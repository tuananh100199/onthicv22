module.exports = app => {
    const schema = app.database.mongoDB.Schema({
        title: String,
        courseType: { type: app.database.mongoDB.Schema.ObjectId, ref: 'CourseType' },
        active: { type: Boolean, default: false },
        papers: { type: [{ type: app.database.mongoDB.Schema.Types.ObjectId, ref: 'ProfileStudentType' }], default: [] }

    });
    const model = app.db.model('ProfileType', schema);

    app.model.profileType = {
        create: (data, done) => model.create(data, done),

        getPage: (pageNumber, pageSize, condition, done) => model.countDocuments(condition, (error, totalItem) => {
            if (error) {
                done(error);
            } else {
                let result = { totalItem, pageSize, pageTotal: Math.ceil(totalItem / pageSize) };
                result.pageNumber = pageNumber === -1 ? result.pageTotal : Math.min(pageNumber, result.pageTotal);
                const skipNumber = (result.pageNumber > 0 ? result.pageNumber - 1 : 0) * result.pageSize;

                model.find(condition).sort({ title: -1 }).skip(skipNumber).limit(result.pageSize)
                    .populate('courseType', '_id title').populate('papers', '_id title')
                    .exec((error, items) => {
                        result.list = error ? [] : items;
                        done(error, result);
                    });
            }
        }),

        getAll: (condition, done) => done ?
            model.find(condition).sort({ title: -1 }).exec(done) :
            model.find({}).sort({ title: -1 }).exec(condition),


        // changes = { $set, $unset, $push, $pull }
        update: (_id, changes, done) => model.findOneAndUpdate({ _id }, changes, { new: true }, done),

        delete: (_id, done) => model.findById(_id, (error, item) => {
            if (error) {
                done(error);
            } else if (item == null) {
                done('Invalid Id!');
            } else {
                item.remove(done);
            }
        }),
    };
};
