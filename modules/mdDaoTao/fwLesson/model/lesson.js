module.exports = app => {
    const schema = app.db.Schema({
        priority: Number,
        title: String,
        shortDescription: String,
        detailDescription: String,
        author: String,
        lessonVideo: { type: [{ type: app.db.Schema.Types.ObjectId, ref: 'LessonVideo' }], default: [] },
        lessonQuestion: { type: [{ type: app.db.Schema.Types.ObjectId, ref: 'LessonQuestion' }], default: [] },
    });
    const model = app.db.model('Lesson', schema);

    app.model.lesson = {
        create: (data, done) => {
            model.find({}).sort({ priority: -1 }).limit(1).exec((error, items) => {
                data.priority = error || items == null || items.length === 0 ? 1 : items[0].priority + 1;
                model.create(data, done)
            })
        },

        getPage: (pageNumber, pageSize, condition, done) => {
            model.countDocuments(condition, (error, totalItem) => {
                if (error) {
                    done(error);
                } else {
                    let result = { totalItem, pageSize, pageTotal: Math.ceil(totalItem / pageSize) };
                    result.pageNumber = pageNumber === -1 ? result.pageTotal : Math.min(pageNumber, result.pageTotal);
                    const skipNumber = (result.pageNumber > 0 ? result.pageNumber - 1 : 0) * result.pageSize;

                    model.find(condition).sort({ title: 1 }).skip(skipNumber).limit(result.pageSize).exec((error, items) => {
                        result.list = error ? [] : items;
                        done(error, result);
                    });
                }
            });
        },

        getAll: (condition, done) => {
            done ? model.find(condition).exec(done) : model.find({}).exec(condition)
        },

        get: (condition, done) => {
            if (done == undefined) {
                done = condition;
                condition = {};
            }
            if (typeof condition == 'string') condition = { _id: condition };
            model.findOne(condition).populate('lessonVideo').populate('lessonQuestion').exec(done);
        },

        update: (_id, $set, $unset, done) => done ?
            model.findOneAndUpdate({ _id }, { $set, $unset }, { new: true }, done) :
            model.findOneAndUpdate({ _id }, { $set }, { new: true }, $unset),

        delete: (_id, done) => {
            model.findById(_id, (error, item) => {
                if (error) {
                    done(error);
                } else if (item == null) {
                    done('Invalid Id!');
                } else {
                    app.deleteImage(item.image);
                    item.remove(done);
                }
            });
        },

        addLessonVideo: (_id, lessonVideo, done) => {
            model.findOneAndUpdate({ _id }, { $push: { lessonVideo } }, { new: true }).populate('lessonVideo').exec(done);
        },
        deleteLessonVideo: (_id, _lessonVideoId, done) => {
            model.findOneAndUpdate({ _id }, { $pull: { lessonVideo: _lessonVideoId } }).populate('lessonVideo').exec(done);
        },

        addLessonQuestion: (_id, lessonQuestion, done) => {
            model.findOneAndUpdate({ _id }, { $push: { lessonQuestion } }, { new: true }).populate('lessonQuestion').exec(done);
        },
        deleteLessonQuestion: (_id, lessonQuestion, done) => {
            model.findOneAndUpdate({ _id }, { $pull: { lessonQuestion } }).populate('lessonQuestion').exec(done);
        },

        count: (condition, done) => done ? model.countDocuments(condition, done) : model.countDocuments({}, condition),
    };
};
