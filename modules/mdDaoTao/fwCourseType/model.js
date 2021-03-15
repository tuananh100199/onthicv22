module.exports = app => {
    const schema = app.db.Schema({
        title: String,
        price: Number,
        shortDescription: String,
        detailDescription: String,
        subjectList: [{ type: app.db.Schema.ObjectId, ref: 'Subject' }],
        isPriceDisplayed: { type: Boolean, default: false }
    });
    const model = app.db.model('CourseType', schema);

    app.model.courseType = {
        create: (data, done) => {
            if (!data.title) data.title = 'Loại khoá học mới';
            model.create(data, done)
        },
        getPage: (pageNumber, pageSize, condition, done) => model.countDocuments(condition, (error, totalItem) => {
            if (error) {
                done(error);
            } else {
                let result = { totalItem, pageSize, pageTotal: Math.ceil(totalItem / pageSize) };
                result.pageNumber = pageNumber === -1 ? result.pageTotal : Math.min(pageNumber, result.pageTotal);
                const skipNumber = (result.pageNumber > 0 ? result.pageNumber - 1 : 0) * result.pageSize;

                model.find(condition).sort({ title: 1 }).skip(skipNumber).limit(result.pageSize).exec((error, items) => {
                    result.list = error ? [] : items;
                    done(error, result);
                });
            }
        }),
        getAll: done => model.find({}).sort({ title: 1 }).exec(done),
        get: (condition, done) => typeof condition == 'string' ? model.findById(condition, done).populate('subjectList') : model.findOne(condition, done).populate('subjectList'),
        update: (_id, $set, $unset, done) => done ?
            model.findOneAndUpdate({ _id }, { $set, $unset }, { new: true }).populate('subjectList').exec(done) :
            model.findOneAndUpdate({ _id }, { $set }, { new: true }).populate('subjectList').exec($unset),

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
