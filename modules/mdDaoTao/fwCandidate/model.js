module.exports = app => {
    const schema = app.db.Schema({
        firstname: String,
        lastname: String,
        email: String,
        phoneNumber: String,
        user: { type: app.db.Schema.ObjectId, ref: 'User' },
        staff: { type: app.db.Schema.ObjectId, ref: 'User' },               // Nhân viên cập nhật dữ liệu
        state: { type: String, enum: ['MoiDangKy', 'DangLienHe', 'Huy', 'UngVien'], default: 'MoiDangKy' },
        createdDate: { type: Date, default: Date.now },                     // Ngày tạo
        modifiedDate: { type: Date, default: null },                        // Ngày cập nhật cuối cùng
        courseType: { type: app.db.Schema.Types.ObjectId, ref: 'CourseType' },
    });
    const model = app.db.model('Candidate', schema);

    app.model.candidate = {
        create: (data, done) => model.create(data, done),

        getAll: (condition, done) => typeof condition == 'function' ?
            model.find({}).populate('courseType', 'title').sort({ _id: -1 }).exec(condition) :
            model.find(condition).populate('courseType', 'title').sort({ _id: -1 }).exec(done),

        getPage: (pageNumber, pageSize, condition, done) => model.countDocuments(condition, (error, totalItem) => {
            if (error) {
                done(error);
            } else {
                let result = { totalItem, pageSize, pageTotal: Math.ceil(totalItem / pageSize) };
                result.pageNumber = pageNumber === -1 ? result.pageTotal : Math.min(pageNumber, result.pageTotal);
                const skipNumber = (result.pageNumber > 0 ? result.pageNumber - 1 : 0) * result.pageSize;
                model.find(condition).populate('courseType', 'title').populate('user', 'firstname lastname').populate('staff', 'firstname lastname').sort({ _id: -1 }).skip(skipNumber).limit(result.pageSize).exec((error, list) => {
                    result.list = list;
                    done(error, result);
                });
            }
        }),

        get: (condition, done) => typeof condition == 'object' ?
            model.findOne(condition, done) : model.findById(condition, done),

        // changes = { $set, $unset, $push, $pull }
        update: (_id, changes, done) => model.findOneAndUpdate({ _id }, changes, { new: true }, done),

        delete: (_id, done) => model.findById(_id, (error, item) => {
            if (error) {
                done(error);
            } else if (item == null) {
                done('Invalid id!');
            } else {
                item.remove(done);
            }
        }),

        count: (condition, done) => done ? model.countDocuments(condition, done) : model.countDocuments({}, condition),
    };
};