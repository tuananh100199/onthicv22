module.exports = app => {
    const menu = {
        parentMenu: app.parentMenu.setting,
        menus: {
            2060: { title: 'Người dùng', link: '/user/member', icon: 'fa-users', backgroundColor: '#2e7d32' },
        },
    };
    const teacherMenu = {
        parentMenu: app.parentMenu.enrollment,
        menus: {
            8050: { title: 'Đánh giá giáo viên', link: '/user/rating-teacher', icon: 'fa-users', backgroundColor: '#2e7d32' },
        },
    };
    // const menuLecturer = {
    //     parentMenu: app.parentMenu.enrollment,
    //     menus: {
    //         8050: { title: 'Quản lý giáo viên', link: '/user/manage-lecturer', icon: 'fa-bars', backgroundColor: '#00b0ff' }
    //     }
    // };

    app.permission.add(
        { name: 'user:read', menu }, { name: 'user:write' }, { name: 'user:delete' },
        { name: 'manageLecturer:read' }, { name: 'manageLecturer:write' }, { name: 'manageLecturer:delete' },
        { name: 'ratingTeacher:read', menu:teacherMenu }, { name: 'ratingTeacher:write' }, { name: 'ratingTeacher:delete' },
    );

    ['/registered(.htm(l)?)?', '/active-user/:userId', '/forgot-password/:userId/:userToken'].forEach((route) => app.get(route, app.templates.home));
    app.get('/user/profile', app.permission.check(), app.templates.admin);
    app.get('/user/member', app.permission.check('user:read'), app.templates.admin);
    app.get('/user/manage-lecturer', app.permission.check('user:read'), app.templates.admin);
    app.get('/user/manage-lecturer/:_id/rating', app.permission.check('user:read'), app.templates.admin);
    app.get('/user/rating-teacher', app.permission.check('ratingTeacher:read'), app.templates.admin);

    // APIs -----------------------------------------------------------------------------------------------------------------------------------------
    app.get('/api/user/page/:pageNumber/:pageSize', (req, res, next) => app.isDebug ? next() : app.permission.check('user:read')(req, res, next), (req, res) => {
        let pageNumber = parseInt(req.params.pageNumber),
            pageSize = parseInt(req.params.pageSize),
            condition = req.query.condition || {},filter=req.query.filter||null,sort=req.query.sort||null,
            pageCondition = {};
        try {
            if(condition.isLecturer){
                pageCondition.isLecturer=condition.isLecturer;
            }
            if (condition && condition.searchText && condition.searchText.startsWith('teacherPage')) {
                let teacherCondition = {};
                teacherCondition.$or = [];
                const value = { $regex: `.*${condition.searchText.substring(11)}.*`, $options: 'i' };
                teacherCondition.$or.push(
                    { firstname: value },
                    { lastname: value },
                );
                pageCondition = {
                    $and: [teacherCondition, { isLecturer: true }]
                };
            } else {
                pageCondition.$or = [];
                if (condition.searchText) {
                    const value = { $regex: `.*${condition.searchText}.*`, $options: 'i' };
                    pageCondition.$or.push(
                        { identityCard: value },
                        { phoneNumber: value },
                        { email: value },
                        { firstname: value },
                        { lastname: value },
                    );
                }

                if (condition.userType && condition.userType != 'all') {
                    if (condition.queryType && condition.queryType == 'or') {
                        (Array.isArray(condition.userType) ? condition.userType : [condition.userType]).forEach((item) => {
                            const subObject = {};
                            subObject[item] = true;
                            pageCondition.$or.push(subObject);
                        });
                    } else pageCondition.$or.push(Object.fromEntries(
                        (Array.isArray(condition.userType) ? condition.userType : [condition.userType]).map(item => [item, true])));
                    pageCondition.daNghiDay = false;
                }

                if (condition.dateStart && condition.dateEnd) {
                    pageCondition.createdDate = {
                        $gte: new Date(condition.dateStart),
                        $lt: new Date(condition.dateEnd)
                    };
                }
            }
            if(filter){
                if(filter.fullName){
                    pageCondition['$expr']= {
                        '$regexMatch': {
                          'input': { '$concat': ['$lastname', ' ', '$firstname'] },
                          'regex': `.*${filter.fullName}.*`,  //Your text search here
                          'options': 'i'
                        }
                    };
                }
                if(filter.ratingScore){
                    let ratingScore = filter.ratingScore;
                    console.log(ratingScore);
                    ratingScore.forEach(score=>{
                        let condition =score=='0'?{ratingScore:null} :{ratingScore:{$gte:Number(score),$lt:Number(score)+1}};
                        pageCondition['$or'].push(condition);
                    });
                }
            }
            if(sort){
                if(sort.fullName){
                    let value= sort.fullName;
                    sort = {firstname:value};
                }
            }
            if (pageCondition.$or.length == 0) delete pageCondition.$or;
            if (req.session.user.division && req.session.user.division.isOutside) pageCondition.division = req.session.user.division._id;
            app.model.user.getPage(pageNumber, pageSize, pageCondition,sort, (error, page) => res.send({ error, page }));
        } catch (error) {
            res.send({ error });
        }
    });

    app.get('/api/user/all', app.permission.check('user:read'), (_, res) => {
        app.model.user.getAll((error, list) => res.send({ error, list }));
    });

    app.get('/api/user', app.permission.orCheck('user:read', 'user:login'), (req, res) => {
        const { _id, email } = req.query;
        if (_id) {
            app.model.user.get({ _id }, (error, user) => res.send({ error, user }));
        } else if (email) {
            app.model.user.get({ email }, (error, user) => res.send({ error, user }));
        } else {
            res.send({ error: 'Invalid params!' });
        }
    });

    app.get('/api/user/lecturer', app.permission.check('user:read'), (req, res) => {
        let condition = req.query.condition || {},
            searchCondition = {};
        if (condition.searchText) {
            searchCondition.$or = [];
            const value = { $regex: `.*${condition.searchText}.*`, $options: 'i' };
            searchCondition.$or.push(
                { firstname: value },
                { lastname: value },
            );
        }
        let lecturerCondition = condition.divisionId ? {
            $and: [searchCondition, { isLecturer: true }, { division: condition.divisionId }]
        } : { $and: [searchCondition, { isLecturer: true }] };
        app.model.user.getAll(lecturerCondition, (error, list) => {
            if (error || list && list.length < 1) {
                res.send({ error: 'Lấy thông tin giáo viên bị lỗi' });
            } else {
                res.send({ error, list });
            }
        });
    });


    app.post('/api/user', app.permission.check('user:write'), (req, res) => {
        const data = req.body.user;
        function convert(str) {
            let date = new Date(str),
                mnth = ('0' + (date.getMonth() + 1)).slice(-2),
                day = ('0' + date.getDate()).slice(-2);
            return [day, mnth, date.getFullYear()].join('');
        }
        if (!data.password) {
            data.password = convert(data.birthday);
        }
        if (data.roles == 'empty') data.roles = [];
        // const password = data.password;
        app.model.user.create(data, (error, user) => {
            res.send({ error, user });
            // if (user.email) {
            //     app.model.setting.get('email', 'emailPassword', 'emailCreateMemberByAdminTitle', 'emailCreateMemberByAdminText', 'emailCreateMemberByAdminHtml', result => {
            //         const url = (app.isDebug ? app.debugUrl : app.rootUrl) + '/active-user/' + user._id,
            //             mailTitle = result.emailCreateMemberByAdminTitle,
            //             mailText = result.emailCreateMemberByAdminText.replaceAll('{name}', user.firstname + ' ' + user.lastname)
            //                 .replaceAll('{firstname}', user.firstname).replaceAll('{lastname}', user.lastname)
            //                 .replaceAll('{email}', user.email).replaceAll('{identityCard}', user.identityCard).replaceAll('{password}', password).replaceAll('{url}', url),
            //             mailHtml = result.emailCreateMemberByAdminHtml.replaceAll('{name}', user.firstname + ' ' + user.lastname)
            //                 .replaceAll('{firstname}', user.firstname).replaceAll('{lastname}', user.lastname)
            //                 .replaceAll('{email}', user.email).replaceAll('{identityCard}', user.identityCard).replaceAll('{password}', password).replaceAll('{url}', url);
            //         app.email.sendEmail(result.email, result.emailPassword, user.email, app.email.cc, mailTitle, mailText, mailHtml, null);
            //     });
            // }
        });
    });

    app.put('/api/user', app.permission.check('user:write'), (req, res) => {
        const changes = req.body.changes;
        if (changes.roles && changes.roles == 'empty') changes.roles = [];

        app.model.role.get({ name: 'admin' }, (error, adminRole) => {
            if (error || adminRole == null) {
                res.send({ error: 'System has errors!' });
            } else {
                app.model.user.get(req.body._id, (error, user) => {
                    if (error || user == null) {
                        res.send({ error: 'System has errors!' });
                    } else {
                        if (user.email == app.defaultAdminEmail) {
                            changes.active = true;
                            changes.roles = [adminRole._id];
                            delete changes.email;
                        }

                        // const password = changes.password;
                        // changes.division = changes.division || req.session.user.division;
                        app.model.user.update(req.body._id, changes, (error, user) => {
                            if (error) {
                                res.send({ error });
                            } else {
                                // if (changes.password) {
                                //     app.model.setting.get('email', 'emailPassword', 'emailNewPasswordTitle', 'emailNewPasswordText', 'emailNewPasswordHtml', result => {
                                //         let mailTitle = result.emailNewPasswordTitle,
                                //             mailText = result.emailNewPasswordText.replaceAll('{name}', user.firstname + ' ' + user.lastname)
                                //                 .replaceAll('{firstname}', user.firstname).replaceAll('{lastname}', user.lastname)
                                //                 .replaceAll('{email}', user.email).replaceAll('{password}', password),
                                //             mailHtml = result.emailNewPasswordHtml.replaceAll('{name}', user.firstname + ' ' + user.lastname)
                                //                 .replaceAll('{firstname}', user.firstname).replaceAll('{lastname}', user.lastname)
                                //                 .replaceAll('{email}', user.email).replaceAll('{password}', password);
                                //         app.email.sendEmail(result.email, result.emailPassword, user.email, [], mailTitle, mailText, mailHtml, null);
                                //     });
                                // }

                                if (error) {
                                    res.send({ error });
                                } else {
                                    app.model.user.get(user._id, (error, user) => {
                                        user = app.clone(user, { password: '', default: user.email == app.defaultAdminEmail });
                                        app.io.emit('user-changed', user);
                                        res.send({ error, user });
                                    });
                                }
                            }
                        });
                    }
                });
            }
        });
    });

    app.put('/api/user/token', app.permission.check('user:login'), (req, res) => {
        const token = req.body.token;
        app.model.user.get(req.body._id, (error, user) => {
            if (error || user == null) {
                res.send({ error: 'System has errors!' });
            } else {
                app.model.user.update(req.body._id, { fcmToken: token }, (error, user) => {
                    if (error) {
                        res.send({ error });
                    } else {
                        res.send({ error, user });
                    }
                });
            }
        });
    });

    app.put('/api/profile', app.permission.check(), (req, res) => {
        const changes = req.body.changes,
            $unset = {};
        if (changes.birthday && changes.birthday == null) {
            delete changes.birthday;
            $unset.birthday = null;
        }
        delete changes.roles;
        delete changes.email;
        delete changes.active;

        app.model.user.update(req.session.user._id, changes, $unset, (error, user) => {
            if (user) {
                app.updateSessionUser(req, user, sessionUser => res.send({ error, user: sessionUser }));
            } else {
                res.send({ error, user: req.session.user });
            }
        });
    });

    app.delete('/api/user', app.permission.check('user:delete'), (req, res) => {
        app.model.user.delete(req.body._id, error => res.send({ error }));
    });

    // Home -----------------------------------------------------------------------------------------------------------------------------------------
    app.post('/register', (req, res) => app.registerUser(req, res));
    app.post('/login', app.loginUser);
    app.post('/logout', app.logoutUser);

    app.post('/active-user/:userId', (req, res) => {
        app.model.user.get(req.params.userId, (error, user) => {
            if (error || user == null) {
                res.send({ message: 'Địa chỉ kích hoạt tài khoản không đúng!' });
            } else if (user.active) {
                res.send({ message: 'Bạn kích hoạt tài khoản đã được kích hoạt!' });
            } else {
                user.active = true;
                user.token = '';
                user.save(error => res.send({
                    message: error ? 'Quá trình kích hoạt tài khoản đã lỗi!' : 'Bạn đã kích hoạt tài khoản thành công!'
                }));
            }
        });
    });

    app.put('/forgot-password', app.isGuest, (req, res) => {
        app.model.user.get({ email: req.body.email }, (error, user) => {
            if (error || user === null) {
                res.send({ error: 'Email không tồn tại!' });
            } else {
                user.token = app.getToken(8);
                user.tokenDate = new Date().getTime() + 24 * 60 * 60 * 1000;
                user.save(error => {
                    if (error) {
                        res.send({ error });
                    } else {
                        // app.model.setting.get('email', 'emailPassword', 'emailForgotPasswordTitle', 'emailForgotPasswordText', 'emailForgotPasswordHtml', result => {
                        //     let name = user.firstname + ' ' + user.lastname,
                        //         url = (app.isDebug ? app.debugUrl : app.rootUrl) + '/forgot-password/' + user._id + '/' + user.token,
                        //         mailTitle = result.emailForgotPasswordTitle,
                        //         mailText = result.emailForgotPasswordText.replaceAll('{name}', name).replaceAll('{firstname}', user.firstname).replaceAll('{lastname}', user.lastname).replaceAll('{email}', user.email).replaceAll('{url}', url),
                        //         mailHtml = result.emailForgotPasswordHtml.replaceAll('{name}', name).replaceAll('{firstname}', user.firstname).replaceAll('{lastname}', user.lastname).replaceAll('{email}', user.email).replaceAll('{url}', url);
                        //     app.email.sendEmail(result.email, result.emailPassword, user.email, [], mailTitle, mailText, mailHtml, null);
                        // });

                        res.send({ error: null });
                    }
                });
            }
        });
    });

    // Hook upload images ---------------------------------------------------------------------------------------------------------------------------
    app.createFolder(app.path.join(app.publicPath, '/img/user'));

    app.uploadHooks.add('uploadYourAvatar', (req, fields, files, params, done) => {
        if (files.ProfileImage && files.ProfileImage[0].size > 1024000) {
            done({ error: 'Vui lòng chọn ảnh có kích thước < 1 MB' });
        } else {
            if (req.session.user && fields.userData && fields.userData[0] == 'profile' && files.ProfileImage && files.ProfileImage.length > 0) {
                console.log('Hook: uploadYourAvatar => your avatar upload');
                const _id = req.session.user._id;
                app.uploadImage('user', app.model.user.get, _id, files.ProfileImage[0].path, data => {
                    if (data.error == null && data.image) req.session.user.image = data.image;
                    done(data);
                });
            }
        }
    });

    const uploadUserAvatar = (fields, files, done) => {
        if (files.UserImage && files.UserImage[0].size > 1024000) {
            done({ error: 'Vui lòng chọn ảnh có kích thước < 1 MB' });
        } else {
            if (fields.userData && fields.userData[0].startsWith('user:') && files.UserImage && files.UserImage.length > 0) {
                console.log('Hook: uploadUserAvatar => user avatar upload');
                const _id = fields.userData[0].substring('user:'.length);
                app.uploadImage('user', app.model.user.get, _id, files.UserImage[0].path, done);
            }
        }
    };
    app.uploadHooks.add('uploadUserAvatar', (req, fields, files, params, done) =>
        app.permission.has(req, () => uploadUserAvatar(fields, files, done), done, 'user:write'));
};
