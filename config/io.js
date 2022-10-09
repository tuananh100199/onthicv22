module.exports = (app, http, appConfig) => {
    const redisAdapter = require('socket.io-redis');
    app.io = require('socket.io')(http);
    app.io.adapter(redisAdapter(appConfig.redisDB));

    const socketListeners = {};
    app.io.addSocketListener = (name, listener) => socketListeners[name] = listener;
    // app.io.addSocketListener('someListener', (socket, data) => { });

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
        app.isDebug && console.log(` - Socket ID ${socket.id} connected!`);

        socket.on('disconnect', () => {
            const sessionUser = app.io.getSessionUser(socket);
            if (sessionUser) app.model.chat.leave(sessionUser._id, socket.id);
        });

        const joinSystem = () => {
            const sessionUser = app.io.getSessionUser(socket);
            if (sessionUser) app.model.chat.join(sessionUser._id, socket.id);
        };
        joinSystem();
        socket.on('system:join', joinSystem);

        Object.keys(socketListeners).forEach(name => {
            try {
                const listener = socketListeners[name];
                socket.on(name, data => listener(socket, data));
            } catch (error) {
                console.error(` - Socket ID ${socket.id} listens ${name}:`, error);
            }
        });
    });

    app.isDebug && app.fs.watch('public/js', () => {
        console.log('Debug: Reload client!');
        app.io.emit('system:debug', 'reload');
    });
};