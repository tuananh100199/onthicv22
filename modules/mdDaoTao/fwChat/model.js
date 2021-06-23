module.exports = app => {
    const schema = app.db.Schema({
        message: String,
        room: String,
        sent: { type: Date, default: Date.now },
        user: { type: app.db.Schema.ObjectId, ref: 'User' },
    });
    const model = app.db.model('Chat', schema);

    app.model.chat = {
        create: (data, done) => model.create(data, done),

        getAll: (condition, done) => done ?
            model.find(condition).sort({ title: 1 }).exec(done) :
            model.find({}).sort({ title: 1 }).exec(condition),

        get: (condition, done) => typeof condition == 'string' ?
            model.findById(condition).exec(done) :
            model.findOne(condition).exec(done),

        // changes = { $set, $unset, $push, $pull }
        update: (_id, changes, done) => model.findOneAndUpdate({ _id }, changes, { new: true }, done),

        delete: (_id, done) => model.findById(_id, (error, item) => {
            if (error) {
                done(error);
            } else if (item == null) {
                done('Invalid Id!');
            } else {
                app.deleteImage(item.image);
                item.remove(done);
            }
        }),
    };
};
