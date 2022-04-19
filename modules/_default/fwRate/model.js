module.exports = app => {
    const schema = app.database.mongoDB.Schema({
        user: { type: app.database.mongoDB.Schema.ObjectId, ref: 'User' },        // Người đánh giá
        _refId: app.database.mongoDB.Schema.ObjectId,      // Đối tượng được đánh giá
        createdDate: { type: Date, default: Date.now },
        value: Number,
        note: String,
        type: String,
    });
    const model = app.db.model('Rate', schema);

    app.model.rate = {
        create: (data, done) => model.create(data, done),

        getPage: (pageNumber, pageSize, condition, sort, done) => model.countDocuments(condition, (error, totalItem) => {
            if (error) {
                done(error);
            } else {
                if (done == undefined) {
                    done = sort;
                    sort = { createdDate: -1 };
                }
                const result = { totalItem, pageSize, pageTotal: Math.ceil(totalItem / pageSize) };
                result.pageNumber = pageNumber === -1 ? result.pageTotal : Math.min(pageNumber, result.pageTotal);

                const skipNumber = (result.pageNumber > 0 ? result.pageNumber - 1 : 0) * result.pageSize;
                model.find(condition).populate('user', 'lastname firstname phoneNumber identityCard').populate('_refId', 'lastname firstname phoneNumber identityCard')
                    .sort(sort).skip(skipNumber).limit(result.pageSize).exec((error, list) => {
                        result.list = list;
                        done(error, result);
                    });
            }
        }),

        get: (condition, done) => typeof condition == 'string' ?
            model.findById(condition, done) : model.findOne(condition, done),

        getAll: (condition, done) => model.find(condition).populate('user', 'firstname lastname').sort({ value: -1 }).exec(done),

        // changes = { $set, $unset, $push, $pull }
        update: (_id, changes, done) => model.findOneAndUpdate({ _id }, changes, { new: true }, done),
    };
};