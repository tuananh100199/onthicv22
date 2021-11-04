module.exports = app => {
    const schema = app.db.Schema({
        lecturer: { type: app.db.Schema.ObjectId, ref: 'User' },
        dateOff: { type: Date, default: Date.now },                                     // Ngày nghỉ
        startHour: { type: Number, default: 8 },                                        // Thời gian bắt đầu học
        numOfHours: { type: Number, default: 1 },                                       // Số giờ học, số nguyên dương.    
        state: { type: String, enum: ['approved', 'waiting', 'reject'], default: 'waiting' },

        // dateNumber: { type: Number, default: -1 },                                      // Buổi học thứ

    });
    const model = app.db.model('RegisterCalendar', schema);

    app.model.registerCalendar = {
       
        create: (data, done) => model.create(data, done),

        getPage: (pageNumber, pageSize, condition, done) => model.countDocuments(condition, (error, totalItem) => {
            if (error) {
                done(error);
            } else {
                let result = { totalItem, pageSize, pageTotal: Math.ceil(totalItem / pageSize) };
                result.pageNumber = pageNumber === -1 ? result.pageTotal : Math.min(pageNumber, result.pageTotal);
                const skipNumber = (result.pageNumber > 0 ? result.pageNumber - 1 : 0) * result.pageSize;
                model.find(condition).populate('lecturer', 'lastname firstname phoneNumber identityCard').sort({ date: -1, startHour: 1 }).skip(skipNumber).limit(result.pageSize).exec((error, list) => {
                    result.list = error ? [] : list;
                    done(error, result);
                });
            }
        }),

        getAll: (condition, done) => done ? model.find(condition).populate('lecturer', 'lastname firstname phoneNumber identityCard').sort({ date: 1, startHour: -1 }).exec(done) : model.find({}).populate('lecturer', 'lastname firstname phoneNumber identityCard').sort({ date: 1, startHour: -1 }).exec(condition),

        get: (condition, done) => {
            const findTask = typeof condition == 'string' ? model.findById(condition) : model.findOne(condition);
            findTask.populate('student').exec(done);
        },

        // changes = { $set, $unset, $push, $pull }
        update: (_id, changes, done) => model.findOneAndUpdate({ _id }, changes, { new: true }).exec(done),

        delete: (_id, done) => model.findById(_id, (error, item) => {
            if (error || item == null) {
                done('Invalid Id!');
            } else {
                item.remove(done);
            }
        }),

        count: (condition, done) => done ? model.countDocuments(condition, done) : model.countDocuments({}, condition),
    };
};
