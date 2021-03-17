module.exports = app => {
    app.post('/api/lesson-video/:_id', app.permission.check('lesson:write'), (req, res) => {
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

    app.put('/api/lesson-video', app.permission.check('lesson:write'), (req, res) => {
        app.model.lessonVideo.update(req.body._id, req.body.data, (error, lessonVideo) => res.send({ error, lessonVideo }));
    });

    app.put('/api/lesson-video/swap', app.permission.check('lesson:write'), (req, res) => {
        const data = req.body.data, lessonId = req.body.lessonId;
        app.model.lesson.update(lessonId, data, (error, item) => res.send({ error, item }));
    });

    app.delete('/api/lesson-video', app.permission.check('lesson:write'), (req, res) => {
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
    app.get('/api/lesson-video/item/:_id', (req, res) => {
        app.model.lessonVideo.get(req.params._id, (error, item) => res.send({ error, item }));
    });

    app.get('/api/lesson-video/:lessonId', (req, res) => {
        app.model.lesson.get(req.params.lessonId, { select: '_id lessonVideo', populate: true }, (error, item) => res.send({ error, item }));
    });
    // Hook upload images ---------------------------------------------------------------------------------------------------------------------------s
    app.createFolder(app.path.join(app.publicPath, '/img/lesson-video'));

    const uploadLessonVideo = (req, fields, files, params, done) => {
        if (fields.userData && fields.userData[0].startsWith('lesson-video:') && files.LessonVideoImage && files.LessonVideoImage.length > 0) {
            console.log('Hook: uploadLessonVideo =>lesson video image upload');
            app.uploadComponentImage(req, 'lesson-video', app.model.lessonVideo.get, fields.userData[0].substring(13), files.LessonVideoImage[0].path, done);
        }
    };
    app.uploadHooks.add('uploadLessonVideo', (req, fields, files, params, done) =>
        app.permission.has(req, () => uploadLessonVideo(req, fields, files, params, done), done, 'component:write'));
}