module.exports = (app) => {
    app.permission.add({ name: 'feedback:read' }, { name: 'feedback:write' }, { name: 'feedback:delete' });
    app.permission.add({ name: 'feedback:read', menu: { parentMenu: { index: 3030, title: 'Phản hồi', icon: 'fa-comments-o', link: '/user/feedback/system' } } });

    app.get('/user/feedback/system', app.permission.check('feedback:read'), app.templates.admin);


    app.get('user/hoc-vien/phan-hoi/he-thong', app.permission.check('user:login'), app.templates.admin);

    app.get('/api/feedback/:type', app.permission.check('feedback:read'), (req, res) => { 
        const condition = { type: req.params.type, _refId: req.query._refId };
        app.model.feedback.getAll(condition, (error, items) => res.send({ error, items }));
    });

    app.put('/api/feedback', app.permission.check('feedback:write'), (req, res) => {
        const changes =req.body.changes;
        if(typeof changes === 'string'){
            const reply={
                content:changes,
                adminUser:req.session.user && req.session.user._id
            };
            app.model.feedback.addReply(req.body._id,reply, (error, item) => res.send({ error, item }));
        } else  app.model.feedback.update(req.body._id,changes, (error, item) => res.send({ error, item }));
    });

    app.post('/home/feedback', app.permission.check('user:login'), (req, res) => { //mobile
        app.model.student.get({ user: req.session.user._id, course: req.body.newData._refId }, (error, student) => {
            if (error) {
                res.send({ error });
            } else {
                app.model.feedback.create(app.clone(req.body.newData, { user: student.user._id }),
                (error, item) => res.send({ error, item }));
            }
        });
    });

    app.get('/home/feedback/:type', app.permission.check('user:login'), (req, res) => { //mobile
        const condition = { type: req.params.type, _refId: req.query._refId, user: req.session.user && req.session.user._id };
        app.model.feedback.getAll(condition, (error, items) => res.send({ error, items }));
    });

    // Hook permissionHooks -------------------------------------------------------------------------------------------
    app.permissionHooks.add('courseAdmin', 'feedback', (user) => new Promise(resolve => {
        app.permissionHooks.pushUserPermission(user, 'feedback:read','feedback:write');
        resolve();
    }));
};