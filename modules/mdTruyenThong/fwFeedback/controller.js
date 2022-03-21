module.exports = (app) => {
    app.permission.add({ name: 'feedback:read' }, { name: 'feedback:write' }, { name: 'feedback:delete' }, { name: 'feedback:system' });
    app.permission.add({ name: 'feedback:system', menu: { parentMenu: { index: 3030, title: 'Phản hồi', icon: 'fa-comments-o', link: '/user/feedback/system' } } });

    app.get('/user/feedback/system', app.permission.check('feedback:read'), app.templates.admin);
    app.get('/user/feedback/system/:_id', app.permission.check('feedback:read'), app.templates.admin);
    app.get('/user/feedback', app.permission.check('user:login'), app.templates.admin);

    const getFeedbackPage = (pageNumber, pageSize, condition, sessionUser, _courseId, done) => {
        const division = sessionUser.division;
        if (sessionUser.isCourseAdmin && division && division.isOutside) {
            // Với user là isCourseAdmin + isOutside: chỉ hiện feedback của student thuộc cơ sở của họ
            app.model.student.getAll({ course: _courseId, division: division._id }, (error, students) => {
                if (error || !students) {
                    done('Tìm học viên của QTKH thuộc cơ sở ngoài bị lỗi!');
                } else if (students.length > 0) {
                    const users = { $in: students.map(({ user }) => user && user._id) };
                    condition.user = users;
                    app.model.feedback.getPage(pageNumber, pageSize, condition, ((error, page) => done(error, page)));
                } else {
                    const page = { list: [], pageNumber: 1, pageSize: 50, pageTotal: 1, totalItem: 0 };
                    done(null, page);
                }
            });
        } else {
            app.model.feedback.getPage(pageNumber, pageSize, condition, ((error, page) => done(error, page)));
        }
    };

    app.get('/api/feedback/page/:pageNumber/:pageSize', app.permission.check('feedback:read'), (req, res) => {
        const pageNumber = parseInt(req.params.pageNumber),
            pageSize = parseInt(req.params.pageSize),
            condition = req.query.pageCondition || {},
            { type, _refId } = condition,
            user = req.session.user;
        try {
            if (type == 'system') {
                if (user.roles.some(role => role.name == 'admin')) {
                    app.model.feedback.getPage(pageNumber, pageSize, condition, (error, page) => res.send({ error, page }));
                } else res.send({ error: 'Bạn không có quyền admin' });
            } else if (type == 'course' || type == 'teacher') {
                if (user.roles.some(role => role.name == 'admin') || user.isCourseAdmin) {
                    if (type == 'course')
                        getFeedbackPage(pageNumber, pageSize, condition, user, _refId, (error, page) => {
                            error = error || (page ? null : 'Lỗi khi lấy phản hồi!');
                            page = page || null;
                            res.send({ error, page });
                        });
                    // app.model.feedback.getPage(pageNumber, pageSize, condition, (error, page) => res.send({ error, page }));
                    else if (type == 'teacher') {
                        app.model.course.get(_refId, (error, course) => {
                            if (error || !course) {
                                res.send({ error: 'Invalid parameter!' });
                            } else {
                                const teachers = course.teacherGroups.map(({ teacher }) => teacher),
                                    _teacherIds = teachers.map(({ _id }) => _id);
                                condition._refId = { $in: _teacherIds };
                                getFeedbackPage(pageNumber, pageSize, condition, user, _refId, (error, page) => {
                                    if (error) {
                                        res.send({ error });
                                    } else {
                                        page = app.clone(page);
                                        page.list.forEach((item) => {
                                            item._refId = teachers.find(({ _id }) => item._refId == _id.toString()) ;
                                        });
                                        res.send({ page });
                                    }
                                });
                                // app.model.feedback.getPage(pageNumber, pageSize, condition, (error, page) => res.send({ error, page }));
                            }
                        });
                    }
                }
            }
        } catch (error) {
            res.send({ error });
        }
    });

    app.get('/api/feedback', app.permission.check('feedback:read'), (req, res) => {
        const { _id } = req.query;
        app.model.feedback.get(_id, (error, item) => res.send({ error, item }));
    });

    app.put('/api/feedback', app.permission.check('feedback:write'), (req, res) => {
        const changes = req.body.changes, user = req.session.user;
        if (typeof changes === 'string') { //send content in string
            const reply = {
                content: changes,
                adminUser: user._id
            };
            app.model.feedback.addReply(req.body._id, reply, (error, item) => res.send({ error, item }));
        } else app.model.feedback.update(req.body._id, changes, (error, item) => res.send({ error, item }));
    });

    app.post('/api/feedback/student', app.permission.check('user:login'), (req, res) => {//mobile
        const { type, _refId } = req.body.newData, user = req.session.user._id;
        if (type !== 'system') {
            app.model.student.get({ user, course: _refId }, (error, student) => {
                if (error || !student) {
                    res.send({ error: 'Bạn không thể phản hồi khóa học không phải của bạn!' });
                } else {
                    if (type == 'course')
                        app.model.feedback.create(app.clone(req.body.newData, { user }), (error, item) => res.send({ error, item }));
                    else if (type == 'teacher') {
                        app.model.course.get(_refId, (error, course) => {
                            if (error || !course) {
                                res.send({ error: 'Invalid parameter!' });
                            } else {
                                const _studentId = student._id,
                                    teacherGroups = course.teacherGroups.find(({ student }) => student.find(({ _id }) => _id == _studentId.toString()) != null),
                                    _teacherId = teacherGroups && teacherGroups.teacher && teacherGroups.teacher._id;
                                req.body.newData._refId = _teacherId;
                                app.model.feedback.create(app.clone(req.body.newData, { user }), (error, item) => res.send({ error, item }));
                            }
                        });

                    }
                }
            });
        } else app.model.feedback.create(app.clone(req.body.newData, { user }), (error, item) => res.send({ error, item }));
    });

    app.post('/api/feedback/lecturer', app.permission.check('user:login'), (req, res) => {//mobile
        const user = req.session.user._id;
        app.model.feedback.create(app.clone(req.body.newData, { user }), (error, item) => res.send({ error, item }));
    });

    app.get('/api/feedback/student/page/:pageNumber/:pageSize', app.permission.check('user:login'), (req, res) => { //mobile
        const pageNumber = parseInt(req.params.pageNumber),
            pageSize = parseInt(req.params.pageSize),
            condition = req.query.pageCondition || {},
            { type, _refId } = condition,
            user = req.session.user._id;
        try {
            if (type !== 'system') {
                app.model.student.get({ user, course: _refId }, (error, student) => {
                    if (error || !student) {
                        res.send({ error: 'Bạn không thể xem phản hồi khóa học không phải của bạn!' });
                    } else {
                        if (type == 'course')
                            app.model.feedback.getPage(pageNumber, pageSize, app.clone(condition, { user }), (error, page) => res.send({ error, page }));
                        else if (type == 'teacher') {
                            app.model.course.get(_refId, (error, course) => {
                                if (error || !course) {
                                    res.send({ error: 'Invalid parameter!' });
                                } else {
                                    const _studentId = student._id,
                                        teacherGroups = course.teacherGroups.find(({ student }) => student.find(({ _id }) => _id == _studentId.toString()) != null),
                                        _teacherId = teacherGroups && teacherGroups.teacher && teacherGroups.teacher._id;
                                    condition._refId = _teacherId;
                                    app.model.feedback.getPage(pageNumber, pageSize, app.clone(condition, { user }), (error, page) => res.send({ error, page }));
                                }
                            });

                        }
                    }
                });
            } else app.model.feedback.getPage(pageNumber, pageSize, app.clone(condition, { user }), (error, page) => res.send({ error, page }));
        } catch (error) {
            res.send({ error: error.message });
        }
    });

    app.get('/api/feedback/lecturer/page/:pageNumber/:pageSize', app.permission.check('user:login'), (req, res) => { //mobile
        const pageNumber = parseInt(req.params.pageNumber),
            pageSize = parseInt(req.params.pageSize),
            condition = req.query.pageCondition || {};
            condition.user = req.session.user._id;
            app.model.feedback.getPage(pageNumber, pageSize, condition, (error, page) => res.send({ error, page }));
    });

    app.get('/api/feedback/student/:type', app.permission.check('user:login'), (req, res) => { //mobile
        const condition = { type: req.params.type, _refId: req.query._refId, user: req.session.user && req.session.user._id };
        app.model.feedback.getAll(condition, (error, items) => res.send({ error, items }));
    });

    // Hook permissionHooks -------------------------------------------------------------------------------------------
    app.permissionHooks.add('courseAdmin', 'feedback', (user) => new Promise(resolve => {
        app.permissionHooks.pushUserPermission(user, 'feedback:read', 'feedback:write');
        resolve();
    }));
};