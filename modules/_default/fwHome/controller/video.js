module.exports = app => {
    app.componentModel['video'] = app.model.video;

    app.get('/api/video/page/:pageNumber/:pageSize', app.permission.check('component:read'), (req, res) => {
        const pageNumber = parseInt(req.params.pageNumber),
            pageSize = parseInt(req.params.pageSize);
        app.model.video.getPage(pageNumber, pageSize, {}, (error, page) => res.send({ error, page }));
    });

    app.get('/api/video/all', app.permission.check('component:read'), (req, res) => {
        const condition = req.query.condition || {};
        app.model.video.getAll(condition, (error, list) => res.send({ error, list }))
    });

    app.get('/api/video', app.permission.check('component:read'), (req, res) => {
        app.model.video.get(req.query._id, (error, item) => res.send({ error, item }));
    });

    app.post('/api/video', app.permission.check('component:write'), (req, res) => {
        app.model.video.create(req.body.data, (error, item) => {
            if (error || (item && item.image == null)) {
                res.send({ error, item });
            } else {
                app.uploadImage('video', app.model.video.get, item._id, item.image, data => res.send(data));
            }
        });
    });

    app.put('/api/video', app.permission.check('component:write'), (req, res) => {
        app.model.video.update(req.body._id, req.body.changes, (error, item) => res.send({ error, item }));
    });

    app.delete('/api/video', app.permission.check('component:write'), (req, res) => app.model.video.delete(req.body._id, error => res.send({ error })));


    // Home -----------------------------------------------------------------------------------------------------------------------------------------
    app.get('/home/video/', (req, res) => app.model.video.get({ _id: req.query._id }, (error, item) => res.send({ error, item })));

    app.get('/home/video/all', (req, res) => {
        const condition = req.query.condition || {};
        app.model.video.getAll(condition, (error, items) => res.send({ error, items }))
    });


    // Hook upload images ---------------------------------------------------------------------------------------------------------------------------s
    app.createFolder(app.path.join(app.publicPath, '/img/video'));

    const uploadVideo = (fields, files, done) => {
        if (fields.userData && fields.userData[0].startsWith('video:') && files.VideoImage && files.VideoImage.length > 0) {
            console.log('Hook: uploadVideo => video image upload');
            const _id = fields.userData[0].substring('video:'.length);
            app.uploadImage('video', app.model.video.get, _id, files.VideoImage[0].path, done);
        }
    };
    app.uploadHooks.add('uploadVideo', (req, fields, files, params, done) =>
        app.permission.has(req, () => uploadVideo(fields, files, done), done, 'component:write'));
};