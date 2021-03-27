module.exports = app => {
    const schema = app.db.Schema({
        title: String,
        price: Number,
        shortDescription: String,
        detailDescription: String,
        image: String,
        subjects: [{ type: app.db.Schema.ObjectId, ref: 'Subject' }],
        isPriceDisplayed: { type: Boolean, default: false }
    });
    const model = app.db.model('CourseType', schema);

    app.model.courseType = {
        create: (data, done) => model.create({ ...data, title: data.title || 'Loại khóa học mới' }, (error, item) => {
            if (error) {
                done(error);
            } else {
                item.image = `/img/course-type/${item._id}.jpg`;
                const srcPath = app.path.join(app.publicPath, '/img/avatar.jpg'),
                    destPath = app.path.join(app.publicPath, item.image);
                app.fs.copyFile(srcPath, destPath, error => {
                    error ? done(error) : item.save(done);
                });
            }
        }),

        getPage: (pageNumber, pageSize, condition, done) => model.countDocuments(condition, (error, totalItem) => {
            if (error) {
                done(error);
            } else {
                let result = { totalItem, pageSize, pageTotal: Math.ceil(totalItem / pageSize) };
                result.pageNumber = pageNumber === -1 ? result.pageTotal : Math.min(pageNumber, result.pageTotal);
                const skipNumber = (result.pageNumber > 0 ? result.pageNumber - 1 : 0) * result.pageSize;

                model.find(condition).sort({ title: 1 }).skip(skipNumber).limit(result.pageSize).exec((error, list) => {
                    result.list = error ? [] : list;
                    done(error, result);
                });
            }
        }),

        getAll: (condition, done) => done ? model.find(condition).sort({ title: 1 }).exec(done) : model.find({}).sort({ title: 1 }).exec(condition),

        get: (condition, done) => typeof condition == 'string' ?
            model.findById(condition, done).populate('subjects') :
            model.findOne(condition, done).populate('subjects'),

        update: (_id, $set, $unset, done) => done ?
            model.findOneAndUpdate({ _id }, { $set, $unset }, { new: true }).populate('subjects').exec(done) :
            model.findOneAndUpdate({ _id }, { $set }, { new: true }).populate('subjects').exec($unset),

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
