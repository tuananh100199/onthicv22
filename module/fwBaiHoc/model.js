module.exports = app => {
    const schema = app.db.Schema({
        priority: Number,
        title: String,
        shortDescription: String,
        detailDescription: String
    });
    const model = app.db.model('Lesson', schema);

    app.model.lesson = {
        create: (data, done) => {
            if (!data.title) data.title = 'Bài học mới';

            model.create(data, done)
        },
        create: (data, done) => model.find({}).sort({ priority: -1 }).limit(1).exec((error, items) => {
            data.priority = error || items == null || items.length === 0 ? 1 : items[0].priority + 1;
            if (!data.title) data.title = 'Bài học mới';
            model.create(data, done)
        }),
        getPage: (pageNumber, pageSize, condition, done) => model.countDocuments(condition, (error, totalItem) => {
            if (error) {
                done(error);
            } else {
                let result = { totalItem, pageSize, pageTotal: Math.ceil(totalItem / pageSize) };
                result.pageNumber = pageNumber === -1 ? result.pageTotal : Math.min(pageNumber, result.pageTotal);
                const skipNumber = (result.pageNumber > 0 ? result.pageNumber - 1 : 0) * result.pageSize;

                model.find(condition, '-content').sort({ _id: -1 }).skip(skipNumber).limit(result.pageSize).exec((error, items) => {
                    result.list = error ? [] : items;
                    done(error, result);
                });
            }
        }),

        getAll: done => model.find({}).sort({ _id: -1 }).exec(done),
        get: (condition, done) => typeof condition == 'string' ? model.findById(condition, done) : model.findOne(condition, done),
        update: (_id, changes, done) => model.findOneAndUpdate({ _id }, { $set: changes }, { new: true }, done),

        delete: (_id, done) => model.findById(_id, (error, item) => {
            if (error) {
                done(error);
            } else if (item == null) {
                done('Invalid Id!');
            } else {
                app.deleteImage(item.image);
                item.remove(done);
            }
        }),

        count: (condition, done) => done ? model.countDocuments(condition, done) : model.countDocuments({}, condition),
    };
};
