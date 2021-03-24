module.exports = app => {
    app.get('/api/video/all', app.permission.check('component:read'), (req, res) => {
        const condition = req.query.condition || {};
        app.model.video.getAll(condition, (error, list) => res.send({ error, list }))
    });

    app.get('/api/video/page/:pageNumber/:pageSize', app.permission.check('component:read'), (req, res) => {
        const pageNumber = parseInt(req.params.pageNumber),
            pageSize = parseInt(req.params.pageSize),
            condition = req.query.condition || { listVideoId: { $exists: false } };
        app.model.video.getPage(pageNumber, pageSize, condition, (error, page) => res.send({ error, page }));
    });

    app.post('/api/video', app.permission.check('component:write'), (req, res) => app.model.video.create(req.body.data, (error, video) => {
        if (video && req.session.videoImage) {
            app.uploadComponentImage(req, 'video', app.model.video.get, video._id, req.session.videoImage, response => {
                res.send({ error: response.error, video });
            });
        } else {
            res.send({ error, video });
        }
    }));

    app.put('/api/video', app.permission.check('component:write'), (req, res) => {
        let data = req.body.changes,
            changes = {};
        if (data.title && data.title != '') changes.title = data.title;
        if (data.link && data.link != '') changes.link = data.link;
        if (data.image && data.image != '') changes.image = data.image;
        if (data.content && data.content != '') changes.content = data.content;

        app.model.video.update(req.body._id, changes, (error, video) => res.send({ error, video }));
    });

    app.put('/api/video/item/swap', app.permission.check('component:write'), (req, res) => {
        const isMoveUp = req.body.isMoveUp.toString() == 'true';
        app.model.video.swapPriority(req.body._id, isMoveUp, (error, item1, item2) => res.send({ error, item1, item2 }));
    });

    app.delete('/api/video', app.permission.check('component:write'), (req, res) => app.model.video.delete(req.body._id, error => res.send({ error })));


    // Home -----------------------------------------------------------------------------------------------------------------------------------------
    app.get('/home/video/item/:_id', (req, res) => app.model.video.get(req.params._id, (error, item) => res.send({ error, item })));

    app.get('/home/video/all', (req, res) => {
        const condition = req.query.condition || {};
        app.model.video.getAll(condition, (error, items) => res.send({ error, items }))
    });


    // Hook upload images ---------------------------------------------------------------------------------------------------------------------------s
    app.createFolder(app.path.join(app.publicPath, '/img/video'));

    const uploadVideo = (req, fields, files, params, done) => {
        if (fields.userData && fields.userData[0].startsWith('video:') && files.VideoImage && files.VideoImage.length > 0) {
            console.log('Hook: uploadVideo => video image upload');
            app.uploadComponentImage(req, 'video', app.model.video.get, fields.userData[0].substring(6), files.VideoImage[0].path, done);
        }
    };
    app.uploadHooks.add('uploadVideo', (req, fields, files, params, done) =>
        app.permission.has(req, () => uploadVideo(req, fields, files, params, done), done, 'component:write'));
};