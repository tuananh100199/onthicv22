module.exports = (app) => {
    const schema = app.database.mongoDB.Schema({
        user: { type: app.database.mongoDB.Schema.ObjectId, ref: 'User' },            //user
        division: { type: app.database.mongoDB.Schema.ObjectId, ref: 'Division' },    // Cơ sở đào tạo

        dayLyThuyet: { type: Boolean, default: false },// loại giảng dạy. True là giáo viên dạy lý thuyết, false là giáo viên dạy thực hành
        courseTypes: { type: [{ type: app.database.mongoDB.Schema.Types.ObjectId, ref: 'CourseType' }], default: [] },// danh sách loại khóa học có thể dạy
        courses: { type: [{ type: app.database.mongoDB.Schema.Types.ObjectId, ref: 'Course' }], default: [] },// danh sách các khóa học đang dạy
        doneCourses: { type: [{ type: app.database.mongoDB.Schema.Types.ObjectId, ref: 'Course' }], default: [] },// danh sách các khóa học đã dạy

        // Thông tin chung
        maGiaoVien: String,
        firstname: String,
        lastname: String,
        sex: { type: String, enum: ['male', 'female'], default: 'male' },
        birthday: Date,
        image: String,
        email: String,
        phoneNumber: String,

        residence: String,                                              // Nơi cư trú
        regularResidence: String,                                       // Nơi đăng ký hộ khẩu thường trú

        identityCard: String,                                           // Số CMND, CCCD
        identityIssuedBy: String,                                       // Nơi cấp CMND, CCCD
        identityDate: Date,                                             // Ngày cấp CMND, CCCD
        teacherType: { type: app.database.mongoDB.Schema.ObjectId, ref: 'Category' },
        trinhDoVanHoa: String,
        // Trình độ và bằng cấp.        
        trinhDoChuyenMon: {
            trinhDo: String,
            chuyenNganh: String,
            ngayCap: Date,
            noiCap: String,
            congVanDi: String,
            congVanDen: String,
            state: { type: String, enum: ['dangKiemTra', 'hopLe', 'KhongHopLe'], default: 'dangKiemTra' },
            lyDo: String,
        },

        //Giấy phép lái xe
        giayPhepLaiXe: {
            category: { type: [{ type: app.database.mongoDB.Schema.Types.ObjectId, ref: 'Category' }], default: [] },
            soGplx: String,
            ngayCap: Date,
            noiCap: String,
            ngayTrungTuyen: Date,
            isVerifyOnline: { type: Boolean, default: false },
            state: { type: String, enum: ['dangKiemTra', 'hopLe', 'KhongHopLe'], default: 'dangKiemTra' },
        },

        chungChiThucHanh: {
            category: { type: [{ type: app.database.mongoDB.Schema.Types.ObjectId, ref: 'Category' }], default: [] },
            ngayCap: Date,
            noiCap: String,
        },
        lyDo: String,
        state: { type: String, enum: ['dangDuyet', 'daDuyet', 'khongDuyet'], default: 'dangDuyet' },



        // contract
        contract: {
            category: { type: app.database.mongoDB.Schema.ObjectId, ref: 'Category' },
            startDate: Date,
            expireDate: Date,
        },
        maSoThue: String,
        baoHiemXaHoi: {
            number: String,
            noiDong: String,
        },
        thoiGianLamViec: {
            startDate: Date,
            nghiViec: { type: Boolean, default: false },
            endDate: Date,
        },

        courseHistory: [{
            course: { type: app.database.mongoDB.Schema.ObjectId, ref: 'Course' },    // Khóa học
            date: { type: Date, default: Date.now },
            user: { type: app.database.mongoDB.Schema.ObjectId, ref: 'User' },    // Người thực hiện                                   // Người xác nhận tiền 
            type: { type: String, enum: ['add', 'remove'], default: 'add' },
            description: String, // only for remove course
        }],

        trainingClass: { type: [{ type: app.database.mongoDB.Schema.Types.ObjectId, ref: 'TrainingClass' }], default: [] },// danh sách lớp tập huấn tham gia.



    });

    const model = app.database.mongoDB.model('Teacher', schema);
    app.model.teacher = {
        create: (data, done) => {
            // xử lý trường hợp có msnv
            if (data && (data.maGiaoVien || data.identityCard)) {
                model.findOne({ $or: [{ maGiaoVien: data.maGiaoVien }, { identityCard: data.identityCard }] }, (error, info) => {
                    if (error) done(error);
                    else if (info) done('Hồ sơ giáo viên đã được tạo!');
                    else {
                        model.create(data, done);
                    }
                });
            } else {//trường hợp không có msnv và cmnd
                model.create(data, done);
            }
        },

        getAll: (condition, done) => typeof condition == 'function' ?
            model.find({}).populate('user', '-password').populate('division', ' _id title isOutside')
                .populate('contract.category').populate('chungChiSuPham', '_id title').populate('giayPhepLaiXe.category', '_id title')
                .populate('courseTypes', '_id title').populate('courses', '_id name').populate('teacherType', '_id title').populate('doneCourses', '_id name')
                .exec(condition) :
            model.find(condition).populate('user', '-password').populate('division', ' _id title isOutside').populate('contract.category', '_id title')
                .populate('chungChiSuPham', '_id title').populate('courseTypes', '_id title').populate('courses', '_id name').populate('teacherType', '_id title')
                .populate('giayPhepLaiXe.category', '_id title').populate('doneCourses', '_id name').exec(done),

        get: (condition, done) => (typeof condition == 'object' ? model.findOne(condition) : model.findById(condition))
            .populate('user', '-password').populate('division', ' _id title isOutside').populate('doneCourses', '_id name')
            .populate('chungChiSuPham', '_id title').populate('courseTypes', '_id title').populate('courses', '_id name').populate('teacherType', '_id title')
            .populate('courseHistory.user', '_id firstname lastname').populate('courseHistory.course', '_id name').exec(done),

        getPage: (pageNumber, pageSize, condition, sort, done) => model.countDocuments(condition, (error, totalItem) => {
            if (error) {
                done(error);
            } else {
                if (typeof sort == 'function') {
                    done = sort;
                    sort = null;
                }
                let result = { totalItem, pageSize, pageTotal: Math.ceil(totalItem / pageSize) };
                result.pageNumber = pageNumber === -1 ? result.pageTotal : Math.min(pageNumber, result.pageTotal);
                const skipNumber = (result.pageNumber > 0 ? result.pageNumber - 1 : 0) * result.pageSize;
                model.find(condition).sort(sort ? sort : { firstname: 1 }).skip(skipNumber).limit(result.pageSize)
                    .populate('user', '-password').populate('division', '_id title').populate('chungChiSuPham', '_id title')
                    .populate('courseTypes', '_id title').populate('courses', '_id name').populate('teacherType', '_id title').populate('doneCourses', '_id name')
                    .exec((error, items) => {
                        result.list = error ? [] : items;
                        done(error, result);
                    });
            }
        }),

        update: (_id, changes, done) => {
            if (changes && (changes.maGiaoVien || changes.identityCard)) {
                model.findOne({ $or: [{ maGiaoVien: changes.maGiaoVien }, { identityCard: changes.identityCard }] }, (error, info) => {
                    if (error) done(error);
                    else if (info && info._id != _id) {// Mã giáo viên đã tồn tại
                        done('Hồ sơ giáo viên đã tồn tại!');
                    } else {
                        model.findOneAndUpdate({ _id }, changes, { new: true }).populate('user', 'email phoneNumber').populate('division', 'id title').exec(done);
                    }
                });
            } else {
                model.findOneAndUpdate({ _id }, changes, { new: true }).populate('user', 'email phoneNumber').populate('division', 'id title').exec(done);
            }
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

        count: (condition, done) => done ? model.countDocuments(condition, done) : model.countDocuments({}, condition),

        addCourse: (_id, course, done) => {
            model.findOneAndUpdate({ _id }, { $push: { courses: course } }, { new: true }).populate('courses').exec(done);
        },
        addCourseHistory: (_id, data, done) => {
            model.findOneAndUpdate({ _id }, { $push: { courseHistory: data } }, { new: true }).exec(done);
        },
        deleteCourse: (_id, course, done) => {
            model.findOneAndUpdate({ _id }, { $pull: { courses: course } }, { new: true }).populate('courses').exec(done);
        },

        addTrainingClass: (_id, trainingClass, done) => {
            model.findOneAndUpdate({ _id }, { $push: { trainingClass: trainingClass } }, { new: true }).populate('trainingClass').exec(done);
        },

        deleteTrainingClass: (_id, trainingClass, done) => {
            model.findOneAndUpdate({ _id }, { $pull: { trainingClass: trainingClass } }, { new: true }).populate('trainingClass').exec(done);
        },

        updateDoneCourse: (_courseId, done) => {// update khi khóa học kết thúc, lúc này courses=>doneCourses
            model.updateMany({ courses: { $in: [_courseId] } },
                { $push: { ['doneCourses']: _courseId }, $pull: { ['courses']: _courseId } },
                // {firstname:'vy'},
                { new: true }).populate('courses', '_id title').populate('doneCourses', '_id title').exec(done);
        },
        updateUnDoneCourse: (_courseId, done) => {// update khi admin mở lại khóa học, lúc này thì những khóa học thuộc doneCourses sẽ trở lại courses
            console.log('update unDoneCourse,courseId = ', _courseId);
            model.updateMany({ doneCourses: { $in: [_courseId] } },
                { $push: { ['courses']: _courseId }, $pull: { ['doneCourses']: _courseId } },
                // {firstname:'vy'},
                { new: true }).populate('courses', '_id title').populate('doneCourses', '_id title').exec(done);
        },
    };
};
