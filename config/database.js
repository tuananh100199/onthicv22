module.exports = (app) => {
    // Connect RedisDB ------------------------------------------------------------------------------------------------------------------------------
    const redis = require('redis');
    app.redis = redis.createClient();
    app.redis.on('connect', () => {
        console.log(` - #${process.pid}: The Redis connection succeeded.`);
    });
    app.redis.on('error', error => {
        console.log(` - #${process.pid}: The Redis connection failed!`, error.message);
        app.redis.end(true);
    });

    // Connect MongoDB ----------------------------------------------------------------------------
    app.db = require('mongoose');
    app.db.connect(app.mongodb, { useNewUrlParser: true });
    app.db.connection.on('error', console.error.bind(console, 'The MongoDB connection error'));
    app.db.connection.once('open', callback => console.log(' - The MongoDB connection succeeded.'));

    // Define all models --------------------------------------------------------------------------
    app.model = {};
};
