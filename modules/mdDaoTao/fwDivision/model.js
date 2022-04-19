module.exports = app => {
    const schema = app.database.mongoDB.Schema({
        title: String,
        address: String,
        phoneNumber: String,
        mobile: String,
        email: String,
        image: String,
        mapURL: String,
        isOutside: Boolean,                     // Cơ sở đào tạo ngoài
        shortDescription: String,
        detailDescription: String,
        priority: Number,
    });
    const model = app.db.model('Division', schema);

    app.model.division = {
        create: (data, done) => model.find({}).sort({ priority: -1 }).limit(1).exec((error, items) => {
            data.priority = error || items == null || items.length === 0 ? 1 : (items[0].priority || 0) + 1;
            model.create(data, done);
        }),

        getAll: (condition, done) => done ?
            model.find(condition).sort({ priority: -1, title: 1 }).exec(done) :
            model.find({}).sort({ priority: -1, title: 1 }).exec(condition),

        get: (condition, done) => typeof condition == 'string' ?
            model.findById(condition).exec(done) :
            model.findOne(condition).exec(done),

        // changes = { $set, $unset, $push, $pull }
        update: (_id, changes, done) => model.findOneAndUpdate({ _id }, changes, { new: true }, done),

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

        swapPriority: (_id, isMoveUp, done) => model.findOne({ _id }, (error, item1) => {
            if (error || item1 === null) {
                done('Invalid category Id!');
            } else {
                model.find({
                    priority: isMoveUp ? { $gt: (item1.priority ? item1.priority : -1000) } : { $lt: (item1.priority ? item1.priority : 1000) }
                }).sort({ priority: isMoveUp ? 1 : -1 }).limit(1).exec((error, list) => {
                    if (error) {
                        done(error);
                    } else if (list == null || list.length === 0) {
                        if (!item1.priority) {
                            item1.priority = 1;
                            item1.save(error => done(error));
                        } else {
                            done(null);
                        }
                    } else {
                        let item2 = list[0], priority = item1.priority ? item1.priority : (isMoveUp ? item2.priority - 1 : item2.priority + 1);
                        item1.priority = item2.priority;
                        item2.priority = priority;
                        item1.save(error1 => item2.save(error2 => done(error1 ? error1 : error2)));
                    }
                });
            }
        }),
    };
};
