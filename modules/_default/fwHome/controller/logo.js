module.exports = app => {
    app.get('/api/logo/all', app.permission.check('component:read'), (req, res) =>
        app.model.logo.getAll((error, items) => res.send({ error, items })));

    app.get('/api/logo/item/:logoId', app.permission.check('component:read'), (req, res) =>
        app.model.logo.get(req.params.logoId, (error, item) => res.send({ error, item })));

    app.post('/api/logo', app.permission.check('component:write'), (req, res) =>
        app.model.logo.create({ title: req.body.title, items: [] }, (error, item) => res.send({ error, item })));

    app.put('/api/logo', app.permission.check('component:write'), (req, res) =>
        app.model.logo.update(req.body._id, req.body.changes, (error, item) => res.send({ error, item })));

    app.delete('/api/logo', app.permission.check('component:write'), (req, res) => app.model.logo.delete(req.body._id, error => res.send({ error })));


    // Home -----------------------------------------------------------------------------------------------------------------------------------------
    app.get('/home/logo/:_id', (req, res) => app.model.logo.get(req.params._id, (error, item) => res.send({ error, item })));


    // Hook upload images ---------------------------------------------------------------------------------------------------------------------------s
    // app.createFolder(app.path.join(app.publicPath, '/img/logo'));

    const uploadLogoImage = (req, fields, files, params, done) => {
        if (fields.userData && fields.userData[0] == 'Logo' && files.LogoImage && files.LogoImage.length > 0) {
            console.log('Hook: uploadLogoImage => Logo image upload');
            app.uploadImageToBase64(files.LogoImage[0].path, done);
        }
    };
    app.uploadHooks.add('uploadLogoImage', (req, fields, files, params, done) =>
        app.permission.has(req, () => uploadLogoImage(req, fields, files, params, done), done, 'component:write'));
};