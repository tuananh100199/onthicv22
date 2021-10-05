module.exports = (app) => {
    app.permission.add({ name: 'feedback:read' }, { name: 'feedback:write' }, { name: 'feedback:delete' });
    app.permission.add({ name: 'user:login', menu: { parentMenu: { index: 3020, title: 'Phản hồi hệ thống', icon: '', link: '/user/feedback/system' } } });

    app.get('/user/feedback/system', app.permission.check('user:login'), app.templates.admin);

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
        app.model.feedback.create(app.clone(req.body.newData, { user: req.session.user && req.session.user._id }),
         (error, item) => res.send({ error, item }));
    });
    app.get('/home/feedback/:type', app.permission.check('user:login'), (req, res) => { //mobile
        const condition = { type: req.params.type, _refId: req.query._refId, user: req.session.user && req.session.user._id };
        app.model.feedback.getAll(condition, (error, items) => res.send({ error, items }));
    });
};