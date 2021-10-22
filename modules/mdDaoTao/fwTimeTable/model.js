module.exports = app => {
    const schema = app.db.Schema({
        student: { type: app.db.Schema.ObjectId, ref: 'Student' },

        date: { type: Date, default: Date.now },                                        // Ngày học
        startHour: { type: Number, default: 8 },                                        // Thời gian bắt đầu học
        numOfHours: { type: Number, default: 1 },                                       // Số giờ học, số nguyên dương.
        dateNumber: { type: Number, default: -1 },                                      // Buổi học thứ
        truant: { type: Boolean, default: false },                                      // Học viên không đến lớp

        licensePlates: String,                                                          // Xe học (biển số xe)
        content: String,                                                                // Nội dung học
        note: String,                                                                   // Ghi chú
    });
    const model = app.db.model('TimeTable', schema);

    const populateStudent = {
        path: 'student',
        populate: [{ path: 'course', select: 'name' }, { path: 'courseType', select: 'title' }, { path: 'user', select: 'phoneNumber' }],
    };

    app.model.timeTable = {
        create: (data, done) => model.create(data, (error, item) => {
            if (error || item == null) {
                done('Gặp lỗi khi tạo thời khóa biểu!');
            } else {
                app.model.timeTable.updateStudentIndex(item, done);
            }
        }),

        getPage: (pageNumber, pageSize, condition, done) => model.countDocuments(condition, (error, totalItem) => {
            if (error) {
                done(error);
            } else {
                let result = { totalItem, pageSize, pageTotal: Math.ceil(totalItem / pageSize) };
                result.pageNumber = pageNumber === -1 ? result.pageTotal : Math.min(pageNumber, result.pageTotal);
                const skipNumber = (result.pageNumber > 0 ? result.pageNumber - 1 : 0) * result.pageSize;
                model.find(condition).populate(populateStudent).sort({ date: -1, startHour: 1 }).skip(skipNumber).limit(result.pageSize).exec((error, list) => {
                    result.list = error ? [] : list;
                    done(error, result);
                });
            }
        }),

        getAll: (condition, done) => done ? model.find(condition).sort({ date: 1 }).exec(done) : model.find({}).sort({ date: 1 }).exec(condition),

        get: (condition, done) => {
            const findTask = typeof condition == 'string' ? model.findById(condition) : model.findOne(condition);
            findTask.populate('student').exec(done);
        },

        // changes = { $set, $unset, $push, $pull }
        update: (_id, changes, done) => model.findOneAndUpdate({ _id }, changes).populate('student').exec((error, item) => {
            if (error || item == null) {
                done('Gặp lỗi khi cập nhật thời khóa biểu!');
            } else {
                app.model.timeTable.updateStudentIndex(item, done);
            }
        }),

        updateStudentIndex: (item, done) => {
            if (item == null || item.student == null) {
                done('Dữ liệu học viên không tồn tại!');
            } else {
                model.find({ student: item.student }).sort({ date: 1, startHour: 1 }).exec((error, items) => {
                    if (error || items == null) {
                        done('Gặp lỗi khi đọc thời khóa biểu của học viên!');
                    } else {
                        const solve = (index = 0) => {
                            if (index < items.length) {
                                items[index].dateNumber = index + 1;
                                items[index].save(error => error ? done('Gặp lỗi khi cập nhật dateNumber của thời khóa biểu!') : solve(index + 1));
                            } else {
                                done(null, item);
                            }
                        };
                        solve();
                    }
                });
            }
        },

        delete: (_id, done) => model.findById(_id, (error, item) => {
            if (error) {
                done(error);
            } else if (item == null) {
                done('Invalid Id!');
            } else {
                item.remove(error => {
                    if (error || item == null) {
                        done('Gặp lỗi khi xoá thời khóa biểu!');
                    } else {
                        app.model.timeTable.updateStudentIndex(item, done);
                    }
                });
            }
        }),

        count: (condition, done) => done ? model.countDocuments(condition, done) : model.countDocuments({}, condition),
    };
};
