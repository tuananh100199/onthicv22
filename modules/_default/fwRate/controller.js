module.exports = (app) => {
    app.permission.add({ name: 'rate:read' }, { name: 'rate:write' });

    app.get('/api/rate/admin/page/:pageNumber/:pageSize', (req, res) => {
        const pageNumber = parseInt(req.params.pageNumber),
            pageSize = parseInt(req.params.pageSize),
            pageCondition = req.query.pageCondition || {};
        if (pageCondition._refId) {
            app.model.user.get({ _id: pageCondition._refId }, (error, user) => {
                if (error || !user) {
                    res.send({ error: 'Lấy thông tin giáo viên bị lỗi!'});
                } else {
                    app.model.rate.getPage(pageNumber, pageSize, pageCondition, (error, page) => {
                        page = app.clone(page);
                        page.lecturer = user;
                        res.send({ error, page });
                    });
                }
            });
        }
    });

    app.get('/api/rate/page/:pageNumber/:pageSize', app.permission.check('rate:read'), (req, res) => {
        const pageNumber = parseInt(req.params.pageNumber),
            pageSize = parseInt(req.params.pageSize),
            condition = req.query.pageCondition || {};
        try {
            if (condition.type == 'teacher')
                app.model.course.get(condition._courseId, (error, course) => {
                    if (error || !course) {
                        res.send({ error: 'Invalid parameter!' });
                    } else {
                        const _teachers = course.teacherGroups.map(({ teacher }) => teacher),
                            _teacherIds = _teachers.map(({ _id }) => _id);
                        if (_teacherIds) {
                            condition._refId = { $in: _teacherIds };
                            delete condition._courseId;
                            app.model.rate.getPage(pageNumber, pageSize, condition, (error, page) => {
                                if (error) {
                                    res.send({ error });
                                } else {
                                    const list = app.clone(page.list);
                                    page.list = list.map(item => app.clone(item, { _refId: _teachers.find(({ _id }) => item._refId == _id.toString()) }));
                                    res.send({ page });
                                }
                            });
                        }
                    }
                });
        } catch (error) {
            res.send({ error });
        }
    });

    app.put('/api/rate/student', app.permission.check('user:login'), (req, res) => {
        const changes = req.body.changes;
        app.model.rate.update(req.body._id, changes, (error, item) => res.send({ error, item }));
    });

    app.post('/api/rate/student', app.permission.check('user:login'), (req, res) => { //mobile
        app.model.rate.create(app.clone(req.body.newData, { user: req.session.user._id }),
            (error, item) => res.send({ error, item }));
    });
    app.get('/api/rate/student/:type', app.permission.check('user:login'), (req, res) => { //mobile
        const condition = { type: req.params.type, _refId: req.query._refId, user: req.session.user._id };
        app.model.rate.get(condition, (error, item) => res.send({ error, item }));
    });

    app.get('/api/rate/student', app.permission.check('rate:read'), (req, res) => {
        const sessionUser = req.session.user,
            listRefId = req.query.listRefId;
        if (listRefId) {
            const condition = { type: 'lesson', _refId: { $in: listRefId } };
            if (sessionUser.isCourseAdmin) {
                app.model.student.getAll({ course: req.query.courseId }, (error, item) => {
                    if (error) {
                        res.send({ error });
                    } else {
                        if (item && item.length) {
                            condition.user = { $in: item.map(item => item.user._id) };
                        }
                        app.model.rate.getAll(condition, (error, item) => res.send({ error, item }));
                    }
                });
            } else {
                app.model.course.get(req.query.courseId, (error, item) => {
                    if (error || !item) {
                        res.send({ error });
                    } else {
                        const listStudent = item.teacherGroups.filter(teacherGroup => teacherGroup.teacher && teacherGroup.teacher._id == sessionUser._id);
                        if (listStudent.length) {
                            condition.user = { $in: listStudent[0].student.map(student => student.user._id) };
                        }
                        app.model.rate.getAll(condition, (error, item) => res.send({ error, item }));
                    }
                });
            }
        } else {
            res.send({ item: [] });
        }
    });

    app.get('/api/rate/lesson/page/:pageNumber/:pageSize', app.permission.check('rate:read'), (req, res) => {
        const pageNumber = parseInt(req.params.pageNumber),
            pageSize = parseInt(req.params.pageSize),
            condition = req.query.pageCondition || {};
        app.model.rate.getPage(pageNumber, pageSize, condition, (error, page) => {
            res.send({ error, page });
        });
    });

    // Hook permissionHooks -------------------------------------------------------------------------------------------
    app.permissionHooks.add('courseAdmin', 'rate', (user) => new Promise(resolve => {
        app.permissionHooks.pushUserPermission(user, 'rate:read');
        resolve();
    }));
    app.permissionHooks.add('lecturer', 'rate', (user) => new Promise(resolve => {
        app.permissionHooks.pushUserPermission(user, 'rate:read');
        resolve();
    }));
};