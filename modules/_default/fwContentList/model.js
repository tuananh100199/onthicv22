module.exports = app => {
    const schema = app.db.Schema({
        title: String,
        abstract: String,
        image: String,
        items: [{ type: app.db.Schema.ObjectId, ref: 'Content' }]
    });
    const model = app.db.model('ContentList', schema);

    app.model.contentList = {
        create: (data, done) => model.create(data, done),

        getAll: (condition, done) => done ? model.find(condition).sort({ title: -1 }).exec(done) : model.find({}).sort({ title: -1 }).exec(condition),

        get: (condition, done) => typeof condition == 'string' ? model.findById(condition).populate('items', '-content').exec(done) : model.findOne(condition).populate('items', '-content').exec(done),
        
        update: (_id, $set, $unset, done) => done ?
            model.findOneAndUpdate({ _id }, { $set, $unset }, { new: true }).populate('items', '-content').exec(done) :
            model.findOneAndUpdate({ _id }, { $set }, { new: true }).populate('items', '-content').exec($unset),
        
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
                app.deleteImage(contentList.image);
                contentList.remove(done);
            }
        }),
    };
};
