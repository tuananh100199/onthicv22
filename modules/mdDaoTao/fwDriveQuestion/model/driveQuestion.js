module.exports = app => {
    const schema = app.db.Schema({
        active: { type: Boolean, default: false },
        title: String,
        image: String,
        answers: { type: [String], default: [] },
        result: { type: Number, default: 0 },
        priority: { type: Number, default: 0 },
        importance: { type: Boolean, default: false },
        category: { type: app.db.Schema.ObjectId, ref: 'DriveQuestionCategory' },
    });
    const model = app.db.model('DriveQuestion', schema);

    app.model.driveQuestion = {
        create: (data, done) => {
            model.create(data, done);
        },

        getPage: (pageNumber, pageSize, condition, done) => {
            model.countDocuments(condition, (error, totalItem) => {
                if (error) {
                    done(error);
                } else {
                    let result = { totalItem, pageSize, pageTotal: Math.ceil(totalItem / pageSize) };
                    result.pageNumber = pageNumber === -1 ? result.pageTotal : Math.min(pageNumber, result.pageTotal);
                    const skipNumber = (result.pageNumber > 0 ? result.pageNumber - 1 : 0) * result.pageSize;

                    model.find(condition).sort({ priority: +1 }).skip(skipNumber).limit(result.pageSize).exec((error, items) => {
                        result.list = error ? [] : items;
                        done(error, result);
                    });
                }
            });
        },

        getAll: (condition, done) => {
            done ? model.find(condition).sort({ priority: +1 }).exec(done) : model.find({}).sort({ priority: +1 }).exec(condition)
        },

        get: (condition, done) => {
            done ? model.findOne(condition).exec(done) : model.findById({}).exec(condition)
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
                app.deleteImage(item.image); //TODO: test
                item.remove(done);
            }
        }),

        // deleteAll: (condition, done) => model.deleteMany(condition, (error) => done(error)),
    };
};
