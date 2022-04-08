module.exports = app => {
    const schema = app.db.Schema({
        title: String,
        shortDescription: String,
        detailDescription: String,
        totalTime: Number,
        monThucHanh: { type: Boolean, default: false },
        monTienQuyet: { type: Boolean, default: false },
        lessons: { type: [{ type: app.db.Schema.Types.ObjectId, ref: 'Lesson' }], default: [] },
        questions: { type: [{ type: app.db.Schema.Types.ObjectId, ref: 'Question' }], default: [] },
        questionTypes: [{
            category: { type: app.db.Schema.ObjectId, ref: 'Category' },
            amount: Number,
        }],
        finalQuestions: [],

        gioHocLyThuyetLT: Number,
        gioHocLyThuyetTH: Number,
        gioHocTrongHinh: Number,
        gioHocTrenDuong: Number,
        cuoiKhoa: Number,

    });
    const model = app.db.model('Subject', schema);

    app.model.subject = {
        create: (data, done) => model.create(data, done),

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

        update: (_id, changes, done) => model.findOneAndUpdate({ _id }, changes, { new: true }, done).populate('questions'), // changes = { $set, $unset, $push, $pull }

        delete: (_id, done) => {
            model.findById(_id, (error, item) => {
                if (item) {
                    app.deleteImage(item.image);
                    app.model.question.delete(item.questions, error => error && console.error(error));
                    item.remove(done);
                } else {
                    done(error || 'Invalid Id!');
                }
            });
        },

        addLesson: (_id, lesson, done) => {
            model.findOneAndUpdate(_id, { $push: { lessons: lesson } }, { new: true }).populate('lessons').exec(done);
        },
        deleteLesson: (_id, _subjectLessonId, done) => {
            model.findOneAndUpdate({ _id }, { $pull: { lessons: _subjectLessonId } }, { new: true }).populate('lessons').exec(done);
        },
    };
};
