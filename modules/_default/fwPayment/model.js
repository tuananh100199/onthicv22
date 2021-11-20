module.exports = app => {
    const schema = app.db.Schema({
        type:String, // mã chứng từ
        timeReceived: Date,
        code:String, // số chứng từ -> unique: type+key of mongoose
        firstname: String, // học viên
        lastname: String, // học viên
        student: { type: app.db.Schema.Types.ObjectId, ref: 'Student' },
        content: String, // diễn giải
        debitAccount: String, //tk nợ, fixed
        creditAccount: String, //tk có, fixed
        moneyAmount: Number,
        creditObject: String,  //đối tượng có = identityCard?
        debitObject: String, //đối tượng nợ , should create new bank model ?
        courseName: String, 
        course: { type: app.db.Schema.ObjectId, ref: 'Course' }, 
    });
    const model = app.db.model('Payment', schema);

    app.model.payment = {
        create: (data, done) => model.create(data, done),
    };
};