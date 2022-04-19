module.exports = app => {
    const schema = app.database.mongoDB.Schema({
        forum: { type: app.database.mongoDB.Schema.ObjectId, ref: 'Forum' },
        user: { type: app.database.mongoDB.Schema.ObjectId, ref: 'User' },
        content: String,
        state: { type: String, enum: ['approved', 'waiting', 'reject'], default: 'waiting' },
        createdDate: { type: Date, default: Date.now },
        modifiedDate: { type: Date, default: Date.now },
    });
    const model = app.db.model('ForumMessage', schema);

    app.model.forumMessage = {
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
            findTask.populate('user', 'firstname lastname').exec(done);
        },

        // changes = { $set, $unset, $push, $pull }
        update: (_id, changes, done) => {
            model.findOneAndUpdate({ _id }, changes, { new: true }).populate('user', 'firstname lastname').exec(done);
        },

        delete: (_id, done) => model.findById(_id, (error, item) => {
            if (error || item == null) {
                done('Invalid forum!');
            } else {
                item.remove(done);
            }
        }),

        deleteForum: (forum, done) => model.remove({ forum }, done),

        count: (condition, done) => done ? model.countDocuments(condition, done) : model.countDocuments({}, condition),
    };
};