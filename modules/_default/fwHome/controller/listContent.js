module.exports = app => {
    app.get('/api/list-content/page/:pageNumber/:pageSize', app.permission.check('component:read'), (req, res) => {
        const pageNumber = parseInt(req.params.pageNumber),
            pageSize = parseInt(req.params.pageSize);
        app.model.listContent.getPage(pageNumber, pageSize, {}, (error, page) => {
            res.send({ error: error || page == null ? 'Content list are not ready!' : null, page });
        });
    });

    app.get('/api/list-content/all', app.permission.check('component:read'), (req, res) => {
        app.model.listContent.getAll((error, list) => { res.send({ error, list }) });
    });

    app.get('/api/list-content', app.permission.check('component:read'), (req, res) => {
        app.model.listContent.get(req.query._id, (error, item) => res.send({ error, item }));
    });

    app.post('/api/list-content', app.permission.check('component:write'), (req, res) => {
        app.model.listContent.create(req.body.newData, (error, item) => res.send({ error, item }))
    });

    app.put('/api/list-content', app.permission.check('component:write'), (req, res) => {
        const $set = req.body.changes;
        if ($set && $set.items && $set.items === 'empty') $set.items = [];
        app.model.listContent.update(req.body._id, $set, (error, item) => res.send({ error, item }))
    });

    app.delete('/api/list-content', app.permission.check('component:delete'), (req, res) => {
        app.model.listContent.delete(req.body._id, error => res.send({ error }));
    });

    app.get('/home/list-content', (req, res) => {
        app.model.listContent.get(req.query._id, (error, item) => res.send({ error, item }));
    });

    // Hook upload images ---------------------------------------------------------------------------------------------------------------------------s
    app.createFolder(app.path.join(app.publicPath, '/img/listContent'));
    const uploadListContent = (req, fields, files, params, done) => {
        if (fields.userData && fields.userData[0].startsWith('listContent:') && files.ListContentImage && files.ListContentImage.length > 0) {
            console.log('Hook: uploadListContent image => content list image upload');
            app.uploadComponentImage(req, 'listContent', app.model.listContent.get, fields.userData[0].substring('listContent:'.length), files.ListContentImage[0].path, done);
        }
    };

    app.uploadHooks.add('uploadListContent', (req, fields, files, params, done) =>
        app.permission.has(req, () => uploadListContent(req, fields, files, params, done), done, 'component:write'));
};