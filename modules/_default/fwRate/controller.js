module.exports = (app) => {
    app.permission.add({ name: 'rate:read' }, { name: 'rate:write' });

    // app.get('/api/rate/:type', app.permission.check('rate:read'), (req, res) => { 
    //     const condition = { type: req.params.type, _refId: req.query._refId };
    //     app.model.rate.getAll(condition, (error, items) => res.send({ error, items }));
    // });

    // app.put('/api/rate', app.permission.check('rate:write'), (req, res) => {
    //     const changes =req.body.changes;
    //     if(typeof changes === 'string'){
    //         const reply={
    //             content:changes,
    //             adminUser:req.session.user && req.session.user._id
    //         };
    //         app.model.rate.addReply(req.body._id,reply, (error, item) => res.send({ error, item }));
    //     } else  app.model.rate.update(req.body._id,changes, (error, item) => res.send({ error, item }));
    // });

    app.post('/home/rate', app.permission.check('user:login'), (req, res) => { //mobile
        app.model.rate.create(app.clone(req.body.newData, { user: req.session.user && req.session.user._id }),
         (error, item) => res.send({ error, item }));
    });
    app.get('/home/rate/:type', app.permission.check('user:login'), (req, res) => { //mobile
        const condition = { type: req.params.type, _refId: req.query._refId, user: req.session.user && req.session.user._id };
        app.model.rate.get(condition, (error, item) => res.send({ error, item }));
    });

    // Hook permissionHooks -------------------------------------------------------------------------------------------
    app.permissionHooks.add('lecturer', 'rate', (user) => new Promise(resolve => {
        app.permissionHooks.pushUserPermission(user, 'rate:read');
        resolve();
    }));
};