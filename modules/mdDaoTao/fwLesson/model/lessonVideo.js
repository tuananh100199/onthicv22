module.exports = app => {
    const schema = app.db.Schema({
        title: String,
        link: String,
        image: String,
    });
    const model = app.db.model('LessonVideo', schema);

    app.model.lessonVideo = {
        create: (data, done) => {
            const finalCreate = (data) => {
                model.create(data, (error, item) => {
                    if (error) {
                        done(error);
                    } else {
                        item.image = '/img/lesson-video/' + item._id + '.jpg';
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
                });
            }
            finalCreate(data);
        },

        getAll: (condition, done) => {
            done ? model.find(condition).exec(done) : model.find({}).exec(condition)
        },

        get: (condition, option, done) => {
            const handleGet = (condition, option, done) => {
                const select = option.select ? option.select : null;
                const populate = option.populate ? option.populate : false;

                const result = typeof condition == 'object' ? model.findOne(condition) : model.findById(condition);
                if (select) result.select(select);
                if (populate) result.populate('lessonVideo');
                result.exec(done);
            };

            if (done) {
                handleGet(condition, option, done);
            } else {
                handleGet(condition, {}, option);
            }
        },

        update: (_id, $set, $unset, done) => done ?
            model.findOneAndUpdate({ _id }, { $set, $unset }, { new: true }, done) :
            model.findOneAndUpdate({ _id }, { $set }, { new: true }, $unset),

        delete: (_id, done) => model.findOne({ _id }, (error, item) => {
            // TODO: delete image nè Vinh
            if (error) {
                done(error);
            } else if (item == null) {
                done('Invalid Id!');
            } else {
                app.deleteImage(item.image);
                item.remove(done);
            }
        }),

        deleteAll: (condition, done) => model.deleteMany(condition, (error) => done(error)),
    };
};
