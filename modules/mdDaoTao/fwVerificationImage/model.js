module.exports = app => {
    const schema = app.database.mongoDB.Schema({
        state: { type: String, enum: ['approved', 'waiting', 'reject'], default: 'waiting' }, 
        createdDate: Date,
        user: { type: app.database.mongoDB.Schema.Types.ObjectId, ref: 'User' },
        image: String,
        lyDo: String,
    });
    const model = app.database.mongoDB.model('VerificationImage', schema);

    app.model.verificationImage = {
        create: (data, done) => model.create(data, done),

        getPage: (pageNumber, pageSize, condition, sort, done) => model.countDocuments(condition, (error, totalItem) => {
            if (done == undefined) {
                done = sort;
                sort = { createdDate: 1 };
            }
            if (error) {
                done(error);
            } else {
                let result = { totalItem, pageSize, pageTotal: Math.ceil(totalItem / pageSize) };
                result.pageNumber = pageNumber === -1 ? result.pageTotal : Math.min(pageNumber, result.pageTotal);
                const skipNumber = (result.pageNumber > 0 ? result.pageNumber - 1 : 0) * result.pageSize;

                model.find(condition).sort({ sort }).skip(skipNumber).limit(result.pageSize).populate('user', 'lastname firstname').exec((error, items) => {
                    result.list = error ? [] : items;
                    done(error, result);
                });
            }
        }),

        getAll: (condition, done) => done ?
            model.find(condition).sort({ title: 1 }).populate('user', 'lastname firstname').exec(done) :
            model.find({}).sort({ title: 1 }).populate('user', 'lastname firstname').exec(condition),


        get: (condition, done) => {
            if (done == undefined) {
                done = condition;
                condition = {};
            }
            if (typeof condition == 'string') condition = { _id: condition };
            model.findOne(condition).populate('user', 'lastname firstname').exec(done);
        },
        // changes = { $set, $unset, $push, $pull }
        update: (condition, changes, $unset, done) => {
            if (!done) {
                done = $unset;
                $unset = {};
            }
            typeof condition == 'string' ?
                model.findOneAndUpdate({ _id: condition }, { $set: changes, $unset }, { new: true }, done) :
                model.updateMany(condition, { $set: changes, $unset }, { new: true }, done);
        },

        addStudent: (_id, student, done) => {
            model.findOneAndUpdate({_id}, { $push: { students: student } }, { new: true }).populate('user', 'lastname firstname').exec(done);
        },

        deleteStudent: (_id, _studentId, done) => {
            model.findOneAndUpdate({ _id }, { $pull: { students: _studentId } }, { new: true }).populate('user', 'lastname firstname').exec(done);
        },

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
