module.exports = app => {
    app.get('/api/statistic-dang-ky-tu-van/all', app.permission.check('component:read'), (req, res) =>
        app.model.dangKyTuVan.getAll((error, items) => res.send({ error, items })));

    app.get('/api/statistic-dang-ky-tu-van/item/:statisticDangKyTuVanId', app.permission.check('component:read'), (req, res) =>
        app.model.dangKyTuVan.get(req.params.dangKyTuVanDangKyTuVanId, (error, item) => res.send({ error, item })));

    app.post('/api/statistic-dang-ky-tu-van', app.permission.check('component:write'), (req, res) =>
        app.model.dangKyTuVan.create({ title: req.body.title, description: req.body.description, image: req.body.image, items: [] }, (error, item) => res.send({ error, item })));

    app.put('/api/statistic-dang-ky-tu-van', app.permission.check('component:write'), (req, res) => {
        const changes = req.body.changes;
        if (changes.items && changes.items == 'empty') changes.items = [];
        app.model.dangKyTuVan.update(req.body._id, changes, (error, item) => res.send({ error, item }));
    });

    app.delete('/api/statistic-dang-ky-tu-van', app.permission.check('component:write'), (req, res) => app.model.dangKyTuVan.delete(req.body._id, error => res.send({ error })));


    // Home -----------------------------------------------------------------------------------------------------------------------------------------
    app.get('/home/statistic-dang-ky-tu-van/:_id', (req, res) =>
        app.model.dangKyTuVan.get(req.params._id, (error, item) => res.send({ error, item })));


    // Hook upload images ---------------------------------------------------------------------------------------------------------------------------s
    app.createFolder(app.path.join(app.publicPath, '/img/statistic-dang-ky-tu-van'));

    const uploadStatistic = (req, fields, files, params, done) => {
        if (fields.userData && fields.userData[0].startsWith('statistic:') && files.dangKyTuVanImage && files.dangKyTuVanImage.length > 0) {
            console.log('Hook: uploadStatistic => statistic image upload');
            app.uploadComponentImage(req, 'statistic', app.model.dangKyTuVan.get, fields.userData[0].substring(10), files.dangKyTuVanImage[0].path, done);
        }
    };
    app.uploadHooks.add('uploadStatistic', (req, fields, files, params, done) =>
        app.permission.has(req, () => uploadStatistic(req, fields, files, params, done), done, 'component:write'));
};
