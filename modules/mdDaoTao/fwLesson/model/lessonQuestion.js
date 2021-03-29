module.exports = app => {
    const schema = app.db.Schema({
        title: String,
        image: String,
        answers: { type: String, default: '' },
        trueAnswer: Number,
        active: { type: Boolean, default: true },
    });
    const model = app.db.model('LessonQuestion', schema);

    app.model.lessonQuestion = {
        create: (data, done) => model.create(data, done),

        getAll: (condition, done) => {
            done ? model.find(condition).exec(done) : model.find({}).exec(condition);
        },

        get: (condition, done) => {
            if (done == undefined) {
                done = condition;
                condition = {};
            }
            if (typeof condition == 'string') condition = { _id: condition };
            model.findOne(condition).exec(done);
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
                app.deleteImage(item.image);
                item.remove(done);
            }
        }),
    };
};