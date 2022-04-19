module.exports = (app) => {
    const schema = app.database.mongoDB.Schema({
        name: String,
        teachers: { type: [{ type: app.database.mongoDB.Schema.Types.ObjectId, ref: 'Teacher' }], default: [] },// danh sách giáo viên được đề nghị
        startDate: { type: Date, default: Date.now },
        endDate: { type: Date, default: Date.now },
        diaChi: String,
        hangTapHuan: { type: app.database.mongoDB.Schema.Types.ObjectId, ref: 'Category' },//Hạng GPLX,gplx category
    });

    const model = app.db.model('TrainingClass', schema);
    app.model.trainingClass = {
        create: (data, done) => model.create(data, done),

        getAll: (condition, done) => model.find(condition).sort({ name: -1 }).exec(done),

        get: (condition, done) => (typeof condition == 'object' ? model.findOne(condition) : model.findById(condition)).exec(done),

        getPage: (pageNumber, pageSize, condition, done) => model.countDocuments(condition, (error, totalItem) => {
            if (error) {
                done(error);
            } else {
                let result = { totalItem, pageSize, pageTotal: Math.ceil(totalItem / pageSize) };
                result.pageNumber = pageNumber === -1 ? result.pageTotal : Math.min(pageNumber, result.pageTotal);
                const skipNumber = (result.pageNumber > 0 ? result.pageNumber - 1 : 0) * result.pageSize;

                model.find(condition).sort({ name: 1 }).skip(skipNumber).limit(result.pageSize)
                    .populate('teacher', '_id firstname lastname').populate('hangTapHuan', '_id title')
                    .exec((error, items) => {
                        result.list = error ? [] : items;
                        done(error, result);
                    });
            }
        }),

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

        addTeacher: (_id, _teacherId, done) => {
            model.findOneAndUpdate({ _id }, { $push: { teachers: _teacherId } }, { new: true }).populate('teachers').exec(done);
        },
        deleteTeacher: (_id, _teacherId, done) => {
            model.findOneAndUpdate({ _id }, { $pull: { teachers: _teacherId } }, { new: true }).populate('teachers').exec(done);
        },

        count: (condition, done) => done ? model.countDocuments(condition, done) : model.countDocuments({}, condition),
    };
};
