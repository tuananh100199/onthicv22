module.exports = app => {
    app.get('/api/testimony/all', app.permission.check('component:read'), (req, res) =>
        app.model.testimony.getAll((error, items) => res.send({ error, items })));

    app.get('/api/testimony/item/:testimonyId', app.permission.check('component:read'), (req, res) =>
        app.model.testimony.get(req.params.testimonyId, (error, item) => res.send({ error, item })));

    app.post('/api/testimony', app.permission.check('component:write'), (req, res) =>
        app.model.testimony.create({ title: req.body.title }, (error, item) => res.send({ error, item })));

    app.put('/api/testimony', app.permission.check('component:write'), (req, res) =>
        app.model.testimony.update(req.body._id, req.body.changes, (error, item) => res.send({ error, item })));

    app.delete('/api/testimony', app.permission.check('component:write'), (req, res) => app.model.testimony.delete(req.body._id, error => res.send({ error })));


    // Home -----------------------------------------------------------------------------------------------------------------------------------------
    app.get('/home/testimony/:_id', (req, res) => app.model.testimony.get(req.params._id, (error, item) => res.send({ error, item })));


    // Hook upload images ---------------------------------------------------------------------------------------------------------------------------s
    app.createFolder(app.path.join(app.publicPath, '/img/testimony'));

    const uploadTestimony = (req, fields, files, params, done) => {
        if (fields.userData && fields.userData[0].startsWith('testimony:') && files.TestimonyImage && files.TestimonyImage.length > 0) {
            console.log('Hook: uploadTestimony => testimony image upload');
            app.uploadComponentImage(req, 'testimony', null, fields.userData[0].substring(10), files.TestimonyImage[0].path, done);
        }
    };
    app.uploadHooks.add('uploadTestimony', (req, fields, files, params, done) =>
        app.permission.has(req, () => uploadTestimony(req, fields, files, params, done), done, 'component:write'));
};