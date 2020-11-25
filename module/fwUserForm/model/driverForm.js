module.exports = app => {
    const schema = app.db.Schema({
        title: String,
        image: String, //Cover image
        description: String,
        active: { type: Boolean, default: false },
        lock: { type: Boolean, default: false },

        maxRegisterUsers: { type: Number, default: -1 }, // -1 is infinity
        createdDate: { type: Date, default: Date.now },
        startRegister: { type: Date, default: Date.now },
        stopRegister: Date, // null is forever
        questions: { type: [{ type: app.db.Schema.Types.ObjectId, ref: 'Question' }], default: [] },
    });
    const model = app.db.model('DriverForm', schema);

    app.model.driverForm = {
        create: (data, done) => model.create(data, done),

        getPage: (pageNumber, pageSize, condition, done) => model.countDocuments(condition, (error, totalItem) => {
            if (error) {
                done(error);
            } else {
                let result = { totalItem, pageSize, pageTotal: Math.ceil(totalItem / pageSize) };
                result.pageNumber = pageNumber === -1 ? result.pageTotal : Math.min(pageNumber, result.pageTotal);

                const skipNumber = (result.pageNumber > 0 ? result.pageNumber - 1 : 0) * result.pageSize;
                model.find(condition).sort({ _id: -1 }).skip(skipNumber).limit(result.pageSize).select('-description -questions').exec((error, items) => {
                    result.list = error ? [] : items;
                    done(error, result);
                });
            }
        }),

        get: (condition, option, done) => {
            const handleGet = (condition, option, done) => {
                const select = option.select ? option.select : null;
                const populate = option.populate ? option.populate : false;

                const result = typeof condition == 'object' ? model.findOne(condition) : model.findById(condition);
                if (select) result.select(select);
                if (populate) result.populate('questions');
                result.exec(done);
            };

            if (done) {
                handleGet(condition, option, done);
            } else {
                handleGet(condition, {}, option);
            }
        },

        update: (_id, $set, $unset, done) => done ? model.findOneAndUpdate({ _id }, { $set, $unset }, { new: true }, done) : model.findOneAndUpdate({ _id }, { $set }, { new: true }, $unset),

        pushQuestion: (condition, questionId, done) => {
            model.findOneAndUpdate(condition, { $push: { questions: questionId } }, { new: true }).select('_id questions').populate('questions').exec(done);
        },

        delete: (_id, done) => model.findById(_id, (error, item) => {
            if (error) {
                done(error);
            } else if (item == null) {
                done('Invalid Id!');
            } else {
                //Delete all Registration
                app.model.answer.delete({ postId: item._id }, (error) => {
                    if (error) {
                        done(error);
                    } else {
                        //Concat all questions Id and delete all questions
                        const questions = item.questions;
                        app.model.question.deleteAll({ _id: { $in: questions } }, err => {
                            if (err) {
                                done(err);
                            } else {
                                app.deleteImage(item.image);
                                item.remove(done);
                            }
                        });
                    }
                });
            }
        }),
    }
};