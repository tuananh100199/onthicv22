module.exports = app => {
    const schema = app.db.Schema({
        title: String,
        abstract: String,
        image: String,
        items: [{ type: app.db.Schema.ObjectId, ref: 'Content' }],
    });
    const model = app.db.model('ListContent', schema);

    app.model.listContent = {
        create: (data, done) => model.create(data, done),

        getPage: (pageNumber, pageSize, condition, done) => model.countDocuments(condition, (error, totalItem) => {
            if (error) {
                done(error);
            } else {
                let result = { totalItem, pageSize, pageTotal: Math.ceil(totalItem / pageSize) };
                result.pageNumber = pageNumber === -1 ? result.pageTotal : Math.min(pageNumber, result.pageTotal);
                const skipNumber = (result.pageNumber > 0 ? result.pageNumber - 1 : 0) * result.pageSize;
                model.find(condition).populate('items', '-content').sort({ title: 1 }).skip(skipNumber).limit(result.pageSize).exec((error, list) => {
                    result.list = list;
                    done(error, result);
                });
            }
        }),

        getAll: (condition, done) => done ? model.find(condition).populate('items', '-content').sort({ title: 1 }).exec(done) : model.find({}).populate('items', '-content').sort({ title: 1 }).exec(condition),

        get: (condition, done) => typeof condition == 'string' ? model.findById(condition).populate('items', '-content').exec(done) : model.findOne(condition).populate('items', '-content').exec(done),

        update: (_id, $set, $unset, done) => done ?
            model.findOneAndUpdate({ _id }, { $set, $unset }, { new: true }).populate('items', '-content').exec(done) :
            model.findOneAndUpdate({ _id }, { $set }, { new: true }).populate('items', '-content').exec($unset),

        delete: (_id, done) => model.findById(_id, (error, listContent) => {
            if (error) {
                done(error);
            } else if (listContent == null) {
                done('Invalid Id!');
            } else {
                app.model.content.getAll({ listContentId: listContent._id }, (error, items) => {
                    if (!error && items && items.length) {
                        items.forEach(item => app.model.content.delete(item._id, () => { }))
                    }
                })
                app.deleteImage(listContent.image);
                listContent.remove(done);
            }
        }),
    };
};
