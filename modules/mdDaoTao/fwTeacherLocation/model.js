module.exports = app => {
    const schema = app.database.mongoDB.Schema({
        teacher: { type: app.database.mongoDB.Schema.ObjectId, ref: 'User' },
        car: { type: app.database.mongoDB.Schema.ObjectId, ref: 'Car' },
        course: { type: app.database.mongoDB.Schema.ObjectId, ref: 'Course' },
        record: [{
            longtitude: String,
            latitude: String,
            time: Date,
        }],
        timeTable: { type: app.database.mongoDB.Schema.ObjectId, ref: 'TimeTable' },
        date: Date,
    });
    const model = app.database.mongoDB.model('TeacherLocation', schema);

    app.model.teacherLocation = {
        create: (data, done) => model.create(data, done),

        getPage: (pageNumber, pageSize, condition, sort, done) => model.countDocuments(condition, (error, totalItem) => {
            if (error) {
                done(error);
            } else {
                if (typeof sort == 'function') {
                    done = sort;
                    sort = null;
                }
                let result = { totalItem, pageSize, pageTotal: Math.ceil(totalItem / pageSize) };
                result.pageNumber = pageNumber === -1 ? result.pageTotal : Math.min(pageNumber, result.pageTotal);
                const skipNumber = (result.pageNumber > 0 ? result.pageNumber - 1 : 0) * result.pageSize;

                model.find(condition).sort(sort ? sort : { date: -1 }).skip(skipNumber).limit(result.pageSize).populate('courseType', '_id title').populate('subject', '_id title').populate('teacher', 'lastname firstname user maGiaoVien').populate({
                    path: 'timeTable', populate: { path: 'car',  select:'licensePlates'}
                }).populate({
                    path: 'timeTable', populate: { path: 'student',  populate: { path:'course', select:'_id name'}}
                }).exec((error, items) => {
                    result.list = error ? [] : items;
                    done(error, result);
                });
            }
        }),

        getAll: (condition, done) => done ?
            model.find(condition).sort({ title: 1 }).populate('teacher', '_id lastname firstname').populate('timeTable', 'startHour numOfHours lecturer').populate('car', 'licensePlates').populate('course', 'title').exec(done) :
            model.find({}).sort({ title: 1 }).populate('teacher', '_id lastname firstname').populate('timeTable', 'startHour numOfHours lecturer').populate('car', 'licensePlates').populate('course', 'title').exec(condition),


        get: (condition, done) => {
            if (done == undefined) {
                done = condition;
                condition = {};
            }
            if (typeof condition == 'string') condition = { _id: condition };
            model.findOne(condition).populate('teacher', '_id lastname firstname').populate('timeTable', 'startHour numOfHours lecturer').populate('car', 'licensePlates').populate('course', 'title').exec(done);
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

        swapPriority: (_id, isMoveUp, done) => model.findById(_id, (error, item1) => {
            if (error || item1 === null) {
                done('Invalid simulator Id!');
            } else {
                model.find({ priority: isMoveUp ? { $gt: item1.priority } : { $lt: item1.priority } })
                    .sort({ priority: isMoveUp ? 1 : -1 }).limit(1).exec((error, list) => {
                        if (error) {
                            done(error);
                        } else if (list == null || list.length === 0) {
                            done(null);
                        } else {
                            let item2 = list[0],
                                priority = item1.priority;
                            item1.priority = item2.priority;
                            item2.priority = priority;
                            item1.save(error1 => item2.save(error2 => done(error1 ? error1 : error2)));
                        }
                    });
            }
        }),

        delete: (_id, done) => model.findById(_id, (error, item) => {
            if (error) {
                done(error);
            } else if (item == null) {
                done('Invalid Id!');
            } else {
                item.remove(done);
            }
        }),
        addRecord: (_id, data, done) => {
            const dataRecord = data.record[0];
            model.findOneAndUpdate(_id, { $push: { record: dataRecord } }, { new: true, useFindAndModify: false }).exec(done);
        },
    };
};
