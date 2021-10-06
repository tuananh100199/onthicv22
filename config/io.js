module.exports = (app, http, appConfig) => {
    const redisAdapter = require('socket.io-redis');
    app.io = require('socket.io')(http);
    app.io.adapter(redisAdapter(appConfig.redisDB));

    app.io.on('connection', socket => {
        console.log('A user connected.');
        socket.on('sendRoomClient', (data) => {
            data && data.map(room => socket.join(room));
        });
        socket.on('sendDataClient', (data) => {
            data.user = socket.request.session ? socket.request.session.user : null;
            app.io.to(data.room).emit('sendDataServer', { data });
        });
        socket.on('disconnect', () => console.log('A user disconnected'));
    });
    // app.io.on('connection', socket => {
    //     console.log('A user connected.');
    //     socket.on('disconnect', () => console.log('A user disconnected'));
    // });
    app.isDebug && app.fs.watch('public/js', () => {
        console.log('Debug: Reload client!');
        app.io.emit('debug', 'reload');
    });

    app.io.on('connection', socket => {
        app.isDebug && console.log(`Socket ID ${socket.id} connected!`);
        // socket.on('disconnect', () => console.log('A user disconnected'));

        //console.log('socket.request.session', socket.request.session ? socket.request.session.user : null);

        // socket.on('abc', () => {
        //     console.log(socket.request.session);
        // });
    });
};