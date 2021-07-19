module.exports = (app) => {
    app.permission.add({ name: 'feedback:read' }, { name: 'feedback:write' }, { name: 'feedback:delete' });
    // Student APIs ---------------------------------------------------------------------------------------------------
    // APIs -----------------------------------------------------------------------------------------------------------------------------------------
    app.get('/api/feedback/:type', (req, res) => { //mobile
        const condition = { type: req.params.type, _refId: req.query._id, user: req.session.user._id };
        app.model.feedback.getAll(condition, (error, items) => res.send({ error, items }));
    });

    app.post('/api/category', app.permission.check('feedback:write'), (req, res) => {
        app.model.feedback.create(req.body.data, (error, item) => {
            if (error || item == null || item.image == null) {
                res.send({ error, item });
            } else {
                app.uploadImage(item.type + 'Category', app.model.category.get, item._id, item.image, data => res.send(data));
            }
        });
    });
};