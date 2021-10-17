module.exports = (app) => {
    app.permission.add({ name: 'rate:read' }, { name: 'rate:write' });

    app.put('/api/rate/student', app.permission.check('user:login'), (req, res) => {
        const changes =req.body.changes;
        app.model.rate.update(req.body._id,changes, (error, item) => res.send({ error, item }));
    });

    app.post('/api/rate/student', app.permission.check('user:login'), (req, res) => { //mobile
        app.model.rate.create(app.clone(req.body.newData, { user:req.session.user._id }),
         (error, item) => res.send({ error, item }));
    });
    app.get('/api/rate/student/:type', app.permission.check('user:login'), (req, res) => { //mobile
        const condition = { type: req.params.type, _refId: req.query._refId, user:req.session.user._id };
        app.model.rate.get(condition, (error, item) => res.send({ error, item }));
    });

    // Hook permissionHooks -------------------------------------------------------------------------------------------
    app.permissionHooks.add('lecturer', 'rate', (user) => new Promise(resolve => {
        app.permissionHooks.pushUserPermission(user, 'rate:read');
        resolve();
    }));
};