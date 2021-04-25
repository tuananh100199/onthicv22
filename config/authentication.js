module.exports = (app) => {
    app.isGuest = (req, res, next) => {
        if (req.session.user == null) {
            next();
        } else if (req.method.toLowerCase() === 'get') {
            res.redirect('/');
        } else {
            res.send({ error: 'You has logged in!' });
        }
    };

    app.registerUser = (req, res) => {
        if (req.session.user) {
            res.send({ error: 'You are logged in!' });
        } else {
            let data = {
                firstname: req.body.firstname.trim(),
                lastname: req.body.lastname.trim(),
                email: req.body.email.trim(),
                password: req.body.password,
                phoneNumber: req.body.phoneNumber.trim(),
                active: req.body.active !== undefined && req.body.active != null ? req.body.active : false
            };
            app.model.user.create(data, (error, user) => {
                if (error) {
                    res.send({ error });
                } else if (user == null) {
                    res.send({ error: 'The registration process has some errors! Please try later. Thank you.' });
                } else {
                    res.send({ error: null, user: app.clone({}, user, { password: null }) });

                    app.model.setting.get('email', 'emailPassword', 'emailRegisterMemberTitle', 'emailRegisterMemberText', 'emailRegisterMemberHtml', result => {
                        let url = (app.isDebug ? app.debugUrl : app.rootUrl) + '/active-user/' + user._id,
                            name = user.firstname + ' ' + user.lastname,
                            mailTitle = result.emailRegisterMemberTitle,
                            mailText = result.emailRegisterMemberText.replaceAll('{name}', name).replaceAll('{firstname}', user.firstname).replaceAll('{lastname}', user.lastname).replaceAll('{url}', url),
                            mailHtml = result.emailRegisterMemberHtml.replaceAll('{name}', name).replaceAll('{firstname}', user.firstname).replaceAll('{lastname}', user.lastname).replaceAll('{url}', url);
                        app.email.sendEmail(result.email, result.emailPassword, data.email, app.email.cc, mailTitle, mailText, mailHtml, null);
                    });
                }
            });
        }
    };

    app.loginUser = (req, res) => {
        if (req.session.user) {
            res.send({ error: 'You are logged in!' });
        } else {
            let email = req.body.email.trim(), password = req.body.password;
            app.model.user.auth(email, password, user => {
                if (user == null) {
                    res.send({ error: 'Invalid email or password!' });
                } else if (user.active) {
                    app.updateSessionUser(req, user, sessionUser => res.send({ user: sessionUser }));
                } else {
                    res.send({ error: 'Your account is inactive!' });
                }
            });
        }
    };

    app.logoutUser = (req, res) => {
        if (req.logout) req.logout();
        if (app.isDebug) res.clearCookie('userId');
        req.session.user = null;
        req.session.today = null;
        res.send({ error: null });
    };

    app.loginUserOnMobile = (req, res) => {
        let email = req.body.email.trim(), password = req.body.password;
        app.model.user.auth(email, password, user => {
            if (user == null) {
                res.send({ error: 'Invalid email or password!' });
            } else if (user.active) {
                const getUserToken = () => {
                    const token = user._id + '_' + app.getToken(8),
                        tokenKey = app.appName + '_mobile:' + token;
                    app.redis.get(tokenKey, (error, value) => {
                        if (error || value) {
                            getUserToken();
                        } else {
                            app.updateSessionUser(req, user, sessionUser => {
                                app.redis.set(tokenKey, JSON.stringify(sessionUser), (error) => {//Lưu session user
                                    if (error) {
                                        getUserToken();
                                    } else {
                                        app.redis.expire(tokenKey, 30 * 24 * 60 * 60); // 30 days
                                        res.send({ token, user });
                                    }
                                });
                            });
                        }
                    });
                };
                getUserToken();
            } else {
                res.send({ error: 'Your account is inactive!' });
            }
        });
    };

    // app.loginUserOnMobile = (req, res) => {
    //     const auth = require('basic-auth');
    //     const credentials = auth(req);
    //     if (credentials) {
    //         //auth => credentials.name, credentials.pass
    //     } else {
    //         res.send({ error: 'Invalid parameters!' });
    //     }
    // };
};
