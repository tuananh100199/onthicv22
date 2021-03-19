module.exports = app => {
    const schema = app.db.Schema({
        title: String,
        createdDate: { type: Date, default: Date.now },
        addressId: { type: app.db.Schema.ObjectId, ref: 'Division' },
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
        subjectList: [{ type: app.db.Schema.ObjectId, ref: 'Subject' }]
    });
    const model = app.db.model('Course', schema);

    app.model.course = {
        create: (data, done) => {
            app.model.courseType.get(data.licenseClass, (_, item) =>
                model.create({
                    ...data,
                    abstract: item.shortDescription,
                    content: item.detailDescription,
                    subjectList: item.subjectList
                }, done))
        },

        getPage: (pageNumber, pageSize, condition, done) => model.countDocuments(condition, (error, totalItem) => {
            if (error) {
                done(error);
            } else {
                let result = { totalItem, pageSize, pageTotal: Math.ceil(totalItem / pageSize) };
                result.pageNumber = pageNumber === -1 ? result.pageTotal : Math.min(pageNumber, result.pageTotal);
                const skipNumber = (result.pageNumber > 0 ? result.pageNumber - 1 : 0) * result.pageSize;

                model.find(condition).sort({ title: 1 }).skip(skipNumber).limit(result.pageSize).exec((error, items) => {
                    result.list = error ? [] : items;
                    done(error, result);
                });
            }
        }),

        getAll: done => model.find({}).sort({ tilte: 1 }).exec(done),

        get: (condition, done) => typeof condition == 'string' ?
            model.findById(condition).populate('licenseClass').populate('subjectList').populate('addressId').exec(done)
            : model.findOne(condition).populate('licenseClass').populate('subjectList').populate('addressId').exec(done),

        update: (_id, $set, $unset, done) => done ?
            model.findOneAndUpdate({ _id }, { $set, $unset }, { new: true }).populate('subjectList').exec(done) :
            model.findOneAndUpdate({ _id }, { $set }, { new: true }).populate('subjectList').exec($unset),
        delete: (_id, done) => model.findById(_id, (error, item) => {
            if (error) {
                done(error);
            } else if (item == null) {
                done('Invalid Id!');
            } else {
                item.remove(done);
            }
        }),

        count: (condition, done) => done ? model.countDocuments(condition, done) : model.countDocuments({}, condition),
    };
};