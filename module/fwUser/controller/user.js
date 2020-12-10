module.exports = app => {
    const userMenu = {
        parentMenu: { index: 2000, title: 'Cấu hình', icon: 'fa-cog' },
        menus: {
            2060: { title: 'Người dùng', link: '/user/user' },
        },
    };
    app.permission.add({ name: 'user:read', menu: userMenu }, { name: 'user:write', menu: userMenu }, { name: 'user:search' }, );

    app.get('/user/profile', app.permission.check(), app.templates.admin);
    app.get('/user/user', app.permission.check('user:read'), app.templates.admin);

    app.get('/api/user-search/:email', app.permission.check('user:read'), (req, res) => app.model.user.get({ email: req.params.email }, (error, user) => {
        res.send({ error, user: user ? app.clone(user, { password: '', token: '', tokenDate: '' }) : null });
    }));

    // APIs -----------------------------------------------------------------------------------------------------------------------------------------
    app.get('/api/user/page/:pageNumber/:pageSize',
        app.permission.orCheck('user:read', 'user:search'),
        (req, res) => {
            let pageNumber = parseInt(req.params.pageNumber),
                pageSize = parseInt(req.params.pageSize),
                condition = req.query.condition || '',
                pageCondition = {};
            try {
                if (condition) {
                    const value = { $regex: `.*${condition}.*`, $options: 'i' };
                    pageCondition['$or'] = [
                        { facebook: value },
                        { phoneNumber: value },
                        { organizationId: value },
                        { email: value },
                        { firstname: value },
                        { lastname: value },
                    ];
                }
                app.model.user.getPage(pageNumber, pageSize, pageCondition, (error, page) => res.send({ error, page }));
            } catch (error) {
                res.send({ error });
            }
        });

    app.get('/api/user/all', app.permission.check('user:read'), (_, res) => app.model.user.getAll((error, items) => res.send({ error, items })));

    app.get('/api/user/:_id',
        app.permission.orCheck('user:read', 'user:search'),
        (req, res) => app.model.user.get(req.params._id, (error, user) => res.send({ error, user })));

    app.get('/api/user-email/:email',
        app.permission.orCheck('user:read', 'user:search'),
        (req, res) => app.model.user.get({ email: req.params.email }, (error, user) => res.send({ error, user })));

    app.post('/api/user', app.permission.check('user:write'), (req, res) => {
        const data = req.body.user;
        const password = data.password;
        if (!data.password) data.password = app.randomPassword(8);
        if (data.roles == 'empty') data.roles = [];
        app.model.user.create(data, (error, user) => {
            res.send({ error, user });
            if (user) {
                app.model.setting.get(['emailCreateMemberByAdminTitle', 'emailCreateMemberByAdminText', 'emailCreateMemberByAdminHtml'], result => {
                    const url = (app.isDebug ? app.debugUrl : app.rootUrl) + '/active-user/' + user._id,
                        mailTitle = result.emailCreateMemberByAdminTitle,
                        mailText = result.emailCreateMemberByAdminText.replaceAll('{name}', user.firstname + ' ' + user.lastname)
                        .replaceAll('{firstname}', user.firstname).replaceAll('{lastname}', user.lastname)
                        .replaceAll('{email}', user.email).replaceAll('{password}', password).replaceAll('{url}', url),
                        mailHtml = result.emailCreateMemberByAdminHtml.replaceAll('{name}', user.firstname + ' ' + user.lastname)
                        .replaceAll('{firstname}', user.firstname).replaceAll('{lastname}', user.lastname)
                        .replaceAll('{email}', user.email).replaceAll('{password}', password).replaceAll('{url}', url);
                    app.email.sendEmail(app.data.email, app.data.emailPassword, user.email, app.email.cc, mailTitle, mailText, mailHtml, null);
                });
            }
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

                        const password = changes.password;
                        app.model.user.update(req.body._id, changes, (error, user) => {
                            if (error) {
                                res.send({ error });
                            } else {
                                if (changes.password) {
                                    app.model.setting.get(['emailNewPasswordTitle', 'emailNewPasswordText', 'emailNewPasswordHtml'], result => {
                                        let mailTitle = result.emailNewPasswordTitle,
                                            mailText = result.emailNewPasswordText.replaceAll('{name}', user.firstname + ' ' + user.lastname)
                                            .replaceAll('{firstname}', user.firstname).replaceAll('{lastname}', user.lastname)
                                            .replaceAll('{email}', user.email).replaceAll('{password}', password),
                                            mailHtml = result.emailNewPasswordHtml.replaceAll('{name}', user.firstname + ' ' + user.lastname)
                                            .replaceAll('{firstname}', user.firstname).replaceAll('{lastname}', user.lastname)
                                            .replaceAll('{email}', user.email).replaceAll('{password}', password);
                                        app.email.sendEmail(app.data.email, app.data.emailPassword, user.email, [], mailTitle, mailText, mailHtml, null);
                                    });
                                }

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
                        })
                    }
                });
            }
        });
    });

    app.put('/api/profile', app.permission.check(), (req, res) => {
        const changes = req.body.changes,
            $unset = {};
        if (changes.birthday && changes.birthday == 'empty') {
            delete changes.birthday;
            $unset.birthday = '';
        }
        delete changes.roles;
        delete changes.email;
        delete changes.active;

        app.model.user.update(req.session.user._id, changes, $unset, (error, user) => {
            if (user) {
                app.updateSessionUser(req, user, sessionUser => res.send({ error, user: sessionUser }))
            } else {
                res.send({ error, user: req.session.user });
            }
        })
    });

    app.delete('/api/user', app.permission.check('user:write'), (req, res) => {
        app.model.user.delete(req.body._id, error => {
            res.send({ error });
        })
    });

    // Home -----------------------------------------------------------------------------------------------------------------------------------------
    app.post('/register', (req, res) => app.registerUser(req, res));
    app.post('/login', app.loginUser);
    app.post('/logout', app.logoutUser);

    app.post('/active-user/:userId', (req, res) => app.model.user.get(req.params.userId, (error, user) => {
        if (error || user == null) {
            res.send({
                message: 'Địa chỉ kích hoạt tài khoản không đúng!'
            });
        } else if (user.active) {
            res.send({
                message: 'Bạn kích hoạt tài khoản đã được kích hoạt!'
            });
        } else {
            user.active = true;
            user.token = '';
            user.save(error => res.send({
                message: error ? 'Quá trình kích hoạt tài khoản đã lỗi!' : 'Bạn đã kích hoạt tài khoản thành công!'
            }));
        }
    }));

    app.put('/forgot-password', app.isGuest, (req, res) => app.model.user.get({ email: req.body.email }, (error, user) => {
        if (error || user === null) {
            res.send({ error: 'Email không tồn tại!' });
        } else {
            user.token = app.getToken(8);
            user.tokenDate = new Date().getTime() + 24 * 60 * 60 * 1000;
            user.save(error => {
                if (error) {
                    res.send({ error })
                } else {
                    app.model.setting.get(['emailForgotPasswordTitle', 'emailForgotPasswordText', 'emailForgotPasswordHtml'], result => {
                        let name = user.firstname + ' ' + user.lastname,
                            url = (app.isDebug ? app.debugUrl : app.rootUrl) + '/forgot-password/' + user._id + '/' + user.token,
                            mailTitle = result.emailForgotPasswordTitle,
                            mailText = result.emailForgotPasswordText.replaceAll('{name}', name).replaceAll('{firstname}', user.firstname).replaceAll('{lastname}', user.lastname).replaceAll('{email}', user.email).replaceAll('{url}', url),
                            mailHtml = result.emailForgotPasswordHtml.replaceAll('{name}', name).replaceAll('{firstname}', user.firstname).replaceAll('{lastname}', user.lastname).replaceAll('{email}', user.email).replaceAll('{url}', url);
                        app.email.sendEmail(app.data.email, app.data.emailPassword, user.email, [], mailTitle, mailText, mailHtml, null);
                    });

                    res.send({ error: null });
                }
            });
        }
    }));

    // app.post('/get_user_on_mobile', app.getUserOnMobile);
    // app.post('/login_on_mobile', app.loginUserOnMobile);
    // app.post('/logout_on_mobile', app.logoutUserOnMobile);


    // Hook upload images ---------------------------------------------------------------------------------------------------------------------------
    app.createFolder(app.path.join(app.publicPath, '/img/user'));

    app.uploadHooks.add('uploadYourAvatar', (req, fields, files, params, done) => {
        if (req.session.user && fields.userData && fields.userData[0] == 'profile' && files.ProfileImage && files.ProfileImage.length > 0) {
            console.log('Hook: uploadYourAvatar => your avatar upload');
            app.uploadComponentImage(req, 'user', app.model.user.get, req.session.user._id, files.ProfileImage[0].path, done);
        }
    });

    const uploadUserAvatar = (req, fields, files, params, done) => {
        if (fields.userData && fields.userData[0].startsWith('user:') && files.UserImage && files.UserImage.length > 0) {
            console.log('Hook: uploadUserAvatar => user avatar upload');
            app.uploadComponentImage(req, 'user', app.model.user.get, fields.userData[0].substring(5), files.UserImage[0].path, done);
        }
    };
    app.uploadHooks.add('uploadUserAvatar', (req, fields, files, params, done) =>
        app.permission.has(req, () => uploadUserAvatar(req, fields, files, params, done), done, 'user:write'));
};