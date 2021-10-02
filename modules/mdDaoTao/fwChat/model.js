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

        getAll: (condition, numMessage, done) => done ?
            model.find(condition).sort({ sent: -1 }).populate('user', 'firstname lastname image _id isLecturer isCourseAdmin').limit(numMessage).exec(done) :
            model.find(condition).exec(numMessage),

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

        count: (condition, done) => done ? model.countDocuments(condition, done) : model.countDocuments({}, condition),
    };
};
