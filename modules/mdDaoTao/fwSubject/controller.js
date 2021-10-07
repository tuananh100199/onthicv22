module.exports = (app) => {
    const menu = {
        parentMenu: app.parentMenu.trainning,
        menus: {
            4020: { title: 'Môn học', link: '/user/dao-tao/mon-hoc' },
        },
    };
    app.permission.add({ name: 'subject:read' }, { name: 'subject:write', menu }, { name: 'subject:delete' });

    app.get('/user/dao-tao', app.permission.check('subject:read'), app.templates.admin);
    app.get('/user/dao-tao/mon-hoc', app.permission.check('subject:read'), app.templates.admin);
    app.get('/user/dao-tao/mon-hoc/:_id', app.templates.admin);
    app.get('/user/hoc-vien/khoa-hoc/:courseId/mon-hoc/:_id', app.permission.check('user:login'), app.templates.admin);
    app.get('/user/hoc-vien/khoa-hoc/:courseId/mon-hoc/thong-tin/:_id', app.permission.check('user:login'), app.templates.admin);
    app.get('/user/hoc-vien/khoa-hoc/:courseId/mon-hoc/phan-hoi/:_id', app.permission.check('user:login'), app.templates.admin);

    // Subject APIs ---------------------------------------------------------------------------------------------------
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

    app.get('/api/subject/all', (req, res) => {
        app.model.subject.getAll(req.query.condition, (error, list) => res.send({ error, list }));
    });

    app.get('/api/subject', app.permission.check('subject:read'), (req, res) => {//mobile
        app.model.subject.get(req.query._id, (error, item) => res.send({ error, item }));
    });

    app.get('/api/subject/student', app.permission.check('user:login'), (req, res) => {
        const subjectId = req.query._id;
        app.model.subject.get(subjectId, (error, item) => res.send({ error, item }));
    });

    app.post('/api/subject', app.permission.check('subject:write'), (req, res) => {
        app.model.subject.create(req.body.data, (error, item) => res.send({ error, item }));
    });

    app.put('/api/subject', app.permission.check('subject:write'), (req, res) => {
        app.model.subject.update(req.body._id, req.body.changes, (error, item) => res.send({ error, item }));
    });

    app.delete('/api/subject', app.permission.check('subject:delete'), (req, res) => {
        app.model.subject.delete(req.body._id, (error) => res.send({ error }));
    });

    app.post('/api/subject/student/submit', app.permission.check('user:login'), (req, res) => {
        const { courseId, subjectId, answers } = req.body;
        app.model.student.get({ user: req.session.user._id, course: courseId }, (error, student) => {
            if (error) {
                res.send({ error });
            } else {
                const data = { studentId: student._id, subjectId, answers };
                app.model.student.addFeedback(data, (error, item) => {
                    res.send({ error, result: { answers }, item });
                });
            }
        });
    });

    // Lesson APIs ----------------------------------------------------------------------------------------------------
    app.post('/api/subject/lesson', app.permission.check('subject:write'), (req, res) => {
        const subjectId = req.body._subjectId,
            lessonId = req.body._subjectLessonId;
        app.model.subject.get({ _id: subjectId, lessons: { _id: lessonId } }, (error, item) => {
            if (error) {
                res.send({ error });
            } else if (item) {
                res.send({ check: 'Môn học đã có bài học này!' });
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

    // Hook readyHooks ------------------------------------------------------------------------------------------------
    app.readyHooks.add('createSubjectQuestionManager', {
        ready: () => app.model && app.model.subject && app.hookQuestion,
        run: () => app.hookQuestion('subject', app.model.subject),
    });

    // Hook permissionHooks  ------------------------------------------------------------------------------------------
    app.permissionHooks.add('courseAdmin', 'subject', (user) => new Promise(resolve => {
        app.permissionHooks.pushUserPermission(user, 'subject:read');
        resolve();
    }));
    app.permissionHooks.add('lecturer', 'subject', (user) => new Promise(resolve => {
        app.permissionHooks.pushUserPermission(user, 'subject:read');
        resolve();
    }));
};