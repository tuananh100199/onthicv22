module.exports = app => {
    const schema = app.database.mongoDB.Schema({
        category: { type: app.database.mongoDB.Schema.ObjectId, ref: 'Category' },
        totNghiepChuyenMon: { type: Boolean, default: false },
        // amount:[{
        //     numOfProfile:Number,
        //     typeOfProfile: { type: String, enum: ['S', 'C', 'P','B']},
        // }],
        soLuong: String,
        teacher: { type: app.database.mongoDB.Schema.ObjectId, ref: 'Teacher' },
    });
    const model = app.database.mongoDB.model('TeacherProfile', schema);

    app.model.teacherProfile = {
        create: (data, done) => model.create(data, done),

        getAll: (condition, done) => {
            done ? model.find(condition).populate('category', '_id title').exec(done) : model.find({}).populate('category', '_id title').exec(condition);
        },

        get: (condition, done) => {
            if (done == undefined) {
                done = condition;
                condition = {};
            }
            if (typeof condition == 'string') condition = { _id: condition };
            model.findOne(condition).exec(done);
        },

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
