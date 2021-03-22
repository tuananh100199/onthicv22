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

        get: (condition, done) => {
            if (done == undefined) {
                done = condition;
                condition = {};
            }
            if (typeof condition == 'string') condition = { _id: condition };
            model.findOne(condition).populate('lesson').populate('subjectQuestion').exec(done);
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

        addSubjectLesson: (condition, subjectLessonId, done) => {
            model.findOneAndUpdate(condition, { $push: { lesson: subjectLessonId } }, { new: true }).populate('lesson').exec(done);
        },

        deleteSubjectLesson: (_id, subjectLessonId, done) => {
            model.findOneAndUpdate({ _id }, { $pull: { lesson: subjectLessonId } }).populate('lesson').exec(done);
        },

        addSubjectQuestion: (_id, subjectQuestion, done) => {
            model.findOneAndUpdate({ _id }, { $push: { subjectQuestion } }, { new: true }).populate('subjectQuestion').exec(done);
        },

        deleteSubjectQuestion: (_id, subjectQuestionId, done) => {
            model.findOneAndUpdate({ _id }, { $pull: { subjectQuestion: subjectQuestionId } }).populate('subjectQuestion').exec(done);
        },
    };
};
