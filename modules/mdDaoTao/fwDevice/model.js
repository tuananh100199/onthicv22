module.exports = app => {
    const schema = app.db.Schema({
        name: String,
        status: { type: String, enum: ['dangSuDung', 'dangSuaChua',], default: 'dangSuDung' },
        type: { type: app.db.Schema.ObjectId, ref: 'Category' },
        quantity: Number,
        division: { type: app.db.Schema.ObjectId, ref: 'Division' },        // Thiết bị thuộc cơ sở nào
    });
    const model = app.db.model('Device', schema);

    app.model.device = {
        create: (data, done) => model.create(data, done),

        getAll: (condition, done) => model.find(condition).populate('user', 'lastname firstname').sort({ priority: -1 }).exec(done),

        getPage: (pageNumber, pageSize, condition, done) => model.countDocuments(condition, (error, totalItem) => {
            if (error) {
                done(error);
            } else {
                const result = { totalItem, pageSize, pageTotal: Math.ceil(totalItem / pageSize) };
                result.pageNumber = pageNumber === -1 ? result.pageTotal : Math.min(pageNumber, result.pageTotal);

                const skipNumber = (result.pageNumber > 0 ? result.pageNumber - 1 : 0) * result.pageSize;
                model.find(condition).sort({ licensePlates: 1 }).skip(skipNumber).limit(result.pageSize).populate('division', 'title').populate('type').exec((error, list) => {
                    result.list = list;
                    done(error, result);
                });
            }
        }),

        get: (condition, done) => typeof condition == 'string' ? model.findById(condition).populate('division', 'title').populate('courseType', 'title').populate('brand', 'title').populate({
            path: 'courseHistory.course', populate: { path: 'course', select: 'name thoiGianBatDau thoiGianKetThuc' }
        }).populate({
            path: 'courseHistory.user', populate: { path: 'user', select: 'firstname lastname' }
        }).populate({
            path: 'calendarHistory.user', populate: { path: 'user', select: 'firstname lastname' }
        }).exec(done) : model.findOne(condition).populate('division', 'title').populate('courseType', 'title').populate('brand', 'title').exec(done),

        update: (condition, changes, $unset, done) => {
            if (!done) {
                done = $unset;
                $unset = {};
            }
            typeof condition == 'string' ?
                model.findOneAndUpdate({ _id: condition }, { $set: changes, $unset }, { new: true }, done) :
                model.updateMany(condition, { $set: changes, $unset }, { new: true }, done);
        },

        delete: (_id, done) => model.findOne({ _id }, (error, item) => {
            if (error) {
                done(error);
            } else if (item == null) {
                done('Invalid Id!');
            } else {
                item.image && app.deleteImage(item.image);
                item.remove(done);
            }
        }),

        count: (condition, done) => done ? model.countDocuments(condition, done) : model.countDocuments({}, condition),
    };
};