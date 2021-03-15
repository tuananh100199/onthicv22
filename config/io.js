module.exports = (app, http) => {
    const redis = require('socket.io-redis');
    app.io = require('socket.io')(http);
    app.io.adapter(redis({ host: 'localhost', port: 6379 }));

    app.io.on('connection', socket => app.onSocketConnect(socket));

    if (app.isDebug) {
        app.fs.watch('public/js', (eventType, filename) => {
            console.log('Reload client!');
            app.io.emit('debug', 'reload');
        });
    }
};