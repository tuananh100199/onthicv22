module.exports = app => {
    const schema = app.db.Schema({
        name: String,
        email: String,
        subject: String,
        message: String,
        userId: app.db.Schema.Types.ObjectId,
        read: { type: Boolean, default: false },
        createdDate: { type: Date, default: Date.now },
    });
    const model = app.db.model('Contact', schema);

    app.model.contact = {
        create: (data, done) => model.create(data, done),

        getAll: (done) => model.find({}).sort({ _id: -1 }).exec(done),

        getUnread: (done) => model.find({ read: false }).sort({ _id: -1 }).exec(done),

        getPage: (pageNumber, pageSize, condition, done) => model.countDocuments(condition, (error, totalItem) => {
            if (error) {
                done(error);
            } else {
                let result = {
                    totalItem,
                    pageSize,
                    pageTotal: Math.ceil(totalItem / pageSize)
                };
                result.pageNumber = pageNumber === -1 ? result.pageTotal : Math.min(pageNumber, result.pageTotal);

                const skipNumber = (result.pageNumber > 0 ? result.pageNumber - 1 : 0) * result.pageSize;
                model.find(condition).sort({ _id: -1 }).skip(skipNumber).limit(result.pageSize).exec((error, list) => {
                    result.list = list;
                    done(error, result);
                });
            }
        }),

        get: (condition, done) => typeof condition == 'string' ?
            model.findById(condition, done) : model.findOne(condition, done),

        read: (_id, done) => model.findOneAndUpdate({ _id }, { $set: { read: true } }, { new: true }, done),

        // changes = { $set, $unset, $push, $pull }
        update: (_id, changes, done) => model.findOneAndUpdate({ _id }, changes, { new: true }, done),

        delete: (_id, done) => model.findById(_id, (error, item) => {
            if (error) {
                done(error);
            } else if (item == null) {
                done('Invalid id!');
            } else {
                item.remove(done);
            }
        }),

        count: (condition, done) => done ? model.countDocuments(condition, done) : model.countDocuments({}, condition),
    };
};