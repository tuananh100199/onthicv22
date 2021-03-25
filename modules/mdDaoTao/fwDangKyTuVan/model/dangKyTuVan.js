
module.exports = app => {
    const schema = app.db.Schema({
        title: String,
        description: String,
        formTitle: String,
        courseType: [{ type: app.db.Schema.ObjectId, ref: 'CourseType' }],
        statistic: [{
            title: String,
            number: Number,
        }]
    });
    const model = app.db.model('DangKyTuVan', schema);

    app.model.dangKyTuVan = {
        create: (data, done) => model.create(data, done),

        getAll: done => model.find({}).sort({ title: -1 }).exec(done),

        get: (_id, done) => model.findById(_id, (error, slogan) => {
            if (error) {
                done(error);
            } else if (slogan == null) {
                done('Invalid Id!');
            } else {
                done(null, slogan);
            }
        }),

        update: (_id, changes, done) => model.findOneAndUpdate({ _id }, { $set: changes }, { new: true }, done),

        delete: (_id, done) => model.findById(_id, (error, slogan) => {
            if (error) {
                done(error);
            } else if (slogan == null) {
                done('Invalid Id!');
            } else {
                slogan.remove(done);
            }
        }),
    };
};