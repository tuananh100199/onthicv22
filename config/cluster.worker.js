module.exports = (cluster, isDebug) => {
    let package = require('../package.json');
    const express = require('express');
    const app = express();
    app.appName = package.name;
    app.isDebug = isDebug;
    app.fs = require('fs');
    app.path = require('path');
    const server = app.isDebug ?
        require('http').createServer(app) :
        require('https').createServer({
            cert: app.fs.readFileSync('/etc/ssl/hiepphat_certificate.crt'),
            ca: app.fs.readFileSync('/etc/ssl/hiepphat_ca_bundle.crt'),
            key: app.fs.readFileSync('/etc/ssl/hiepphat_private.key'),
        }, app);

    if (!app.isDebug && app.fs.existsSync('./asset/config.json')) package = Object.assign({}, package, require('../asset/config.json'));

    // Variables ------------------------------------------------------------------------------------------------------
    app.port = package.port;
    app.rootUrl = package.rootUrl;
    app.debugUrl = `http://localhost:${app.port}`;
    app.mongodb = `mongodb://localhost:27017/${package.dbName}`;
    app.email = package.email;
    app.defaultAdminEmail = package.default.adminEmail;
    app.defaultAdminPassword = package.default.adminPassword;
    app.assetPath = app.path.join(__dirname, '..', package.path.asset);
    app.bundlePath = app.path.join(app.assetPath, 'bundle');
    app.viewPath = app.path.join(__dirname, '..', package.path.view);
    app.modulesPath = app.path.join(__dirname, '..', package.path.modules);
    app.publicPath = app.path.join(__dirname, '..', package.path.public);
    app.imagePath = app.path.join(package.path.public, 'img');
    app.uploadPath = app.path.join(__dirname, '..', package.path.upload);
    app.faviconPath = app.path.join(__dirname, '..', package.path.favicon);

    // Configure ------------------------------------------------------------------------------------------------------
    require('./common')(app, package.name);
    require('./view')(app, express);
    require('./database')(app);
    require('./packages')(app, server, package);
    require('./authentication')(app, package);
    require('./permission')(app);
    require('./io')(app, server);

    // Init -----------------------------------------------------------------------------------------------------------
    app.createTemplate('home', 'admin');
    app.loadModules();
    app.readyHooks.add('adminInit', {
        ready: () => app.model != null && app.model.user != null,
        run: () => {
            const enableInit = process.env['enableInit'] == 'true';
            if (enableInit) {
                app.setupAdmin()
            }
        },
    });

    app.get('/user', app.permission.check(), app.templates.admin);
    app.get('*', (req, res, next) => {
        if (app.isDebug && req.session.user) app.updateSessionUser(req, req.session.user);
        const link = req.path.endsWith('/') && req.path.length > 1 ? req.path.substring(0, req.path.length - 1) : req.path;
        app.model.menu.get({ link }, (error, menu) => {
            (error || menu == null) ? next() : app.templates.home(req, res)
        });
    });

    // Worker ---------------------------------------------------------------------------------------------------------
    app.worker = {
        refreshState: (option) => process.send({ type: 'refreshState', workerId: process.pid, option }),

        create: () => process.send({ type: 'createWorker' }),
        reset: (workerId) => process.send({ type: 'resetWorker', workerId }),
        shutdown: (workerId) => process.send({ type: 'shutdownWorker', workerId }),
    };

    // Listen from MASTER ---------------------------------------------------------------------------------------------
    process.on('message', message => {
        if (message.type == 'refreshState') {
            app.state.refresh(message.option);
        } else if (message.type == 'workersChanged') {
            app.io.emit('workers-changed', message.workers);
            app.worker.items = message.workers;
        } else if (message.type == 'resetWorker') {
            server.close();
            process.exit(1);
            // isDebug ? process.exit(1) : setTimeout(() => process.exit(1), 1 * 60 * 1000); // Waiting 1 minutes...
        } else if (message.type == 'shutdownWorker') {
            process.exit(1);
        }
    });

    // Launch website -------------------------------------------------------------------------------------------------
    require('./debug')(app);
    server.listen(app.port);
};