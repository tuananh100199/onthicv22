module.exports = app => {
    const schema = app.database.mongoDB.Schema({
        firstname: String,
        lastname: String,
        email: String,
        phoneNumber: String,
        birthday: Date,
        identityCard: String,
        planCourse: String,
        user: { type: app.database.mongoDB.Schema.ObjectId, ref: 'User' },
        staff: { type: app.database.mongoDB.Schema.ObjectId, ref: 'User' },               // Nhân viên cập nhật dữ liệu
        state: { type: String, enum: ['MoiDangKy', 'DangLienHe', 'Huy', 'UngVien'], default: 'MoiDangKy' },
        createdDate: { type: Date, default: Date.now },                     // Ngày tạo
        modifiedDate: { type: Date, default: null },                        // Ngày cập nhật cuối cùng
        courseType: { type: app.database.mongoDB.Schema.Types.ObjectId, ref: 'CourseType' },
        division: { type: app.database.mongoDB.Schema.ObjectId, ref: 'Division' },
        // Thêm phần gợi ý khóa học phí
        coursePayment: { type: app.database.mongoDB.Schema.ObjectId, ref: 'CoursePayment' },
        discount: { type: app.database.mongoDB.Schema.ObjectId, ref: 'Discount' },
        courseFee: { type: app.database.mongoDB.Schema.ObjectId, ref: 'CourseFee' },
        // thêm phần bổ sung hồ sơ
        isDon: { type: Boolean, default: false },
        isHinh: { type: Boolean, default: false },
        isIdentityCard: { type: Boolean, default: false },
        isGiayKhamSucKhoe: { type: Boolean, default: false },
        isBangLaiA1: { type: Boolean, default: false },
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
                model.find(condition).populate('courseType', 'title').populate('division', 'title').populate('user', 'firstname lastname').populate('staff', 'firstname lastname')
                    .populate('courseFee', '_id name courseType').populate('discount', '_id name').populate('coursePayment', '_id title')
                    .sort({ _id: -1 }).skip(skipNumber).limit(result.pageSize).exec((error, list) => {
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