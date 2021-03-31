module.exports = (app) => {
    const schema = app.db.Schema({
        user: { type: app.db.Schema.ObjectId, ref: 'User' },

        firstname: String,
        lastname: String,
        sex: { type: String, enum: ['male', 'female'], default: 'male' },
        birthday: Date,
        image: String,                                                                              // Hình người dùng

        nationality: String,                                                                        // Quốc tịch
        residence: String,                                                                          // Nơi cư trú
        regularResidence: String,                                                                   // Nơi đăng ký hộ khẩu thường trú

        identityCard: String,                                                                       // Số CMND, CCCD
        identityIssuedBy: String,                                                                   // Nơi cấp CMND, CCCD
        identityDate: Date,                                                                         // Ngày cấp CMND, CCCD
        identityCardImage1: String,                                                                 // Hình CMND, CCCD mặt trước
        identityCardImage2: String,                                                                 // Hình CMND, CCCD mặt sau

        giayPhepLaiXe2BanhSo: String,                                                               // Số giấy phép lái xe 2 bánh
        giayPhepLaiXe2BanhNgay: String,                                                             // Ngày trúng truyển giấy phép lái xe 2 bánh
        giayPhepLaiXe2BanhNoiCap: String,                                                           // Nơi cấp giấy phép lái xe 2 bánh

        donXinHoc: { type: Boolean, default: false },                                               // Checkbox, đánh dấu có đơn xin học hay chưa có
        giayKhamSucKhoe: { type: Boolean, default: false },                                         // Checkbox, đánh dấu có giấy khám sức khoẻ hay chưa có
        giayKhamSucKhoeNgayKham: Date,                                                              // Ngày khám sức khoẻ

        course: { type: app.db.Schema.ObjectId, ref: 'Course' },                                    // Khoá học
        courseType: { type: app.db.Schema.ObjectId, ref: 'CourseType' },                            // Hạng đăng ký

        hocPhiPhaiDong: Number,                                                                     // Học phí phải đóng
        hocPhiMienGiam: Number,                                                                     // Số tiển được miễn giảm
        hocPhiDaDong: Number,                                                                       // Học phí đã đóng

        duKienThangThi: Number,                                                                     // Dự kiến tháng thi
        duKienNamThi: Number,                                                                       // Dự kiến năm thi

        createdDate: { type: Date, default: Date.now },                                             // Ngày tạo
        modifiedDate: { type: Date, default: Date.now },                                            // Ngày cập nhật cuối cùng
    });

    const model = app.db.model('Student', schema);
    app.model.student = {
        create: (data, done) => model.create(data, done),

        get: (condition, done) => typeof condition == 'object' ?
            model.findOne(condition, done) : model.findById(condition, done),

        getAll: (condition, selector, done) => {
            if (typeof condition == 'function') {
                model.find({}).sort({ name: 1 }).exec(condition);
            } else if (selector && typeof selector == 'function') {
                done = selector;
                typeof condition == 'object' ? model.find(condition).sort({ name: 1 }).exec(done) : model.find({}, condition).sort({ name: 1 }).exec(done);
            } else if (done && typeof done == 'function') {
                model.find(condition, selector).sort({ name: 1 }).exec(done);
            }
        },

        getPage: (pageNumber, pageSize, condition, done) => model.countDocuments(condition, (error, totalItem) => {
            if (error) {
                done(error);
            } else {
                const result = { totalItem, pageSize, pageTotal: Math.ceil(totalItem / pageSize) };
                result.pageNumber = pageNumber === -1 ? result.pageTotal : Math.min(pageNumber, result.pageTotal);
                const skipNumber = (result.pageNumber > 0 ? result.pageNumber - 1 : 0) * result.pageSize;
                model.find(condition).sort({ lastname: 1, firstname: 1 }).skip(skipNumber).limit(result.pageSize).populate('user').populate('courseType').populate('course').exec((error, list) => {
                    result.list = list;
                    done(error, result);
                });
            }
        }),

        // changes = { $set, $unset, $push, $pull }
        update: (_id, changes, done) => {
            changes.modifiedDate = new Date();
            model.findOneAndUpdate({ _id }, changes, { new: true }).exec(done);
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
    }
};
