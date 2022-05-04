module.exports = app => {
    const schema = app.database.mongoDB.Schema({
        licensePlates: String,                                              // Biển số xe
        carId: String,
        courseType: { type: app.database.mongoDB.Schema.ObjectId, ref: 'CourseType' },    // Loại khóa học
        user: { type: app.database.mongoDB.Schema.ObjectId, ref: 'User' },                // Thầy dạy lái xe
        ngayHetHanDangKiem: { type: Date, default: Date.now },              // Ngày hết hạn đăng kiểm xe để NV đưa xe đi đăng kiểm lại
        ngayHetHanTapLai: { type: Date, default: Date.now },                // Ngày hết hạn tập lái xe để NV đưa xe đi đăng kiểm lại
        ngayDangKy: { type: Date, default: Date.now },
        ngayThanhLy: { type: Date },
        ngayHetHanBaoHiem: { type: Date, default: Date.now }, 
        typeOfFuel: { type: String, enum: ['xang', 'dau', 'nhot'], default: 'xang' }, // Loại nhiên liệu xe sử dụng
        state: {type: String, enum: ['S', 'R'], default: 'S'},
        fuel: [{
            date: { type: Date, default: Date.now },
            fee: { type: Number, default: 0 },
            quantity: { type: Number, default: 0 },
            diSaHinh: { type: Number, default: 0 },                         //Số giờ sử dụng để đi sa hình
            diDuong: { type: Number, default: 0 },                          //Số giờ sử dụng để đi đường
            diDangKiem: {type: Number, default: 0},                         //Số giờ sử dụng để đi đăng kiểm
            soKMDau: {type: Number, default: 0},                            //Số km của lần đổ trước đó
            soKMCuoi: { type: Number, default: 0 },                         //Số km hiện tại
            tongGioDay: { type: Number, default: 0 },                       //Tổng giờ dạy
            donGia: { type: Number, default: 0 },                           // Đơn giá khi đổ
        }],
        repair: [{
            dateStart: { type: Date, default: Date.now },
            dateEnd: { type: Date },
            fee: { type: Number, default: 0 },
            content: String,
        }],
        lichSuDangKiem: [{
            ngayDangKiem: { type: Date },
            fee: { type: Number, default: 0 },
            ngayHetHanDangKiem: { type: Date },
        }],
        lichSuDongBaoHiem: [{
            ngayDongBaoHiem: { type: Date },
            fee: { type: Number, default: 0 },
            ngayHetHanBaoHiem: { type: Date },
        }],
        lichSuDangKy: [{
            progress: String,
            ngayDangKy: { type: Date },
            fee: { type: Number, default: 0 },
            ngayHetHanDangKy: { type: Date },
        }],
        status: { type: String, enum: ['dangSuDung', 'dangSuaChua', 'dangThanhLy', 'daThanhLy'], default: 'dangSuDung' },
        currentCourseClose: { type: Boolean, default: true },
        courseHistory: [{
            course: { type: app.database.mongoDB.Schema.ObjectId, ref: 'Course' },
            user: { type: app.database.mongoDB.Schema.ObjectId, ref: 'User' },
        }],
        owner: String,
        calendarHistory: [{
            thoiGianBatDau: { type: Date, default: Date.now },
            thoiGianKetThuc: { type: Date },
            user: { type: app.database.mongoDB.Schema.ObjectId, ref: 'User' },
        }],
        brand: { type: app.database.mongoDB.Schema.ObjectId, ref: 'Category' },
        type: { type: app.database.mongoDB.Schema.ObjectId, ref: 'Category' },
        isPersonalCar: { type: Boolean, default: false },                   // Xe cá nhân hay xe của trung tâm
        division: { type: app.database.mongoDB.Schema.ObjectId, ref: 'Division' },        // Xe thuộc cơ sở nào
    });
    const model = app.database.mongoDB.model('Car', schema);

    app.model.car = {
        create: (data, done) => model.create(data, done),

        getAll: (condition, done) => model.find(condition).populate('user', 'lastname firstname').sort({ priority: -1 }).exec(done),

        getPage: (pageNumber, pageSize, condition, sort, done) => model.countDocuments(condition, (error, totalItem) => {
            if (error) {
                done(error);
            } else {
                const result = { totalItem, pageSize, pageTotal: Math.ceil(totalItem / pageSize) };
                result.pageNumber = pageNumber === -1 ? result.pageTotal : Math.min(pageNumber, result.pageTotal);

                const skipNumber = (result.pageNumber > 0 ? result.pageNumber - 1 : 0) * result.pageSize;
                model.find(condition).sort(sort ? sort:{ licensePlates: 1 }).skip(skipNumber).limit(result.pageSize).populate('division', 'title').populate('user', 'firstname lastname').populate('courseType', 'title').populate({
                    path: 'courseHistory.course', populate: { path: 'course', select: 'name thoiGianBatDau thoiGianKetThuc' }
                }).populate('brand', 'title').populate('type', 'title').exec((error, list) => {
                    result.list = list;
                    done(error, result);
                });
            }
        }),

        getOld: (done) => model.find({}).sort({ ngayDangKy: 1 }).limit(1).exec(done),

        get: (condition, done) => typeof condition == 'string' ? model.findById(condition).populate('division', 'title').populate('courseType', 'title').populate('brand', 'title').populate('type', 'title').populate({
            path: 'courseHistory.course', populate: { path: 'course', select: 'name thoiGianBatDau thoiGianKetThuc' }
        }).populate({
            path: 'courseHistory.user', populate: { path: 'user', select: 'firstname lastname' }
        }).populate({
            path: 'calendarHistory.user', populate: { path: 'user', select: 'firstname lastname' }
        }).exec(done) : model.findOne(condition).populate('division', 'title').populate('courseType', 'title').populate('brand', 'title').populate('type', 'title').exec(done),

        update: (condition, changes, $unset, done) => {
            if (!done) {
                done = $unset;
                $unset = {};
            }
            typeof condition == 'string' ?
                model.findOneAndUpdate({ _id: condition }, { $set: changes, $unset }, { new: true }, done) :
                model.updateMany(condition, { $set: changes, $unset }, { new: true }, done);
        },

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
        addFuel: (_id, data, done) => {
            model.findOneAndUpdate(_id, { $push: { fuel: data } }, { new: true }).exec(done);
        },
        addRepair: (_id, data, done) => {
            model.findOneAndUpdate(_id, { $push: { repair: data } }, { new: true }).exec(done);
        },
        addCourseHistory: (_id, data, done) => {
            model.findOneAndUpdate(_id, { $push: { courseHistory: data } }, { new: true }).exec(done);
        },
        addLichSuDangKiem: (_id, data, done) => {
            model.findOneAndUpdate(_id, { $push: { lichSuDangKiem: data } }, { new: true }).exec(done);
        },
        addLichSuDongBaoHiem: (_id, data, done) => {
            model.findOneAndUpdate(_id, { $push: { lichSuDongBaoHiem: data } }, { new: true }).exec(done);
        },
        addCalendarHistory: (condition, data, done = () => {}) => {
            model.findOneAndUpdate(condition, { $push: { calendarHistory: data } }, { new: true }).exec(done);
        },
        updateCalendarHistory: (_id, done) => {
            model.findById(_id).exec((error, item) => {
                if (item.calendarHistory[item.calendarHistory.length - 1]) {
                    model.findOneAndUpdate({ _id, 'calendarHistory._id': item.calendarHistory[item.calendarHistory.length - 1]._id }, {
                        '$set': {
                            'calendarHistory.$.thoiGianKetThuc': new Date(),
                        }
                    }, { new: true }).exec(done);
                }
            });
        },
        deleteFuel: (_id, _fuelId, done) => {
            model.findOneAndUpdate({ _id }, { $pull: { fuel: { _id: _fuelId } } }, { new: true }).exec(done);
        },
        addLichSuDangKy: (_id, data, done) => {
            model.findOneAndUpdate(_id, { $push: { lichSuDangKy: data } }, { new: true }).exec(done);
        },
        deleteCar: (_id, data, done) => {
            if (data._courseHistoryId) {
                model.findOneAndUpdate({ _id }, { $pull: { courseHistory: { _id: data._courseHistoryId } } }, { new: true }).exec(done);
            } if (data._courseId) {
                model.findOneAndUpdate({ _id }, { $pull: { courseHistory: { course: data._courseId } } }, { new: true }).exec(done);
            } else if (data._repairId) {
                model.findOneAndUpdate({ _id }, { $pull: { repair: { _id: data._repairId } } }, { new: true }).exec(done);
            } else if (data._registrationId) {
                model.findOneAndUpdate({ _id }, { $pull: { lichSuDangKiem: { _id: data._registrationId } } }, { new: true }).exec(done);
            }  else if (data._insuranceId) {
                model.findOneAndUpdate({ _id }, { $pull: { lichSuDongBaoHiem: { _id: data.insuranceId } } }, { new: true }).exec(done);
            } else if (data._practiceId) {
                model.findOneAndUpdate({ _id }, { $pull: { lichSuDangKy: { _id: data._practiceId } } }, { new: true }).exec(done);
            } else model.findOneAndUpdate({ _id }, { $pull: { fuel: { _id: data._fuelId } } }, { new: true }).exec(done);
        },

        count: (condition, done) => done ? model.countDocuments(condition, done) : model.countDocuments({}, condition),
    };
};