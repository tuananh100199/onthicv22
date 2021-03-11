module.exports = app => {
    app.post('/api/lesson-video/:_id', app.permission.check('baihoc:write'), (req, res) => {
        const _id = req.params._id, data = req.body.data;
        app.model.lessonVideo.create(data, (error, lessonVideo) => {
            if (error || !lessonVideo) {
                res.send({ error });
            } else {
                app.model.lesson.pushLessonVideo({ _id }, lessonVideo._id, lessonVideo.title, lessonVideo.link, (error, item) => {
                    res.send({ error, item });
                });
            }
        });
    });

    app.put('/api/lesson-video', app.permission.check('baihoc:write'), (req, res) => {
        const _id = req.body._id, data = req.body.data;
        app.model.lessonVideo.update(_id, data, (error, lessonVideo) => {
            res.send({ error, lessonVideo });
        });
    });

    app.put('/api/lesson-video/swap', app.permission.check('baihoc:write'), (req, res) => {
        const data = req.body.data, lessonId = req.body.lessonId;
        app.model.lesson.update(lessonId, data, (error, item) => {
            res.send({ error, item });
        });
    });

    app.delete('/api/lesson-video', app.permission.check('baihoc:write'), (req, res) => {
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
    app.get('/api/lesson-video/item/:_id', (req, res) => app.model.lessonVideo.get(req.params._id, (error, item) => res.send({ error, item })));
    // Hook upload images ---------------------------------------------------------------------------------------------------------------------------s
    app.createFolder(app.path.join(app.publicPath, '/img/lesson-video'));

    const uploadLessonVideo = (req, fields, files, params, done) => {
        if (fields.userData && fields.userData[0].startsWith('lesson-video:') && files.LessonVideoImage && files.LessonVideoImage.length > 0) {
            console.log('Hook: uploadVideo =>lesson video image upload');
            app.uploadComponentImage(req, 'lesson-video', app.model.lessonVideo.get, fields.userData[0].substring(13), files.LessonVideoImage[0].path, done);
        }
    };
    app.uploadHooks.add('uploadLessonVideo', (req, fields, files, params, done) =>
        app.permission.has(req, () => uploadLessonVideo(req, fields, files, params, done), done, 'component:write'));
}