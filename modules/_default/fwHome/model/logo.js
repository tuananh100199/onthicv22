module.exports = app => {
    const schema = app.db.Schema({
        title: String,
        items: {
            type: [{
                name: String,
                address: String,
                link: String,
                image: String,
            }], default: []
        }
    });
    const model = app.db.model('Logo', schema);

    app.model.logo = {
        create: (data, done) => model.create(data, done),

        getAll: done => model.find({}).sort({ title: -1 }).exec((error, items) => {
            const list = (items && items.length ? items : []).map(item => app.clone(item, { image: '' }));
            done(error, list);
        }),

        get: (_id, done) => model.findById(_id, (error, logo) => {
            if (error) {
                done(error);
            } else if (logo == null) {
                done('Invalid Id!');
            } else {
                done(null, logo);
            }
        }),

        update: (_id, changes, done) => model.findOneAndUpdate({ _id }, { $set: changes }, { new: true }, done),

        delete: (_id, done) => model.findById(_id, (error, logo) => {
            if (error) {
                done(error);
            } else if (logo == null) {
                done('Invalid Id!');
            } else {
                logo.remove(done);
            }
        }),
    };
};