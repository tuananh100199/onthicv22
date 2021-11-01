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

        hinhThe3x4: { type: Boolean, default: false },
        hinhChupTrucTiep: { type: Boolean, default: false },

        planCourse: String,                                                                         // Khóa học dự kiến
        planLecturer: { type: app.db.Schema.ObjectId, ref: 'User' },                                // Cố vấn học tập dự kiến                                 
        division: { type: app.db.Schema.ObjectId, ref: 'Division' },                                // Cơ sở đào tạo
        course: { type: app.db.Schema.ObjectId, ref: 'Course' },                                    // Khóa học
        courseType: { type: app.db.Schema.ObjectId, ref: 'CourseType' },                            // Hạng đăng ký

        hocPhiPhaiDong: Number,                                                                     // Học phí phải đóng
        hocPhiMienGiam: Number,                                                                     // Số tiền được miễn giảm
        hocPhiDaDong: Number,                                                                       // Học phí đã đóng

        tienDoHocTap: {},
        diemThucHanh: Number,
        diemBoDeThi: {},

        duKienThangThi: Number,                                                                     // Dự kiến tháng thi
        duKienNamThi: Number,                                                                       // Dự kiến năm thi

        diemThiTotNghiep: [{
            monThiTotNghiep: { type: app.db.Schema.ObjectId },
            point: Number,
            diemLiet: { type: Boolean, default: false },
        }],

        diemThiHetMon: [{
            subject: { type: app.db.Schema.ObjectId, ref: 'Subject' },
            point: Number,
        }],
        diemTrungBinhThiHetMon: Number,

        datSatHach: { type: Boolean, default: false },
        ngayDuKienThiSatHach: Date,
        liDoChuaDatSatHach: String,

        createdDate: { type: Date, default: Date.now },                                             // Ngày tạo
        modifiedDate: { type: Date, default: Date.now },                                            // Ngày cập nhật cuối cùng
    });

    // Không được phép viết hàm getAll cho model student
    const model = app.db.model('Student', schema);
    app.model.student = {
        create: (data, done) => model.create(data, done),

        get: (condition, done) => (typeof condition == 'object' ? model.findOne(condition) : model.findById(condition))
            .populate('user', '-password').populate('division').populate('courseType').populate('course').exec(done),

        getAll: (condition, done) => {
            if (typeof condition == 'function') {
                done = condition;
                condition = {};
            }
            model.find(condition)
                .populate('user', 'email phoneNumber image')
                .populate('course', 'courseType name active')
                .populate('division')
                .populate('courseType', 'title')
                .populate({
                    path: 'course', populate: { path: 'subjects', select: '-detailDescription' }
                })
                .sort({ lastname: 1, firstname: 1 }).exec(done);
        },

        getPage: (pageNumber, pageSize, condition, sort, done) => model.countDocuments(condition, (error, totalItem) => {
            if (done == undefined) {
                done = sort;
                sort = { lastname: 1, firstname: 1 };
            }
            if (error) {
                done(error);
            } else {
                const result = { totalItem, pageSize, pageTotal: Math.ceil(totalItem / pageSize) };
                result.pageNumber = pageNumber === -1 ? result.pageTotal : Math.min(pageNumber, result.pageTotal);
                const skipNumber = (result.pageNumber > 0 ? result.pageNumber - 1 : 0) * result.pageSize;
                if (condition.searchText) {
                    model.aggregate([{ $project: { 'name': { $concat: ['$lastname', ' ', '$firstname'] } } },
                    { $match: { 'name': { $regex: `.*${condition.searchText}.*`, $options: 'i' } } }
                    ]).exec((error, list) => {
                        if (error) {
                            done(error);
                        } else {
                            const _ids = list.map(item => item._id);
                            delete condition.searchText;
                            if (sort && sort.division == 0) delete sort.division;
                            model.find({ _id: { $in: _ids }, ...condition }).sort(sort).skip(skipNumber).limit(result.pageSize)
                                .populate('user', '-password').populate('division', '_id title isOutside').populate('planLecturer', '_id lastname firstname').populate('courseType').populate('course').populate({
                                    path: 'course', populate: { path: 'subjects', select: '-detailDescription' }
                                }).exec((error, list) => {
                                    result.list = list;
                                    done(error, result);
                                });
                        }
                    });
                } else {
                    delete condition.searchText;
                    if (sort && sort.division == 0) delete sort.division;
                    model.find(condition).sort(sort).skip(skipNumber).limit(result.pageSize)
                        .populate('user', '-password').populate('division', '_id title isOutside').populate('planLecturer', '_id lastname firstname').populate('courseType').populate('course').populate({
                            path: 'course', populate: { path: 'subjects', select: '-detailDescription' }
                        }).exec((error, list) => {
                            result.list = list;
                            done(error, result);
                        });
                }
            }
        }),

        // changes = { $set, $unset, $push, $pull }
        update: (_id, changes, done) => {
            if (changes.course) {
                app.model.course.get(changes.course, (error, item) => {
                    if (error) {
                        done(error);
                    } else if (item) {
                        changes.tienDoHocTap = {};
                        changes.diemBoDeThi = {};
                        item.subjects && item.subjects.forEach(subject => {
                            const obj = {};
                            obj[subject._id] = {};
                            Object.assign(changes.tienDoHocTap, obj);
                        });
                        changes.modifiedDate = new Date();
                        model.findOneAndUpdate({ _id }, changes, { new: true }).populate('user', 'email phoneNumber').populate('division', 'id title').exec(done);
                    } else {
                        done();
                    }
                });
            } else {
                changes.modifiedDate = new Date();
                model.findOneAndUpdate({ _id }, changes, { new: true }).populate('user', 'email phoneNumber').populate('division', 'id title').populate('course', 'name').exec(done);
            }
        },

        resetLesson: (_id, changes, done) => {
            model.findOneAndUpdate({ _id }, { $unset: changes, $set: { modifiedDate: new Date() } }, { new: true }).exec(done);
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

        updateLearningProgress: (data, done) => {
            app.model.student.get(data.studentId, (error, student) => {
                if (error) {
                    done(error);
                } else if (data.view) {
                    const obj = {};
                    if (student.tienDoHocTap[data.subjectId] && student.tienDoHocTap[data.subjectId][data.lessonId]) {
                        student.tienDoHocTap[data.subjectId][data.lessonId].view = data.view;
                    } else {
                        obj[data.lessonId] = { view: data.view };
                        Object.assign(student.tienDoHocTap[data.subjectId], obj);
                    }
                    model.findOneAndUpdate({ _id: data.studentId }, { tienDoHocTap: student.tienDoHocTap }, { new: true }).exec(done);
                } else {
                    const obj = {};
                    obj[data.lessonId] = { score: data.score, trueAnswers: data.trueAnswer, answers: data.answers };
                    Object.assign(student.tienDoHocTap[data.subjectId], obj);
                    model.findOneAndUpdate({ _id: data.studentId }, { tienDoHocTap: student.tienDoHocTap }, { new: true }).exec(done);
                }
            });
        },

        addFeedback: (data, done) => {
            app.model.student.get(data.studentId, (error, student) => {
                if (error) {
                    done(error);
                } else {
                    const obj = { answers: data.answers };
                    Object.assign(student.tienDoHocTap[data.subjectId], obj);
                    model.findOneAndUpdate({ _id: data.studentId }, { tienDoHocTap: student.tienDoHocTap }, { new: true }).exec(done);
                }
            });
        },
    };
};
