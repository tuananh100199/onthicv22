module.exports = (app) => {
    app.permission.add({ name: 'feedback:read' }, { name: 'feedback:write' }, { name: 'feedback:delete' });
    // APIs -----------------------------------------------------------------------------------------------------------------------------------------
    app.get('/api/feedback/:type', app.permission.check('feedback:read'), (req, res) => { //mobile
        const condition = { type: req.params.type, _refId: req.query._id, user: req.session.user && req.session.user._id };
        app.model.feedback.getAll(condition, (error, items) => res.send({ error, items }));
    });

    app.post('/api/feedback', app.permission.check('feedback:write'), (req, res) => {
        app.model.feedback.create(app.clone(req.body.newData, { user: req.session.user && req.session.user._id }),
         (error, item) => res.send({ error, item }));
    });
};