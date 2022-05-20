module.exports = (app) => {
    const schema = app.database.mongoDB.Schema({
        user: { type: app.database.mongoDB.Schema.ObjectId, ref: 'User' },

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
        planLecturer: { type: app.database.mongoDB.Schema.ObjectId, ref: 'User' },                                // Giáo viên dự kiến                                 
        division: { type: app.database.mongoDB.Schema.ObjectId, ref: 'Division' },                                // Cơ sở đào tạo
        course: { type: app.database.mongoDB.Schema.ObjectId, ref: 'Course' },                                    // Khóa học
        courseType: { type: app.database.mongoDB.Schema.ObjectId, ref: 'CourseType' },                            // Hạng đăng ký

        goiHocVien: { type: String, enum: ['coban', 'tuchon'], default: 'coban' },                  // Gói đăng ký của học viên => được học vào T7, CN, ngoài giờ

        hocPhiPhaiDong: Number,                                                                     // Học phí phải đóng
        hocPhiMienGiam: Number,                                                                     // Số tiền được miễn giảm
        hocPhiDaDong: Number,                                                                       // Học phí đã đóng
        ngayHetHanNopHocPhi: Date,                                                                  // Ngày hết hạn nộp học phí
        coursePayment: { type: app.database.mongoDB.Schema.ObjectId, ref: 'CoursePayment' },
        discount: { type: app.database.mongoDB.Schema.ObjectId, ref: 'Discount' },
        courseFee: { type: app.database.mongoDB.Schema.ObjectId, ref: 'CourseFee' },
        lichSuDongTien: [{
            date: { type: Date, default: Date.now },
            fee: { type: Number, default: 0 },
            user: { type: app.database.mongoDB.Schema.ObjectId, ref: 'User' },                                    // Người xác nhận tiền 
            isOnlinePayment: { type: Boolean, default: false },
        }],

        lichSuMuaThemGoi: [
            {
                transactionId: String,
                item: [{
                    isDefault: { type: Boolean, default: false },
                    _id: { type: app.database.mongoDB.Schema.ObjectId },
                    name: String,
                    courseType: { type: app.database.mongoDB.Schema.ObjectId, ref: 'CourseType' },
                    feeType: { type: app.database.mongoDB.Schema.ObjectId, ref: 'FeeType' },
                    fee: Number,
                    description: String,
                    quantity: Number,
                    fees: Number,
                }],
                date: { type: Date, default: Date.now },

            }
        ],

        cart: {
            transactionId: String,
            item: [{
                isDefault: { type: Boolean, default: false },
                _id: { type: app.database.mongoDB.Schema.ObjectId },
                name: String,
                courseType: { type: app.database.mongoDB.Schema.ObjectId, ref: 'CourseType' },
                feeType: { type: app.database.mongoDB.Schema.ObjectId, ref: 'FeeType' },
                fee: Number,
                description: String,
                quantity: Number,
                fees: Number,
            }],
            lock: { type: Boolean, default: false }
        },
        // active manual
        activeKhoaLyThuyet: { type: Boolean, default: false },
        activeKhoaThucHanh: { type: Boolean, default: false },

        tienDoHocTap: {},
        tienDoThiHetMon: {},
        diemThucHanh: Number,
        diemBoDeThi: {},
        duKienThangThi: Number,                                                                     // Dự kiến tháng thi
        duKienNamThi: Number,                                                                       // Dự kiến năm thi

        diemThiTotNghiep: [{
            monThiTotNghiep: { type: app.database.mongoDB.Schema.ObjectId },
            point: Number,
            diemLiet: { type: Boolean, default: false },
        }],

        diemThiHetMon: [{
            subject: { type: app.database.mongoDB.Schema.ObjectId, ref: 'Subject' },
            point: Number,
        }],

        diemTrungBinhThiHetMon: Number,
        soGioThucHanhDaHoc: { type: Number, default: 0 },

        datSatHach: { type: Boolean, default: false },
        totNghiep: { type: Boolean, default: false },
        kySatHach:{ type: app.database.mongoDB.Schema.ObjectId, ref: 'LicenseTest' },
        // ngaySatHach:Date,
        
        // nhận chứng chỉ sơ cấp, giấy phép lái xe
        isCertification: { type: Boolean, default: false },  // trung tâm đã có CCSC
        hasCertification: { type: Boolean, default: false },   // Học viên đã nhận được CCSC
        isLicense: { type: Boolean, default: false },        // Trung tâm đã có GPLX
        hasLicense: { type: Boolean, default: false },         // Học viên đã nhận được GPLX

        ngayDuKienThiSatHach: Date,
        liDoChuaDatSatHach: String,
        ngayDuKienThiTotNghiep: Date,
        liDoChuaTotNghiep: String,



        ngayNhanChungChiHoanThanhKhoaHoc: Date,
        ngayNhanGiayPhepLaiXe: Date,

        tongThoiGianChat: Number,
        tongThoiGianTaiLieu: Number,
        tongThoiGianForum: Number,

        isDon: { type: Boolean, default: false },
        isHinh: { type: Boolean, default: false },
        isIdentityCard: { type: Boolean, default: false },
        isGiayKhamSucKhoe: { type: Boolean, default: false },
        isBangLaiA1: { type: Boolean, default: false },

        soNamLaiXe: Number,
        soKMLaiXe: Number,
        soChungChi: String,
        soGPLX: String,
        coQuan: String,                                                                             // Các trường báo cáo cuối khoá
        ngayHetHanGPLX: Date,
        lyDoSatHach: String,
        noiDungSatHach: String,
        soKMThucHanh: Number,
        diemCuoiKhoa: Number,

        createdDate: { type: Date, default: Date.now },                                             // Ngày tạo
        modifiedDate: { type: Date, default: Date.now },                                            // Ngày cập nhật cuối cùng
    });

    // Không được phép viết hàm getAll cho model student
    const model = app.database.mongoDB.model('Student', schema);
    app.model.student = {
        create: (data, done) => model.create(data, done),

        get: (condition, done) => (typeof condition == 'object' ? model.findOne(condition) : model.findById(condition))
            .populate('user', '-password').populate('division').populate('courseType').populate('courseFee').populate('feeType').populate('coursePayment').populate('discount').populate('course').exec(done),

        getAll: (condition, done) => {
            if (typeof condition == 'function') {
                done = condition;
                condition = {};
            }
            model.find(condition)
                .populate('user', 'email phoneNumber image fcmToken')
                .populate('course', 'courseType name active')
                .populate('division')
                .populate('courseType', 'title').populate('kySatHach','_id title date')
                .populate({
                    path: 'course', populate: { path: 'subjects', select: '-detailDescription' }
                })
                .sort({ lastname: 1, firstname: 1 }).exec(done);
        },

        getAllPreStudent: (maxStudent, condition, done) => {
            if (typeof condition == 'function') {
                done = condition;
                condition = {};
            }
            // Query Mongoose with priority query conditions: courseId => courseType
            model.find(condition).limit(maxStudent).exec((error, listStudent) => {
                if (error) {
                    done(error);
                } else {
                    if (condition.courseType && listStudent && listStudent.length < maxStudent) {
                        //getAllPre
                        model.find({ courseType: condition.courseType, course: null }).limit(maxStudent - listStudent.length).sort({ createdDate: 1 }).exec(done);
                    } else {
                        done('Số lượng học viên của khóa học đã đạt tối đa');
                    }
                }
            });
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
                            model.find({ _id: { $in: _ids }, ...condition }).sort(sort || { firstname: 1 }).skip(skipNumber).limit(result.pageSize)
                                .populate('user', '-password').populate('division', '_id title isOutside').populate('planLecturer', '_id lastname firstname').populate('courseType').populate('course').populate({
                                    path: 'course', populate: { path: 'subjects', select: '-detailDescription' }
                                }).populate('courseFee').populate('_id name').populate('kySatHach','_id title date')
                                .exec((error, list) => {
                                    result.list = list;
                                    done(error, result);
                                });
                        }
                    });
                } else {
                    delete condition.searchText;
                    if (sort && sort.division == 0) delete sort.division;
                    model.find(condition).sort(sort || { firstname: 1 }).skip(skipNumber).limit(result.pageSize)
                        .populate('user', '-password').populate('division', '_id title isOutside').populate('planLecturer', '_id lastname firstname').populate('courseType').populate('course').populate({
                            path: 'course', populate: { path: 'subjects', select: '-detailDescription' }
                        }).populate('courseFee').populate('discount').populate('coursePayment').populate('kySatHach','_id title date')
                        .exec((error, list) => {
                            result.list = list;
                            done(error, result);
                        });
                }
            }
        }),

        mapToId: (condition, done) => {
            model.aggregate([{ $project: { 'name': { $concat: ['$lastname', ' ', '$firstname'] } } },
            { $match: { 'name': { $regex: condition.fullname, $options: 'i' } } }]).exec((error, list) => {
                if (error || list.length == 0) {
                    done(error, list);
                } else {
                    const _ids = list.map(item => item._id);
                    delete condition.fullname;
                    model.find({ _id: { $in: _ids }, ...condition }).exec(done);
                }
            });
        },

        // changes = { $set, $unset, $push, $pull }
        update: (_id, changes, $unset, done) => {
            if (!done) {
                done = $unset;
                $unset = {};
            }
            if (changes && changes.course) {
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
                        model.findOneAndUpdate({ _id }, { $set: changes, $unset }, { new: true }).populate('user', 'email phoneNumber').populate('division', 'id title').exec(done);
                    } else {
                        done();
                    }
                });
            } else {
                changes.modifiedDate = new Date();
                model.findOneAndUpdate({ _id }, { $set: changes, $unset }, { new: true }).populate('user', 'email phoneNumber').populate('division', 'id title').populate('course', 'name').exec(done);
            }
        },

        updateMany: (condition, changes, done) => {
            changes.modifiedDate = new Date();
            model.updateMany(condition, { $set: changes }, { new: true }, done);
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
                }else if(data.state){
                    // giáo viên thực hành đánh dấu cho học viên.
                    const obj = {};
                    if (student.tienDoHocTap[data.subjectId] && student.tienDoHocTap[data.subjectId][data.lessonId]) {
                        student.tienDoHocTap[data.subjectId][data.lessonId].state = data.state;
                    } else {
                        obj[data.lessonId] = { state: data.state };
                        Object.assign(student.tienDoHocTap[data.subjectId], obj);
                    }
                    model.findOneAndUpdate({ _id: data.studentId }, { tienDoHocTap: student.tienDoHocTap }, { new: true }).exec(done);
                } else if (data.view) {
                    const obj = {};
                    if (student.tienDoHocTap[data.subjectId] && student.tienDoHocTap[data.subjectId][data.lessonId]) {
                        student.tienDoHocTap[data.subjectId][data.lessonId].view = data.view;
                    } else {
                        obj[data.lessonId] = { view: data.view };
                        Object.assign(student.tienDoHocTap[data.subjectId], obj);
                    }
                    model.findOneAndUpdate({ _id: data.studentId }, { tienDoHocTap: student.tienDoHocTap }, { new: true }).exec(done);
                } else if (data.viewVideo) {
                    const obj = {};
                    let list = {};
                    if (student.tienDoHocTap[data.subjectId] && student.tienDoHocTap[data.subjectId][data.lessonId]) {
                        list = student.tienDoHocTap[data.subjectId][data.lessonId].viewedVideo ? student.tienDoHocTap[data.subjectId][data.lessonId].viewedVideo : {};
                        list[data.viewVideo] = true;
                        student.tienDoHocTap[data.subjectId][data.lessonId].viewedVideo = list;
                    } else {
                        list[data.viewVideo] = true;
                        obj[data.lessonId] = { viewedVideo: list };
                        Object.assign(student.tienDoHocTap[data.subjectId], obj);
                    }
                    model.findOneAndUpdate({ _id: data.studentId }, { tienDoHocTap: student.tienDoHocTap }, { new: true }).exec(done);
                } else if (data.totalSeconds) {
                    const obj = {};
                    if (student.tienDoHocTap[data.subjectId] && student.tienDoHocTap[data.subjectId][data.lessonId]) {
                        student.tienDoHocTap[data.subjectId][data.lessonId].totalSeconds = data.totalSeconds;
                    } else {
                        obj[data.lessonId] = { totalSeconds: data.totalSeconds };
                        Object.assign(student.tienDoHocTap[data.subjectId], obj);
                    }
                    model.findOneAndUpdate({ _id: data.studentId }, { tienDoHocTap: student.tienDoHocTap }, { new: true }).exec(done);
                } else if (data.answers) {
                    const obj = {};
                    if (student.tienDoHocTap[data.subjectId] && student.tienDoHocTap[data.subjectId][data.lessonId]) {
                        student.tienDoHocTap[data.subjectId][data.lessonId].score = data.score;
                        student.tienDoHocTap[data.subjectId][data.lessonId].trueAnswers = data.trueAnswer;
                        student.tienDoHocTap[data.subjectId][data.lessonId].answers = data.answers;
                        student.tienDoHocTap[data.subjectId][data.lessonId].diemTB = Number((parseInt(data.score) / Object.keys(data.answers).length).toFixed(1));
                    } else {
                        obj[data.lessonId] = { score: data.score, trueAnswers: data.trueAnswer, answers: data.answers, diemTB: Number((parseInt(data.score) / Object.keys(data.answers).length).toFixed(1)) };
                        Object.assign(student.tienDoHocTap[data.subjectId], obj);
                    }
                    model.findOneAndUpdate({ _id: data.studentId }, { tienDoHocTap: student.tienDoHocTap }, { new: true }).exec(done);
                }
            });
        },

        updateTienDoThiHetMon: (data, done) => {
            app.model.student.get(data.studentId, (error, student) => {
                if (error) {
                    done(error);
                } else if (data.answers) {
                    const obj = {};
                    if (student.tienDoThiHetMon) {
                        if (!student.tienDoThiHetMon[data.subjectId]) student.tienDoThiHetMon[data.subjectId] = {};
                        student.tienDoThiHetMon[data.subjectId] = {};
                        student.tienDoThiHetMon[data.subjectId].score = data.score;
                        student.tienDoThiHetMon[data.subjectId].trueAnswers = data.trueAnswer;
                        student.tienDoThiHetMon[data.subjectId].answers = data.answers;
                        student.tienDoThiHetMon[data.subjectId].diemTB = Number((parseInt(data.score) / Object.keys(data.answers).length).toFixed(1));

                    } else {
                        student.tienDoThiHetMon = {};
                        obj[data.subjectId] = { score: data.score, trueAnswers: data.trueAnswer, answers: data.answers, diemTB: Number((parseInt(data.score) / Object.keys(data.answers).length).toFixed(1)) };
                        Object.assign(student.tienDoThiHetMon, obj);
                    }
                    model.findOneAndUpdate({ _id: data.studentId }, { tienDoThiHetMon: student.tienDoThiHetMon }, { new: true }).exec(done);
                }
            });
        },

        addPayment: (_id, data, done) => {
            model.findOneAndUpdate(_id, { $push: { lichSuDongTien: data } }, { new: true }).exec(done);
        },

        addPaymentExtra: (_id, data, done) => {
            model.findOneAndUpdate(_id, { $push: { lichSuMuaThemGoi: data } }, { new: true }).exec(done);
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
        count: (condition, done) => done ? model.countDocuments(condition, done) : model.countDocuments({}, condition),
    };
};
