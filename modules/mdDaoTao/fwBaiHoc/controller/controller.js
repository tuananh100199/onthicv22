module.exports = (app) => {
    const menu = {
        parentMenu: { index: 8000, title: 'Đào tạo', icon: 'fa-graduation-cap' },
        menus: {
            8030: { title: 'Bài học', link: '/user/dao-tao/bai-hoc/list' },
        },
    };
    app.permission.add({ name: 'baihoc:read', menu }, { name: 'baihoc:write', menu });

    app.get('/user/dao-tao/bai-hoc/list', app.permission.check('baihoc:read'), app.templates.admin);
    app.get('/user/dao-tao/bai-hoc/edit/:baiHocId', app.templates.admin);
    app.get('/user/dao-tao/bai-hoc/view/:baiHocId', app.templates.admin);

    // APIs ------------------------------------------------------------------------------------------------------------
    app.get('/api/bai-hoc/page/:pageNumber/:pageSize', app.permission.check('baihoc:read'), (req, res) => {
        let pageNumber = parseInt(req.params.pageNumber),
            pageSize = parseInt(req.params.pageSize),
            condition = req.query.condition || '',
            pageCondition = {};
        try {
            if (condition) {
                const value = { $regex: `.*${condition}.*`, $options: 'i' };
                pageCondition['$or'] = [
                    { title: value },
                ];
            }
            app.model.lesson.getPage(pageNumber, pageSize, pageCondition, (error, page) => res.send({ error, page }));
        } catch (error) {
            res.send({ error });
        }
    });

    app.get('/api/bai-hoc/edit/:baiHocId', app.permission.check('baihoc:read'), (req, res) =>
        app.model.lesson.get(req.params.baiHocId, (error, item) => res.send({ error, item })));


    app.post('/api/bai-hoc', app.permission.check('baihoc:write'), (req, res) =>
        app.model.lesson.create(req.body.data || {}, (error, item) => res.send({ error, item })
        ));

    app.put('/api/bai-hoc', app.permission.check('baihoc:write'), (req, res) => {
        const changes = req.body.changes;
        if (changes.categories && changes.categories == 'empty') changes.categories = [];
        app.model.lesson.update(req.body._id, req.body.changes, (error, item) => res.send({ error, item }))
    });

    app.delete('/api/bai-hoc', app.permission.check('baihoc:write'), (req, res) =>
        app.model.lesson.delete(req.body._id, (error) => res.send({ error }))
    );

    //Lesson Video
    app.get('/api/lesson-video/:lessonId', (req, res) => {
        const lessonId = req.params.lessonId;
        app.model.lesson.get(lessonId, { select: '_id lessonVideo', populate: true }, (error, item) => {
            res.send({ error, item });
        });
    });
    // app.post('/api/lesson-video/:_id', app.permission.check('baihoc:write'), (req, res) => {
    //     const _id = req.params._id, data = req.body.data;
    //     app.model.lessonVideo.create(data, (error, lessonVideo) => {
    //         if (error || !lessonVideo) {
    //             res.send({ error });
    //         } else {
    //             app.model.lesson.pushLessonVideo({ _id }, lessonVideo._id, lessonVideo.title, lessonVideo.link, (error, item) => {
    //                 res.send({ error, item });
    //             });
    //         }
    //     });
    // });

    //Question ---------------------------------------------------------------------------------------------------------
    app.get('/api/lesson-question/:lessonId', (req, res) => {
        const lessonId = req.params.lessonId;
        app.model.lesson.get(lessonId, { select: '_id lessonQuestion', populate: true }, (error, item) => {
            res.send({ error, item });
        });
    });

    app.post('/api/lesson-question/:_id', app.permission.check('baihoc:write'), (req, res) => {
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

    app.put('/api/lesson-question', app.permission.check('baihoc:write'), (req, res) => {
        const _id = req.body._id, data = req.body.data;
        app.model.lessonQuestion.update(_id, data, (error, question) => {
            res.send({ error, question });
        });
    });

    app.put('/api/lesson-question/swap', app.permission.check('baihoc:write'), (req, res) => {
        const data = req.body.data, lessonId = req.body.lessonId;
        app.model.lesson.update(lessonId, data, (error, item) => {
            res.send({ error, item });
        });
    });

    app.delete('/api/lesson-question', app.permission.check('baihoc:write'), (req, res) => {
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
    //End question -----------------------------------------------------------------------------------------------------
};
