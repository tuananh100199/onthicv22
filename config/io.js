module.exports = (app, http, appConfig) => {
    const redisAdapter = require('socket.io-redis');
    app.io = require('socket.io')(http);
    app.io.adapter(redisAdapter(appConfig.redisDB));
    app.io.adapter(redisAdapter({ host: 'localhost', port: 6379 }));

    app.isDebug && app.fs.watch('public/js', () => {
        console.log('Debug: Reload client!');
        app.io.emit('debug', 'reload');
    });

    app.io.on('connection', socket => {
        app.isDebug && console.log(`Socket ID ${socket.id} connected!`);
        // socket.on('disconnect', () => console.log('A user disconnected'));

        // socket.on('abc', () => {
        //     console.log(socket.request.session);
        // });
    });
};