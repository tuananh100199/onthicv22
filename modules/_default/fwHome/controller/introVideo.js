module.exports = app => {
    app.componentModel['introVideo'] = app.model.introVideo;

    app.get('/api/intro-video/page/:pageNumber/:pageSize', app.permission.check('component:read'), (req, res) => {
        const pageNumber = parseInt(req.params.pageNumber),
            pageSize = parseInt(req.params.pageSize);
        app.model.introVideo.getPage(pageNumber, pageSize, {}, (error, page) => {
            res.send({ error: error || page == null ? 'Content is not ready!' : null, page });
        });
    });

    app.get('/api/intro-video/all', app.permission.check('component:read'), (req, res) => {
        app.model.introVideo.getAll((error, list) => res.send({ error, list }));
    });

    app.get('/api/intro-video', (req, res) => {
        app.model.introVideo.get(req.query._id, (error, item) => res.send({ error, item }));
    });

    app.post('/api/intro-video', app.permission.check('component:write'), (req, res) => {
        app.model.introVideo.create(req.body.data, (error, item) => res.send({ error, item }));
    });

    app.put('/api/intro-video', app.permission.check('component:write'), (req, res) => {
        app.model.introVideo.update({ _id: req.body._id }, req.body.changes, (error, item) => res.send({ error, item }));
    });

    app.delete('/api/intro-video', app.permission.check('component:write'), (req, res) => {
        app.model.introVideo.delete(req.body._id, error => res.send({ error }));
    });

    // Home -----------------------------------------------------------------------------------------------------------------------------------------
    app.get('/intro-video/:_id', app.templates.home);

    app.get('/home/intro-video', (req, res) => {//mobile
        app.model.introVideo.get({ _id: req.query._id }, (error, item) => res.send({ error, item }));
    });

    // Hook upload images ---------------------------------------------------------------------------------------------------------------------------
    app.createFolder(app.path.join(app.publicPath, '/img/introVideo'));

    const uploadContent = (fields, files, done) => {
        if (fields.userData && fields.userData[0].startsWith('introVideo:') && files.IntroVideoImage && files.IntroVideoImage.length > 0) {
            console.log('Hook: uploadIntroVideo image => Intro video image upload');
            const _id = fields.userData[0].substring('introVideo:'.length);
            app.uploadImage('introVideo', app.model.introVideo.get, _id, files.IntroVideoImage[0].path, done);
        }
    };

    app.uploadHooks.add('uploadIntroVideoImage', (req, fields, files, params, done) =>
        app.permission.has(req, () => uploadContent(fields, files, done), done, 'component:write'));

};
