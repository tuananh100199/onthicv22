module.exports = app => {
    const schema = app.db.Schema({
        _refId: app.db.Schema.ObjectId, // _courseId
        type: String,                   // Loại phản hồi: course

        createdDate: { type: Date, default: Date.now },
        content: String,
        user: { type: app.db.Schema.ObjectId, ref: 'User' },

        replies: [{
            createdDate: { type: Date, default: Date.now },
            content: String,
            adminUser: { type: app.db.Schema.ObjectId, ref: 'User' },
        }],
    });
    const model = app.db.model('Feedback', schema);

    app.model.feedback = {
        create: (data, done) => model.create(data, done),

        getAll: (condition, done) => {
            if (typeof condition == 'function') {
                done = condition;
                condition = {};
            }
            model.find(condition)
                .populate('user', 'lastname firstname image').populate('replies.adminUser', 'lastname firstname image')
                .sort({ createdDate: 1 }).exec(done);
        },
        getPage: (pageNumber, pageSize, condition, done) => model.countDocuments(condition, (error, totalItem) => {
            if (error) {
                done(error);
            } else {
                const result = { totalItem, pageSize, pageTotal: Math.ceil(totalItem / pageSize) };
                result.pageNumber = pageNumber === -1 ? result.pageTotal : Math.min(pageNumber, result.pageTotal);

                const skipNumber = (result.pageNumber > 0 ? result.pageNumber - 1 : 0) * result.pageSize;
                model.find(condition).select('-replies').sort({ _id: -1 }).skip(skipNumber).limit(result.pageSize).exec((error, list) => {
                    result.list = list;
                    done(error, result);
                });
            }
        }),

        get: (condition, done) => typeof condition == 'string' ?
            model.findById(condition, done) : model.findOne(condition, done),

        // changes = { $set, $unset, $push, $pull }
        update: (_id, changes, done) => model.findOneAndUpdate({ _id }, changes, { new: true }, done),

        addReply: (_id, reply, done) => {
            const { content, adminUser } = reply;
            model.findOneAndUpdate({ _id }, { $push: { replies: { createdDate: new Date(), content, adminUser } } }, { new: true }).exec(done);
        },

        deleteReply: (_id, _replyId, done) => {
            model.findOneAndUpdate({ _id }, { $pull: { replies: _replyId } }, { new: true }).populate('replies').exec(done);
        },

        count: (condition, done) => done ? model.countDocuments(condition, done) : model.countDocuments({}, condition),
    };
};