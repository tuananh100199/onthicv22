module.exports = app => {
    const schema = app.db.Schema({
        firstname: String,
        lastname: String,
        email: String,
        phone: String,
        user: { type: app.db.Schema.ObjectId, ref: 'User' },
        staff: { type: app.db.Schema.ObjectId, ref: 'User' },               // Nhân viên cập nhật dữ liệu
        state: { type: String, enum: ['MoiDangKy', 'DangLienHe', 'Huy', 'ChoKhoa'], default: 'MoiDangKy' },
        createdDate: { type: Date, default: Date.now },                     // Ngày tạo
        modifiedDate: { type: Date, default: Date.now },                    // Ngày cập nhật cuối cùng
    });
    const model = app.db.model('Candidate', schema);

    app.model.candidate = {
        //TODO: Tuấn Anh, nhớ sort ngày mới ở trên. 
        // Trong contrller, khi create, nhớ kiểm tra req.session.user có khác null không? Khác null thì lưu vào thuộc tính user. Còn bằng null thì tạo user, và lưu vào biến user.
    };
};