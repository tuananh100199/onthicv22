module.exports = app => {
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
        if (req.session.user != null) {
            res.send({ error: 'You are logged in!' });
        } else {
            let data = {
                firstname: req.body.firstname.trim(),
                lastname: req.body.lastname.trim(),
                email: req.body.email.trim(),
                password: req.body.password,
                active: req.body.active !== undefined && req.body.active != null ? req.body.active : false
            };
            app.model.user.create(data, (error, user) => {
                if (error) {
                    res.send({ error });
                } else if (user == null) {
                    res.send({ error: 'The registration process has some errors! Please try later. Thank you.' });
                } else {
                    res.send({ error: null, user: app.clone({}, user, { password: null }) });

                    app.model.setting.get(['emailRegisterMemberTitle', 'emailRegisterMemberText', 'emailRegisterMemberHtml'], result => {
                        let url = (app.isDebug ? app.debugUrl : app.rootUrl) + '/active-user/' + user._id,
                            name = user.firstname + ' ' + user.lastname,
                            mailTitle = result.emailRegisterMemberTitle,
                            mailText = result.emailRegisterMemberText.replaceAll('{name}', name).replaceAll('{firstname}', user.firstname).replaceAll('{lastname}', user.lastname).replaceAll('{url}', url),
                            mailHtml = result.emailRegisterMemberHtml.replaceAll('{name}', name).replaceAll('{firstname}', user.firstname).replaceAll('{lastname}', user.lastname).replaceAll('{url}', url);
                        app.email.sendEmail(app.data.email, app.data.emailPassword, data.email, app.email.cc, mailTitle, mailText, mailHtml, null);
                    });
                }
            });
        }
    };
    
    app.loginUser = (req, res) => {
        if (req.session.user != null) {
            res.send({ error: 'You are logged in!' });
        } else {
            let email = req.body.email.trim(), password = req.body.password;
            app.model.user.auth(email, password, user => {
                if (user == null) {
                    res.send({ error: 'Invalid email or password!' });
                } else if (user.active) {
                    req.session.user = user.clone();
                    res.send({ user });
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
        const auth = require('basic-auth');
        const credentials = auth(req);
        if (credentials) {
            //TODO: auth => credentials.name, credentials.pass
        } else {
            res.send({ error: 'Invalid parameters!' });
        }
    };
};
