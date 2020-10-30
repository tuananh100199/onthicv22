module.exports = app => {
    const schema = app.db.Schema({
        listVideoId: app.db.Schema.ObjectId,
        title: String,
        link: String,
        image: String,
        content: String,
        priority: Number
    });
    const model = app.db.model('Video', schema);

    app.model.video = {
        create: (data, done) => {
            const finalCreate = (data) => {
                model.create(data, (error, item) => {
                    if (error) {
                        done(error);
                    } else {
                        item.image = '/img/video/' + item._id + '.jpg';
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
            }
            
            if (data.listVideoId) {
                model.find({ listVideoId: data.listVideoId }).sort({ priority: -1 }).limit(1).exec((error, items) => {
                    data.priority = error || items == null || items.length === 0 ? 1 : items[0].priority + 1;
                    finalCreate(data);
                })
            } else {
                finalCreate(data);
            }
        },

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