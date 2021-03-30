module.exports = (app) => {
    const menu = {
        parentMenu: app.parentMenu.trainning,
        menus: {
            4020: { title: 'Môn học', link: '/user/dao-tao/mon-hoc' },
        },
    };
    app.permission.add({ name: 'subject:read', menu }, { name: 'subject:write' }, { name: 'subject:delete' });

    app.get('/user/dao-tao', app.permission.check('subject:read'), app.templates.admin);
    app.get('/user/dao-tao/mon-hoc', app.permission.check('subject:read'), app.templates.admin);
    app.get('/user/dao-tao/mon-hoc/:_id', app.templates.admin);

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

    app.get('/api/subject', app.permission.check('subject:read'), (req, res) => {
        app.model.subject.get(req.query._id, (error, item) => res.send({ error, item }));
    });

    app.post('/api/subject', app.permission.check('subject:write'), (req, res) => {
        app.model.subject.create(req.body.newData, (error, item) => res.send({ error, item }));
    });

    app.put('/api/subject', app.permission.check('subject:write'), (req, res) => {
        app.model.subject.update(req.body._id, req.body.changes, (error, item) => res.send({ error, item }))
    });

    app.delete('/api/subject', app.permission.check('subject:delete'), (req, res) => {
        app.model.subject.delete(req.body._id, (error) => res.send({ error }));
    });


    app.post('/api/subject/lesson', app.permission.check('subject:write'), (req, res) => {
        const subjectId = req.body._subjectId,
            lessonId = req.body._subjectLessonId;
        app.model.subject.get({ _id: subjectId, lessons: { _id: lessonId } }, (error, item) => {
            if (error) {
                res.send({ error });
            } else if (item) {
                res.send({ check: `Môn học đã có bài học này!` });
            } else {
                app.model.subject.addLesson({ _id: subjectId }, lessonId, (error, item) => res.send({ error, lessons: item && item.lessons ? item.lessons : [] }));
            }
        });
    });

    app.put('/api/subject/lesson/swap', app.permission.check('subject:write'), (req, res) => {
        const { _subjectId, _subjectLessonId, isMoveUp } = req.body;
        app.model.subject.get(_subjectId, (error, item) => {
            if (error) {
                res.send({ error });
            } else {
                for (let index = 0, length = item.lessons.length; index < item.lessons.length; index++) {
                    const subjectLesson = item.lessons[index];
                    if (subjectLesson._id == _subjectLessonId) {
                        const newIndex = index + (isMoveUp == 'true' ? -1 : +1);
                        if (0 <= index && index < length && 0 <= newIndex && newIndex < length) {
                            item.lessons.splice(index, 1);
                            item.lessons.splice(newIndex, 0, subjectLesson);
                            item.save();
                        }
                        break;
                    }
                }
                res.send({ lessons: item.lessons });
            }
        });
    });

    app.delete('/api/subject/lesson', app.permission.check('subject:write'), (req, res) => {
        const { _subjectId, _subjectLessonId } = req.body;
        app.model.subject.deleteLesson(_subjectId, _subjectLessonId, (error) => {
            if (error) {
                res.send({ error });
            } else {
                app.model.subject.get(_subjectId, (error, item) => res.send({ error, item }));
            }
        });
    });

    // Question APIs --------------------------------------------------------------------------------------------------
    let questionManager = null;
    app.readyHooks.add('createSubjectQuestionManager', {
        ready: () => app.model && app.model.question && app.buildQuestionManager,
        run: () => questionManager = app.buildQuestionManager(app.model.subject),
    });

    app.post('/api/subject/question', app.permission.check('subject:write'), (req, res) => {
        const { _subjectId, data } = req.body;
        questionManager.create(_subjectId, data, (error, questions) => res.send({ error, questions }));
    });

    app.put('/api/subject/question', app.permission.check('subject:write'), (req, res) => {
        const { _subjectId, _questionId, data } = req.body;
        questionManager.update(_subjectId, _questionId, data, (error, questions) => res.send({ error, questions }));
    });

    app.put('/api/subject/question/swap', app.permission.check('subject:write'), (req, res) => {
        const { _subjectId, _questionId, isMoveUp } = req.body;
        questionManager.swap(_subjectId, _questionId, isMoveUp, (error, questions) => res.send({ error, questions }));
    });

    app.delete('/api/subject/question', app.permission.check('subject:write'), (req, res) => {
        const { _subjectId, _questionId } = req.body;
        questionManager.delete(_subjectId, _questionId, (error, questions) => res.send({ error, questions }));
    });
};