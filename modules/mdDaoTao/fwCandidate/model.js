module.exports = app => {
    const schema = app.db.Schema({
        firstname: String,
        lastname: String,
        email: String,
        phone: String,
        user: { type: app.db.Schema.ObjectId, ref: 'User' },
        staff: { type: app.db.Schema.ObjectId, ref: 'User' },               // Nhân viên cập nhật dữ liệu
        state: { type: String, enum: ['MoiDangKy', 'DangLienHe', 'Huy', 'UngVien'], default: 'MoiDangKy' },
        createdDate: { type: Date, default: Date.now },                     // Ngày tạo
        modifiedDate: { type: Date, default: Date.now },                    // Ngày cập nhật cuối cùng
        read: { type: Boolean, default: false },
    });
    const model = app.db.model('Candidate', schema);
    //TODO: Tuấn Anh, nhớ sort ngày mới ở trên. 
    // Trong contrller, khi create, nhớ kiểm tra req.session.user có khác null không? Khác null thì lưu vào thuộc tính user. Còn bằng null thì tạo user, và lưu vào biến user.
 
    app.model.candidate = {
        create: (data, done) => model.create(data, done),

        getAll: (done) => model.find({}).sort({ _id: -1 }).exec(done),

        getUnread: (done) => model.find({ read: false }).sort({ _id: -1 }).exec(done),

        getPage: (pageNumber, pageSize, condition, done) => model.countDocuments(condition, (error, totalItem) => {
            if (error) {
                done(error);
            } else {
                let result = { totalItem, pageSize, pageTotal: Math.ceil(totalItem / pageSize) };
                result.pageNumber = pageNumber === -1 ? result.pageTotal : Math.min(pageNumber, result.pageTotal);

                const skipNumber = (result.pageNumber > 0 ? result.pageNumber - 1 : 0) * result.pageSize;
                model.find(condition).sort({ _id: -1 }).skip(skipNumber).limit(result.pageSize).exec((error, list) => {
                    result.list = list;
                    done(error, result);
                });
            }
        }),

        getByActive: (active, done) => model.find({ active }).sort({ _id: -1 }).exec(done),

        get: (condition, done) => typeof condition == 'object' ?
            model.findOne(condition, done) : model.findById(condition, done),

        read: (_id, done) => model.findOneAndUpdate({ _id }, { $set: { read: true } }, { new: true }, done),

        update: (_id, changes, done) => model.findOneAndUpdate({ _id }, { $set: changes }, { new: true }, done),

        delete: (_id, done) => model.findById(_id, (error, item) => {
            if (error) {
                done(error);
            } else if (item == null) {
                done('Invalid id!');
            } else {
                item.remove(done);
            }
        }),

        count: (condition, done) => done ? model.countDocuments(condition, done) : model.countDocuments({}, condition),
    };
};