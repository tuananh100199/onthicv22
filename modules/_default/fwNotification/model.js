module.exports = app => {
    const schema = app.db.Schema({
        type: String,                                               // Loại notification
        course: { type: app.db.Schema.ObjectId, ref: 'Course' },    // Khóa học
        user: { type: app.db.Schema.ObjectId, ref: 'User' },        // Thông báo đến đúng cá nhân

        title: String,
        content: String,
        abstract: String,
        createdDate: { type: Date, default: Date.now },
        sentDate: { type: Date, default: null },
    });
    const model = app.db.model('Notification', schema);

    app.model.notification = {
        create: (data, done) => model.create(data, done),

        getPage: (pageNumber, pageSize, condition, done) => model.countDocuments(condition, (error, totalItem) => {
            if (error) {
                done(error);
            } else {
                const result = { totalItem, pageSize, pageTotal: Math.ceil(totalItem / pageSize) };
                result.pageNumber = pageNumber === -1 ? result.pageTotal : Math.min(pageNumber, result.pageTotal);

                const skipNumber = (result.pageNumber > 0 ? result.pageNumber - 1 : 0) * result.pageSize;
                model.find(condition).sort({ createdDate: -1 }).skip(skipNumber).populate('user', 'firstname lastname identityCard').limit(result.pageSize).exec((error, list) => {
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