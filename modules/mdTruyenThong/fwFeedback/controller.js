module.exports = (app) => {
    app.permission.add({ name: 'feedback:read' }, { name: 'feedback:write' }, { name: 'feedback:delete' });
    app.permission.add({ name: 'feedback:read', menu: { parentMenu: { index: 3030, title: 'Phản hồi', icon: 'fa-comments-o', link: '/user/feedback/system' } } });

    app.get('/user/feedback/system', app.permission.check('feedback:read'), app.templates.admin);
    app.get('/user/feedback/system/:_id', app.permission.check('feedback:read'), app.templates.admin);
    app.get('/user/feedback', app.permission.check('user:login'), app.templates.admin);

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
                                const teacherGroups = course.teacherGroups.find(({ student }) => student.find(({ _id }) => _id == user) != null),
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

    app.get('/api/feedback/page/:pageNumber/:pageSize', app.permission.check('feedback:read'), (req, res) => {
        let pageNumber = parseInt(req.params.pageNumber),
            pageSize = parseInt(req.params.pageSize),
            condition = req.query.pageCondition || {};
        try {
            app.model.feedback.getPage(pageNumber, pageSize, condition, (error, page) => res.send({ error, page }));
        } catch (error) {
            res.send({ error });
        }
    });

    app.get('/api/feedback/student/page/:pageNumber/:pageSize', app.permission.check('user:login'), (req, res) => { //mobile
        let pageNumber = parseInt(req.params.pageNumber),
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
                                    const teacherGroups = course.teacherGroups.find(({ student }) => student.find(({ _id }) => _id == user) != null),
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