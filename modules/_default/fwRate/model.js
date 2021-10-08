module.exports = app => {
    const schema = app.db.Schema({
        user: { type: app.db.Schema.ObjectId, ref: 'User' },        // Người đánh giá
        _refId: app.db.Schema.ObjectId,                             // Đối tượng đánh giá
        value: Number,
        note: String,
        type: String,
    });
    const model = app.db.model('Rate', schema);

    app.model.rate = {
        getAll: (condition, done) => model.find(condition).sort({ value: -1 }).exec(done),
    };
};