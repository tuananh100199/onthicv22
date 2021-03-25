module.exports = (app) => {
    const schema = app.db.Schema({
        name: String,
        permission: [String],
        active: { type: Boolean, default: true },
        default: { type: Boolean, default: false },
        description: String,
    });

    const model = app.db.model('Role', schema);
    app.model.role = {
        create: (data, done) => model.findOne({ name: data.name }, (error, role) => {
            if (error) {
                if (done) done(error);
            } else if (role) {
                if (done) done('Vai trò đã được đăng ký!', role);
            } else {
                model.create(data, done);
            }
        }),

        get: (condition, done) => typeof condition == 'object' ?
            model.findOne(condition, done) : model.findById(condition, done),

        getAll: (condition, selector, done) => {
            if (typeof condition == 'function') {
                model.find({}).sort({ name: 1 }).exec(condition);
            } else if (selector && typeof selector == 'function') {
                done = selector;
                typeof condition == 'object' ? model.find(condition).sort({ name: 1 }).exec(done) : model.find({}, condition).sort({ name: 1 }).exec(done);
            } else if (done && typeof done == 'function') {
                model.find(condition, selector).sort({ name: 1 }).exec(done);
            }
        },

        getPage: (pageNumber, pageSize, condition, done) => model.countDocuments(condition, (error, totalItem) => {
            if (error) {
                done(error);
            } else {
                const result = { totalItem, pageSize, pageTotal: Math.ceil(totalItem / pageSize) };
                result.pageNumber = pageNumber === -1 ? result.pageTotal : Math.min(pageNumber, result.pageTotal);
                const skipNumber = (result.pageNumber > 0 ? result.pageNumber - 1 : 0) * result.pageSize;
                model.find(condition).sort({ name: 1 }).skip(skipNumber).limit(result.pageSize).exec((error, list) => {
                    result.list = list;
                    done(error, result);
                });
            }
        }),

        update: (_id, changes, done) => model.findById(_id, (error, role) => {
            if (error || role == null) {
                done('System has errors!');
            } else if (role.name != 'admin' && changes.name == 'admin') {
                done('Invalid role name!');
            } else {
                if (role.name == 'admin') {
                    delete changes.name;
                    changes.active = true;
                }
                if (role.default && (changes.active == false || changes.active == 'false')) {
                    delete changes.active;
                }

                if ((changes.default == true || changes.default == 'true') && (role.default == null || role.default == false)) {
                    changes.default = true;
                    changes.active = true;
                    model.updateMany({}, { $set: { default: false } }, error =>
                        error ? done(error) : model.findOneAndUpdate({ _id }, { $set: changes }, { new: true }, done));
                } else {
                    delete changes.default;
                    model.findOneAndUpdate({ _id }, { $set: changes }, { new: true }, done);
                }
            }
        }),

        delete: (_id, done) => model.findById(_id, (error, item) => {
            if (error) {
                done(error);
            } else if (item == null) {
                done('Invalid Id!');
            } else {
                item.remove(done);
            }
        }),
    }
};
