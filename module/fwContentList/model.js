module.exports = app => {
    const schema = app.db.Schema({
        title: String,
        items:
            [{
                type: app.db.Schema.ObjectId,
                ref: 'Content'
            }]
    });
    const model = app.db.model('ContentList', schema);

    app.model.contentList = {
        create: (data, done) => {
            model.create(data, done)
        },

        getAll: done => {
            model.find({}).sort({ title: -1 }).exec(done)
        },

        get: (_id, done) => model.findById(_id, (error, list) => {
            console.log('list in model', list)
            if (error) {
                done(error);
            } else if (list == null) {
                done('Invalid Id!');
            } else {
                done(null, list);
            }
        }),

        update: (_id, changes, done) => {
            console.log('req.body.changes in model', changes)
            model.findOneAndUpdate({ _id }, { $set: changes }, { new: true }, done)
        },

        delete: (_id, done) => model.findById(_id, (error, contentList) => {
            if (error) {
                done(error);
            } else if (contentList == null) {
                done('Invalid Id!');
            } else {
                app.model.content.getAll({ contentListId: contentList._id }, (error, items) => {
                    if (!error && items && items.length) {
                        items.forEach(item => app.model.content.delete(item._id, () => { }))
                    }
                })
                contentList.remove(done);
            }
        }),
    };
};
