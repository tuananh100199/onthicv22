module.exports = (app, appConfig) => {
    // Connect RedisDB ----------------------------------------------------------------------------
    const redis = require('redis');
    app.database.redisDB = redis.createClient();
    app.database.redisDB.on('connect', () => console.log(` - #${process.pid}: The Redis connection succeeded.`));
    app.database.redisDB.on('error', error => console.log(` - #${process.pid}: The Redis connection failed!`, error.message) || app.database.redisDB.end(true));

    // Connect MongoDB ----------------------------------------------------------------------------
    const mongoConnectionString = `mongodb://${appConfig.mongoDB.host}:${appConfig.mongoDB.port}/${appConfig.mongoDB.dbName}`;
    const mongoose = require('mongoose');
    app.database.mongoDB = { Schema: mongoose.Schema };
    app.db = require('mongoose');
    app.db.connect(mongoConnectionString, { useNewUrlParser: true, useUnifiedTopology: true });
    app.db.connection.on('error', console.error.bind(console, ` - #${process.pid}: The MongoDB connection failed!`));
    app.db.connection.once('open', () => console.log(` - #${process.pid}: The MongoDB connection succeeded.`));
};