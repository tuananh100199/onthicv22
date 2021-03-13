module.exports = (app) => {
    const menu = {
        parentMenu: { index: 8000, title: 'Đào tạo', icon: 'fa-graduation-cap' },
        menus: {
            8020: { title: 'Môn học', link: '/user/dao-tao/mon-hoc/list' },
        },
    };
    app.permission.add({ name: 'lesson:read', menu }, { name: 'lesson:write', menu });
    app.get('/user/dao-tao', app.permission.check('lesson:read'), app.templates.admin);
    app.get('/user/dao-tao/mon-hoc/list', app.permission.check('lesson:read'), app.templates.admin);
    app.get('/user/dao-tao/mon-hoc/edit/:monHocId', app.templates.admin);
    app.get('/user/dao-tao/mon-hoc/list-bai-hoc/:monHocId', app.templates.admin);

    // APIs -----------------------------------------------------------------------------------------------------------
    app.get('/api/mon-hoc/page/:pageNumber/:pageSize', app.permission.check('lesson:read'), (req, res) => {
        const pageNumber = parseInt(req.params.pageNumber),
            pageSize = parseInt(req.params.pageSize);
        app.model.subject.getPage(pageNumber, pageSize, {}, (error, page) => {
            res.send({ page, error: error || page == null ? 'Danh sách môn học không sẵn sàng!' : null });
        });
    });

    app.get('/api/mon-hoc/edit/:monHocId', app.permission.check('lesson:read'), (req, res) => {
        app.model.subject.get(req.params.monHocId, (error, item) => res.send({ error, item }));
    });


    app.post('/api/mon-hoc', app.permission.check('lesson:write'), (req, res) => {
        app.model.subject.create(req.body.data || {}, (error, item) => res.send({ error, item }));
    });

    app.put('/api/mon-hoc', app.permission.check('lesson:write'), (req, res) => {
        const changes = req.body.changes;
        if (changes.categories && changes.categories == 'empty') changes.categories = [];
        app.model.subject.update(req.body._id, req.body.changes, (error, item) => res.send({ error, item }))
    });

    app.delete('/api/mon-hoc', app.permission.check('lesson:write'), (req, res) => {
        app.model.subject.delete(req.body._id, (error) => res.send({ error }));
    });

    app.get('/api/baihoc/:subjectId', (req, res) => {
        app.model.subject.get(req.params.subjectId, { select: '_id lesson', populate: true }, (error, item) => res.send({ error, item }));
    });

    app.post('/api/mon-hoc/bai-hoc/add/:subjectId', app.permission.check('lesson:write'), (req, res) => {
        const subjectId = req.params.subjectId,
            lessonId = req.body.lessonId;
        app.model.subject.get({ _id: subjectId, lesson: { _id: lessonId } }, (error, item) => {
            if (error) {
                res.send({ error });
            } else if (item) {
                res.send({ check: `Môn học đã có bài học này!` });
            } else {
                app.model.subject.addLesson({ _id: subjectId }, lessonId, (error, item) => res.send({ error, item }));
            }
        });
    });

    app.delete('/api/mon-hoc/bai-hoc/:_id', app.permission.check('lesson:write'), (req, res) => {
        app.model.subject.deleteLesson({ _id: req.params._id }, req.body.lessonId, (error, item) => res.send({ error, item }));
    });

    app.put('/api/mon-hoc/bai-hoc/swap', app.permission.check('lesson:write'), (req, res) => {
        app.model.subject.update(req.body._id, req.body.data, (error, item) => res.send({ error, item }));
    });
    app.get('/api/feedback-question/:subjectId', (req, res) => {
        const subjectId = req.params.subjectId;
        app.model.subject.get(subjectId, { select: '_id feedbackQuestion', populate: true }, (error, item) => {
            res.send({ error, item });
        });
    });

    app.post('/api/feedback-question/:_id', app.permission.check('lesson:write'), (req, res) => {
        const _id = req.params._id, data = req.body.data;
        app.model.feedbackQuestion.create(data, (error, question) => {
            if (error || !question) {
                res.send({ error });
            } else {
                app.model.subject.pushFeedbackQuestion({ _id }, question._id, question.title, question.content, question.active, (error, item) => {
                    res.send({ error, item });
                });
            }
        });
    });

    app.put('/api/feedback-question', app.permission.check('lesson:write'), (req, res) => {
        const _id = req.body._id, data = req.body.data;
        app.model.feedbackQuestion.update(_id, data, (error, question) => {
            res.send({ error, question });
        });
    });

    app.put('/api/feedback-question/swap', app.permission.check('lesson:write'), (req, res) => {
        const data = req.body.data, subjectId = req.body.subjectId;
        app.model.subject.update(subjectId, data, (error, item) => {
            res.send({ error, item });
        });
    });

    app.delete('/api/feedback-question', app.permission.check('lesson:write'), (req, res) => {
        const { data, subjectId, _id } = req.body;
        if (data.questions && data.questions == 'empty') data.questions = [];
        app.model.subject.update(subjectId, data, (error, _) => {
            if (error) {
                res.send({ error });
            } else {
                app.model.feedbackQuestion.delete(_id, error => res.send({ error }));
            }
        });
    });
    //End question -----------------------------------------------------------------------------------------------------
};
