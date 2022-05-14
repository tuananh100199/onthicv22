module.exports = app => {
    app.componentModel['viPham'] = app.model.viPham;

    app.get('/api/viPham/page/:pageNumber/:pageSize', app.permission.check('component:read'), (req, res) => {
        const pageNumber = parseInt(req.params.pageNumber),
            pageSize = parseInt(req.params.pageSize);
        app.model.viPham.getPage(pageNumber, pageSize, {}, (error, page) => res.send({ error, page }));
    });

    app.get('/api/viPham/all', app.permission.check('component:read'), (req, res) => {
        const condition = req.query.condition || {};
        app.model.viPham.getAll(condition, (error, list) => res.send({ error, list }));
    });

    app.get('/api/viPham', app.permission.check('component:read'), (req, res) => {
        app.model.viPham.get(req.query._id, (error, item) => res.send({ error, item }));
    });

    app.post('/api/viPham', app.permission.check('component:write'), (req, res) => {
        app.model.viPham.create(req.body.data, (error, item) => {
            if (error || (item && item.image == null)) {
                res.send({ error, item });
            } else {
                app.uploadImage('viPham', app.model.viPham.get, item._id, item.image, data => res.send(data));
            }
        });
    });

    app.put('/api/viPham', app.permission.check('component:write'), (req, res) => {
        app.model.viPham.update(req.body._id, req.body.changes, (error, item) => res.send({ error, item }));
    });

    app.delete('/api/viPham', app.permission.check('component:write'), (req, res) => app.model.viPham.delete(req.body._id, error => res.send({ error })));


    // Home -----------------------------------------------------------------------------------------------------------------------------------------
    app.get('/home/viPham/', (req, res) => app.model.viPham.get({ _id: req.query._id }, (error, item) => res.send({ error, item })));

    app.get('/home/viPham/all', (req, res) => {
        const condition = req.query.condition || {};
        app.model.viPham.getAll(condition, (error, items) => res.send({ error, items }));
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