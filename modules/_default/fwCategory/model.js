module.exports = app => {
    const schema = app.db.Schema({
        priority: Number,
        type: String,
        title: String,
        image: String,
        active: { type: Boolean, default: true },
        description: String,
    });
    const model = app.db.model('Category', schema);

    app.model.category = {
        create: (data, done) => model.find({}).sort({ priority: -1 }).limit(1).exec((error, items) => {
            data.priority = error || items == null || items.length === 0 ? 1 : items[0].priority + 1;
            model.create(data, done);
        }),

        getAll: (condition, done) => model.find(condition).sort({ priority: -1 }).exec(done),

        get: (condition, done) => typeof condition == 'string' ? model.findById(condition, done) : model.findOne(condition, done),

        update: (_id, changes, done) => model.findOneAndUpdate({ _id }, { $set: changes }, { new: true }, done),

        swapPriority: (_id, isMoveUp, done) => model.findOne({ _id }, (error, item1) => {
            if (error || item1 === null) {
                done('Invalid category Id!');
            } else {
                model.find({
                    type: item1.type,
                    priority: isMoveUp ? { $gt: item1.priority } : { $lt: item1.priority }
                }).sort({ priority: isMoveUp ? 1 : -1 }).limit(1).exec((error, list) => {
                    if (error) {
                        done(error);
                    } else if (list == null || list.length === 0) {
                        done(null);
                    } else {
                        let item2 = list[0], priority = item1.priority;
                        item1.priority = item2.priority;
                        item2.priority = priority;
                        item1.save(error1 => item2.save(error2 => done(error1 ? error1 : error2)));
                    }
                });
            }
        }),

        delete: (_id, done) => model.findOne({ _id }, (error, item) => {
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