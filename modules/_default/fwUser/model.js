module.exports = (app) => {
    const schema = app.database.mongoDB.Schema({
        division: { type: app.database.mongoDB.Schema.ObjectId, ref: 'Division' },                                // Thuộc đơn vị nào

        roles: [{ type: app.database.mongoDB.Schema.ObjectId, ref: 'Role', default: [] }],
        firstname: String,
        lastname: String,
        sex: { type: String, enum: ['male', 'female'], default: 'male' },
        birthday: Date,
        identityCard: String,
        email: String,
        password: String,
        phoneNumber: String,
        image: String,
        active: { type: Boolean, default: true },
        createdDate: { type: Date, default: Date.now },

        isCourseAdmin: { type: Boolean, default: false },                                           // Là quản trị viên khóa học
        isLecturer: { type: Boolean, default: false },                                              // Là giáo viên
        isStaff: { type: Boolean, default: false },                                                 // Là nhân viên
        isTrustLecturer: { type: Boolean, default: false },                                         // Giáo viên tin cậy => họ được quyền approved forum, comment của họ
        daNghiDay: { type: Boolean, default: false },                                               // Là giáo viên đã nghỉ dạy
        ngayNghiDay: Date,

        token: String,
        tokenDate: Date,
        fcmToken: String,

        notificationRead: [{ type: app.database.mongoDB.Schema.ObjectId, ref: 'Notification' }],                  // Người dùng đã đọc các notification này
        notificationUnread: [{ type: app.database.mongoDB.Schema.ObjectId, ref: 'Notification' }],                // Người dùng chưa đọc các notification này
        //rating teacher
        ratingScore: Number,
        ratingAmount: Number,
    });

    schema.methods.equalPassword = function (password) {
        return app.crypt.compareSync(password, this.password);
    };

    const model = app.database.mongoDB.model('User', schema);
    app.model.user = {
        hashPassword: (password) =>
            app.crypt.hashSync(password, app.crypt.genSaltSync(8), null),

        auth: (identityCard, password, done) => model.findOne({ identityCard }).populate('roles').populate('division').exec((error, user) =>
            done(error == null && user && user.equalPassword(password) ? user : null)),

        create: (data, done) => {
            app.model.user.get({ identityCard: data.identityCard }, (error, user) => {
                if (error) {
                    done && done(error);
                } else if (user) {
                    done && done('CMND/CCCD của bạn đã được đăng ký!', user);
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
                                // user.roles = [];
                                user.save((error, user) => done && done(error, user));
                            }
                        }
                    });
                }
            });
        },

        get: (condition, done) => (typeof condition == 'object' ? model.findOne(condition) : model.findById(condition))
            .select('-password -token -tokenDate').populate('roles').populate('division').exec(done),

        getOld: (done) => model.find({ isLecturer: true }).sort({ createdDate: 1 }).limit(1).exec(done),

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

            if ($set.identityCard) {
                model.findOne({ identityCard: $set.identityCard }, (error, user) => {
                    if (error) {
                        done('Có lỗi xảy ra khi thay đổi mật khẩu!');
                    } else if (user && user._id != _id) {
                        done('CMND/CCCD của bạn đã được sử dụng');
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
                app.model.chat.getAll({ $or: [{ 'sender': item._id }, { 'receiver': item._id }] }, (error, list) => {
                    if (error) item.remove(done);
                    else {
                        const handleDeleteChat = (index = 0) => {
                            if (index == list.length) {
                                item.remove(done);
                            } else {
                                const chat = list[index];
                                app.model.chat.delete(chat._id, () => {
                                    handleDeleteChat(index + 1);
                                });
                            }
                        };
                        handleDeleteChat();
                    }
                });
            }
        }),


        count: (condition, done) => done ? model.countDocuments(condition, done) : model.countDocuments({}, condition),
    };
};