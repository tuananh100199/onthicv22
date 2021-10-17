module.exports = (app) => {
    app.permission.add({ name: 'feedback:read' }, { name: 'feedback:write' }, { name: 'feedback:delete' });
    app.permission.add({ name: 'feedback:read', menu: { parentMenu: { index: 3030, title: 'Phản hồi', icon: 'fa-comments-o', link: '/user/feedback/system' } } });

    app.get('/user/feedback/system', app.permission.check('feedback:read'), app.templates.admin);
    app.get('/user/feedback', app.permission.check('user:login'), app.templates.admin);

    app.get('/api/feedback/:type', app.permission.check('feedback:read'), (req, res) => {
        const condition = { type: req.params.type, _refId: req.query._refId };
        app.model.feedback.getAll(condition, (error, items) => res.send({ error, items }));
    });

    app.put('/api/feedback', app.permission.check('feedback:write'), (req, res) => {
        const changes = req.body.changes;
        if (typeof changes === 'string') {
            const reply = {
                content: changes,
                adminUser: req.session.user && req.session.user._id
            };
            app.model.feedback.addReply(req.body._id, reply, (error, item) => res.send({ error, item }));
        } else app.model.feedback.update(req.body._id, changes, (error, item) => res.send({ error, item }));
    });

    app.post('/api/feedback/student', app.permission.check('user:login'), (req, res) => { //mobile
        app.model.student.get({ user: req.session.user._id, course: req.body.newData._refId }, (error, student) => {
            if (error) {
                res.send({ error });
            } else {
                app.model.feedback.create(app.clone(req.body.newData, { user: student.user._id }),
                    (error, item) => res.send({ error, item }));
            }
        });
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
            condition = req.query.pageCondition || {};
        try {
            app.model.student.get({ user: req.session.user._id, course: condition._refId }, (error, student) => {
                if (error) {
                    res.send({ error: 'Bạn không thể phản hồi khóa học không phải của bạn!' });
                } else {
                    app.model.feedback.getPage(pageNumber, pageSize, app.clone(condition, { user: student.user._id}), (error, page) => res.send({ error, page }));
                }
            });
        } catch (error) {
            res.send({ error });
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