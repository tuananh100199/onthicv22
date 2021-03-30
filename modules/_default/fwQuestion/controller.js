module.exports = (app) => {
    const parentModelContainer = {}
    app.hookQuestion = (type, parentModel) => parentModelContainer[type] = parentModel;

    app.post(`/api/question/:type`, (req, res, next) => app.permission.check(req.params.type + ':write')(req, res, next), (req, res) => {
        const { _parentId, data } = req.body,
            parentModel = parentModelContainer[req.params.type];
        new Promise((resolve, reject) => {
            app.model.question.create(data, (error, item) => {
                if (error || item == null) {
                    reject(error || 'Hệ thống bị lỗi!');
                } else if (item.image == null) {
                    resolve(item);
                } else {
                    app.uploadImage('question', app.model.question.get, item._id, item.image, data =>
                        data.error ? reject(data.error) : resolve(item));
                }
            });
        }).then(item => {
            parentModel.update(_parentId, { $push: { questions: item } }, (error) => {
                error ? res.send({ error }) : parentModel.get(_parentId, (error, item) => res.send({ error, questions: item ? item.questions : [] }));
            });
        }).catch(error => res.send({ error }));
    });

    app.put(`/api/question/:type`, (req, res, next) => app.permission.check(req.params.type + ':write')(req, res, next), (req, res) => {
        const { _parentId, _questionId, data } = req.body,
            parentModel = parentModelContainer[req.params.type];
        app.model.question.update(_questionId, data, error => {
            error ? res.send({ error }) : parentModel.get(_parentId, (error, item) => {
                res.send({ error, questions: item ? item.questions : [] });
            });
        });
    });

    app.put(`/api/question/:type/swap`, (req, res, next) => app.permission.check(req.params.type + ':write')(req, res, next), (req, res) => {
        const { _parentId, _questionId, isMoveUp } = req.body,
            parentModel = parentModelContainer[req.params.type];
        parentModel.get(_parentId, (error, item) => {
            if (error) {
                res.send({ error });
            } else {
                for (let index = 0, length = item.questions.length; index < item.questions.length; index++) {
                    const question = item.questions[index];
                    if (question._id == _questionId) {
                        const newIndex = index + (isMoveUp.toString() == 'true' ? -1 : +1);
                        if (0 <= index && index < length && 0 <= newIndex && newIndex < length) {
                            item.questions.splice(index, 1);
                            item.questions.splice(newIndex, 0, question);
                            item.save();
                        }
                        break;
                    }
                }
                res.send({ questions: item.questions });
            }
        });
    });

    app.delete(`/api/question/:type`, (req, res, next) => app.permission.check(req.params.type + ':write')(req, res, next), (req, res) => {
        const { _parentId, _questionId } = req.body,
            parentModel = parentModelContainer[req.params.type];
        app.model.question.delete(_questionId, error => {
            error ? res.send({ error }) : parentModel.update(_parentId, { $pull: { questions: _questionId } }, (error) => {
                error ? res.send({ error }) : parentModel.get(_parentId, (error, item) => res.send({ error, questions: item ? item.questions : [] }));
            });
        });
    });


    // Hook upload images ---------------------------------------------------------------------------------------------
    app.createFolder(app.path.join(app.publicPath, '/img/question'));

    const uploadQuestion = (fields, files, done) => {
        if (fields.userData && fields.userData[0].startsWith('questionImage:') && files.questionImage && files.questionImage.length > 0) {
            console.log('Hook: uploadQuestion => question image upload');
            const _id = fields.userData[0].substring('questionImage:'.length);
            app.uploadImage('question', app.model.question.get, _id, files.questionImage[0].path, done);
        }
    };
    app.uploadHooks.add('uploadQuestion', (req, fields, files, params, done) =>
        app.permission.has(req, () => uploadQuestion(fields, files, done), done, 'user:login'));
};
