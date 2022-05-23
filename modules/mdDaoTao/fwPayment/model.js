module.exports = app => {
    const schema = app.database.mongoDB.Schema({
        type: String, // mã chứng từ
        timeReceived: Date,
        code: String, // số chứng từ -> unique: type+key of mongoose
        firstname: String, // học viên
        lastname: String, // học viên
        student: { type: app.database.mongoDB.Schema.Types.ObjectId, ref: 'Student' },
        content: String, // diễn giải
        debitAccount: String, //tk nợ, fixed
        creditAccount: String, //tk có, fixed
        moneyAmount: Number,
        creditObject: String,  //đối tượng có = identityCard?
        debitObject: String, //đối tượng nợ , should create new bank model ?
        courseTypeName: String,
        courseType: { type: app.database.mongoDB.Schema.ObjectId, ref: 'CourseType' },
        sms: { type: app.database.mongoDB.Schema.ObjectId, ref: 'Sms' },
        userImport: { type: app.database.mongoDB.Schema.ObjectId, ref: 'User' },
    });
    const model = app.database.mongoDB.model('Payment', schema);

    app.model.payment = {
        create: (data, done) => model.create(data, done),

        getPage: (pageNumber, pageSize, condition, sort, done) => model.countDocuments(condition, (error, totalItem) => {
            if (done == undefined) {
                done = sort;
                sort = { lastname: 1, firstname: 1 };
            }
            if (error) {
                done(error);
            } else {
                const result = { totalItem, pageSize, pageTotal: Math.ceil(totalItem / pageSize) };
                result.pageNumber = pageNumber === -1 ? result.pageTotal : Math.min(pageNumber, result.pageTotal);

                const skipNumber = (result.pageNumber > 0 ? result.pageNumber - 1 : 0) * result.pageSize;
                model.find(condition).sort(sort || { timeReceived: -1 }).skip(skipNumber).limit(parseInt(result.pageSize)).populate('sms', '-isHandled').populate('userImport').exec((error, list) => {
                        result.list = list;
                        done(error, result);
                    });
            }
        }),
    };
};