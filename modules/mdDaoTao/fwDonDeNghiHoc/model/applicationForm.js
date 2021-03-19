module.exports = app => {
    const schema = app.db.Schema({
        user: { type: app.db.Schema.Types.ObjectId, ref: 'User' },

        integration: Boolean, // Tich hop
        content: String,
        reason: String, //Ly do tu choi don(neu co)
        licenseNumber: String, // So GPLX
        licenseDated: Date, // Ngay cap GPLX
        licenseIssuedBy: String, // Noi cap GPLX

        otherDocumentation: String, // Tai lieu khac
        licenseClass: { type: String, enum: ['B1', 'B2', 'C'], default: 'B1' }, // Hang bang lai xe 
        newLicenseClass: { type: String, enum: ['B1', 'B2', 'C'], default: 'B1' },

        status: { type: String, enum: ['approved', 'waiting', 'reject', 'finish', 'progressing'], default: 'waiting' },

    });
    const model = app.db.model('ApplicationForm', schema);

    app.model.applicationForm = {
        create: (data, done) => model.create(data, done),

        getPage: (pageNumber, pageSize, condition, done) => model.countDocuments(condition, (error, totalItem) => {
            if (error) {
                done(error);
            } else {
                let result = { totalItem, pageSize, pageTotal: Math.ceil(totalItem / pageSize) };
                result.pageNumber = pageNumber === -1 ? result.pageTotal : Math.min(pageNumber, result.pageTotal);

                const skipNumber = (result.pageNumber > 0 ? result.pageNumber - 1 : 0) * result.pageSize;
                model.find(condition).sort({ status: -1 }).skip(skipNumber).limit(result.pageSize).populate('user', '_id firstname lastname').exec((error, items) => {
                    result.list = error ? [] : items;
                    done(error, result);
                });
            }
        }),

        get: (condition, done) => (typeof condition == 'object' ?
            model.findOne(condition) :
            model.findById(condition)).populate('user', '_id firstname lastname birthday phoneNumber residence identityCard identityDate identityIssuedBy nationality sex regularResidence').exec(done),

        update: (_id, $set, $unset, done) => done ?
            model.findOneAndUpdate({ _id }, { $set, $unset }, { new: true }, done) :
            model.findOneAndUpdate({ _id }, { $set }, { new: true }, $unset),

        delete: (_id, done) => model.findById(_id, (error, item) => {
            if (error) {
                done(error);
            } else if (item == null) {
                done('Invalid Id!');
            } else {
                item.remove(done);
            }
        }),
        getAll: (condition, done) => done ? model.find(condition).exec(done) : model.find({}).exec(condition),
    }
};
