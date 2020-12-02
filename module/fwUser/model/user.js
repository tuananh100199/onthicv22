module.exports = (app) => {
    const schema = app.db.Schema({
        roles: [{ type: app.db.Schema.ObjectId, ref: 'Role', default: [] }],
        firstname: String,
        lastname: String,
        sex: { type: String, enum: ['male', 'female'], default: 'male' },
        birthday: Date,
        email: String,
        password: String,
        phoneNumber: String,
        
        nationality: String, // Quoc tich
        residence: String, // Noi cu tru
    
        identityCard: Number, // CMND, CCCD
        issuedBy: String, // Noi cap CMND, CCCD
        identityDate: Date, // Ngay cap CMND, CCCD
        
        image: String,
        active: { type: Boolean, default: false },
        createdDate: Date,
        
        token: String,
        tokenDate: Date,
    });

    schema.methods.equalPassword = function(password) {
        return app.crypt.compareSync(password, this.password);
    };

    schema.methods.clone = function() {
        let user = app.clone(this, { permissions: [], menu: {} });
        delete user.password;

        const systemMenu = app.permission.list();
        (user.roles ? user.roles : []).forEach((role) => {
            (role.permission ? role.permission : []).forEach((permission) => {
                if (!user.permissions.includes(permission)) {
                    user.permissions.push(permission);
                }
                if (systemMenu[permission]) {
                    const permissionMenu = systemMenu[permission];
                    if (permissionMenu.parentMenu) {
                        if (user.menu[permissionMenu.parentMenu.index] == undefined) {
                            user.menu[permissionMenu.parentMenu.index] = permissionMenu;
                        } else {
                            const userParentMenu = user.menu[permissionMenu.parentMenu.index];
                            if (userParentMenu.menus == undefined) userParentMenu.menus = {};

                            if (permissionMenu.menus) {
                                Object.keys(permissionMenu.menus).forEach((menuIndex) => {
                                    if (userParentMenu.menus[menuIndex] == undefined) {
                                        userParentMenu.menus[menuIndex] =
                                            permissionMenu.menus[menuIndex];
                                    }
                                });
                            }
                        }
                    }
                }
            });
        });
        return user;
    };

    const model = app.db.model('User', schema);
    app.model.user = {
        hashPassword: (password) =>
            app.crypt.hashSync(password, app.crypt.genSaltSync(8), null),

        auth: (email, password, done) =>
            model
            .findOne({ email })
            .populate('roles')
            .exec((error, user) =>
                done(
                    error == null && user != null && user.equalPassword(password) ?
                    user :
                    null
                )
            ),

        create: (data, done) =>
            app.model.user.get({ email: data.email }, (error, user) => {
                if (error) {
                    if (done) done(error);
                } else if (user) {
                    if (done) done('Email bạn dùng đã được đăng ký!', user);
                } else {
                    data.createdDate = new Date();
                    data.tokenDate = new Date();
                    data.token = 'new'; //app.getToken(8);
                    data.password = app.model.user.hashPassword(data.password);
                    if (data.active === undefined) data.active = false;

                    model.create(data, (error, user) => {
                        if (error) {
                            done && done(error);
                        } else {
                            if (app.data && app.data.numberOfUser) app.data.numberOfUser++;

                            user.image = '/img/user/' + user._id + '.jpg';
                            const srcPath = app.path.join(app.publicPath, '/img/avatar.jpg'),
                                destPath = app.path.join(app.publicPath, user.image);
                            app.fs.copyFileSync(srcPath, destPath);
                            if (user.roles == null || user.roles.length == 0) {
                                app.model.role.get({ default: true }, (error, role) => {
                                    if (error || role == null) {
                                        app.model.role.get({ name: 'admin' }, (error, role) => {
                                            if (error || !role) {
                                                done && done('System has errors! ' + error);
                                            } else {
                                                user.roles = [role._id];
                                                user.save((error, newUser) => {
                                                    newUser.roles = [role];
                                                    done && done(error, newUser);
                                                });
                                            }
                                        });
                                    } else {
                                        user.roles = [role._id];
                                        user.save((error, newUser) => {
                                            newUser.roles = [role];
                                            done && done(error, newUser);
                                        });
                                    }
                                });
                            } else {
                                user.roles = [];
                                user.save((error, user) => done && done(error, user));
                            }
                        }
                    });
                }
            }),

        get: (condition, done) =>
            typeof condition == 'object' ? model.findOne(condition).select('-password -token -tokenDate').populate('roles').exec(done) :
            model.findById(condition).select('-password -token -tokenDate').populate('roles').exec(done), // condition is _id.

        getPlayerInfo: (_id, done) => {
            const userSelect = '-password -token -tokenDate -roles -active';
            model.findById({ _id }, userSelect).exec(done);
        },

        getPage: (pageNumber, pageSize, condition, sort, done) =>
            model.countDocuments(condition, (error, totalItem) => {
                if (done == undefined) {
                    done = sort;
                    sort = { lastname: 1, firstname: 1 };
                }

                if (error) {
                    done(error);
                } else {
                    let result = {
                        totalItem,
                        pageSize,
                        pageTotal: Math.ceil(totalItem / pageSize),
                    };
                    result.pageNumber =
                        pageNumber === -1 ?
                        result.pageTotal :
                        Math.min(pageNumber, result.pageTotal);
                    const skipNumber =
                        (result.pageNumber > 0 ? result.pageNumber - 1 : 0) *
                        result.pageSize;
                    model
                        .find(condition)
                        .sort(sort)
                        .skip(skipNumber)
                        .limit(result.pageSize)
                        .populate('roles')
                        .exec((error, users) => {
                            result.list = (error ? [] : users).map((user) =>
                                app.clone(user, {
                                    password: '',
                                    default: user.email == app.defaultAdminEmail,
                                })
                            );
                            done(error, result);
                        });
                }
            }),

        getAll: (condition, done) =>
            done ?
            model
            .find(condition)
            .sort({ lastname: 1, firstname: 1 })
            .select('-password -token -tokenDate')
            .exec(done) :
            model
            .find({})
            .sort({ lastname: 1, firstname: 1 })
            .select('-password -token -tokenDate')
            .exec(condition),

        update: (_id, $set, $unset, done) => {
            if (!done) {
                done = $unset;
                $unset = {};
            }
            const updateProfile = () => {
                if ($set.password)
                    $set.password = app.model.user.hashPassword($set.password);
                model
                    .findOneAndUpdate({ _id }, { $set, $unset }, { new: true })
                    .populate('roles')
                    .exec(done);
            };

            if ($set.email) {
                model.findOne({ email: $set.email }, (error, user) => {
                    if (error) {
                        done('Có lỗi xảy ra khi thay đổi mật khẩu!');
                    } else if (user && user._id != _id) {
                        done('Email của bạn đã được sử dụng!');
                    } else {
                        updateProfile();
                    }
                });
            } else {
                updateProfile();
            }
        },

        delete: (_id, done) =>
            model.findById(_id, (error, item) => {
                if (error) {
                    done(error);
                } else if (item == null) {
                    done('Invalid Id!');
                } else if (item.email == app.defaultAdminEmail) {
                    done('Cannot delete default admin menu!');
                } else {
                    if (app.data && app.data.numberOfUser) app.data.numberOfUser--;
                    app.deleteImage(item.image);
                    item.remove(done);
                }
            }),

        count: (condition, done) => done ? model.countDocuments(condition, done) : model.countDocuments({}, condition),
    };
};