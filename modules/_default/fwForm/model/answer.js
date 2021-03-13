module.exports = app => {
    const schema = app.db.Schema({
        user: { type: app.db.Schema.Types.ObjectId, ref: 'User' },
        userEmail: String,
        userLastname: String,
        userFirstname: String,
        userOrganization: String,
        formId: app.db.Schema.Types.ObjectId,
        answeredDate: { type: Date, default: Date.now },
        record: [{
            questionId: app.db.Schema.Types.ObjectId,
            answer: String,
        }],
        attendance: { type: Boolean, default: false },
    });
    const model = app.db.model('Answer', schema);

    app.model.answer = {
        create: (data, done) => model.create(data, done),

        getPage: (pageNumber, pageSize, condition, done) => model.countDocuments(condition, (error, totalItem) => {
            if (error) {
                done(error);
            } else {
                let result = { totalItem, pageSize, pageTotal: Math.ceil(totalItem / pageSize) };
                result.pageNumber = pageNumber === -1 ? result.pageTotal : Math.min(pageNumber, result.pageTotal);
                const skipNumber = (result.pageNumber > 0 ? result.pageNumber - 1 : 0) * result.pageSize;
                model.find(condition).sort({ answeredDate: 1 }).select('-record').skip(skipNumber).limit(result.pageSize).populate('user', '_id firstname lastname').exec((error, items) => {
                    result.list = items;
                    done(error, result);
                });
            }
        }),

        get: (condition, done) => typeof condition == 'string' ? model.findById(condition, done) : model.findOne(condition, done),

        getAll: (condition, params, done) => {
            if (!done || typeof params === 'function') {
                model.find(condition).populate('user', '-password').exec(params);
            } else {
                model.find(condition, params).populate('user', '-password').exec(done);
            }
        },

        update: (_id, changes, done) => model.findOneAndUpdate({ _id }, { $set: changes }, { new: true }, (error, item) => {
            if (error || !item) {
                done && done(error);
            } else {
                model.findById(_id).populate('user', '_id lastname firstname').exec(done);
            }
        }),

        delete: (condition, done) => typeof condition == 'string' ? // condition is _id
            model.findById(condition, (error, item) => {
                if (error) {
                    done(error);
                } else if (item == null) {
                    done('Invalid Id!');
                } else {
                    item.remove(done);
                }
            }) : model.deleteMany(condition, (error) => done(error)),

        count: (condition, done) => model.countDocuments(condition, done),
    };
};
