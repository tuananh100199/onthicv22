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
        const changes = req.body.changes;
        if (changes.categories && changes.categories == 'empty') changes.categories = [];
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


    app.post('/api/subject/question', app.permission.check('subject:write'), (req, res) => {
        app.model.subjectQuestion.create(req.body.data, (error, questions) => {
            if (error || !questions) {
                res.send({ error });
            } else {
                app.model.subject.addQuestion(req.body._subjectId, questions, (error, item) => {
                    res.send({ error, questions: item && item.questions ? item.questions : [] });
                });
            }
        });
    });

    app.put('/api/subject/question', app.permission.check('subject:write'), (req, res) => {
        const { _subjectId, _subjectQuestionId, data } = req.body;
        app.model.subjectQuestion.update(_subjectQuestionId, data, (error) => {
            if (error) {
                res.send({ error });
            } else {
                app.model.subject.get(_subjectId, (error, item) => {
                    res.send({ error, questions: item && item.questions ? item.questions : [] })
                });
            }
        });
    });

    app.put('/api/subject/question/swap', app.permission.check('subject:write'), (req, res) => {
        const { _subjectId, _subjectQuestionId, isMoveUp } = req.body;
        app.model.subject.get(_subjectId, (error, item) => {
            if (error) {
                res.send({ error });
            } else {
                for (let index = 0, length = item.questions.length; index < item.questions.length; index++) {
                    const questions = item.questions[index];
                    if (questions._id == _subjectQuestionId) {
                        const newIndex = index + (isMoveUp == 'true' ? -1 : +1);
                        if (0 <= index && index < length && 0 <= newIndex && newIndex < length) {
                            item.questions.splice(index, 1);
                            item.questions.splice(newIndex, 0, questions);
                            item.save();
                        }
                        break;
                    }
                }
                res.send({ questions: item.questions });
            }
        });
    });

    app.delete('/api/subject/question', app.permission.check('subject:write'), (req, res) => {
        const { _subjectId, _subjectQuestionId } = req.body;
        app.model.subjectQuestion.delete(_subjectQuestionId, error => {
            if (error) {
                res.send({ error });
            } else {
                app.model.subject.deleteQuestion(_subjectId, _subjectQuestionId, (error, item) => {
                    res.send({ error, questions: item && item.questions ? item.questions : [] });
                });
            }
        });
    });
};