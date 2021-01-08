module.exports = app => {
    const schema = app.db.Schema({
        title: String,
        categories: [{ type: app.db.Schema.ObjectId, ref: 'Category' }],
        createdDate: { type: Date, default: Date.now },
        image: String,
        link: String,
        abstract: String,
        content: String,
        active: { type: Boolean, default: false },
    });
    const model = app.db.model('Course', schema);
    
    app.model.course = {
        create: (data, done) => {
            if (!data.title) data.title = 'Khoá học mới';
            model.create(data, (error, item) => {
                if (error) {
                    done(error);
                } else {
                    item.image = '/img/course/' + item._id + '.jpg';
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
            })
        },

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