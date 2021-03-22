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

    app.post('/api/subject/lesson', app.permission.check('subject:write'), (req, res) => {
        const subjectId = req.body.subjectId,
            lessonId = req.body.lessonId;
        app.model.subject.get({ _id: subjectId, lesson: { _id: lessonId } }, (error, item) => {
            if (error) {
                res.send({ error });
            } else if (item) {
                res.send({ check: `Môn học đã có bài học này!` });
            } else {
                app.model.subject.addSubjectLesson({ _id: subjectId }, lessonId, (error, item) => res.send({ error, item }));
            }
        });
    });

    app.put('/api/subject/lesson', app.permission.check('subject:write'), (req, res) => {
        const { subjectId, subjectLessonId, newSubjectLessonId } = req.body,
            changes = { _id: newSubjectLessonId }
        app.model.subject.get(subjectId, (error, item) => {
            if (error) {
                res.send({ error });
            } else {
                app.model.subject.update(subjectLessonId, changes, (error, item) => res.send({ error, item }));
            }
        });
    });

    app.delete('/api/subject/lesson', app.permission.check('subject:write'), (req, res) => {
        const { _subjectId, _subjectLessonId } = req.body;
        app.model.subject.deleteSubjectLesson(_subjectId, _subjectLessonId, (error, item) => {

            res.send({ error, item });
        });
    });

    app.put('/api/subject/lesson/swap', app.permission.check('subject:write'), (req, res) => {
        const { _subjectId, _subjectLessonId, isMoveUp } = req.body;
        app.model.subject.get(_subjectId, (error, item) => {
            if (error) {
                res.send({ error });
            } else {
                for (let index = 0, length = item.lesson.length; index < item.lesson.length; index++) {
                    const subjectLesson = item.lesson[index];
                    if (subjectLesson._id == _subjectLessonId) {
                        const newIndex = index + (isMoveUp == 'true' ? -1 : +1);
                        if (0 <= index && index < length && 0 <= newIndex && newIndex < length) {
                            item.lesson.splice(index, 1);
                            item.lesson.splice(newIndex, 0, subjectLesson);
                            item.save();
                        }
                        break;
                    }
                }
                res.send({ error, item });
            }
        });
    });

    app.post('/api/subject/question', app.permission.check('subject:write'), (req, res) => {
        app.model.subjectQuestion.create(req.body.data, (error, subjectQuestion) => {
            if (error || !subjectQuestion) {
                res.send({ error });
            } else {
                app.model.subject.addSubjectQuestion(req.body.subjectId, subjectQuestion, (error, item) => {
                    res.send({ error, item });
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
                for (let index = 0, length = item.subjectQuestion.length; index < item.subjectQuestion.length; index++) {
                    const subjectQuestion = item.subjectQuestion[index];
                    if (subjectQuestion._id == _subjectQuestionId) {
                        const newIndex = index + (isMoveUp == 'true' ? -1 : +1);
                        if (0 <= index && index < length && 0 <= newIndex && newIndex < length) {
                            item.subjectQuestion.splice(index, 1);
                            item.subjectQuestion.splice(newIndex, 0, subjectQuestion);
                            item.save();
                        }
                        break;
                    }
                }
                res.send({ error, item });
            }
        });
    });

    app.put('/api/subject/question', app.permission.check('subject:write'), (req, res) => {
        const { _subjectId, _subjectQuestionId, data } = req.body;
        app.model.subjectQuestion.update(_subjectQuestionId, data, (error) => {
            if (error) {
                res.send({ error });
            } else {
                app.model.subject.get(_subjectId, (error, item) => res.send({ error, item }));
            }
        });
    });

    app.delete('/api/subject/question', app.permission.check('subject:write'), (req, res) => {
        const { _subjectId, _subjectQuestionId } = req.body;
        app.model.subjectQuestion.delete(_subjectQuestionId, error => {
            if (error) {
                res.send({ error });
            } else {
                app.model.subject.deleteSubjectQuestion(_subjectId, _subjectQuestionId, (error, item) => {
                    res.send({ error, item });
                });
            }
        });
    });

};
