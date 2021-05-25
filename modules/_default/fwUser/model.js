module.exports = (app) => {
    const schema = app.db.Schema({
        division: { type: app.db.Schema.ObjectId, ref: 'Division' },                                // Thuộc đơn vị nào

        roles: [{ type: app.db.Schema.ObjectId, ref: 'Role', default: [] }],
        firstname: String,
        lastname: String,
        sex: { type: String, enum: ['male', 'female'], default: 'male' },
        birthday: Date,
        identityCard: String,
        email: String,
        password: String,
        phoneNumber: String,

        image: String,
        active: { type: Boolean, default: false },
        createdDate: Date,

        isCourseAdmin: { type: Boolean, default: false },                                           // Là quản trị viên khóa học
        isLecturer: { type: Boolean, default: false },                                              // Là cố vấn học tập
        isRepresenter: { type: Boolean, default: false },                                           // Là người đại diện (giáo viên báo cáo với Sở)
        isStaff: { type: Boolean, default: false },                                                 // Là nhân viên

        token: String,
        tokenDate: Date,
    });

    schema.methods.equalPassword = function (password) {
        return app.crypt.compareSync(password, this.password);
    };

    const model = app.db.model('User', schema);
    app.model.user = {
        hashPassword: (password) =>
            app.crypt.hashSync(password, app.crypt.genSaltSync(8), null),

        auth: (identityCard, password, done) => model.findOne({ identityCard }).populate('roles').populate('division').exec((error, user) =>
            done(error == null && user && user.equalPassword(password) ? user : null)),

        create: (data, done) => {
            app.model.user.get({ identityCard: data.identityCard }, (error, user) => {
                if (error) {
                    if (done) done(error);
                } else if (user) {
                    if (done) done('CMND/CCCD của bạn đã được đăng ký!', user);
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
                            user.image = '/img/user/' + user._id + '.jpg';
                            const srcPath = app.path.join(app.publicPath, '/img/avatar-default.png'),
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
            });
        },

        get: (condition, done) => (typeof condition == 'object' ? model.findOne(condition) : model.findById(condition))
            .select('-password -token -tokenDate').populate('roles').populate('division').exec(done),

        getPage: (pageNumber, pageSize, condition, sort, done) => {
            model.countDocuments(condition, (error, totalItem) => {
                if (done == undefined) {
                    done = sort;
                    sort = { lastname: 1, firstname: 1 };
                }

                if (error) {
                    done(error);
                } else {
                    let result = { totalItem, pageSize, pageTotal: Math.ceil(totalItem / pageSize) };
                    result.pageNumber = pageNumber === -1 ? result.pageTotal : Math.min(pageNumber, result.pageTotal);
                    const skipNumber = (result.pageNumber > 0 ? result.pageNumber - 1 : 0) * result.pageSize;
                    model.find(condition).select('-password -token -tokenDate').sort(sort).skip(skipNumber).limit(result.pageSize)
                        .populate('roles').populate('division').exec((error, list) => {
                            result.list = list || [];
                            done(error, result);
                        });
                }
            });
        },

        getAll: (condition, done) => {
            if (done == undefined) {
                done = condition;
                condition = {};
            }
            model.find(condition).sort({ lastname: 1, firstname: 1 }).select('-password -token -tokenDate').populate('roles').populate('division').exec(done);
        },

        // changes = { $set, $unset, $push, $pull }
        update: (_id, $set, $unset, done) => {
            if (!done) {
                done = $unset;
                $unset = {};
            }
            const updateProfile = () => {
                if ($set.password) $set.password = app.model.user.hashPassword($set.password);
                model.findOneAndUpdate({ _id }, { $set, $unset }, { new: true }).populate('roles').exec(done);
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

        delete: (_id, done) => model.findById(_id, (error, item) => {
            if (error) {
                done(error);
            } else if (item == null) {
                done('Invalid Id!');
            } else if (item.email == app.defaultAdminEmail) {
                done('Cannot delete default admin menu!');
            } else {
                app.deleteImage(item.image);
                item.remove(done);
            }
        }),


        count: (condition, done) => done ? model.countDocuments(condition, done) : model.countDocuments({}, condition),
    };
};