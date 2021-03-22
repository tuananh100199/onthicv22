module.exports = app => {
    app.get('/api/statistic/all', app.permission.check('component:read'), (req, res) =>
        app.model.statistic.getAll((error, items) => res.send({ error, items })));

    app.get('/api/statistic/item/:statisticId', app.permission.check('component:read'), (req, res) =>
        app.model.statistic.get(req.params.statisticId, (error, item) => res.send({ error, item })));

    app.post('/api/statistic', app.permission.check('component:write'), (req, res) =>
        app.model.statistic.create(req.body.newData, (error, item) => res.send({ error, item })));

    app.put('/api/statistic', app.permission.check('component:write'), (req, res) => {
        const changes = req.body.changes;
        if (changes.items && changes.items == 'empty') changes.items = [];
        app.model.statistic.update(req.body._id, changes, (error, item) => res.send({ error, item }));
    });

    app.delete('/api/statistic', app.permission.check('component:write'), (req, res) => app.model.statistic.delete(req.body._id, error => res.send({ error })));


    // Home -----------------------------------------------------------------------------------------------------------------------------------------
    app.get('/home/statistic/:_id', (req, res) =>
        app.model.statistic.get(req.params._id, (error, item) => res.send({ error, item })));


    // Hook upload images ---------------------------------------------------------------------------------------------------------------------------s
    app.createFolder(app.path.join(app.publicPath, '/img/statistic'));

    const uploadStatistic = (req, fields, files, params, done) => {
        if (fields.userData && fields.userData[0].startsWith('statistic:') && files.StatisticImage && files.StatisticImage.length > 0) {
            console.log('Hook: uploadStatistic => statistic image upload');
            app.uploadComponentImage(req, 'statistic', app.model.statistic.get, fields.userData[0].substring(10), files.StatisticImage[0].path, done);
        }
    };
    app.uploadHooks.add('uploadStatistic', (req, fields, files, params, done) =>
        app.permission.has(req, () => uploadStatistic(req, fields, files, params, done), done, 'component:write'));
};
