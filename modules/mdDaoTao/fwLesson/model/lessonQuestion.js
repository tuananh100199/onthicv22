module.exports = app => {
    const schema = app.db.Schema({
        active: { type: Boolean, default: false },
        title: String,
        defaultAnswer: String,
        content: String,
        typeValue: { type: [String], default: [] }
    });
    const model = app.db.model('LessonQuestion', schema);

    app.model.lessonQuestion = {
        create: (data, done) => model.create(data, done),

        getAll: (condition, done) => {
            done ? model.find(condition).exec(done) : model.find({}).exec(condition)
        },

        get: (condition, done) => {
            done ? model.findOne(condition).exec(done) : model.findById({}).exec(condition)
        },

        update: (_id, $set, $unset, done) => done ?
            model.findOneAndUpdate({ _id }, { $set, $unset }, { new: true }, done) :
            model.findOneAndUpdate({ _id }, { $set }, { new: true }, $unset),

        delete: (_id, done) => model.findOne({ _id }, (error, item) => {
            //TODO: xóa câu trả lời liên quan tới câu hỏi này
            if (error) {
                done(error);
            } else if (item == null) {
                done('Invalid Id!');
            } else {
                item.remove(done);
            }
        }),

        deleteAll: (condition, done) => model.deleteMany(condition, (error) => done(error)),
    };
};
