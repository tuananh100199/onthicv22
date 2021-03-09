module.exports = app => {
    const schema = app.db.Schema({
        dangKyTuVanId: app.db.Schema.ObjectId,
        title: String,
        formTitle: String,
        description: String,
        statistic: [{
            title: String,
            number: Number,
        }],
    });
    const model = app.db.model('DangKyTuVan', schema);

    app.model.dangKyTuVan = {
        create: (data, done) => model.create(data, done),
        getAll: done => model.find({}).sort({ priority: -1 }).exec(done),
        // getAll: (condition,done) => condition ? model.find({ condition }).sort({ _id: -1 }).exec(done) : model.find({}).sort({ _id: -1 }).exec(done),

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

        get: (_id, done) => model.findById(_id, done),

        update: (_id, changes, done) => model.findOneAndUpdate({ _id }, { $set: changes }, { new: true }, done),

        delete: (_id, done) => model.findById(_id, (error, item) => {
            if (error) {
                done(error);
            } else if (item == null) {
                done('Invalid id!');
            } else {
                item.remove(done);
            }
        }),
    };
};