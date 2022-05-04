module.exports = app => {
    const schema = app.database.mongoDB.Schema({
        author: { type: app.database.mongoDB.Schema.ObjectId, ref: 'User' },
        type: { type: String, enum: ['export', 'import'], default: 'import' },
        filename: String,
        chucVu: String,
        date: { type: Date, default: Date.now },
    });
    const model = app.database.mongoDB.model('Encryption', schema);

    app.model.encryption = {
        create: (data, done) => model.create(data, done),

        getPage: (pageNumber, pageSize, condition, sort, done) => model.countDocuments(condition, (error, totalItem) => {
            if (error) {
                done(error);
            } else {
                let result = { totalItem, pageSize, pageTotal: Math.ceil(totalItem / pageSize) };
                result.pageNumber = pageNumber === -1 ? result.pageTotal : Math.min(pageNumber, result.pageTotal);
                const skipNumber = (result.pageNumber > 0 ? result.pageNumber - 1 : 0) * result.pageSize;

                model.find(condition).sort({ date: 1 }).populate('author').skip(skipNumber).limit(result.pageSize).exec((error, items) => {
                    result.list = error ? [] : items;
                    done(error, result);
                });
            }
        }),

        getAll: (condition, done) => done ?
            model.find(condition).sort({ date: 1 }).populate('author').exec(done) :
            model.find({}).sort({ date: 1 }).populate('author').exec(condition),


        // changes = { $set, $unset, $push, $pull }
        update: (condition, changes, $unset, done) => {
            if (!done) {
                done = $unset;
                $unset = {};
            }
            typeof condition == 'string' ?
                model.findOneAndUpdate({ _id: condition }, { $set: changes, $unset }, { new: true }, done) :
                model.updateMany(condition, { $set: changes, $unset }, { new: true }, done);
        },

        delete: (_id, done) => model.findById(_id, (error, item) => {
            if (error) {
                done(error);
            } else if (item == null) {
                done('Invalid Id!');
            } else {
                item.remove(done);
            }
        }),
    };
};
