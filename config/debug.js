module.exports = app => {
    // Log every request to the console
    if (app.isDebug) {
        const morgan = require('morgan');
        app.use(morgan('dev'));

        app.post('/api/debug/change-role', (req, res) => {
            if (app.isDebug) {
                app.model.user.get({ roles: req.body.role }, (error, user) => {
                    if (error || user == null) {
                        res.send({ error });
                    } else {
                        req.session.user = user.clone();
                        res.send({ user: req.session.user });
                    }
                });
            } else {
                res.send({ error: 'Not in debug mode!' });
            }
        });
    }

    app.use(function (req, res) {
        res.status(404);

        // respond with html page
        if (req.accepts('html')) {
            return res.redirect('/404.html');
        }

        // respond with json
        if (req.accepts('json')) {
            return res.send({ error: 'Not found!' });
        }
    });
};