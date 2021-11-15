module.exports = app => {
    const schema = app.db.Schema({
        app: String,
        title: String,
        text: String,
        time: String, //{ type: Date, default: Date.now },
    });
    const model = app.db.model('Payment', schema);

    app.model.payment = {
        create: (data, done) => model.create(data, done),
    };
};