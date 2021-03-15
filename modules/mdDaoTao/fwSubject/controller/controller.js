module.exports = (app) => {
    const menu = {
        parentMenu: app.parentMenu.trainning,
        menus: {
            4020: { title: 'Môn học', link: '/user/dao-tao/mon-hoc/list' },
        },
    };
    app.permission.add({ name: 'subject:read', menu }, { name: 'subject:write', menu });
    app.get('/user/dao-tao', app.permission.check('subject:read'), app.templates.admin);
    app.get('/user/dao-tao/mon-hoc/list', app.permission.check('subject:read'), app.templates.admin);
    app.get('/user/dao-tao/mon-hoc/edit/:subjectId', app.templates.admin);
    app.get('/user/dao-tao/mon-hoc/list-bai-hoc/:subjectId', app.templates.admin);

    // APIs -----------------------------------------------------------------------------------------------------------
    app.get('/api/subject/page/:pageNumber/:pageSize', app.permission.check('subject:read'), (req, res) => {
        const pageNumber = parseInt(req.params.pageNumber),
            pageSize = parseInt(req.params.pageSize);
        app.model.subject.getPage(pageNumber, pageSize, {}, (error, page) => {
            res.send({ page, error: error || page == null ? 'Danh sách môn học không sẵn sàng!' : null });
        });
    });

    app.get('/api/subject/edit/:subjectId', app.permission.check('subject:read'), (req, res) => {
        app.model.subject.get(req.params.subjectId, (error, item) => res.send({ error, item }));
    });


    app.post('/api/subject', app.permission.check('subject:write'), (req, res) => {
        app.model.subject.create(req.body.data || {}, (error, item) => res.send({ error, item }));
    });

    app.put('/api/subject', app.permission.check('subject:write'), (req, res) => {
        const changes = req.body.changes;
        if (changes.categories && changes.categories == 'empty') changes.categories = [];
        app.model.subject.update(req.body._id, req.body.changes, (error, item) => res.send({ error, item }))
    });

    app.delete('/api/subject', app.permission.check('subject:write'), (req, res) => {
        app.model.subject.delete(req.body._id, (error) => res.send({ error }));
    });

    app.get('/api/lesson/:subjectId', (req, res) => {
        app.model.subject.get(req.params.subjectId, { select: '_id lesson', populate: true }, (error, item) => res.send({ error, item }));
    });

    app.post('/api/subject/lesson/add/:subjectId', app.permission.check('subject:write'), (req, res) => {
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

    app.delete('/api/subject/lesson/:_id', app.permission.check('subject:write'), (req, res) => {
        app.model.subject.deleteLesson({ _id: req.params._id }, req.body.lessonId, (error, item) => res.send({ error, item }));
    });

    app.put('/api/subject/lesson/swap', app.permission.check('subject:write'), (req, res) => {
        app.model.subject.update(req.body._id, req.body.data, (error, item) => res.send({ error, item }));
    });
    app.get('/api/feedback-question/:subjectId', (req, res) => {
        const subjectId = req.params.subjectId;
        app.model.subject.get(subjectId, { select: '_id feedbackQuestion', populate: true }, (error, item) => {
            res.send({ error, item });
        });
    });

    app.post('/api/feedback-question/:_id', app.permission.check('subject:write'), (req, res) => {
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

    app.put('/api/feedback-question', app.permission.check('subject:write'), (req, res) => {
        const _id = req.body._id, data = req.body.data;
        app.model.feedbackQuestion.update(_id, data, (error, question) => {
            res.send({ error, question });
        });
    });

    app.put('/api/feedback-question/swap', app.permission.check('subject:write'), (req, res) => {
        const data = req.body.data, subjectId = req.body.subjectId;
        app.model.subject.update(subjectId, data, (error, item) => {
            res.send({ error, item });
        });
    });

    app.delete('/api/feedback-question', app.permission.check('subject:write'), (req, res) => {
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
