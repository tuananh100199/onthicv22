module.exports = (cluster, isDebug) => {
    let appConfig = require('../package.json');
    const express = require('express');
    const app = express();
    app.appName = appConfig.name;
    app.isDebug = isDebug;
    app.fs = require('fs');
    app.path = require('path');
    app.primaryWorker = process.env['primaryWorker'] == 'true';
    const server = app.isDebug ?
        require('http').createServer(app) :
        require('https').createServer({
            cert: app.fs.readFileSync('/etc/ssl/hpo_certificate.crt'),
            ca: app.fs.readFileSync('/etc/ssl/hpo_ca_bundle.crt'),
            key: app.fs.readFileSync('/etc/ssl/hpo_private.key'),
        }, app);

    if (!app.isDebug && app.fs.existsSync('./asset/config.json')) appConfig = Object.assign({}, appConfig, require('../asset/config.json'));

    // Variables ------------------------------------------------------------------------------------------------------
    app.port = appConfig.port;
    app.rootUrl = appConfig.rootUrl;
    app.debugUrl = `http://localhost:${app.port}`;
    app.mongodb = `mongodb://localhost:27017/${appConfig.dbName}`;
    app.email = appConfig.email;
    app.defaultAdminEmail = appConfig.default.adminEmail;
    app.defaultAdminPassword = appConfig.default.adminPassword;
    app.assetPath = app.path.join(__dirname, '..', appConfig.path.asset);
    app.bundlePath = app.path.join(app.assetPath, 'bundle');
    app.viewPath = app.path.join(__dirname, '..', appConfig.path.view);
    app.modulesPath = app.path.join(__dirname, '..', appConfig.path.modules);
    app.publicPath = app.path.join(__dirname, '..', appConfig.path.public);
    app.imagePath = app.path.join(appConfig.path.public, 'img');
    app.uploadPath = app.path.join(__dirname, '..', appConfig.path.upload);
    app.faviconPath = app.path.join(__dirname, '..', appConfig.path.favicon);

    // Configure ------------------------------------------------------------------------------------------------------
    require('./common')(app, app.appName);
    require('./view')(app, express);
    require('./database')(app);
    require('./packages')(app, server, appConfig);
    require('./authentication')(app);
    require('./permission')(app);
    require('./io')(app, server);

    // Init -----------------------------------------------------------------------------------------------------------
    app.createTemplate('home', 'admin');
    app.loadModules();
    app.readyHooks.add('setupAdmin', {
        ready: () => app.model && app.model.user,
        run: () => process.env['primaryWorker'] == 'true' && app.setupAdmin(),
    });

    app.get('/user', app.permission.check(), app.templates.admin);
    app.get('*', (req, res, next) => {
        if (app.isDebug && req.session.user) app.updateSessionUser(req, req.session.user);
        const link = req.path.endsWith('/') && req.path.length > 1 ? req.path.substring(0, req.path.length - 1) : req.path;
        app.model.menu.get({ link }, (error, menu) => {
            (error || menu == null) ? next() : app.templates.home(req, res);
        });
    });

    // Worker ---------------------------------------------------------------------------------------------------------
    app.worker = {
        create: () => process.send({ type: 'createWorker' }),
        reset: (workerId) => process.send({ type: 'resetWorker', workerId, primaryWorker: app.primaryWorker }),
        shutdown: (workerId) => process.send({ type: 'shutdownWorker', workerId, primaryWorker: app.primaryWorker }),
    };

    // Listen from MASTER ---------------------------------------------------------------------------------------------
    process.on('message', message => {
        if (message.type == 'workersChanged') {
            app.io.emit('workers-changed', message.workers);
            app.worker.items = message.workers;
        } else if (message.type == 'resetWorker') {
            server.close();
            process.exit(1);
            // isDebug ? process.exit(1) : setTimeout(() => process.exit(1), 1 * 60 * 1000); // Waiting 1 minutes...
        } else if (message.type == 'shutdownWorker') {
            process.exit(4);
        } else if (message.type == 'setPrimaryWorker') {
            app.primaryWorker = true;
        }
    });

    // Launch website -------------------------------------------------------------------------------------------------
    require('./debug')(app);
    server.listen(app.port);
};