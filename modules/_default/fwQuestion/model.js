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

        delete: (_ids, done) => {
            if (_ids && !Array.isArray(_ids)) _ids = [_ids];
            let error = null,
                solve = (index = 0) => {
                    if (index < _ids.length) {
                        model.findOne({ _id: _ids[index] }, (err, question) => {
                            if (question) {
                                app.deleteImage(question.image);
                                question.remove(err => {
                                    if (err) error = err;
                                    solve(index + 1);
                                });
                            } else {
                                error = err || 'Invalid Id!';
                                solve(index + 1);
                            }
                        });
                    } else {
                        done(error);
                    }
                };
            solve();
        },
    };
};