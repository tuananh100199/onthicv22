module.exports = app => {
    const schema = app.database.mongoDB.Schema({
        title: String,
        active: { type: Boolean, default: false },
        numberOfStaff: { type: Number, default: 0 },
    });
    const model = app.db.model('StaffGroup', schema);

    app.model.staffGroup = {

        create: (data, done) => model.create(data, done),

        getAll: done => model.find({}).sort({ title: 1 }).exec(done),

        get: (_id, done) => model.findById(_id, done),

        // changes = { $set, $unset, $push, $pull }
        update: (_id, changes, done) => model.findOneAndUpdate({ _id }, changes, { new: true }, done),

        delete: (_id, done) => model.findById(_id, (error, item) => {
            if (error) {
                done(error);
            } else if (item == null) {
                done('Invalid id!');
            } else {
                item.remove(error => {
                    if (error) {
                        done(error);
                    } else {
                        app.model.staff.getAll({ staffGroupId: _id }, (error, staffs) => {
                            if (error || staffs == null) {
                                done('Delete staffs failed!');
                            } else {
                                const deleteStaff = index => {
                                    if (index < staffs.length) {
                                        app.model.staff.delete(staffs[index]._id, () => deleteStaff(index + 1));
                                    } else {
                                        app.model.component.clearViewId(_id, done);
                                    }
                                };
                                deleteStaff(0);
                            }
                        });
                    }
                });
            }
        }),
    };
};