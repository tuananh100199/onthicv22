module.exports = app => {
    const schema = app.db.Schema({
        user: { type: app.db.Schema.Types.ObjectId, ref: 'User' },
        
        integration: Boolean, // Tich hop
        content: String,
        
        licenseNumber: String, // So GPLX
        licenseDate: Date, // Ngay cap GPLX
    });
    const model = app.db.model('ApplicationForm', schema);

    app.model.applicationForm = {
        create: (data, done) => model.create(data, done),

        getPage: (pageNumber, pageSize, condition, done) => model.countDocuments(condition, (error, totalItem) => {
            if (error) {
                done(error);
            } else {
                let result = { totalItem, pageSize, pageTotal: Math.ceil(totalItem / pageSize) };
                result.pageNumber = pageNumber === -1 ? result.pageTotal : Math.min(pageNumber, result.pageTotal);

                const skipNumber = (result.pageNumber > 0 ? result.pageNumber - 1 : 0) * result.pageSize;
                model.find(condition).sort({ _id: -1 }).skip(skipNumber).limit(result.pageSize).exec((error, items) => {
                    result.list = error ? [] : items;
                    done(error, result);
                });
            }
        }),
    
        get: (condition, done) => typeof condition == 'object' ? model.findOne(condition, done) : model.findById(condition, done),

        update: (_id, $set, $unset, done) => done ? model.findOneAndUpdate({ _id }, { $set, $unset }, { new: true }, done) : model.findOneAndUpdate({ _id }, { $set }, { new: true }, $unset),

        delete: (_id, done) => model.findById(_id, (error, item) => {
            if (error) {
                done(error);
            } else if (item == null) {
                done('Invalid Id!');
            } else {
                item.remove(done);
            }
        }),
    }
};