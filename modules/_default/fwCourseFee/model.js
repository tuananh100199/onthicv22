module.exports = (app) => {
    const schema = app.database.mongoDB.Schema({
        name: String,
        courseType: { type: app.database.mongoDB.Schema.ObjectId, ref: 'CourseType' },    // Loại khóa học
        feeType: { type: app.database.mongoDB.Schema.ObjectId, ref: 'FeeType' },
        fee: Number,
        description: String,
        quantity: Number,                                                   // Số lượng gói còn lại
        isDefault: { type: Boolean, default: false },
        isDaily: { type: Boolean, default: false },                         // Gói hàng ngày sẽ reset lại vào 12:00 hàng ngày
        start: Date,
        // numOfHour: Number                                                   // Số giờ tăng thêm (mặc định là 1 với gói hàng ngày)
    });

    const model = app.db.model('CourseFee', schema);
    app.model.courseFee = {
        create: (data, done) => model.create(data, done),

        getAll: (condition, done) => model.find(condition).populate('courseType', 'title').populate('feeType', 'title official isExtra').sort({ priority: -1 }).exec(done),

        get: (condition, done) => (typeof condition == 'object' ? model.findOne(condition) : model.findById(condition))
            .populate('courseType', 'title').populate('feeType', 'title official isExtra').exec(done),

        getPage: (pageNumber, pageSize, condition, done) => model.countDocuments(condition, (error, totalItem) => {
            if (error) {
                done(error);
            } else {
                let result = { totalItem, pageSize, pageTotal: Math.ceil(totalItem / pageSize) };
                result.pageNumber = pageNumber === -1 ? result.pageTotal : Math.min(pageNumber, result.pageTotal);
                const skipNumber = (result.pageNumber > 0 ? result.pageNumber - 1 : 0) * result.pageSize;

                model.find(condition).sort({ courseType: 1 }).skip(skipNumber).limit(result.pageSize)
                    .populate('courseType', 'title').populate('feeType', 'title official isExtra')
                    .exec((error, items) => {
                        result.list = error ? [] : items;
                        done(error, result);
                    });
            }
        }),

        update: (condition, changes, $unset, done) => {
            if (!done) {
                done = $unset;
                $unset = {};
            }
            typeof condition == 'string' ?
                model.findOneAndUpdate({ _id: condition }, { $set: changes, $unset }, { new: true }, done) :
                model.updateMany(condition, { $set: changes, $unset }, { new: true }, done);
        },

        delete: (_id, done) => model.findById(_id, (error, item) => {
            if (error) {
                done(error);
            } else if (item == null) {
                done('Invalid Id!');
            } else {
                app.deleteImage(item.image);
                item.remove(done);
            }
        }),

        count: (condition, done) => done ? model.countDocuments(condition, done) : model.countDocuments({}, condition),
    };
};
