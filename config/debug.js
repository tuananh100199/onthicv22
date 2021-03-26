module.exports = app => {
    // Log every request to the console
    if (app.isDebug) {
        const morgan = require('morgan');
        app.use(morgan('dev'));

        // Redirect to webpack server
        app.get('/*.js', (req, res) => {
            if (req.originalUrl.endsWith('.min.js')) {
                console.log(req.originalUrl);
                res.next();
            } else {
                const http = require('http');
                http.get('http://localhost:' + (app.port + 1) + req.originalUrl, response => {
                    let data = '';
                    response.on('data', chunk => data += chunk);
                    response.on('end', () => res.send(data));
                });
            }
        });
    }

    app.post('/api/debug/switch-user', (req, res) => {
        const _id = req.body._id, isDebug = app.isDebug || (req.session.user && req.session.user.roles.some(role => role.name == 'admin'));
        if (_id && isDebug) {
            app.model.user.get({ _id }, (error, user) => {
                if (error || !user) {
                    res.send({ error: 'System has errors!' });
                } else {
                    app.updateSessionUser(req, user, _ => res.send({ user }));
                }
            });
        } else {
            res.send({ error: 'Invalid request!' });
        }
    });

    app.use((req, res) => {
        res.status(404);

        // respond with html page
        if (req.accepts('html')) {
            return res.redirect('/404.html');
        } else if (req.accepts('json')) {
            // respond with json
            return res.send({ error: 'Not found!' });
        }
    });
};