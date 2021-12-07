module.exports = app => {
    const schema = app.db.Schema({
        code: String,
        name: String,
        accounts:[{
            holder: String,
            number: String,
            active: { type: Boolean, default: false },
        }],
        active: { type: Boolean, default: false },
        moneyLine: String,
        moneyStr: String,
        contentLine: String,
        contentStr: String,
    });

    const model = app.db.model('Bank', schema);

    app.model.bank = {
        create: (data, done) => model.create(data, done),

        getAll: (condition, done) => typeof condition == 'function' ?
            model.find({}).exec(condition) :
            model.find(condition).exec(done),

        get: (condition, done) => (typeof condition == 'string' ? model.findById(condition) : model.findOne(condition)).exec(done),

        update: (_id, changes, done) => {
            model.findOneAndUpdate({ _id }, changes, { new: true }).exec(done);
        },

        delete: (_id, done) => model.findOne({ _id }, (error, item) => {
            if (error) {
                done(error);
            } else if (item == null) {
                done('Invalid Id!');
            } else {
                item.remove(done);
            }
        }),

        count: (condition, done) => done ? model.countDocuments(condition, done) : model.countDocuments({}, condition)
    };
};