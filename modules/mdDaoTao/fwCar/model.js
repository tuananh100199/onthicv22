module.exports = app => {
    const schema = app.db.Schema({
        licensePlates: String,                                              // Biển số xe
        courseType: { type: app.db.Schema.ObjectId, ref: 'CourseType' },    // Loại khóa học
        user: { type: app.db.Schema.ObjectId, ref: 'User' },                // Thầy dạy lái xe
        ngayHetHanDangKiem: { type: Date, default: Date.now },              // Ngày hết hạn đăng kiểm xe để NV đưa xe đi đăng kiểm lại
        ngayHetHanTapLai: { type: Date, default: Date.now },                // Ngày hết hạn tập lái xe để NV đưa xe đi đăng kiểm lại
        ngayDangKy: { type: Date, default: Date.now },
        ngayThanhLy: { type: Date },
        fuel: [{
            date: { type: Date, default: Date.now },
            fee: { type: Number, default: 0 },
        }],
        status: { type: String, enum: ['dangSuDung', 'dangSuaChua', 'dangThanhLy', 'daThanhLy'], default: 'dangSuDung' },
        courseHistory: [{
            course: { type: app.db.Schema.ObjectId, ref: 'Course' },
            user: { type: app.db.Schema.ObjectId, ref: 'User' },
        }],
        brand: { type: app.db.Schema.ObjectId, ref: 'Category' },
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
                model.find(condition).sort({ ngayDangKy: 1 }).skip(skipNumber).limit(result.pageSize).populate('division', 'title').populate('user', 'firstname lastname').populate('courseType', 'title').populate('brand', 'title').exec((error, list) => {
                    result.list = list;
                    done(error, result);
                });
            }
        }),

        get: (condition, done) => typeof condition == 'string' ? model.findById(condition).populate('brand', 'title').populate({
            path: 'courseHistory.course', populate: { path: 'course', select: 'name thoiGianBatDau thoiGianKetThuc' }
        }).populate({
            path: 'courseHistory.user', populate: { path: 'user', select: 'firstname lastname' }
        }).exec(done) : model.findOne(condition).populate('brand', 'title').exec(done),

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
        addCourseHistory: (_id, data, done) => {
            console.log(data);
            model.findOneAndUpdate(_id, { $push: { courseHistory: data } }, { new: true }).exec(done);
        },
        deleteFuel: (_id, _fuelId, done) => {
            model.findOneAndUpdate({ _id }, { $pull: { fuel: { _id: _fuelId } } }, { new: true }).exec(done);
        },
        deleteCourseHistory: (_id, _courseHistoryId, done) => {
            model.findOneAndUpdate({ _id }, { $pull: { courseHistory: { _id: _courseHistoryId } } }, { new: true }).exec(done);
        },
    };
};