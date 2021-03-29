module.exports = app => {
    const schema = app.db.Schema({
        name: String,                                                       // Tên lớp
        shortDescription: String,                                           // Giới thiệu ngắn khóa học
        detailDescription: String,                                          // Chi tiết khóa học
        courseType: { type: app.db.Schema.ObjectId, ref: 'CourseType' },    // Loại khóa học
        courseFee: { type: Number, default: 0 },                            // Học phí
        subjects: [{ type: app.db.Schema.ObjectId, ref: 'Subject' }],       // Danh sách môn học
        modifiedDate: { type: Date, default: Date.now },
        createdDate: { type: Date, default: Date.now },
        active: { type: Boolean, default: false },

        thoiGianKhaiGiang: { type: Date, default: Date.now },
        thoiGianBatDau: { type: Date, default: Date.now },
        thoiGianKetThuc: { type: Date, default: Date.now },
        thoiGianThiKetThucMonDuKien: { type: Date, default: Date.now },
        thoiGianThiKetThucMonChinhThuc: { type: Date, default: Date.now },
        thoiGianThiTotNghiepDuKien: { type: Date, default: Date.now },
        thoiGianThiTotNghiepChinhThuc: { type: Date, default: Date.now },

        admins: [{ type: app.db.Schema.ObjectId, ref: 'User' }],            // Quản trị viên khóa học
        groups: [{
            teacher: { type: app.db.Schema.Types.ObjectId, ref: 'User' },
            student: [{ type: app.db.Schema.Types.ObjectId, ref: 'Student' }],
        }],

        lock: { type: Boolean, default: false },
    });
    const model = app.db.model('Course', schema);

    app.model.course = {
        create: (data, done) => app.model.courseType.get(data.courseType, (_, item) =>
            model.create({
                ...data,
                courseFee: item.price,
                shortDescription: item.shortDescription,
                detailDescription: item.detailDescription,
                subjects: item.subjects
            }, done)),

        getPage: (pageNumber, pageSize, condition, done) => model.countDocuments(condition, (error, totalItem) => {
            if (error) {
                done(error);
            } else {
                let result = { totalItem, pageSize, pageTotal: Math.ceil(totalItem / pageSize) };
                result.pageNumber = pageNumber === -1 ? result.pageTotal : Math.min(pageNumber, result.pageTotal);
                const skipNumber = (result.pageNumber > 0 ? result.pageNumber - 1 : 0) * result.pageSize;
                model.find(condition).populate('admins', '-password').sort({ name: 1 }).skip(skipNumber).limit(result.pageSize).exec((error, list) => {
                    result.list = error ? [] : list;
                    done(error, result);
                });
            }
        }),

        getAll: done => model.find({}).sort({ name: 1 }).exec(done),

        get: (condition, done) => {
            const findTask = typeof condition == 'string' ? model.findById(condition) : model.findOne(condition);
            findTask.populate('courseType').populate('subjects', '-detailDescription').populate('admins', '-password').populate('groups.teacher', '-password').exec((error, item) => {
                item.subjects.sort((a, b) => a.title.localeCompare(b.title));
                done(error, item)
            });
        },

        update: (_id, $set, $unset, done) => {
            $set.modifiedDate = new Date();
            done ?
                model.findOneAndUpdate({ _id }, { $set, $unset }, { new: true }).populate('subjects', '-detailDescription').exec(done) :
                model.findOneAndUpdate({ _id }, { $set }, { new: true }).populate('subjects', '-detailDescription').exec((error, item) => {
                    item.subjects.sort((a, b) => a.title.localeCompare(b.title));
                    $unset(error, item)
                });
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

        count: (condition, done) => done ? model.countDocuments(condition, done) : model.countDocuments({}, condition),
    };
};