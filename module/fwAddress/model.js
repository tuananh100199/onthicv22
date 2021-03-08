module.exports = app => {
    const schema = app.db.Schema({
        title: String,
        address: String,
        phoneNumber: String,
        mobile: String,
        email: String,
        image: String,
        mapURL: String,
        isOutside: Boolean,
        shortDescription: String,
        detailDescription: String
    });
    const model = app.db.model('Address', schema);

    app.model.address = {
        create: (data, done) => model.find({}).sort({ title: -1 }).limit(1).exec((error, items) => {
            data.priority = error || items == null || items.length === 0 ? 1 : items[0].priority + 1;
            model.create(data, (error, item) => {
                if (error) {
                    done(error);
                } else {
                    item.image = '/img/address/' + item._id + '.jpg';
                    const srcPath = app.path.join(app.publicPath, '/img/avatar.jpg'),
                        destPath = app.path.join(app.publicPath, item.image);
                    app.fs.copyFile(srcPath, destPath, error => {
                        if (error) {
                            done(error);
                        } else {
                            item.save(done);
                        }
                    });
                }
            });
        }),

        getAll: (condition, done) => done ? model.find(condition).sort({ title: -1 }).exec(done) : model.find({}).sort({ title: -1 }).exec(condition),

        get: (condition, done) => typeof condition == 'string' ? model.findById(condition).exec(done) : model.findOne(condition).exec(done),

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
    };
}