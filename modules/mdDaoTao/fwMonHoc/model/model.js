module.exports = app => {
    const schema = app.db.Schema({
        title: String,
        shortDescription: String,
        detailDescription: String,
        lesson: { type: [{ type: app.db.Schema.Types.ObjectId, ref: 'Lesson' }], default: [] },
        feedbackQuestion: { type: [{ type: app.db.Schema.Types.ObjectId, ref: 'FeedbackQuestion' }], default: [] },
    });
    const model = app.db.model('Subject', schema);

    app.model.subject = {
        create: (data, done) => {
            if (!data.title) data.title = 'Môn học mới';
            model.create(data, done)
        },

        getPage: (pageNumber, pageSize, condition, done) => model.countDocuments(condition, (error, totalItem) => {
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
        }),

        getAll: done => model.find({}).sort({ _id: -1 }).exec(done),

        get: (condition, option, done) => {
            const handleGet = (condition, option, done) => {
                const select = option.select ? option.select : null;
                const populate = option.populate ? option.populate : false;

                const result = typeof condition == 'object' ? model.findOne(condition) : model.findById(condition);
                if (select) result.select(select);
                if (populate) result.populate('lesson', '_id title').populate('feedbackQuestion');
                result.exec(done);
            };

            if (done) {
                handleGet(condition, option, done);
            } else {
                handleGet(condition, {}, option);
            }
        },

        update: (_id, changes, done) => model.findOneAndUpdate({ _id }, { $set: changes }, { new: true }, done),

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


        addLesson: (condition, lessonId, done) => {
            model.findOneAndUpdate(condition, { $push: { lesson: lessonId } }, { new: true }).select('_id lesson').populate('lesson').exec(done);
        },

        pushFeedbackQuestion: (condition, feedbackQuestionId, feedbackQuestionTitle, feedbackQuestionContent, feedbackQuestionActive, done) => {
            model.findOneAndUpdate(condition, { $push: { feedbackQuestion: { _id: feedbackQuestionId, title: feedbackQuestionTitle, content: feedbackQuestionContent, active: feedbackQuestionActive } } }, { new: true }).select('_id feedbackQuestion').populate('feedbackQuestion').exec(done);
        },

        deleteLesson: (condition, lessonId, done) => {
            model.findOneAndUpdate(condition, { $pull: { lesson: lessonId } }).exec(done);
        },
    };
};
