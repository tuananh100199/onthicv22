module.exports = app => {
    const schema = app.db.Schema({
        title: String,
        height: { type: Number, default: 255 },
        items: [{ type: app.db.Schema.ObjectId, ref: 'Video' }],
    });
    const model = app.db.model('ListVideo', schema);

    app.model.listVideo = {
        create: (data, done) => model.create(data, done),

        getAll: done => model.find({}).populate('items', '-content').sort({ title: 1 }).exec(done),

        get: (condition, done) => typeof condition == 'string' ? model.findById(condition).populate('items', '-content').exec(done) : model.findOne(condition).populate('items', '-content').exec(done),

        update: (_id, $set, $unset, done) => done ?
            model.findOneAndUpdate({ _id }, { $set, $unset }, { new: true }).populate('items', '-content').exec(done) :
            model.findOneAndUpdate({ _id }, { $set }, { new: true }).populate('items', '-content').exec($unset),

        delete: (_id, done) => model.findById(_id, (error, item) => {
            if (error) {
                done(error);
            } else if (item == null) {
                done('Invalid Id!');
            } else {
                item.remove(done);
            }
        }),
    };
};
