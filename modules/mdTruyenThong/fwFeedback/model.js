module.exports = app => {
    const schema = app.db.Schema({
        _refId: app.db.Schema.ObjectId, // _courseId

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
        //TODO: Tâm

        addReply: (_id, reply, done) => {
            model.findOneAndUpdate(_id, { $push: { replies: reply } }, { new: true }).populate('replies').exec(done);
        },
        deleteReply: (_id, _replyId, done) => {
            model.findOneAndUpdate({ _id }, { $pull: { replies: _replyId } }, { new: true }).populate('replies').exec(done);
        },

        count: (condition, done) => done ? model.countDocuments(condition, done) : model.countDocuments({}, condition),
    };
};