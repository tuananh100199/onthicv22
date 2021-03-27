module.exports = app => {
    const schema = app.db.Schema({
        advisorId: { type: app.db.Schema.ObjectId, ref: 'User' },
        branchId: { type: app.db.Schema.ObjectId, ref: 'Division' },
        courseId: { type: app.db.Schema.ObjectId, ref: 'Course' },
    });
    const model = app.db.model('Advisor', schema);

    app.model.advisor = {
        create: (data, done) => {
            if (!data.title) data.title = 'Khóa học mới';
            model.create(data, (error, item) => {
                if (error) {
                    done(error);
                } else {
                    item.image = '/img/course/' + item._id + '.jpg';
                    const srcPath = app.path.join(app.publicPath, '/img/avatar.jpg'),
                        destPath = app.path.join(app.publicPath, item.image);
                    app.fs.copyFile(srcPath, destPath, error => {
                        if (error) {
                            done(error);
                        } else {
                            item.save(done);
                        }
                    });
                }
            })
        },
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