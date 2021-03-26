module.exports = app => {
    const schema = app.db.Schema({
        name: String,                                                       // Tên lớp
        shortDescription: String,                                           // Giới thiệu ngắn khoá học
        detailDescription: String,                                          // Chi tiết khoá học
        courseType: { type: app.db.Schema.ObjectId, ref: 'CourseType' },    // Loại khoá học
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

        admin: { type: [{ type: app.db.Schema.Types.ObjectId, ref: 'User' }], default: [] },    // Quản trị viên khoá học

        groups: [{
            supervisor: { type: app.db.Schema.Types.ObjectId, ref: 'User' },
            student: { type: [{ type: app.db.Schema.Types.ObjectId, ref: 'Student' }], default: [] },
        }],
    });
    const model = app.db.model('Course', schema);

    app.model.course = {
        create: (data, done) => app.model.courseType.get(data.courseType, (_, item) =>
            model.create({
                ...data,
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
                model.find(condition).sort({ name: 1 }).skip(skipNumber).limit(result.pageSize).exec((error, items) => {
                    result.list = error ? [] : items;
                    done(error, result);
                });
            }
        }),

        getAll: done => model.find({}).sort({ name: 1 }).exec(done),

        get: (condition, done) => typeof condition == 'string' ?
            model.findById(condition).populate('courseType').populate('subjects').exec(done)
            : model.findOne(condition).populate('courseType').populate('subjects').exec(done),

        update: (_id, $set, $unset, done) => done ?
            model.findOneAndUpdate({ _id }, { $set, $unset }, { new: true }).exec(done) :
            model.findOneAndUpdate({ _id }, { $set }, { new: true }).exec($unset),

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