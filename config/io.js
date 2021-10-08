module.exports = (app, http, appConfig) => {
    const redisAdapter = require('socket.io-redis');
    app.io = require('socket.io')(http);
    app.io.adapter(redisAdapter(appConfig.redisDB));

    const socketListeners = {};
    app.io.onSocketListener = (name, listener) => socketListeners[name] = listener;
    // app.io.onSocketListener('someListener', (socket, data) => { });

    app.io.getSessionUser = (socket) => {
        const sessionUser = socket.request.session ? socket.request.session.user : null;
        if (sessionUser) {
            delete sessionUser.password;
            delete sessionUser.token;
            delete sessionUser.tokenDate;
            delete sessionUser.fcmToken;
        }
        return sessionUser;
    };

    app.io.on('connection', socket => {
        app.isDebug && console.log(`Socket ID ${socket.id} connected!`);
        app.isDebug && socket.on('disconnect', () => console.log(`Socket ID ${socket.id} disconnected!`));

        Object.keys(socketListeners).forEach(name => {
            const listener = socketListeners[name];
            socket.on(name, data => listener(socket, data));
        });
    });

    app.isDebug && app.fs.watch('public/js', () => {
        console.log('Debug: Reload client!');
        app.io.emit('debug', 'reload');
    });
};