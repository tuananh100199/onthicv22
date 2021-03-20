module.exports = (app) => {
    const menu = {
        parentMenu: app.parentMenu.trainning,
        menus: {
            4020: { title: 'Môn học', link: '/user/dao-tao/mon-hoc' },
        },
    };

    app.permission.add(
        { name: 'subject:read', menu },
        { name: 'subject:write' },
        { name: 'subject:delete' },
    );

    app.get('/user/dao-tao', app.permission.check('subject:read'), app.templates.admin);
    app.get('/user/dao-tao/mon-hoc', app.permission.check('subject:read'), app.templates.admin);
    app.get('/user/dao-tao/mon-hoc/edit/:subjectId', app.templates.admin);
    app.get('/user/dao-tao/mon-hoc-bai-hoc/:subjectId', app.templates.admin);

    // APIs -----------------------------------------------------------------------------------------------------------
    app.get('/api/subject/page/:pageNumber/:pageSize', app.permission.check('subject:read'), (req, res) => {
        const pageNumber = parseInt(req.params.pageNumber),
            pageSize = parseInt(req.params.pageSize),
            condition = {}, searchText = req.query.searchText;
        if (searchText) {
            condition.title = new RegExp(searchText, 'i');
        }
        app.model.subject.getPage(pageNumber, pageSize, condition, (error, page) => {
            res.send({ page, error: error || page == null ? 'Danh sách môn học không sẵn sàng!' : null });
        });
    });

    app.get('/api/subject/item/:subjectId', app.permission.check('subject:read'), (req, res) => {
        app.model.subject.get(req.params.subjectId, (error, item) => res.send({ error, item }));
    });

    app.post('/api/subject', app.permission.check('subject:write'), (req, res) => {
        app.model.subject.create(req.body.newData, (error, item) => res.send({ error, item }));
    });

    app.put('/api/subject', app.permission.check('subject:write'), (req, res) => {
        const changes = req.body.changes;
        if (changes.categories && changes.categories == 'empty') changes.categories = [];
        app.model.subject.update(req.body._id, req.body.changes, (error, item) => res.send({ error, item }))
    });

    app.delete('/api/subject', app.permission.check('subject:write'), (req, res) => {
        app.model.subject.delete(req.body._id, (error) => res.send({ error }));
    });

    app.get('/api/subject/lesson/:subjectId', (req, res) => {
        app.model.subject.get(req.params.subjectId, { select: '_id lesson', populate: true }, (error, item) => res.send({ error, item }));
    });

    app.post('/api/subject/lesson/:subjectId', app.permission.check('subject:write'), (req, res) => {
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

    app.get('/api/subject/question/:subjectId', (req, res) => {
        const subjectId = req.params.subjectId;
        app.model.subject.get(subjectId, { select: '_id subjectQuestion', populate: true }, (error, item) => {
            res.send({ error, item });
        });
    });

    app.post('/api/subject/question/:_id', app.permission.check('subject:write'), (req, res) => {
        app.model.subjectQuestion.create(req.body.data, (error, subjectQuestion) => {
            if (error || !subjectQuestion) {
                res.send({ error });
            } else {
                app.model.subject.addSubjectQuestion({ _id: req.params._id }, subjectQuestion, (error, item) => {
                    res.send({ error, item });
                });
            }
        });
    });

    app.put('/api/subject/question', app.permission.check('subject:write'), (req, res) => {
        const _id = req.body._id, data = req.body.data;
        app.model.subjectQuestion.update(_id, data, (error, question) => {
            res.send({ error, question });
        });
    });

    app.put('/api/subject/question/swap', app.permission.check('subject:write'), (req, res) => {
        const data = req.body.data, subjectId = req.body.subjectId;
        app.model.subject.update(subjectId, data, (error, item) => {
            res.send({ error, item });
        });
    });

    app.delete('/api/subject/question', app.permission.check('subject:write'), (req, res) => {
        app.model.subject.deleteSubjectQuestion({ _id: req.body.subjectId }, req.body._id, (error, item) => {
            res.send({ error, item });
        });
    });
};
