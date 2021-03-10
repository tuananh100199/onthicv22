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

    app.delete('/api/lessonVideo', app.permission.check('baihoc:write'), (req, res) => {
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
}