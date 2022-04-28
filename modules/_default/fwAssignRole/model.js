module.exports = app => {
    const schema = app.database.mongoDB.Schema({
        title:String,
        type:{ type: String, enum: ['enrollManager', 'teacherManager','carManager','accountant']},// loại quản lý,unique
        users:[{
            course:{ type: app.database.mongoDB.Schema.ObjectId, ref: 'Course' },
            user:{ type: app.database.mongoDB.Schema.ObjectId, ref: 'User' },// người được gán quyền
            userSetPermission:{ type: app.database.mongoDB.Schema.ObjectId, ref: 'User' },//người gán
            date:{type:Date,default:Date.now},
            roles:[{ type: app.database.mongoDB.Schema.ObjectId, ref: 'Role' }],
        }],
        // allowRoles:[{ type: app.database.mongoDB.Schema.ObjectId, ref: 'Role' }],// quyền được gán
    });
    const model = app.database.mongoDB.model('AssignRole', schema);

    app.model.assignRole = {
        create: (data, done) => model.create(data, done),

        get: (condition, done) => {
            const findTask = typeof condition == 'string' ? model.findById(condition) : model.findOne(condition);
            findTask.populate('course', '_id name').populate('allowRoles').populate({
                path: 'users.user', select: '-password', populate: { path: 'division' }
            }).populate({
                path: 'user.userSetPermission', populate: { path: 'division' }
            }).populate({
                path: 'user.roles'
            })
            .exec(done);
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

        getAll: (condition, done) => done ?
            model.find(condition).sort({ title: 1 }).populate('category', '_id title isSuPham').exec(done) :
            model.find({}).sort({ title: 1 }).populate('category', '_id title isSuPham').exec(condition),


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