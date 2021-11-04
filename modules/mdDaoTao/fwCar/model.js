module.exports = app => {
    const schema = app.db.Schema({
        licensePlates: String,                                              // Biển số xe
        courseType: { type: app.db.Schema.ObjectId, ref: 'CourseType' },    // Loại khóa học
        user: { type: app.db.Schema.ObjectId, ref: 'User' },                // Thầy dạy lái xe
        ngayHetHanDangKiem: { type: Date, default: Date.now },              // Ngày hết hạn đăng kiểm xe để NV đưa xe đi đăng kiểm lại
        brand: String,
        isPersonalCar: { type: Boolean, default: false },                   // Xe cá nhân hay xe của trung tâm
        division: { type: app.db.Schema.ObjectId, ref: 'Division' },        // Xe thuộc cơ sở nào
    });
    const model = app.db.model('Car', schema);

    app.model.car = {
        create: (data, done) => model.create(data, done),

        getAll: (condition, done) => model.find(condition).sort({ priority: -1 }).exec(done),

        getPage: (pageNumber, pageSize, condition, done) => model.countDocuments(condition, (error, totalItem) => {
            if (error) {
                done(error);
            } else {
                const result = { totalItem, pageSize, pageTotal: Math.ceil(totalItem / pageSize) };
                result.pageNumber = pageNumber === -1 ? result.pageTotal : Math.min(pageNumber, result.pageTotal);

                const skipNumber = (result.pageNumber > 0 ? result.pageNumber - 1 : 0) * result.pageSize;
                model.find(condition).sort({ createdDate: -1 }).skip(skipNumber).limit(result.pageSize).populate('user', 'firstname lastname').populate('division', 'title').populate('courseType', 'title').exec((error, list) => {
                    result.list = list;
                    done(error, result);
                });
            }
        }),

        get: (condition, done) => typeof condition == 'string' ? model.findById(condition, done) : model.findOne(condition, done),

        update: (condition, changes, done) => typeof condition == 'string' ?
            model.findOneAndUpdate({ _id: condition }, { $set: changes }, { new: true }, done) :
            model.updateMany(condition, { $set: changes }, { new: true }, done),

        delete: (_id, done) => model.findOne({ _id }, (error, item) => {
            if (error) {
                done(error);
            } else if (item == null) {
                done('Invalid Id!');
            } else {
                item.image && app.deleteImage(item.image);
                item.remove(done);
            }
        }),
    };
};