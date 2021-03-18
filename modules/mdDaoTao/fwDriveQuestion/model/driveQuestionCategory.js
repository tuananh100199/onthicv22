module.exports = app => {
    const schema = app.db.Schema({
        active: { type: Boolean, default: false },
        title: String,
    });
    const model = app.db.model('DriveQuestionCategory', schema);

    app.model.driveQuestionCategory = {
        create: (data, done) => {
            model.create(data, done);
        },

        getAll: (condition, done) => {
            done ? model.find(condition).sort({ title: +1 }).exec(done) : model.find({}).sort({ title: +1 }).exec(condition)
        },

        get: (condition, done) => {
            done ? model.findOne(condition).exec(done) : model.findById(condition).exec(condition)
        },

        update: (_id, $set, $unset, done) => done ?
            model.findOneAndUpdate({ _id }, { $set, $unset }, { new: true }, done) :
            model.findOneAndUpdate({ _id }, { $set }, { new: true }, $unset),

        delete: (_id, done) => model.findOne({ _id }, (error, item) => {
            if (error) {
                done(error);
            } else if (item == null) {
                done('Invalid Id!');
            } else {
                item.remove(done);
            }
        }),
    };
};
