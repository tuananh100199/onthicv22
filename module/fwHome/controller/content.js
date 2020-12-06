module.exports = app => {
    app.get('/api/content/all', app.permission.check('component:read'), (req, res) => {
        const condition = req.query.condition || {};
        app.model.content.getAll(condition, (error, items) => res.send({ error, items }))
    });

    app.get('/api/content/item/:contentId', app.permission.check('component:read'), (req, res) =>
        app.model.content.get(req.params.contentId, (error, item) => res.send({ error, item })));

    app.post('/api/content', app.permission.check('component:write'), (req, res) =>
        app.model.content.create({ title: 'Bài viết', active: false },
            (error, item) => res.send({ error, item })
        ));

    app.put('/api/content', app.permission.check('component:write'), (req, res) =>
        app.model.content.update(req.body._id, req.body.changes, (error, item) => res.send({ error, item })));
    app.put('/api/content/swap', app.permission.check('component:write'), (req, res) => {
        const isMoveUp = req.body.isMoveUp.toString() == 'true';
        app.model.content.swapPriority(req.body._id, isMoveUp, (error) =>
            res.send({ error }));
    });
    app.delete('/api/content', app.permission.check('component:write'), (req, res) =>
        app.model.content.delete(req.body._id, error => res.send({ error })));

    // Hook upload images ---------------------------------------------------------------------------------------------------------------------------s
    app.createFolder(app.path.join(app.publicPath, '/img/content'));

    app.uploadHooks.add('uploadContentCkEditor', (req, fields, files, params, done) =>
        app.permission.has(req, () => app.uploadCkEditorImage('content', fields, files, params, done), done, 'component:write'));

    const uploadContentAvatar = (req, fields, files, params, done) => {
        if (
            fields.userData &&
            fields.userData[0].startsWith('content:') &&
            files.ContentImage &&
            files.ContentImage.length > 0
        ) {
            console.log('Hook: uploadContentAvatar => content image upload');
            app.uploadComponentImage(
                req,
                'content',
                app.model.content.get,
                fields.userData[0].substring(8),
                files.ContentImage[0].path,
                done
            );
        }
    };
    app.uploadHooks.add('uploadContentAvatar', (req, fields, files, params, done) =>
        app.permission.has(
            req,
            () => uploadContentAvatar(req, fields, files, params, done),
            done,
            'component:write'
        )
    );
};