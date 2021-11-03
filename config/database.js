module.exports = (app, appConfig) => {
    // Connect RedisDB ----------------------------------------------------------------------------
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
    const mongoConnectionString = `mongodb://${appConfig.mongoDB.host}:${appConfig.mongoDB.port}/${appConfig.mongoDB.dbName}`;
    app.db = require('mongoose');
    app.db.connect(mongoConnectionString, { useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false });
    app.db.connection.on('error', console.error.bind(console, ` - #${process.pid}: The MongoDB connection failed!`));
    app.db.connection.once('open', () => console.log(` - #${process.pid}: The MongoDB connection succeeded.`));

    // Define all models --------------------------------------------------------------------------
    app.model = {};
};
