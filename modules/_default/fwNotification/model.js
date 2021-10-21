module.exports = app => {
    const schema = app.db.Schema({
        type: String,                                           // Loại notification
        title: String,
        content: String,
        image: String,
        active: { type: Boolean, default: true },
        createdDate: { type: Date, default: Date.now },
    });
    const model = app.db.model('Notification', schema);

    app.model.notification = {
        create: (data, done) => model.create(data, done),

        getAll: (condition, done) => model.find(condition).sort({ createdDate: -1 }).exec(done),

        get: (condition, done) => typeof condition == 'string' ? model.findById(condition, done) : model.findOne(condition, done),

        update: (condition, changes, done) => typeof condition == 'string' ?
            model.findOneAndUpdate({ _id: condition }, { $set: changes }, { new: true }, done) :
            model.updateMany(condition, { $set: changes }, { new: true }, done),

        delete: (_id, done) => model.findOne({ _id }, (error, item) => {
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