module.exports = app => {
    const schema = app.db.Schema({
        _refId: app.db.Schema.ObjectId, // _courseId
        type: String, // course

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

        addReply: (_id, reply, done) => {
            const { content, adminUser } = reply;
            model.findOneAndUpdate(_id, { $push: { replies: { createdDate: new Date(), content, adminUser } } }, { new: true }).exec(done);
        },

        deleteReply: (_id, _replyId, done) => {
            model.findOneAndUpdate({ _id }, { $pull: { replies: _replyId } }, { new: true }).populate('replies').exec(done);
        },

        count: (condition, done) => done ? model.countDocuments(condition, done) : model.countDocuments({}, condition),
    };
};