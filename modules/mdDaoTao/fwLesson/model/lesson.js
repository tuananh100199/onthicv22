module.exports = app => {
    const schema = app.database.mongoDB.Schema({
        title: String,
        shortDescription: String,
        detailDescription: String,
        taiLieuThamKhao: String,
        author: { type: app.database.mongoDB.Schema.ObjectId, ref: 'User' },
        videos: { type: [{ type: app.database.mongoDB.Schema.Types.ObjectId, ref: 'LessonVideo' }], default: [] },
        questions: { type: [{ type: app.database.mongoDB.Schema.Types.ObjectId, ref: 'Question' }], default: [] },
        numQuestion: { type: Number, default: 5 },
    });
    const model = app.database.mongoDB.model('Lesson', schema);

    app.model.lesson = {
        create: (data, done) => model.create(data, done),

        getPage: (pageNumber, pageSize, condition, done) => {
            model.countDocuments(condition, (error, totalItem) => {
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
            });
        },

        getAll: (condition, done) => {
            done ? model.find(condition).exec(done) : model.find({}).exec(condition);
        },

        get: (condition, done) => {
            if (done == undefined) {
                done = condition;
                condition = {};
            }
            if (typeof condition == 'string') condition = { _id: condition };
            model.findOne(condition).populate('videos').populate('questions').exec(done);
        },

        update: (_id, changes, done) => { // changes = {$set, $unset, $push, $pull}
            model.findOneAndUpdate({ _id }, changes, { new: true }).populate('videos').populate('questions').exec(done);
        },

        delete: (_id, done) => {
            model.findById(_id, (error, item) => {
                if (item) {
                    app.deleteImage(item.image);
                    app.model.lessonVideo.delete(item.videos, error => error && console.error(error));
                    app.model.question.delete(item.questions, error => error && console.error(error));
                    item.remove(done);
                } else {
                    done(error || 'Invalid Id!');
                }
            });
        },

        addVideo: (_id, video, done) => {
            model.findOneAndUpdate({ _id }, { $push: { videos: video } }, { new: true }).populate('videos').exec(done);
        },
        deleteVideo: (_id, _lessonVideoId, done) => {
            model.findOneAndUpdate({ _id }, { $pull: { videos: _lessonVideoId } }, { new: true }).populate('videos').exec(done);
        },

        count: (condition, done) => done ? model.countDocuments(condition, done) : model.countDocuments({}, condition),
    };
};
