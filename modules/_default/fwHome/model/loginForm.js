module.exports = app => {
    const schema = app.db.Schema({
        title: String,
        image: String,
        content: String,
    });
    const model = app.db.model('LoginForm', schema);

    app.model.loginForm = {
        create: (data, done) => model.create(data, done),

        getPage: (pageNumber, pageSize, condition, done) => model.countDocuments(condition, (error, totalItem) => {
            if (error) {
                done(error);
            } else {
                let result = { totalItem, pageSize, pageTotal: Math.ceil(totalItem / pageSize) };
                result.pageNumber = pageNumber === -1 ? result.pageTotal : Math.min(pageNumber, result.pageTotal);
                const skipNumber = (result.pageNumber > 0 ? result.pageNumber - 1 : 0) * result.pageSize;
                model.find(condition).sort({ title: 1 }).skip(skipNumber).limit(result.pageSize).exec((error, list) => {
                    result.list = list;
                    done(error, result);
                });
            }
        }),

        getAll: (done) => model.find({},).sort({ _id: -1 }).exec(done),

        get: (condition, done) => typeof condition == 'string' ? model.findById(condition, done) : model.findOne(condition, done),

        update: (_id, changes, done) => model.findOneAndUpdate({ _id }, { $set: changes }, { new: true }, done),

        delete: (_id, done) => model.findById(_id, (error, item) => {
            if (error) {
                done(error);
            } else if (item == null) {
                done('Invalid id!');
            } else {
                app.deleteImage(item.image);
                item.remove(error => {
                    if (error) {
                        done(error);
                    } else {
                        app.model.component.clearViewId(_id, done);
                    }
                });
            }
        }),
    };
};
