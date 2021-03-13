module.exports = app => {
    app.get('/api/slogan/all', app.permission.check('component:read'), (req, res) => app.model.slogan.getAll((error, items) => res.send({ error, items })));

    app.get('/api/slogan/item/:sloganId', app.permission.check('component:read'), (req, res) =>
        app.model.slogan.get(req.params.sloganId, (error, item) => res.send({ error, item })));

    app.post('/api/slogan', app.permission.check('component:write'), (req, res) =>
        app.model.slogan.create({ title: req.body.title }, (error, item) => res.send({ error, item })));

    app.put('/api/slogan', app.permission.check('component:write'), (req, res) => {
        const changes = req.body.changes;
        if (changes.items && changes.items == 'empty') changes.items = [];
        app.model.slogan.update(req.body._id, changes, (error, item) => res.send({ error, item }));
    });

    app.delete('/api/slogan', app.permission.check('component:write'), (req, res) => app.model.slogan.delete(req.body._id, error => res.send({ error })));


    // Home -----------------------------------------------------------------------------------------------------------------------------------------
    app.get('/home/slogan/:_id', (req, res) => app.model.slogan.get(req.params._id, (error, item) => res.send({ error, item })));


    // Hook upload images ---------------------------------------------------------------------------------------------------------------------------s
    // app.createFolder(app.path.join(app.publicPath, '/img/slogan'));

    const uploadSlogan = (req, fields, files, params, done) => {
        if (fields.userData && fields.userData[0] == 'Slogan' && files.SloganImage && files.SloganImage.length > 0) {
            console.log('Hook: uploadSlogan => slogan image upload');
            app.uploadImageToBase64(files.SloganImage[0].path, done);
        }
    };
    app.uploadHooks.add('uploadSlogan', (req, fields, files, params, done) =>
        app.permission.has(req, () => uploadSlogan(req, fields, files, params, done), done, 'component:write'));
};
