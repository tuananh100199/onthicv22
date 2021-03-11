module.exports = app => {
    const schema = app.db.Schema({
        title: String,
        createdDate: { type: Date, default: Date.now },
        addressId: { type: app.db.Schema.ObjectId, ref: 'Address' },
        startTime: Date,
        endTime: Date,
        launchTime: Date,
        endSubTimeExpect: Date,
        endSubTimeOfficial: Date,
        graduationTestTimeExpect: Date,
        graduationTestTimeOfficial: Date,
        adminId: { type: app.db.Schema.ObjectId, ref: 'User' },
        supervisorId: { type: app.db.Schema.ObjectId, ref: 'User' },
        advisorId: [{ type: app.db.Schema.ObjectId, ref: 'User' }],
        studentId: [{ type: app.db.Schema.ObjectId, ref: 'User' }],
        abstract: String,
        content: String,
        active: { type: Boolean, default: false },
        licenseClass: { type: app.db.Schema.ObjectId, ref: 'CourseType' },
    });
    const model = app.db.model('Course', schema);

    app.model.course = {
        create: (data, done) => {
            if (!data.title) data.title = 'Khoá học mới';
            model.create(data, done);
        },

        getPage: (pageNumber, pageSize, condition, done) => model.countDocuments(condition, (error, totalItem) => {
            if (error) {
                done(error);
            } else {
                let result = { totalItem, pageSize, pageTotal: Math.ceil(totalItem / pageSize) };
                result.pageNumber = pageNumber === -1 ? result.pageTotal : Math.min(pageNumber, result.pageTotal);
                const skipNumber = (result.pageNumber > 0 ? result.pageNumber - 1 : 0) * result.pageSize;

                model.find(condition).sort({ tilte: 1 }).skip(skipNumber).limit(result.pageSize).exec((error, items) => {
                    result.list = error ? [] : items;
                    done(error, result);
                });
            }
        }),

        getAll: done => model.find({}).sort({ tilte: 1 }).exec(done),
        // get: (condition, done) => typeof condition == 'string' ? model.findById(condition).populate('addressId').populate('adminId').populate('supervisorId').exec(done) : model.findOne(condition).populate('adminId').populate('supervisorId').exec(done),
        // get: (condition, done) => typeof condition == 'string' ? model.findById(condition, done) : model.findOne(condition, done),
        get: (condition, done) => typeof condition == 'string' ? model.findById(condition).populate('adminId').exec(done) : model.findOne(condition).populate('adminId').exec(done),
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