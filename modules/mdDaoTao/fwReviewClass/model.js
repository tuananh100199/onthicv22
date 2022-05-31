module.exports = app => {
    const schema = app.database.mongoDB.Schema({
        title: String,
        active: { type: Boolean, default: false },
        dateStart: Date,
        dateEnd: Date,
        students: [{ type: app.database.mongoDB.Schema.Types.ObjectId, ref: 'Student' }],
        teacher: { type: app.database.mongoDB.Schema.Types.ObjectId, ref: 'User' },
        remainStudent: { type: Number, default: 100 },  
        courseType: { type: app.database.mongoDB.Schema.ObjectId, ref: 'CourseType' }, 
    });
    const model = app.database.mongoDB.model('ReviewClass', schema);

    app.model.reviewClass = {
        create: (data, done) => model.create(data, done),

        getPage: (pageNumber, pageSize, condition, done) => model.countDocuments(condition, (error, totalItem) => {
            if (error) {
                done(error);
            } else {
                let result = { totalItem, pageSize, pageTotal: Math.ceil(totalItem / pageSize) };
                result.pageNumber = pageNumber === -1 ? result.pageTotal : Math.min(pageNumber, result.pageTotal);
                const skipNumber = (result.pageNumber > 0 ? result.pageNumber - 1 : 0) * result.pageSize;

                model.find(condition).sort({ title: 1 }).skip(skipNumber).limit(result.pageSize).populate('courseType', '_id title').populate('teacher', 'lastname firstname').populate('students', 'lastname firstname phoneNumber').exec((error, items) => {
                    result.list = error ? [] : items;
                    done(error, result);
                });
            }
        }),

        getAll: (condition, done) => done ?
            model.find(condition).sort({ title: 1 }).populate('category', '_id title isSuPham').exec(done) :
            model.find({}).sort({ title: 1 }).populate('category', '_id title isSuPham').exec(condition),


        get: (condition, done) => {
            if (done == undefined) {
                done = condition;
                condition = {};
            }
            if (typeof condition == 'string') condition = { _id: condition };
            model.findOne(condition).populate('students', 'lastname firstname').populate({
                path: 'students', populate: { path: 'user', select: 'phoneNumber' }
            }).exec(done);
        },
        // changes = { $set, $unset, $push, $pull }
        update: (condition, changes, $unset, done) => {
            if (!done) {
                done = $unset;
                $unset = {};
            }
            typeof condition == 'string' ?
                model.findOneAndUpdate({ _id: condition }, { $set: changes, $unset }, { new: true }, done) :
                model.updateMany(condition, { $set: changes, $unset }, { new: true }, done);
        },

        addStudent: (_id, student, done) => {
            model.findOneAndUpdate(_id, { $push: { students: student } }, { new: true }).populate('students', 'lastname firstname phoneNumber').exec(done);
        },

        deleteLesson: (_id, _studentId, done) => {
            model.findOneAndUpdate({ _id }, { $pull: { students: _studentId } }, { new: true }).populate('students', 'lastname firstname phoneNumber').exec(done);
        },

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
