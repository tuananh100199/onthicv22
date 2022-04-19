module.exports = app => {
    const schema = app.database.mongoDB.Schema({
        carouselId: app.database.mongoDB.Schema.Types.ObjectId,
        priority: Number,
        title: String,
        subtitle: String,
        description: String,
        image: String,
        link: String,
        active: { type: Boolean, default: false },
    });
    const model = app.database.mongoDB.model('CarouselItem', schema);

    app.model.carouselItem = {
        create: (data, done) => model.find({}).sort({ priority: -1 }).limit(1).exec((error, items) => {
            data.priority = error || items == null || items.length === 0 ? 1 : items[0].priority + 1;
            model.create(data, done);
        }),

        getAll: (condition, done) => done ? model.find(condition).sort({ priority: -1 }).exec(done) : model.find({}).sort({ priority: -1 }).exec(condition),

        get: (condition, done) => typeof condition == 'string' ? model.findById(condition, done) : model.findOne(condition, done),

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
                done('Invalid id!');
            } else {
                app.deleteImage(item.image);
                item.remove(error => done(error, item));
            }
        }),

        count: (condition, done) => done ? model.countDocuments(condition, done) : model.countDocuments({}, condition),
    };
};
