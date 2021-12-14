module.exports = app => {
    app.componentModel['gioi thieu'] = app.model.gioiThieu;
    app.get('/user/gioi-thieu/:_id', app.permission.check('component:write'), app.templates.admin);
    app.get('/api/gioi-thieu/page/:pageNumber/:pageSize', app.permission.check('component:read'), (req, res) => {
        const pageNumber = parseInt(req.params.pageNumber),
            pageSize = parseInt(req.params.pageSize);
        app.model.gioiThieu.getPage(pageNumber, pageSize, {}, (error, page) => {
            res.send({ error: error || page == null ? 'Content is not ready!' : null, page });
        });
    });

    app.get('/api/gioi-thieu/all', app.permission.check('component:read'), (req, res) => {
        app.model.gioiThieu.getAll((error, list) => res.send({ error, list }));
    });

    app.get('/api/gioi-thieu', (req, res) => {
        app.model.gioiThieu.get(req.query._id, (error, item) => res.send({ error, item }));
    });

    app.post('/api/gioi-thieu', app.permission.check('component:write'), (req, res) => {
        app.model.gioiThieu.create(req.body.data, (error, item) => res.send({ error, item }));
    });

    app.put('/api/gioi-thieu', app.permission.check('component:write'), (req, res) => {
        app.model.gioiThieu.update({ _id: req.body._id }, req.body.changes, (error, item) => res.send({ error, item }));
    });

    app.delete('/api/gioi-thieu', app.permission.check('component:write'), (req, res) => {
        app.model.gioiThieu.delete(req.body._id, error => res.send({ error }));
    });

    // Home -----------------------------------------------------------------------------------------------------------------------------------------
    app.get('/gioi-thieu/:_id', app.templates.home);

    app.get('/home/gioi-thieu', (req, res) => {//mobile
        app.model.gioiThieu.get({ _id: req.query._id }, (error, item) => res.send({ error, item }));
    });

    // Hook upload images ---------------------------------------------------------------------------------------------------------------------------
    app.createFolder(app.path.join(app.publicPath, '/img/gioi-thieu1'));
    app.createFolder(app.path.join(app.publicPath, '/img/gioi-thieu2'));
    app.createFolder(app.path.join(app.publicPath, '/img/gioi-thieu3'));

    const uploadGioiThieu1 = (fields, files, done) => {
        if (fields.userData && fields.userData[0].startsWith('gioi-thieu1:') && files.GioiThieuImage1 && files.GioiThieuImage1.length > 0) {
            console.log('Hook: uploadGioiThieu image => gioi thieu image upload');
            const _id = fields.userData[0].substring('gioi-thieu1:'.length);
            app.uploadImage('gioi-thieu1', app.model.gioiThieu.get, _id, files.GioiThieuImage1[0].path, done);
        }
    };

    const uploadGioiThieu2 = (fields, files, done) => {
        if (fields.userData && fields.userData[0].startsWith('gioi-thieu2:') && files.GioiThieuImage2 && files.GioiThieuImage2.length > 0) {
            console.log('Hook: uploadGioiThieu image => gioi thieu image upload');
            const _id = fields.userData[0].substring('gioi-thieu2:'.length);
            app.uploadImage('gioi-thieu2', app.model.gioiThieu.get, _id, files.GioiThieuImage2[0].path, done);
        }
    };

    const uploadGioiThieu3 = (fields, files, done) => {
        if (fields.userData && fields.userData[0].startsWith('gioi-thieu3:') && files.GioiThieuImage3 && files.GioiThieuImage3.length > 0) {
            console.log('Hook: uploadGioiThieu image => gioi thieu image upload');
            const _id = fields.userData[0].substring('gioi-thieu3:'.length);
            app.uploadImage('gioi-thieu3', app.model.gioiThieu.get, _id, files.GioiThieuImage3[0].path, done);
        }
    };

    app.uploadHooks.add('uploadGioiThieu1Image', (req, fields, files, params, done) =>
        app.permission.has(req, () => uploadGioiThieu1(fields, files, done), done, 'component:write'));

    app.uploadHooks.add('uploadGioiThieu2Image', (req, fields, files, params, done) =>
        app.permission.has(req, () => uploadGioiThieu2(fields, files, done), done, 'component:write'));

    app.uploadHooks.add('uploadGioiThieu3Image', (req, fields, files, params, done) =>
        app.permission.has(req, () => uploadGioiThieu3(fields, files, done), done, 'component:write'));

    app.uploadHooks.add('uploadGioiThieuCkEditor', (req, fields, files, params, done) =>
        app.permission.has(req, () => app.uploadCkEditorImage('gioi-thieu', fields, files, params, done), done, 'component:write'));
};
