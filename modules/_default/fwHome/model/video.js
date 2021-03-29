module.exports = app => {
    const schema = app.db.Schema({
        title: String,
        link: String,
        image: String,
        content: String,
        priority: Number
    });
    const model = app.db.model('Video', schema);

    app.model.video = {
        create: (data, done) => model.create(data, done),

        getAll: (condition, done) => done ? model.find(condition).sort({ priority: -1 }).exec(done) : model.find({}).sort({ priority: -1 }).exec(condition),

        getPage: (pageNumber, pageSize, condition, done) => model.countDocuments(condition, (error, totalItem) => {
            if (error) {
                done(error);
            } else {
                const result = { totalItem, pageSize, pageTotal: Math.ceil(totalItem / pageSize) };
                result.pageNumber = pageNumber === -1 ? result.pageTotal : Math.min(pageNumber, result.pageTotal);
                const skipNumber = (result.pageNumber > 0 ? result.pageNumber - 1 : 0) * result.pageSize;
                model.find(condition).sort({ priority: -1 }).skip(skipNumber).limit(result.pageSize).exec((error, list) => {
                    result.list = list ? list.map((item) => app.clone(item, { content: '' })) : [];
                    done(error, result);
                });
            }
        }),

        get: (_id, done) => model.findById(_id, done),

        update: (_id, changes, done) => model.findOneAndUpdate({ _id }, { $set: changes }, { new: true }, done),

        swapPriority: (_id, isMoveUp, done) => model.findOne({ _id }, (error, item1) => {
            if (error || item1 === null) {
                done('Invalid carousel item Id!');
            } else {
                model.find({
                    carouselId: item1.carouselId,
                    priority: isMoveUp ? { $gt: item1.priority } : { $lt: item1.priority }
                }).sort({
                    priority: isMoveUp ? 1 : -1
                }).limit(1).exec((error, list) => {
                    if (error) {
                        done(error);
                    } else if (list == null || list.length === 0) {
                        done(null);
                    } else {
                        let item2 = list[0],
                            priority = item1.priority;
                        item1.priority = item2.priority;
                        item2.priority = priority;
                        item1.save(error1 => item2.save(error2 => done(error1 ? error1 : error2, item1, item2)));
                    }
                });
            }
        }),

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
    };
};