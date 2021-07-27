module.exports = app => {
    const schema = app.db.Schema({
        name: String,                                                       // Tên lớp
        shortDescription: String,                                           // Giới thiệu ngắn khóa học
        detailDescription: String,                                          // Chi tiết khóa học
        courseType: { type: app.db.Schema.ObjectId, ref: 'CourseType' },    // Loại khóa học
        courseFee: { type: Number, default: 0 },                            // Học phí => Delete
        courseFees: [{                                                      // Học phí => courseFee
            division: String,
            fee: { type: Number, default: 0 },
        }],
        subjects: [{ type: app.db.Schema.ObjectId, ref: 'Subject' }],       // Danh sách môn học
        maxStudent: { type: Number, default: 100 },                         // Số lượng học viên tối đa
        modifiedDate: { type: Date, default: Date.now },
        createdDate: { type: Date, default: Date.now },
        chatActive: { type: Boolean, default: true },
        active: { type: Boolean, default: false },

        thoiGianKhaiGiang: { type: Date, default: Date.now },
        thoiGianBatDau: { type: Date, default: Date.now },
        thoiGianKetThuc: { type: Date, default: Date.now },
        thoiGianThiKetThucMonDuKien: { type: Date, default: Date.now },
        thoiGianThiKetThucMonChinhThuc: { type: Date, default: Date.now },
        thoiGianThiTotNghiepDuKien: { type: Date, default: Date.now },
        thoiGianThiTotNghiepChinhThuc: { type: Date, default: Date.now },

        admins: [{ type: app.db.Schema.ObjectId, ref: 'User' }],            // Quản trị viên khóa học
        teacherGroups: [{
            teacher: { type: app.db.Schema.Types.ObjectId, ref: 'User' },
            student: [{ type: app.db.Schema.Types.ObjectId, ref: 'Student' }],
        }],
        representerGroups: [{
            representer: { type: app.db.Schema.Types.ObjectId, ref: 'User' },
            student: [{ type: app.db.Schema.Types.ObjectId, ref: 'Student' }],
        }],

        lock: { type: Boolean, default: false },                            // Bổ sung khóa khóa học lại
        close: { type: Boolean, default: false },                           // Khóa học đã đóng
    });
    const model = app.db.model('Course', schema);

    app.model.course = {
        create: (data, done) => app.model.courseType.get(data.courseType, (_, item) =>
            model.create({
                ...data,
                courseFees: [{
                    division: '0',
                    fee: item.price
                }],
                shortDescription: item.shortDescription,
                detailDescription: item.detailDescription,
                subjects: item.subjects,
            }, done)),

        getPage: (pageNumber, pageSize, condition, done) => model.countDocuments(condition, (error, totalItem) => {
            if (error) {
                done(error);
            } else {
                let result = { totalItem, pageSize, pageTotal: Math.ceil(totalItem / pageSize) };
                result.pageNumber = pageNumber === -1 ? result.pageTotal : Math.min(pageNumber, result.pageTotal);
                const skipNumber = (result.pageNumber > 0 ? result.pageNumber - 1 : 0) * result.pageSize;
                model.find(condition).populate('admins', '-password').populate('courseType', 'title').sort({ name: 1 }).skip(skipNumber).limit(result.pageSize).exec((error, list) => {
                    result.list = error ? [] : list;
                    done(error, result);
                });
            }
        }),

        getAll: done => model.find({}).sort({ name: 1 }).exec(done),

        get: (condition, done) => {
            const findTask = typeof condition == 'string' ? model.findById(condition) : model.findOne(condition);
            findTask.populate('courseType').populate('subjects', '-detailDescription').populate({
                path: 'teacherGroups.teacher', select: '-password', populate: { path: 'user division' }
            }).populate({
                path: 'teacherGroups.student', populate: { path: 'user division courseType course', select: 'email title name image' }
            }).populate({
                path: 'representerGroups.representer', select: '-password', populate: { path: 'user division' }
            }).populate({
                path: 'representerGroups.student', populate: { path: 'user division courseType course', select: 'email title name' }
            }).populate({
                path: 'admins', select: '-password', populate: { path: 'division' }
            }).exec(done);
        },

        getByUser: (condition, done) => {
            (typeof condition == 'string' ? model.findById(condition) : model.findOne(condition)).select('-teacherGroups -admins -lock -modifiedDate').populate('courseType').populate('subjects').exec(done);
        },

        // changes = { $set, $unset, $push, $pull }
        update: (_id, changes, done) => { // Không cập nhật teacherGroups, representerGroups
            let isError = false;
            new Promise((resolve, reject) => {
                app.model.division.getAll({ isOutside: true }, (error, list) => {
                    const _divisionOutsideIds = list.map(item => item._id);
                    if (changes.teacherGroups) {
                        for (const group of changes.teacherGroups) {
                            if (group.student) {
                                for (const student of group.student) {
                                    app.model.student.get(student._id || student, (error, item) => {
                                        app.model.user.get(group.teacher._id || group.teacher, (error, teacher) => {
                                            if ((_divisionOutsideIds.includes(item.division._id) && !_divisionOutsideIds.includes(teacher.division._id)) || (!_divisionOutsideIds.includes(item.division._id) && _divisionOutsideIds.includes(teacher.division._id))) {
                                                reject('Ứng viên thuộc cơ sở ngoài chỉ được thêm vào nhóm học viên thuộc cơ sở ngoài!');
                                                isError = true;
                                            } else if (item.division._id != teacher.division._id) {
                                                reject('Giáo viên và ứng viên phải trùng cơ sở đào tạo!');
                                                isError = true;
                                            }
                                        });
                                    });
                                }
                            }
                            if (isError) {
                                break;
                            }
                        }
                    }
                    if (!isError) {
                        resolve();
                    }
                });
            }).then(() => {
                changes.modifiedDate = new Date();
                model.findOneAndUpdate({ _id }, changes, { new: true }).populate('admins', '-password').populate('subjects', '-detailDescription').populate('teacherGroups.teacher', 'firstname lastname division').populate('teacherGroups.student', 'firstname lastname').exec(done);
            }).catch(error => done(error));
        },

        addTeacherGroup: (_id, _teacherId, done) => {
            model.findOneAndUpdate({ _id }, { $push: { teacherGroups: { teacher: _teacherId, student: [] } } }, { new: true }).exec(done);
        },

        removeTeacherGroup: (_id, _teacherId, done) => {
            model.findOneAndUpdate({ _id }, { $pull: { teacherGroups: { teacher: _teacherId } } }, { new: true }).exec(done);
        },

        addStudentToTeacherGroup: (_id, _teacherId, _studentId, done) => {
            model.findOneAndUpdate({ _id, 'teacherGroups.teacher': _teacherId }, { $push: { 'teacherGroups.$.student': _studentId } }, { new: true }).exec(done);
        },

        removeStudentFromTeacherGroup: (_id, _teacherId, _studentId, done) => {
            model.findOneAndUpdate({ _id, 'teacherGroups.teacher': _teacherId }, { $pull: { 'teacherGroups.$.student': _studentId } }, { new: true }).exec(done);
        },

        addRepresenterGroup: (_id, _representerId, done) => {
            model.findOneAndUpdate({ _id }, { $push: { representerGroups: { representer: _representerId, student: [] } } }, { new: true }).exec(done);
        },

        removeRepresenterGroup: (_id, _representerId, done) => {
            model.findOneAndUpdate({ _id }, { $pull: { representerGroups: { representer: _representerId } } }, { new: true }).exec(done);
        },

        addStudentToRepresenterGroup: (_id, _representerId, _studentId, done) => {
            model.findOneAndUpdate({ _id, 'representerGroups.representer': _representerId }, { $push: { 'representerGroups.$.student': _studentId } }, { new: true }).exec(done);
        },

        removeStudentFromRepresenterGroup: (_id, _representerId, _studentId, done) => {
            model.findOneAndUpdate({ _id, 'representerGroups.representer': _representerId }, { $pull: { 'representerGroups.$.student': _studentId } }, { new: true }).exec(done);
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
