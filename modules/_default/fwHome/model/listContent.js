module.exports = app => {
    const schema = app.database.mongoDB.Schema({
        title: String,
        abstract: String,
        image: String,
        items: [{ type: app.database.mongoDB.Schema.ObjectId, ref: 'Content' }],
    });
    const model = app.database.mongoDB.model('ListContent', schema);

    app.model.listContent = {
        create: (data, done) => model.create(data, done),

        getPage: (pageNumber, pageSize, condition, done) => model.countDocuments(condition, (error, totalItem) => {
            if (error) {
                done(error);
            } else {
                let result = { totalItem, pageSize, pageTotal: Math.ceil(totalItem / pageSize) };
                result.pageNumber = pageNumber === -1 ? result.pageTotal : Math.min(pageNumber, result.pageTotal);
                const skipNumber = (result.pageNumber > 0 ? result.pageNumber - 1 : 0) * result.pageSize;
                model.find(condition).populate('items', '-content').sort({ title: 1 }).skip(skipNumber).limit(result.pageSize).exec((error, list) => {
                    result.list = list;
                    done(error, result);
                });
            }
        }),

        getAll: (condition, done) => done ? model.find(condition).populate('items', '-content').sort({ title: 1 }).exec(done) : model.find({}).populate('items', '-content').sort({ title: 1 }).exec(condition),

        get: (condition, done) => typeof condition == 'string' ? model.findById(condition).populate('items', '-content').exec(done) : model.findOne(condition).populate('items', '-content').exec(done),

        // changes = { $set, $unset, $push, $pull }
        update: (_id, changes, done) => model.findOneAndUpdate({ _id }, changes, { new: true }).populate('items', '-content').exec(done),

        delete: (_id, done) => model.findById(_id, (error, item) => {
            if (error) {
                done(error);
            } else if (item == null) {
                done('Invalid Id!');
            } else {
                app.deleteImage(item.image);
                item.remove(done);
            }
        }),
    };
};
