module.exports = app => {
    const schema = app.database.mongoDB.Schema({
        title: String,
        content: String,
        type: String,
        abstract: String,
        state: { type: String, enum: ['thanhToan', 'hoanTien', 'huyOnTap', 'giamGia', 'thoiKhoaBieu', 'huyThoiKhoaBieu'], default: 'thanhToan' },
    });
    const model = app.database.mongoDB.model('NotificationTemplate', schema);

    app.model.notificationTemplate = {
        create: (data, done) => model.create(data, done),

        getAll: (condition, done) => model.find(condition).sort({ priority: -1 }).exec(done),

        getPage: (pageNumber, pageSize, condition, done) => model.countDocuments(condition, (error, totalItem) => {
            if (error) {
                done(error);
            } else {
                const result = { totalItem, pageSize, pageTotal: Math.ceil(totalItem / pageSize) };
                result.pageNumber = pageNumber === -1 ? result.pageTotal : Math.min(pageNumber, result.pageTotal);

                const skipNumber = (result.pageNumber > 0 ? result.pageNumber - 1 : 0) * result.pageSize;
                model.find(condition).sort({ createdDate: -1 }).skip(skipNumber).limit(result.pageSize).exec((error, list) => {
                    result.list = list;
                    done(error, result);
                });
            }
        }),

        get: (condition, done) => typeof condition == 'string' ? model.findById(condition, done) : model.findOne(condition, done),

        update: (condition, changes, done) => typeof condition == 'string' ?
            model.findOneAndUpdate({ _id: condition }, { $set: changes }, { new: true }, done) :
            model.updateMany(condition, { $set: changes }, { new: true }, done),

        delete: (_id, done) => model.findOne({ _id }, (error, item) => {
            if (error) {
                done(error);
            } else if (item == null) {
                done('Invalid Id!');
            } else {
                item.image && app.deleteImage(item.image);
                item.remove(done);
            }
        }),
    };
};