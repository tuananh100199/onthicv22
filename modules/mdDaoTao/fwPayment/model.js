module.exports = app => {
    const schema = app.db.Schema({
        type: String, // mã chứng từ
        timeReceived: Date,
        code: String, // số chứng từ -> unique: type+key of mongoose
        firstname: String, // học viên
        lastname: String, // học viên
        student: { type: app.db.Schema.Types.ObjectId, ref: 'Student' },
        content: String, // diễn giải
        debitAccount: String, //tk nợ, fixed
        creditAccount: String, //tk có, fixed
        moneyAmount: Number,
        creditObject: String,  //đối tượng có = identityCard?
        debitObject: String, //đối tượng nợ , should create new bank model ?
        courseTypeName: String, 
        courseType: { type: app.db.Schema.ObjectId, ref: 'CourseType' },
        sms: { type: app.db.Schema.ObjectId, ref: 'Sms' },
    });
    const model = app.db.model('Payment', schema);

    app.model.payment = {
        create: (data, done) => model.create(data, done),

        getPage: (pageNumber, pageSize, condition, done) => model.countDocuments(condition, (error, totalItem) => {
            if (error) {
                done(error);
            } else {
                const result = { totalItem, pageSize, pageTotal: Math.ceil(totalItem / pageSize) };
                result.pageNumber = pageNumber === -1 ? result.pageTotal : Math.min(pageNumber, result.pageTotal);

                const skipNumber = (result.pageNumber > 0 ? result.pageNumber - 1 : 0) * result.pageSize;
                model.find(condition).sort({ timeReceived: -1 }).skip(skipNumber).limit(result.pageSize).populate('sms', '-isHandled').exec((error, list) => {
                        result.list = list;
                        done(error, result);
                    });
            }
        }),
    };
};