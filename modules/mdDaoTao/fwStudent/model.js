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

        division: { type: app.db.Schema.ObjectId, ref: 'Division' },                                // Cơ sở đào tạo
        course: { type: app.db.Schema.ObjectId, ref: 'Course' },                                 // Khoá học
        courseType: { type: app.db.Schema.ObjectId, ref: 'CourseType' },                            // Hạng đăng ký

        hocPhiPhaiDong: Number,                                                                     // Học phí phải đóng
        hocPhiMienGiam: Number,                                                                     // Số tiển được miễn giảm
        hocPhiDaDong: Number,   // Học phí đã đóng

        tienDoHocTap: {},

        duKienThangThi: Number,                                                                     // Dự kiến tháng thi
        duKienNamThi: Number,                                                                       // Dự kiến năm thi

        createdDate: { type: Date, default: Date.now },                                             // Ngày tạo
        modifiedDate: { type: Date, default: Date.now },                                            // Ngày cập nhật cuối cùng
    });

    // Không được phép viết hàm getAll cho model student
    const model = app.db.model('Student', schema);
    app.model.student = {
        create: (data, done) => model.create(data, done),

        get: (condition, done) => (typeof condition == 'object' ? model.findOne(condition) : model.findById(condition))
            .populate('user', '-password').populate('division').populate('courseType').populate('course').exec(done),

        getAll: (condition, done) => typeof condition == 'function' ?
            model.find({}).populate('course', 'name').populate('division').populate('courseType', 'title').sort({ lastname: 1, firstname: 1 }).exec(condition) :
            model.find(condition).populate('course', 'name').populate('division').populate('courseType', 'title').sort({ lastname: 1, firstname: 1 }).exec(done),

        getPage: (pageNumber, pageSize, condition, done) => model.countDocuments(condition, (error, totalItem) => {
            if (error) {
                done(error);
            } else {
                const result = { totalItem, pageSize, pageTotal: Math.ceil(totalItem / pageSize) };
                result.pageNumber = pageNumber === -1 ? result.pageTotal : Math.min(pageNumber, result.pageTotal);
                const skipNumber = (result.pageNumber > 0 ? result.pageNumber - 1 : 0) * result.pageSize;
                model.find(condition).sort({ modifiedDate: 1, lastname: 1, firstname: 1 }).skip(skipNumber).limit(result.pageSize)
                    .populate('user', '-password').populate('division', '_id title').populate('courseType').populate('course').exec((error, list) => {
                        result.list = list;
                        done(error, result);
                    });
            }
        }),

        // changes = { $set, $unset, $push, $pull }
        update: (_id, changes, done) => {
            if (changes.course) {
                app.model.course.get(changes.course, (error, item) => {
                    if (error) {
                        done(error)
                    } else {
                        changes.tienDoHocTap = {};
                        item.subjects.forEach(subject => {
                            {
                                const obj = {};
                                obj[subject._id] = {};
                                Object.assign(changes.tienDoHocTap, obj)
                            }
                        });
                        changes.modifiedDate = new Date();
                        model.findOneAndUpdate({ _id }, changes, { new: true }).exec(done);
                    }
                });
            } else {
                changes.modifiedDate = new Date();
                model.findOneAndUpdate({ _id }, changes, { new: true }).exec(done);
            }
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

        addStudiedLesson: (studentId, subjectId, lessonId, score, done) => {
            app.model.student.get(studentId, (error, student) => {
                if (error) {
                    done(error)
                } else {
                    const obj = {};
                    obj[lessonId] = score;
                    Object.assign(student.tienDoHocTap[subjectId], obj)
                    model.findOneAndUpdate({ _id: studentId }, { tienDoHocTap: student.tienDoHocTap }, { new: true }).exec(done);
                }
            })
        },
    };
};
