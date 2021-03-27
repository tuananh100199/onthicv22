module.exports = app => {
    const schema = app.db.Schema({
        title: String,
        titleVisible: { type: Boolean, default: true },
        description: String,
        active: { type: Boolean, default: false },
    });
    const model = app.db.model('Statistic', schema);

    app.model.statistic = {
        create: (data, done) => model.create(data, done),

        getAll: done => model.find({}).sort({ title: -1 }).exec(done),

        get: (_id, done) => model.findById(_id, (error, statistic) => {
            if (error) {
                done(error);
            } else if (statistic == null) {
                done('Invalid Id!');
            } else {
                done(null, statistic);
            }
        }),

        getPage: (pageNumber, pageSize, condition, done) => model.countDocuments(condition, (error, totalItem) => {
            if (error) {
                done(error);
            } else {
                let result = { totalItem, pageSize, pageTotal: Math.ceil(totalItem / pageSize) };
                result.pageNumber = pageNumber === -1 ? result.pageTotal : Math.min(pageNumber, result.pageTotal);
                const skipNumber = (result.pageNumber > 0 ? result.pageNumber - 1 : 0) * result.pageSize;
                model.find(condition).sort({ title: 1 }).skip(skipNumber).limit(result.pageSize).exec((error, list) => {
                    result.list = list;
                    done(error, result);
                });
            }
        }),

        update: (_id, changes, done) => model.findOneAndUpdate({ _id }, { $set: changes }, { new: true }, done),

        delete: (_id, done) => model.findById(_id, (error, slogan) => {
            if (error) {
                done(error);
            } else if (slogan == null) {
                done('Invalid Id!');
            } else {
                slogan.remove(done);
            }
        }),
    };
};