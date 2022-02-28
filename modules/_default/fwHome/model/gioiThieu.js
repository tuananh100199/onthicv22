module.exports = app => {
    const schema = app.db.Schema({
        title: String,
        titleVisible: { type: Boolean, default: true },
        abstract: String,
        abstract2: String,
        abstract3: String,
        image1: String,
        image2: String,
        image3: String,
        content1: { type: app.db.Schema.ObjectId, ref: 'Content' },
        content2: { type: app.db.Schema.ObjectId, ref: 'Content' },
        content3: { type: app.db.Schema.ObjectId, ref: 'Content' },
    });
    const model = app.db.model('GioiThieu', schema);

    app.model.gioiThieu = {
        create: (data, done) => model.create(data, done),

        getPage: (pageNumber, pageSize, condition, done) => model.countDocuments(condition, (error, totalItem) => {
            if (error) {
                done(error);
            } else {
                let result = { totalItem, pageSize, pageTotal: Math.ceil(totalItem / pageSize) };
                result.pageNumber = pageNumber === -1 ? result.pageTotal : Math.min(pageNumber, result.pageTotal);
                const skipNumber = (result.pageNumber > 0 ? result.pageNumber - 1 : 0) * result.pageSize;
                model.find(condition).sort({ title: 1 }).skip(skipNumber).limit(result.pageSize)
                .populate('content1').populate('content2','_id title').populate('content3','_id title')
                .exec((error, list) => {
                    result.list = list;
                    done(error, result);
                });
            }
        }),

        getAll: (done) => model.find({}, '-content').sort({ _id: -1 }).exec(done),

        get: (condition, done) => typeof condition == 'string' ? model.findById(condition).populate('content1','_id title').populate('content2','_id title').populate('content3','_id title').exec(done) 
        : model.findOne(condition, done).populate('content1').populate('content2','_id title').populate('content3','_id title').exec(done),

        update: (_id, changes, done) => model.findOneAndUpdate({ _id }, { $set: changes }, { new: true }, done),

        delete: (_id, done) => model.findById(_id, (error, item) => {
            if (error) {
                done(error);
            } else if (item == null) {
                done('Invalid id!');
            } else {
                app.deleteImage(item.image);
                item.remove(error => {
                    if (error) {
                        done(error);
                    } else {
                        app.model.component.clearViewId(_id, done);
                    }
                });
            }
        }),
    };
};
