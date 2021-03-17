module.exports = app => {
    const schema = app.db.Schema({
        title: String,
        shortDescription: String,
        detailDescription: String,
        lesson: { type: [{ type: app.db.Schema.Types.ObjectId, ref: 'Lesson' }], default: [] },
        subjectQuestion: { type: [{ type: app.db.Schema.Types.ObjectId, ref: 'SubjectQuestion' }], default: [] },
    });
    const model = app.db.model('Subject', schema);

    app.model.subject = {
        create: (data, done) => {
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

        getAll: (condition, done) => {
            if (done == undefined) {
                done = condition;
                condition = {};
            }
            model.find(condition).sort({ title: 1 }).exec(done);
        },

        get: (condition, option, done) => {
            const handleGet = (condition, option, done) => {
                const select = option.select ? option.select : null;
                const populate = option.populate ? option.populate : false;

                const result = typeof condition == 'object' ? model.findOne(condition) : model.findById(condition);
                if (select) result.select(select);
                if (populate) result.populate('lesson', '_id title').populate('subjectQuestion');
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

        pushSubjectQuestion: (condition, SubjectQuestionId, SubjectQuestionTitle, SubjectQuestionContent, SubjectQuestionActive, done) => {
            model.findOneAndUpdate(condition, { $push: { subjectQuestion: { _id: SubjectQuestionId, title: SubjectQuestionTitle, content: SubjectQuestionContent, active: SubjectQuestionActive } } }, { new: true }).select('_id subjectQuestion').populate('subjectQuestion').exec(done);
        },

        deleteLesson: (condition, lessonId, done) => {
            model.findOneAndUpdate(condition, { $pull: { lesson: lessonId } }).exec(done);
        },
    };
};
