module.exports = app => {
    app.get('/content/:_id', app.templates.home);

    app.get('/api/content/page/:pageNumber/:pageSize', app.permission.check('component:read'), (req, res) => {
        const pageNumber = parseInt(req.params.pageNumber),
            pageSize = parseInt(req.params.pageSize);
        app.model.content.getPage(pageNumber, pageSize, {}, (error, page) => {
            res.send({ error: error || page == null ? 'Content list are not ready!' : null, page });
        });
    });

    app.get('/api/content/all', app.permission.check('component:read'), (req, res) => {
        app.model.content.getAll((error, list) => res.send({ error, list }));
    });

    app.get('/api/content', app.permission.check('component:read'), (req, res) => {
        app.model.content.get(req.query._id, (error, item) => res.send({ error, item }));
    });

    app.post('/api/content', app.permission.check('component:write'), (req, res) => {
        app.model.content.create({ title: 'Title', active: 0 }, (error, item) => res.send({ error, item }));
    });

    app.put('/api/content', app.permission.check('component:write'), (req, res) => {
        app.model.content.update({ _id: req.body._id }, req.body.changes, (error, item) => res.send({ error, item }));
    });

    app.delete('/api/content', app.permission.check('component:write'), (req, res) => {
        app.model.content.delete(req.body._id, error => res.send({ error }));
    });

    app.get('/home/content', (req, res) => {
        app.model.content.get({ _id: req.query._id, active: true }, (error, item) => res.send({ error, item }));
    });

    // Hook upload images ---------------------------------------------------------------------------------------------------------------------------s
    app.createFolder(app.path.join(app.publicPath, '/img/content'));

    const uploadContent = (req, fields, files, params, done) => {
        if (fields.userData && fields.userData[0].startsWith('content:') && files.ContentImage && files.ContentImage.length > 0) {
            console.log('Hook: uploadContent image => content image upload');
            app.uploadComponentImage(req, 'content', app.model.content.get, fields.userData[0].substring(8), files.ContentImage[0].path, done);
        }
    };

    app.uploadHooks.add('uploadContentImage', (req, fields, files, params, done) =>
        app.permission.has(req, () => uploadContent(req, fields, files, params, done), done, 'component:write'));

    app.uploadHooks.add('uploadContentCkEditor', (req, fields, files, params, done) =>
        app.permission.has(req, () => app.uploadCkEditorImage('content', fields, files, params, done), done, 'component:write'));
};
