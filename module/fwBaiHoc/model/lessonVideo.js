module.exports = app => {
    const schema = app.db.Schema({
        title: String,
        link: String,
        image: String,
    });
    const model = app.db.model('LessonVideo', schema);

    app.model.lessonVideo = {
        create: (data, done) => model.create(data, done),

        getAll: (done) => model.find({}).exec(done),

        get: (condition, option, done) => {
            const handleGet = (condition, option, done) => {
                const select = option.select ? option.select : null;
                const populate = option.populate ? option.populate : false;

                const result = typeof condition == 'object' ? model.findOne(condition) : model.findById(condition);
                if (select) result.select(select);
                if (populate) result.populate('lessonVideo', '_id title');
                result.exec(done);
            };

            if (done) {
                handleGet(condition, option, done);
            } else {
                handleGet(condition, {}, option);
            }
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

        deleteAll: (condition, done) => model.deleteMany(condition, (error) => done(error)),
    };
};
