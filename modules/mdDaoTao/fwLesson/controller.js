module.exports = (app) => {
    const menu = {
        parentMenu: app.parentMenu.trainning,
        menus: {
            4030: { title: 'Bài học', link: '/user/dao-tao/bai-hoc' },
        },
    };
    app.permission.add({ name: 'lesson:read', menu }, { name: 'lesson:write', menu });

    app.get('/user/dao-tao/bai-hoc', app.permission.check('lesson:read'), app.templates.admin);
    app.get('/user/dao-tao/bai-hoc/edit/:_id', app.templates.admin);
    app.get('/user/dao-tao/bai-hoc/view/:_id', app.templates.admin);

    // Lesson APIs ----------------------------------------------------------------------------------------------------
    app.get('/api/lesson/page/:pageNumber/:pageSize', app.permission.check('subject:read'), (req, res) => {
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

    app.get('/api/lesson/edit/:_id', app.permission.check('lesson:read'), (req, res) => {
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

    app.delete('/api/lesson', app.permission.check('lesson:write'), (req, res) => {
        app.model.lesson.delete(req.body._id, (error) => res.send({ error }));
    });

    app.post('/api/lesson/video/:_id', app.permission.check('lesson:write'), (req, res) => {
        const _id = req.params._id, data = req.body.data;
        app.model.lessonVideo.create(data, (error, lessonVideo) => {
            if (error || !lessonVideo) {
                res.send({ error });
            } else {
                if (lessonVideo && req.session['lesson-videoImage']) {
                    app.uploadComponentImage(req, 'lesson-video', app.model.lessonVideo.get, lessonVideo._id, req.session['lesson-videoImage'], response => {
                        if (response.error) {
                            res.send({ error: response.error, lessonVideo });
                        } else {
                            app.model.lesson.pushLessonVideo({ _id }, lessonVideo._id, lessonVideo.title, lessonVideo.link, lessonVideo.image, (error, item) => {
                                res.send({ error, item });
                            });
                        }
                    });
                } else {
                    res.send({ error, lessonVideo });
                }
            }
        });
    });

    app.put('/api/lesson/video', app.permission.check('lesson:write'), (req, res) => {
        app.model.lessonVideo.update(req.body._id, req.body.data, (error, lessonVideo) => res.send({ error, lessonVideo }));
    });

    app.put('/api/lesson/video/swap', app.permission.check('lesson:write'), (req, res) => {
        const data = req.body.data, lessonId = req.body.lessonId;
        app.model.lesson.update(lessonId, data, (error, item) => res.send({ error, item }));
    });

    app.delete('/api/lesson/video', app.permission.check('lesson:write'), (req, res) => {
        const { data, lessonId, _id } = req.body;
        if (data.lessonVideo && data.lessonVideo == 'empty') data.lessonVideo = [];
        app.model.lesson.update(lessonId, data, (error, _) => {
            if (error) {
                res.send({ error });
            } else {
                app.model.lessonVideo.delete(_id, error => res.send({ error }));
            }
        });
    });

    app.get('/api/lesson/video/item/:_id', (req, res) => {
        app.model.lessonVideo.get(req.params._id, (error, item) => res.send({ error, item }));
    });

    app.get('/api/lesson/video/:lessonId', (req, res) => {
        app.model.lesson.get(req.params.lessonId, { select: '_id lessonVideo', populate: true }, (error, item) => res.send({ error, item }));
    });

    // Question APIs --------------------------------------------------------------------------------------------------
    app.get('/api/lesson/question/:lessonId', (req, res) => {
        app.model.lesson.get(req.params.lessonId, { select: '_id lessonQuestion', populate: true }, (error, item) => res.send({ error, item }));
    });

    app.post('/api/lesson/question/:_id', app.permission.check('lesson:write'), (req, res) => {
        const _id = req.params._id, data = req.body.data;
        app.model.lessonQuestion.create(data, (error, question) => {
            if (error || !question) {
                res.send({ error });
            } else {
                app.model.lesson.pushLessonQuestion({ _id }, question._id, question.title, question.defaultAnswer, question.content, question.active, question.typeValue, (error, item) => {
                    res.send({ error, item });
                });
            }
        });
    });

    app.put('/api/lesson/question', app.permission.check('lesson:write'), (req, res) => {
        app.model.lessonQuestion.update(req.body._id, req.body.data, (error, question) => res.send({ error, question }));
    });

    app.put('/api/lesson/question/swap', app.permission.check('lesson:write'), (req, res) => {
        app.model.lesson.update(req.body.lessonId, req.body.data, (error, item) => res.send({ error, item }));
    });

    app.delete('/api/lesson/question', app.permission.check('lesson:write'), (req, res) => {
        const { data, lessonId, _id } = req.body;
        if (data.questions && data.questions == 'empty') data.questions = [];
        app.model.lesson.update(lessonId, data, (error, _) => {
            if (error) {
                res.send({ error });
            } else {
                app.model.lessonQuestion.delete(_id, error => res.send({ error }));
            }
        });
    });

    // Hook upload images ---------------------------------------------------------------------------------------------
    app.createFolder(app.path.join(app.publicPath, '/img/lesson-video'));

    const uploadLessonVideo = (req, fields, files, params, done) => {
        if (fields.userData && fields.userData[0].startsWith('lesson-video:') && files.LessonVideoImage && files.LessonVideoImage.length > 0) {
            console.log('Hook: uploadLessonVideo =>lesson video image upload');
            app.uploadComponentImage(req, 'lesson-video', app.model.lessonVideo.get, fields.userData[0].substring(13), files.LessonVideoImage[0].path, done);
        }
    };
    app.uploadHooks.add('uploadLessonVideo', (req, fields, files, params, done) =>
        app.permission.has(req, () => uploadLessonVideo(req, fields, files, params, done), done, 'component:write'));
};
