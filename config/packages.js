module.exports = (app, http, appConfig) => {
    app.componentModel = {};
    app.url = require('url');

    // Protect your app from some well-known web vulnerabilities by setting HTTP headers appropriately
    const helmet = require('helmet');
    app.use(helmet.dnsPrefetchControl());
    app.use(helmet.frameguard());
    app.use(helmet.hidePoweredBy());
    app.use(helmet.hsts());
    app.use(helmet.ieNoOpen());
    // app.use(helmet.noCache());
    app.use(helmet.xssFilter());
    // app.use(helmet.referrerPolicy());
    app.use(helmet.permittedCrossDomainPolicies());

    // Get information from html forms
    const bodyParser = require('body-parser');
    app.use(bodyParser.json({ limit: '50mb' }));
    app.use(bodyParser.urlencoded({ limit: '50mb', extended: true, parameterLimit: 100000 }));

    // Cryptography
    app.crypt = require('bcrypt-nodejs');
    app.getToken = length => Array(length).fill('~!@#$%^&*()0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz').map(x => x[Math.floor(Math.random() * x.length)]).join('');
    // app.sha256 = require('crypto-js/sha256');

    // Configure session
    app.set('trust proxy', 1); // trust first proxy
    const session = require('express-session'),
        sessionOptions = {
            secret: '@KKPR*u_-_7RXeN^P5!z_2JhV-u5Dq=ZZt3hY5GwU38u?*GsTjcKSXfC24_NWM%^7!_x$z3-Ag&HtLMg!2Anpn84t$Tw9N&ucq9',
            key: 'hiep-phat',
            resave: false,
            saveUninitialized: true,
            cookie: {
                maxAge: 3600000 * 24 * 7// one week
            }
        };
    if (appConfig && app.redis) {
        // console.log(` - #${process.pid}: The system used Redis session!`);
        const redisStore = require('connect-redis')(session);
        sessionOptions.store = new redisStore({ client: app.redis, prefix: appConfig.name + '_sess:' });
    }
    const sessionMiddleware = session(sessionOptions);
    app.use(sessionMiddleware);
    app.io.use((socket, next) => sessionMiddleware(socket.request, sessionOptions, next));

    // Read cookies (needed for auth)
    const cookieParser = require('cookie-parser');
    app.use(cookieParser());

    // Multi upload
    const multiparty = require('multiparty');
    app.getUploadForm = () => new multiparty.Form({ uploadDir: app.uploadPath });

    // Image processing library
    app.jimp = require('jimp');

    // Libraries
    require('./lib/array')(app);
    require('./lib/date')(app);
    require('./lib/docx')(app);
    require('./lib/email')(app);
    require('./lib/excel')(app);
    require('./lib/fs')(app);
    // require('./lib/language')(app);
    require('./lib/schedule')(app);
    require('./lib/string')(app);
};