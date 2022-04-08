module.exports = app => {
    const schema = app.db.Schema({
        payer: { type: app.db.Schema.ObjectId, ref: 'Student' },                       // Người đóng tiền
        receiver: { type: app.db.Schema.ObjectId, ref: 'User' },                    // Người nhận tiền,
        type: { type: String, enum: ['online', 'offline'], default: 'offline' },    // Hình thức đóng tiền
        date: { type: Date, default: Date.now },   
        fee: Number,                                                                // Số tiền đóng
        course: { type: app.db.Schema.ObjectId, ref: 'Course' },
        courseType: { type: app.db.Schema.ObjectId, ref: 'CourseType' },
    });

    const model = app.db.model('Revenue', schema);

    app.model.revenue = {
        create: (data, done) => model.create(data, done),

        getAll: (condition, done) => {
            done ? model.find(condition).populate('payer').populate('course', 'name').populate('receiver', 'firstname lastname').exec(done) : model.find({}).populate('payer').populate('course', 'name').populate('receiver', 'firstname lastname').exec(condition);
        },

        get: (condition, done) => (typeof condition == 'string' ? model.findById(condition) : model.findOne(condition)).populate('payer').populate('course', 'name').populate('receiver', 'firstname lastname').exec(done),

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
                if (condition.searchText) {
                    model.aggregate([{ $project: { 'name': { $concat: ['$lastname', ' ', '$firstname'] } } },
                    { $match: { 'name': { $regex: `.*${condition.searchText}.*`, $options: 'i' } } }
                    ]).exec((error, list) => {
                        if (error) {
                            done(error);
                        } else {
                            const _ids = list.map(item => item._id);
                            delete condition.searchText;
                            if (sort && sort.division == 0) delete sort.division;
                            model.find({ _id: { $in: _ids }, ...condition }).sort(sort).skip(skipNumber).limit(result.pageSize)
                                .populate('receiver', '-password').populate('payer').populate('course', 'name')
                                .exec((error, list) => {
                                    result.list = list;
                                    done(error, result);
                                });
                        }
                    });
                } else {
                    delete condition.searchText;
                    if (sort && sort.division == 0) delete sort.division;
                    model.find(condition).sort(sort).skip(skipNumber).limit(result.pageSize)
                        .populate('receiver', '-password').populate('payer').populate('course', 'name')
                        .exec((error, list) => {
                            result.list = list;
                            done(error, result);
                        });
                }
            }
        }),

        update: (_id, changes, done) => {
            model.findOneAndUpdate({ _id }, changes, { new: true }).exec(done);
        },

        delete: (_id, done) => model.findOne({ _id }, (error, item) => {
            if (error) {
                done(error);
            } else if (item == null) {
                done('Invalid Id!');
            } else {
                item.remove(done);
            }
        }),

        count: (condition, done) => done ? model.countDocuments(condition, done) : model.countDocuments({}, condition)
    };
};