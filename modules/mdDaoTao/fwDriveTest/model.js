module.exports = app => {
    const schema = app.db.Schema({
        title: String,
        active: { type: Boolean, default: true },
        priority: { type: Number, default: 0 },
        courseType: { type: app.db.Schema.ObjectId, ref: 'CourseType' },
        questions: { type: [{ type: app.db.Schema.Types.ObjectId, ref: 'DriveQuestion' }], default: [] },
        description: String,
    });
    const model = app.db.model('DriveTest', schema);

    app.model.driveTest = {
        create: (data, done) => {
            model.find({}).sort({ priority: -1 }).limit(1).exec((error, items) => {
                data.priority = error || items == null || items.length === 0 ? 1 : items[0].priority + 1;
                model.create(data, done);
            });
        },

        getPage: (pageNumber, pageSize, condition, done) => {
            model.countDocuments(condition, (error, totalItem) => {
                if (error) {
                    done(error);
                } else {
                    let result = { totalItem, pageSize, pageTotal: Math.ceil(totalItem / pageSize) };
                    result.pageNumber = pageNumber === -1 ? result.pageTotal : Math.min(pageNumber, result.pageTotal);
                    const skipNumber = (result.pageNumber > 0 ? result.pageNumber - 1 : 0) * result.pageSize;

                    model.find(condition).populate('courseType', 'title').sort({ priority: -1 }).skip(skipNumber).limit(result.pageSize).exec((error, items) => {
                        result.list = error ? [] : items;
                        done(error, result);
                    });
                }
            });
        },

        getAll: (condition, done) => done ? model.find(condition).sort({ priority: -1 }).exec(done) : model.find({}).sort({ priority: -1 }).exec(condition),

        get: (condition, done) => {
            if (typeof condition == 'string') condition = { _id: condition };
            model.findOne(condition).populate('courseType', 'title').populate('questions').exec(done);
        },

        // changes = { $set, $unset, $push, $pull }
        update: (_id, changes, done) => model.findOneAndUpdate({ _id }, changes, { new: true }, done).populate('questions', 'title categories'),

        swapPriority: (_id, isMoveUp, done) => model.findById(_id, (error, item1) => {
            if (error || item1 === null) {
                done('Invalid drive question Id!');
            } else {
                model.find({ priority: isMoveUp ? { $gt: item1.priority } : { $lt: item1.priority } })
                    .sort({ priority: isMoveUp ? 1 : -1 }).limit(1).exec((error, list) => {
                        if (error) {
                            done(error);
                        } else if (list == null || list.length === 0) {
                            done(null);
                        } else {
                            let item2 = list[0],
                                priority = item1.priority;
                            item1.priority = item2.priority;
                            item2.priority = priority;
                            item1.save(error1 => item2.save(error2 => done(error1 ? error1 : error2)));
                        }
                    });
            }
        }),

        delete: (_id, done) => model.findOne({ _id }, (error, item) => {
            if (error) {
                done(error);
            } else if (item == null) {
                done('Invalid Id!');
            } else {
                item.remove(done);
            }
        }),

        addQuestion: (_id, question, done) => {
            model.findOneAndUpdate({ _id }, { $push: { questions: question } }, { new: true }).populate('questions', 'title categories').exec(done);
        },
        deleteQuestion: (_id, _questionId, done) => {
            model.findOneAndUpdate({ _id }, { $pull: { questions: _questionId } }, { new: true }).populate('questions', 'title categories').exec(done);
        },
    };
};
