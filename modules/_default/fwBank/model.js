module.exports = app => {
    const schema = app.database.mongoDB.Schema({
        code: String,
        name: String,
        shortname: String,
        accounts: [{
            holder: String,
            number: String,
            active: { type: Boolean, default: false },
        }],
        active: { type: Boolean, default: false },
        moneyLine: { type: Number, default: 0 },
        moneyStr: { type: String, default: '+/:money/VND' },
        contentLine: { type: Number, default: 0 },
        contentStr: { type: String, default: 'ND:/:content/' },
        contentSyntax: { type: String, default: '{cmnd} {ten_loai_khoa_hoc}' },
        contentSyntaxExtra: { type: String, default: '{cmnd} {ten_loai_khoa_hoc} {ma_giao_dich}' },
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