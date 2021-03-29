module.exports = app => {
    const schema = app.db.Schema({
        title: String,
        height: { type: Number, default: 255 },
        items: [{ type: app.db.Schema.ObjectId, ref: 'Video' }],
    });
    const model = app.db.model('ListVideo', schema);

    app.model.listVideo = {
        create: (data, done) => model.create(data, done),

        getAll: done => model.find({}).sort({ title: -1 }).exec(done),

        get: (_id, done) => model.findById(_id, (error, list) => {
            if (error) {
                done(error);
            } else if (list == null) {
                done('Invalid Id!');
            } else {
                done(null, list);
            }
        }),

        update: (_id, changes, done) => model.findOneAndUpdate({ _id }, { $set: changes }, { new: true }, done),

        delete: (_id, done) => model.findById(_id, (error, videoList) => {
            if (error) {
                done(error);
            } else if (videoList == null) {
                done('Invalid Id!');
            } else {
                app.model.video.getAll({ listVideoId: videoList._id }, (error, items) => {
                    if (!error && items && items.length) {
                        items.forEach(item => app.model.video.delete(item._id, () => { }))
                    }
                });
                videoList.remove(done);
            }
        }),
    };
};
