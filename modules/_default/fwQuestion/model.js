module.exports = app => {
    const schema = app.db.Schema({
        active: { type: Boolean, default: true },
        title: String,
        image: String,
        answers: { type: String, default: '' },
        trueAnswer: Number,
    });
    const model = app.db.model('Question', schema);

    app.model.question = {
        create: (data, done) => model.create(data, done),

        getAll: (condition, done) => done ? model.find(condition).exec(done) : model.find({}).exec(condition),

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

        delete: (_id, done) => {
            if (Array.isArray(_id)) {
                _id.map((item, index) => {
                    model.findOne({ _id: item._id }, (error, question) => {
                        if (error) {
                            done(error);
                        } else if (question == null) {
                            done('Invalid Id!');
                        } else {
                            app.deleteImage(question.image);
                            index == _id.length - 1 ? question.remove(done) : question.remove();
                        }
                    })
                });
            } else {
                model.findOne({ _id }, (error, item) => {
                    if (error) {
                        done(error);
                    } else if (item == null) {
                        done('Invalid Id!');
                    } else {
                        app.deleteImage(item.image);
                        item.remove(done);
                    }
                })
            }
        }
    };
};