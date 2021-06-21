module.exports = app => {
    const schema = app.db.Schema({
        user: { type: app.db.Schema.ObjectId, ref: 'User' },
        title: String,
        state: { type: String, enum: ['approved', 'waiting', 'reject'], default: 'waiting' },
        category: { type: app.db.Schema.ObjectId, ref: 'Category' },              // Phân loại forum
        createdDate: { type: Date, default: Date.now },
        modifiedDate: { type: Date, default: Date.now },                          // Ngày cập nhật cuối cùng
    });
    const model = app.db.model('Forum', schema);

    app.model.forum = {
        create: (data, done) => model.create(data, done),

        getPage: (pageNumber, pageSize, condition, done) => model.countDocuments(condition, (error, totalItem) => {
            if (error) {
                done(error);
            } else {
                let result = { totalItem, pageSize, pageTotal: Math.ceil(totalItem / pageSize) };
                result.pageNumber = pageNumber === -1 ? result.pageTotal : Math.min(pageNumber, result.pageTotal);
                const skipNumber = (result.pageNumber > 0 ? result.pageNumber - 1 : 0) * result.pageSize;
                model.find(condition).populate('user', 'firstname lastname').sort({ modifiedDate: -1 }).skip(skipNumber).limit(result.pageSize).exec((error, list) => {
                    result.list = list;
                    done(error, result);
                });
            }
        }),

        get: (condition, done) => {
            const findTask = typeof condition == 'string' ? model.findById(condition) : model.findOne(condition);
            findTask.populate('user', 'firstname lastname').populate('category', 'title').exec(done);
        },

        // changes = { $set, $unset, $push, $pull }
        update: (_id, changes, done) => {
            changes.modifiedDate = new Date().getTime();
            model.findOneAndUpdate({ _id }, changes, { new: true }).exec(done);
        },

        delete: (_id, done) => model.findById(_id, (error, item) => {
            if (error) {
                done(error);
            } else if (item == null) {
                done('Invalid id!');
            } else {
                app.model.forumMessage.deleteForum(_id, () => item.remove(done));
            }
        }),

        count: (condition, done) => done ? model.countDocuments(condition, done) : model.countDocuments({}, condition),
    };
};