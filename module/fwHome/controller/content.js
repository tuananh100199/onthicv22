module.exports = app => {
    app.get('/content/item/:contentId', app.templates.home);

    app.get('/api/content/all', app.permission.check('component:read'), (req, res) =>
        app.model.content.getAll((error, items) => res.send({ error, items })));

    app.get('/api/content/item/:contentId', app.permission.check('component:read'), (req, res) =>
        app.model.content.get(req.params.contentId, (error, item) => res.send({ error, item })));

    app.post('/api/content', app.permission.check('component:write'), (req, res) =>
        app.model.content.create({ title: 'Title', active: 0 }, (error, item) => res.send({ error, item })));

    app.put('/api/content', app.permission.check('component:write'), (req, res) =>
        app.model.content.update({ _id: req.body._id }, req.body.changes, (error, item) => res.send({ error, item })));

    app.delete('/api/content', app.permission.check('component:write'), (req, res) =>
        app.model.content.delete(req.body._id, error => res.send({ error })));
    
    app.get('/home/content/item/:contentId', (req, res) =>
        app.model.content.get({ _id: req.params.contentId, active: true }, (error, item) => res.send({ error, item })));

    // Hook upload images ---------------------------------------------------------------------------------------------------------------------------s
    app.createFolder(app.path.join(app.publicPath, '/img/content'));

    app.uploadHooks.add('uploadContentCkEditor', (req, fields, files, params, done) =>
        app.permission.has(req, () => app.uploadCkEditorImage('content', fields, files, params, done), done, 'component:write'));
};
