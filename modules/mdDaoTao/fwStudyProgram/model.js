module.exports = app => {
    const schema = app.database.mongoDB.Schema({
        title: String,
        kiemTra: String,                                                    // Chương trình học
        note: String,
        lyThuyet: String,
        thucHanh: String,
        monHoc: String,
        active: { type: Boolean, default: false },
        courseType: { type: app.database.mongoDB.Schema.ObjectId, ref: 'CourseType' },
        time: String,
    });
    const model = app.database.mongoDB.model('StudyProgram', schema);

    app.model.studyProgram = {
        create: (data, done) => model.create(data, done),

        getAll: (condition, done) => done ?
            model.find(condition).populate('courseType').sort({ courseType: 1 }).exec(done) :
            model.find({}).populate('courseType').sort({ courseType: 1 }).exec(condition),

        get: (condition, done) => typeof condition == 'string' ?
            model.findById(condition).populate('courseType').exec(done) :
            model.findOne(condition).populate('courseType').exec(done),

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
    };
};
