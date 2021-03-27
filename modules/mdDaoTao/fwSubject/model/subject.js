module.exports = app => {
    const schema = app.db.Schema({
        priority: Number,
        title: String,
        shortDescription: String,
        detailDescription: String,
        lessons: { type: [{ type: app.db.Schema.Types.ObjectId, ref: 'Lesson' }], default: [] },
        questions: { type: [{ type: app.db.Schema.Types.ObjectId, ref: 'SubjectQuestion' }], default: [] },
    });
    const model = app.db.model('Subject', schema);

    app.model.subject = {
        create: (data, done) => {
            model.find({}).sort({ priority: -1 }).limit(1).exec((error, items) => {
                data.priority = error || items == null || items.length === 0 ? 1 : items[0].priority + 1;
                model.create(data, done)
            })
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
            model.findOne(condition).populate('lessons').populate('questions').exec(done);
        },

        update: (_id, $set, $unset, done) => done ?
            model.findOneAndUpdate({ _id }, { $set, $unset }, { new: true }, done) :
            model.findOneAndUpdate({ _id }, { $set }, { new: true }, $unset),

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

        addLesson: (_id, lessons, done) => {
            model.findOneAndUpdate(_id, { $push: { lessons } }, { new: true }).populate('lessons').exec(done);
        },

        deleteLesson: (_id, _subjectLessonId, done) => {
            model.findOneAndUpdate({ _id }, { $pull: { lessons: _subjectLessonId } }).populate('lessons').exec(done);
        },

        addQuestion: (_id, questions, done) => {
            model.findOneAndUpdate({ _id }, { $push: { questions } }, { new: true }).populate('questions').exec(done);
        },

        deleteQuestion: (_id, subjectQuestionId, done) => {
            model.findOneAndUpdate({ _id }, { $pull: { questions: subjectQuestionId } }).populate('questions').exec(done);
        },
    };
};
