const package = require('./package');
const express = require('express');
const passport = require('passport');
const app = express();
app.fs = require('fs');
app.path = require('path');
app.isDebug = !__dirname.startsWith('/var/www/');
const server = app.isDebug ?
    require('http').createServer(app) :
    require('https').createServer({
        cert: app.fs.readFileSync('/etc/ssl/hiepphat_certificate.crt'),
        ca: app.fs.readFileSync('/etc/ssl/hiepphat_ca_bundle.crt'),
        key: app.fs.readFileSync('/etc/ssl/hiepphat_private.key'),
    }, app);

// Variables ==================================================================
app.title = package.title;
app.port = package.port;
app.rootUrl = package.rootUrl;
app.debugUrl = `http://localhost:${app.port}`;
app.mongodb = `mongodb://localhost:27017/${package.dbName}`;
app.email = package.email;
app.defaultAdminEmail = package.default.adminEmail;
app.defaultAdminPassword = package.default.adminPassword;
app.assetPath = app.path.join(__dirname, 'asset');

app.viewPath = app.path.join(__dirname, package.path.view);
app.modulePath = app.path.join(__dirname, package.path.module);
app.publicPath = app.path.join(__dirname, package.path.public);
app.imagePath = app.path.join(package.path.public, 'img');
app.uploadPath = app.path.join(__dirname, package.path.upload);
app.faviconPath = app.path.join(__dirname, package.path.favicon);

// app.version = package.version;
// app.description = package.description;
// app.autoLogin = package.autoLogin;

// Configure ==================================================================
app.use(passport.initialize());
app.use(passport.session()); // persistent login sessions
require('./config/common')(app);
require('./config/view')(app, express);
require('./config/packages')(app, server, package);
require('./config/database')(app);
require('./config/authentication')(app);
require('./config/permission')(app);
require('./config/io')(app, server);

// Init =======================================================================
app.createTemplate('home', 'admin');
app.loadModules();
app.setupAdmin();
app.createFolder(app.publicPath, app.uploadPath);
app.createFolder(app.path.join(app.publicPath, '/img'), app.path.join(app.publicPath, '/img/draft'))

// Default route ==============================================================
app.get('/user', app.permission.check(), app.templates.admin);
app.get('*', (req, res, next) => {
    const link = req.path.endsWith('/') && req.path.length > 1 ? req.path.substring(0, req.path.length - 1) : req.path;
    app.model.menu.get({ link }, (error, menu) =>
        (error || menu == null) ? next() : app.templates.home(req, res));
});
app.isDebug && app.permission.getTreeMenuText();

// Launch website =============================================================
require('./config/debug')(app);
server.listen(app.port, () => console.log(` - ${app.title} is ${app.isDebug ? 'debugging on ' + app.debugUrl : 'running on http://localhost:' + app.port}`));
