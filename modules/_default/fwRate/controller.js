module.exports = (app) => {
    app.permission.add({ name: 'rate:read' }, { name: 'rate:write' });

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
                        const _teacherIds = course.teacherGroups.map(item => item.teacher && item.teacher._id);
                        if (_teacherIds) {
                            condition._refId = { $in: _teacherIds };
                            delete condition._courseId;
                            app.model.rate.getPage(pageNumber, pageSize, condition, (error, page) => {
                                new Promise((resolve, reject) => {
                                    if (error) {
                                        reject(error);
                                    } else {
                                        let count = 0;
                                        const list = [...page.list];
                                        page.list = [];
                                        list.forEach(item => {
                                            app.model.user.get(item._refId, (error, user) => {
                                                if (error) {
                                                    res.send({ error });
                                                } else {
                                                    item = app.clone(item, { _refId: user });
                                                    page.list.push(item);
                                                    count++;
                                                    if (count == list.length) {
                                                        resolve(page);
                                                    }
                                                }
                                            });
                                        });
                                    }
                                }).then((page) => {
                                    res.send({ page });
                                }).catch(error => res.send(error));
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
        const ObjectId = require('mongodb').ObjectID;
        const listStudentId = [];
        if (sessionUser.isCourseAdmin) {
            app.model.student.getAll({ course: req.query.courseId }, (error, item) => {
                if (error) {
                    res.send({ error });
                } else {
                    item.forEach(student => listStudentId.push(student.user._id));
                    const objId = listStudentId.map(id => ObjectId(id));
                    const condition = { type: 'lesson', _refId: { $in: listRefId }, user: { $in: objId } };
                    app.model.rate.getAll(condition, (error, item) => {
                        res.send({ error, item });
                    });
                }
            });
        } else {
            app.model.course.get(req.query.courseId, (error, item) => {
                if (error || !item) {
                    res.send({ error });
                } else {
                    const listStudent = item.teacherGroups.filter(teacherGroup => teacherGroup.teacher && teacherGroup.teacher._id == sessionUser._id);
                    listStudent.length && listStudent[0].student.map(student => listStudentId.push(student.user._id));
                    const objId = listStudentId.map(id => ObjectId(id));
                    const condition = {
                        type: 'lesson', _refId: { $in: listRefId }, user: { $in: objId }
                    };
                    app.model.rate.getAll(condition, (error, item) => {
                        res.send({ error, item });
                    });
                }
            });
        }

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