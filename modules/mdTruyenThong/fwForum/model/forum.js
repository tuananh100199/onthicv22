module.exports = app => {
    const schema = app.database.mongoDB.Schema({
        course: { type: app.database.mongoDB.Schema.ObjectId, ref: 'Course' },
        user: { type: app.database.mongoDB.Schema.ObjectId, ref: 'User' },
        title: String,
        content: String,
        state: { type: String, enum: ['approved', 'waiting', 'reject'], default: 'waiting' }, // QTHT hoặc QTKH phê duyệt
        category: { type: app.database.mongoDB.Schema.ObjectId, ref: 'Category' },              // Phân loại forum
        createdDate: { type: Date, default: Date.now },
        modifiedDate: { type: Date, default: Date.now },
        active: { type: Boolean, default: false }, // bật/tắt forum
        video:{
            link:String,
            active: { type: Boolean, default: false },
        }
    });
    const model = app.database.mongoDB.model('Forum', schema);

    app.model.forum = {
        create: (data, done) => model.create(data, done),

        getPage: (pageNumber, pageSize, condition, done) => model.countDocuments(condition, (error, totalItem) => {
            if (error) {
                done(error);
            } else {
                let result = { totalItem, pageSize, pageTotal: Math.ceil(totalItem / pageSize) };
                result.pageNumber = pageNumber === -1 ? result.pageTotal : Math.min(pageNumber, result.pageTotal);
                const skipNumber = (result.pageNumber > 0 ? result.pageNumber - 1 : 0) * result.pageSize;
                model.find(condition).populate('user', 'firstname lastname image').populate('course', 'name').sort({ modifiedDate: -1 }).skip(skipNumber).limit(result.pageSize).exec((error, list) => {
                    result.list = [];
                    const numberOfForums = list ? list.length : 0,
                        solve = (index = 0) => {
                            if (index < numberOfForums) {
                                const item = app.clone(list[index]);
                                app.model.forumMessage.getPage(1, 3, { forum: item._id,state:'approved' }, (error, messages) => {
                                    item.messages = error || messages == null ? [] : messages;
                                    result.list.push(item);
                                    solve(index + 1);
                                });
                            } else {
                                done(error, result);
                            }
                        };
                    solve();
                });
            }
        }),

        get: (condition, done) => {
            const findTask = typeof condition == 'string' ? model.findById(condition) : model.findOne(condition);
            findTask.populate('user', 'firstname lastname image').populate('category', 'title').exec(done);
        },

        // changes = { $set, $unset, $push, $pull }
        update: (_id, changes, done) => model.findOneAndUpdate({ _id }, changes, { new: true }).exec(done),

        delete: (_id, done) => model.findById(_id, (error, item) => {
            if (error) {
                done(error);
            } else if (item == null) {
                done('Invalid id!');
            } else {
                app.model.forumMessage.deleteForum(_id, () => item.remove(error => done(error, item)));
            }
        }),

        count: (condition, done) => done ? model.countDocuments(condition, done) : model.countDocuments({}, condition),
    };
};