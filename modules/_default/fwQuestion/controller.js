module.exports = (app) => {
    const buildQuestionManager = (parentGetItem, parentUpdateItem) => {

    };

    app.question = {
        add: (req, parentUpdateItem, _parentId, done) => {
            new Promise((resolve, reject) => {
                const image = req.session['questionImage'];
                app.model.question.create(req.body.data, (error, question) => {
                    if (error || question == null) {
                        reject(error || 'Hệ thống bị lỗi!');
                    } else if (image) {
                        app.uploadComponentImage(req, 'question', app.model.question.get, question._id, image,
                            response => response.error ? reject(response.error) : resolve(question));
                    } else {
                        resolve(question);
                    }
                });
            }).then(question => {
                parentUpdateItem(_parentId, { $push: { questions: question } }, (error, item) => done(error, item && item.questions ? item.questions : []));
            }).catch(error => done(error));
        },

        update: (_questionId, data, done) => app.model.question.update(_questionId, data, done),

        swap: (parentGetItem, _parentId, _questionId, isMoveUp, done) => {
            parentGetItem(_parentId, (error, item) => {
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
                    done(item.questions);
                }
            });
        },
    };


    app.post('/api/question', app.permission.check('lesson:write'), (req, res) => {
        app.question.add(req, app.model.lesson.update, req.body._lessonId, (error, questions) => {
            res.send({ error, questions });
        });
    });

    app.put('/api/question', app.permission.check('lesson:write'), (req, res) => {
        const { _lessonId, _questionId, data } = req.body;
        app.question.update(_questionId, data, (error) => {
            if (error) {
                res.send({ error });
            } else {
                app.model.lesson.get(_lessonId, (error, item) => res.send({ error, questions: item && item.questions ? item.questions : [] }));
            }
        });
    });

    app.put('/api/question/swap', app.permission.check('lesson:write'), (req, res) => {
        const { _lessonId, _questionId, isMoveUp } = req.body;
        app.question.swap(app.model.lesson.get, _lessonId, _questionId, isMoveUp, questions => res.send({ questions }));
    });

    app.delete('/api/question', app.permission.check('lesson:write'), (req, res) => {
        const { _lessonId, _questionId } = req.body;
        app.model.question.delete(_questionId, error => {
            if (error) {
                res.send({ error });
            } else {
                app.model.lesson.deleteQuestion(_lessonId, _questionId, (error, item) => {
                    res.send({ error, questions: item && item.questions ? item.questions : [] });
                });
            }
        });
    });

    // Hook upload images ---------------------------------------------------------------------------------------------
    app.createFolder(app.path.join(app.publicPath, '/img/question'));

    const uploadQuestion = (req, fields, files, params, done) => {
        if (fields.userData && fields.userData[0].startsWith('lessonImage:') && files.questionImage && files.questionImage.length > 0) {
            console.log('Hook: uploadQuestion => question image upload');
            app.uploadComponentImage(req, 'lesson-question', app.model.question.get, fields.userData[0].substring('questionImage:'.length), files.questionImage[0].path, done);
        }
    };
    app.uploadHooks.add('uploadQuestion', (req, fields, files, params, done) =>
        app.permission.has(req, () => uploadQuestion(req, fields, files, params, done), done, 'lesson:write'));
};
