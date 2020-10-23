module.exports = app => {
    app.get('/api/list-video/all', app.permission.check('component:read'), (req, res) =>
        app.model.listVideo.getAll((error, items) => res.send({ error, items })));

    app.get('/api/list-video/item/:listVideoId', app.permission.check('component:read'), (req, res) =>
        app.model.listVideo.get(req.params.listVideoId, (error, item) => res.send({ error, item })));

    app.post('/api/list-video', app.permission.check('component:write'), (req, res) =>
        app.model.listVideo.create({ title: req.body.title, description: req.body.description, image: req.body.image, items: [] }, (error, item) => res.send({ error, item })));

    app.put('/api/list-video', app.permission.check('component:write'), (req, res) => {
        const changes = req.body.changes;
        if (changes.items && changes.items == 'empty') changes.items = [];
        app.model.listVideo.update(req.body._id, changes, (error, item) => res.send({ error, item }));
    });

    app.delete('/api/list-video', app.permission.check('component:write'), (req, res) => app.model.listVideo.delete(req.body._id, error => res.send({ error })));


    // Home -----------------------------------------------------------------------------------------------------------------------------------------
    app.get('/home/list-video/:_id', (req, res) =>
        app.model.listVideo.get(req.params._id, (error, item) => res.send({ error, item })));


    // Hook upload images ---------------------------------------------------------------------------------------------------------------------------s
    app.createFolder(app.path.join(app.publicPath, '/img/list-video'));

    const uploadListVideo = (req, fields, files, params, done) => {
        if (fields.userData && fields.userData[0].startsWith('list-video:') && files.StatisticImage && files.StatisticImage.length > 0) {
            console.log('Hook: uploadListVideo => list-video image upload');
            app.uploadComponentImage(req, 'list-video', app.model.listVideo.get, fields.userData[0].substring(10), files.StatisticImage[0].path, done);
        }
    };
    app.uploadHooks.add('uploadStatistic', (req, fields, files, params, done) =>
        app.permission.has(req, () => uploadStatistic(req, fields, files, params, done), done, 'component:write'));
};