module.exports = app => {
    const schema = app.db.Schema({
        title: String,
        kiemTra: String,                                                    // Chương trình học
        note: String,
        lyThuyet: String,
        thucHanh: String,
        monHoc: String,
        active: { type: Boolean, default: false },
        courseType: { type: app.db.Schema.ObjectId, ref: 'CourseType' },
    });
    const model = app.db.model('StudyProgram', schema);

    app.model.studyProgram = {
        create: (data, done) => model.create(data, done),

        getAll: (condition, done) => done ?
            model.find(condition).sort({ title: 1 }).exec(done) :
            model.find({}).sort({ title: 1 }).exec(condition),

        get: (condition, done) => typeof condition == 'string' ?
            model.findById(condition).exec(done) :
            model.findOne(condition).exec(done),

        // changes = { $set, $unset, $push, $pull }
        update: (_id, changes, done) => model.findOneAndUpdate({ _id }, changes, { new: true }, done),

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
