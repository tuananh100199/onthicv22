module.exports = app => {
    const schema = app.db.Schema({
        title: String,
        items: [{
            fullname: String,
            jobPosition: String,
            image: String,
            content: String,
        }]
    });
    const model = app.db.model('Testimony', schema);

    app.model.testimony = {
        create: (data, done) => model.create(data, done),

        getAll: (condition, done) => done ?
            model.find(condition).sort({ title: -1 }).exec(done) :
            model.find({}).sort({ title: -1 }).exec(condition),

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