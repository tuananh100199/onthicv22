module.exports = (app) => {
    const menu = {
        parentMenu: app.parentMenu.trainning,
        menus: {
            4030: { title: 'Bài học', link: '/user/dao-tao/bai-hoc' },
        },
    };
    app.permission.add({ name: 'lesson:read', menu }, { name: 'lesson:write' }, { name: 'lesson:delete' });

    app.get('/user/dao-tao/bai-hoc', app.permission.check('lesson:read'), app.templates.admin);
    app.get('/user/dao-tao/bai-hoc/edit/:_id', app.templates.admin);
    app.get('/user/dao-tao/bai-hoc/view/:_id', app.templates.admin);

    // Lesson APIs ----------------------------------------------------------------------------------------------------
    app.get('/api/lesson/page/:pageNumber/:pageSize', app.permission.check('lesson:read'), (req, res) => {
        const pageNumber = parseInt(req.params.pageNumber),
            pageSize = parseInt(req.params.pageSize),
            condition = {}, searchText = req.query.searchText;
        if (searchText) {
            condition.title = new RegExp(searchText, 'i');
        }
        app.model.lesson.getPage(pageNumber, pageSize, condition, (error, page) => {
            res.send({ page, error: error || page == null ? 'Danh sách bài học không sẵn sàng!' : null });
        });
    });

    app.get('/api/lesson/item/:_id', app.permission.check('lesson:read'), (req, res) => {
        app.model.lesson.get(req.params._id, (error, item) => res.send({ error, item }));
    });

    app.post('/api/lesson', app.permission.check('lesson:write'), (req, res) => {
        const author = req.session.user._id,
            data = req.body.newData;
        data.author = author;
        app.model.lesson.create(data, (error, item) => res.send({ error, item }));
    });

    app.put('/api/lesson', app.permission.check('lesson:write'), (req, res) => {
        const changes = req.body.changes;
        if (changes.categories && changes.categories == 'empty') changes.categories = [];
        app.model.lesson.update(req.body._id, req.body.changes, (error, item) => res.send({ error, item }));
    });

    app.delete('/api/lesson', app.permission.check('lesson:delete'), (req, res) => {
        //TODO: delete all videos and questions
        app.model.lesson.delete(req.body._id, (error) => res.send({ error }));
    });

    // Video APIs -----------------------------------------------------------------------------------------------------
    app.post('/api/lesson/video', app.permission.check('lesson:write'), (req, res) => {
        const { _lessonId, data } = req.body;
        app.model.lessonVideo.create(data, (error, lessonVideo) => {
            if (error || lessonVideo == null) {
                res.send({ error: error || 'Hệ thống bị lỗi!' });
            } else {
                const addLessonVideo = () => app.model.lesson.addLessonVideo(_lessonId, lessonVideo, (error, item) => {
                    res.send({ error, videos: item && item.videos ? item.videos : [] });
                });

                if (req.session['lesson-videoImage']) {
                    app.uploadComponentImage(req, 'lesson-video', app.model.lessonVideo.get, lessonVideo._id, req.session['lesson-videoImage'], response =>
                        response.error ? res.send({ error: response.error }) : addLessonVideo());
                } else {
                    addLessonVideo();
                }
            }
        });
    });

    app.put('/api/lesson/video', app.permission.check('lesson:write'), (req, res) => {
        const { _lessonId, _lessonVideoId, data } = req.body;
        app.model.lessonVideo.update(_lessonVideoId, data, (error) => {
            if (error) {
                res.send({ error });
            } else {
                app.model.lesson.get(_lessonId, (error, item) => res.send({ error, videos: item && item.videos ? item.videos : [] }));
            }
        });
    });

    app.put('/api/lesson/video/swap', app.permission.check('lesson:write'), (req, res) => {
        const { _lessonId, _lessonVideoId, isMoveUp } = req.body;
        app.model.lesson.get(_lessonId, (error, item) => {
            if (error) {
                res.send({ error });
            } else {
                for (let index = 0, length = item.videos.length; index < item.videos.length; index++) {
                    const lessonVideo = item.videos[index];
                    if (lessonVideo._id == _lessonVideoId) {
                        const newIndex = index + (isMoveUp == 'true' ? -1 : +1);
                        if (0 <= index && index < length && 0 <= newIndex && newIndex < length) {
                            item.videos.splice(index, 1);
                            item.videos.splice(newIndex, 0, lessonVideo);
                            item.save();
                        }
                        break;
                    }
                }
                res.send({ videos: item.videos });
            }
        });
    });

    app.delete('/api/lesson/video', app.permission.check('lesson:write'), (req, res) => {
        const { _lessonId, _lessonVideoId } = req.body;
        app.model.lessonVideo.delete(_lessonVideoId, error => {
            if (error) {
                res.send({ error });
            } else {
                app.model.lesson.deleteLessonVideo(_lessonId, _lessonVideoId, (error, item) => {
                    res.send({ error, videos: item && item.videos ? item.videos : [] });
                });
            }
        });
    });

    // Question APIs --------------------------------------------------------------------------------------------------
    app.post('/api/lesson/question', app.permission.check('lesson:write'), (req, res) => {
        const { _lessonId, data } = req.body;
        app.model.lessonQuestion.create(data, (error, lessonQuestion) => {
            if (error || lessonQuestion == null) {
                res.send({ error: error || 'Hệ thống bị lỗi!' });
            } else {
                const addLessonQuestion = () => app.model.lesson.addLessonQuestion(_lessonId, lessonQuestion, (error, item) => {
                    res.send({ error, questions: item && item.questions ? item.questions : [] });
                });

                if (req.session['lesson-questionImage']) {
                    app.uploadComponentImage(req, 'lesson-question', app.model.lessonQuestion.get, lessonQuestion._id, req.session['lesson-questionImage'], response =>
                        response.error ? res.send({ error: response.error }) : addLessonQuestion());
                } else {
                    addLessonQuestion();
                }
            }
        });
    });

    app.put('/api/lesson/question', app.permission.check('lesson:write'), (req, res) => {
        const { _lessonId, _lessonQuestionId, data } = req.body;
        app.model.lessonQuestion.update(_lessonQuestionId, data, (error) => {
            if (error) {
                res.send({ error });
            } else {
                app.model.lesson.get(_lessonId, (error, item) => res.send({ error, questions: item && item.questions ? item.questions : [] }));
            }
        });
    });

    app.put('/api/lesson/question/swap', app.permission.check('lesson:write'), (req, res) => {
        const { _lessonId, _lessonQuestionId, isMoveUp } = req.body;
        app.model.lesson.get(_lessonId, (error, item) => {
            if (error) {
                res.send({ error });
            } else {
                for (let index = 0, length = item.questions.length; index < item.questions.length; index++) {
                    const lessonQuestion = item.questions[index];
                    if (lessonQuestion._id == _lessonQuestionId) {
                        const newIndex = index + (isMoveUp == 'true' ? -1 : +1);
                        if (0 <= index && index < length && 0 <= newIndex && newIndex < length) {
                            item.questions.splice(index, 1);
                            item.questions.splice(newIndex, 0, lessonQuestion);
                            item.save();
                        }
                        break;
                    }
                }
                res.send({ questions: item.questions });
            }
        });
    });

    app.delete('/api/lesson/question', app.permission.check('lesson:write'), (req, res) => {
        const { _lessonId, _lessonQuestionId } = req.body;
        app.model.lessonQuestion.delete(_lessonQuestionId, error => {
            if (error) {
                res.send({ error });
            } else {
                app.model.lesson.deleteLessonQuestion(_lessonId, _lessonQuestionId, (error, item) => {
                    res.send({ error, questions: item && item.questions ? item.questions : [] });
                });
            }
        });
    });

    // Hook upload images ---------------------------------------------------------------------------------------------
    app.createFolder(app.path.join(app.publicPath, '/img/lesson-video'), app.path.join(app.publicPath, '/img/lesson-question'));

    const uploadLessonVideo = (req, fields, files, params, done) => {
        if (fields.userData && fields.userData[0].startsWith('LessonVideoImage:') && files.LessonVideoImage && files.LessonVideoImage.length > 0) {
            console.log('Hook: uploadLessonVideo =>lesson video image upload');
            app.uploadComponentImage(req, 'lesson-video', app.model.lessonVideo.get, fields.userData[0].substring('LessonVideoImage:'.length), files.LessonVideoImage[0].path, done);
        }
    };
    app.uploadHooks.add('uploadLessonVideo', (req, fields, files, params, done) =>
        app.permission.has(req, () => uploadLessonVideo(req, fields, files, params, done), done, 'lesson:write'));

    const uploadLessonQuestion = (req, fields, files, params, done) => {
        if (fields.userData && fields.userData[0].startsWith('lessonQuestion:') && files.LessonQuestionImage && files.LessonQuestionImage.length > 0) {
            console.log('Hook: uploadLessonQuestion =>lesson question image upload');
            app.uploadComponentImage(req, 'lesson-question', app.model.lessonQuestion.get, fields.userData[0].substring('lessonQuestion:'.length), files.LessonQuestionImage[0].path, done);
        }
    };
    app.uploadHooks.add('uploadLessonQuestion', (req, fields, files, params, done) =>
        app.permission.has(req, () => uploadLessonQuestion(req, fields, files, params, done), done, 'lesson:write'));
};
