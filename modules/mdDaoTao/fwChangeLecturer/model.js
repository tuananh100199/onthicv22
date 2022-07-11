module.exports = app => {
    const schema = app.database.mongoDB.Schema({
        student: { type: app.database.mongoDB.Schema.ObjectId, ref: 'Student' },              // Học viên đổi
        requestedLecturer: { type: app.database.mongoDB.Schema.ObjectId, ref: 'User' },         // Giáo viên được học viên yêu cầu
        lecturer: { type: app.database.mongoDB.Schema.ObjectId, ref: 'User' },                // Giáo viên được thay đổi
        reason: String,
        createdDate: { type: Date, default: Date.now },
        startDate: { type: Date, default: Date.now },
        state: { type: String, enum: ['approved', 'waiting', 'reject'], default: 'waiting' },
    });
    const model = app.database.mongoDB.model('ChangeLecturer', schema);

    app.model.changeLecturer = {
        create: (data, done) => model.create(data, done),

        getPage: (pageNumber, pageSize, condition, done) => model.countDocuments(condition, (error, totalItem) => {
            if (error) {
                done(error);
            } else {
                let result = { totalItem, pageSize, pageTotal: Math.ceil(totalItem / pageSize) };
                result.pageNumber = pageNumber === -1 ? result.pageTotal : Math.min(pageNumber, result.pageTotal);
                const skipNumber = (result.pageNumber > 0 ? result.pageNumber - 1 : 0) * result.pageSize;
                model.find(condition).populate('student', 'lastname firstname division').populate('requestedLecturer', 'lastname firstname phoneNumber identityCard').populate('lecturer', 'lastname firstname phoneNumber identityCard').sort({ _id: -1 }).skip(skipNumber).limit(result.pageSize).exec((error, list) => {
                    result.list = list;
                    done(error, result);
                });
            }
        }),

        getAll: (condition, done) => done ?
            model.find(condition).sort({ title: 1 }).exec(done) :
            model.find({}).sort({ title: 1 }).exec(condition),

        get: (condition, done) => typeof condition == 'string' ?
            model.findById(condition).populate({
                path: 'student',
                populate: {
                    path: 'course'
                }
            }).exec(done) :
            model.findOne(condition).populate({
                path: 'student',
                populate: {
                    path: 'course'
                }
            }).exec(done),

        // changes = { $set, $unset, $push, $pull }
        update: (_id, changes, done) => model.findOneAndUpdate({ _id }, changes, { new: true }, done),

        delete: (_id, done) => model.findById(_id, (error, item) => {
            if (error) {
                done(error);
            } else if (item == null) {
                done('Invalid Id!');
            } else {
                item.remove(done);
            }
        }),
    };
};
