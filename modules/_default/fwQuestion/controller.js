module.exports = (app) => {
    app.buildQuestionManager = (parentGetItem, parentUpdateItem) => ({
        add: (_parentId, done) => {
            app.model.question.create(data, (error, item) => {
                if (error || item == null) {
                    done(error || 'Hệ thống bị lỗi!');
                } else if (item.image == null) {
                    done(null, item);
                } else {
                    app.uploadImage('question', app.model.question.get, item._id, item.image, data => {
                        if (data.error) {
                            done(data.error, item);
                        } else {
                            parentUpdateItem(_parentId, { $push: { questions: item } }, (error, item) => {
                                done(error, item && item.questions ? item.questions : []);
                            });
                        }
                    });
                }
            });
        },

        update: (_questionId, data, done) => app.model.question.update(_questionId, data, done),

        swap: (_parentId, _questionId, isMoveUp, done) => {
            parentGetItem(_parentId, (error, item) => {
                if (error) {
                    done(error);
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
                    done(null, item.questions);
                }
            });
        },

        delete: (_parentId, _questionId, done) => {
            app.model.question.delete(_questionId, error => {
                if (error) {
                    done(error);
                } else {
                    parentUpdateItem(_parentId, { $pull: { questions: _questionId } }, (error, item) => {
                        done(error, item && item.questions ? item.questions : []);
                    });
                }
            });
        }
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
        app.permission.has(req, () => uploadQuestion(fields, files, done), done, 'lesson:write'));
};
