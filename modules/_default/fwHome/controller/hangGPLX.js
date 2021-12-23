module.exports = app => {
    app.componentModel['hang GPLX'] = app.model.hangGPLX;
    app.get('/user/hang-gplx/:_id', app.permission.check('component:write'), app.templates.admin);
    app.get('/api/hang-gplx/page/:pageNumber/:pageSize', app.permission.check('component:read'), (req, res) => {
        const pageNumber = parseInt(req.params.pageNumber),
            pageSize = parseInt(req.params.pageSize);
            console.log('herre123');
            console.log('pageNumber', pageNumber);
            console.log('pageSize', pageSize);

        app.model.hangGPLX.getPage(pageNumber, pageSize, {}, (error, page) => {
            console.log('page', page);
            res.send({ error: error || page == null ? 'Content is not ready!' : null, page });
        });
    });

    app.get('/api/hang-gplx/all', app.permission.check('component:read'), (req, res) => {
        app.model.hangGPLX.getAll((error, list) => res.send({ error, list }));
    });

    app.get('/api/hang-gplx', (req, res) => {
        app.model.hangGPLX.get(req.query._id, (error, item) => res.send({ error, item }));
    });

    app.post('/api/hang-gplx', app.permission.check('component:write'), (req, res) => {
        app.model.hangGPLX.create(req.body.data, (error, item) => res.send({ error, item }));
    });

    app.put('/api/hang-gplx', app.permission.check('component:write'), (req, res) => {
        app.model.hangGPLX.update({ _id: req.body._id }, req.body.changes, (error, item) => res.send({ error, item }));
    });

    app.delete('/api/hang-gplx', app.permission.check('component:write'), (req, res) => {
        app.model.hangGPLX.delete(req.body._id, error => res.send({ error }));
    });

    // Home -----------------------------------------------------------------------------------------------------------------------------------------
    app.get('/hang-gplx/:_id', app.templates.home);

    app.get('/home/hang-gplx', (req, res) => {//mobile
        app.model.hangGPLX.get({ _id: req.query._id }, (error, item) => res.send({ error, item }));
    });

    // Hook upload images ---------------------------------------------------------------------------------------------------------------------------
    app.createFolder(app.path.join(app.publicPath, '/img/hang1'));
    app.createFolder(app.path.join(app.publicPath, '/img/hang2'));
    app.createFolder(app.path.join(app.publicPath, '/img/hang3'));

    const uploadHangGPLX1 = (fields, files, done) => {
        if (fields.userData && fields.userData[0].startsWith('hang1:') && files.HangGPLXImage1 && files.HangGPLXImage1.length > 0) {
            console.log('Hook: uploadHangGPLX image => hang 1 image upload');
            const _id = fields.userData[0].substring('hang1:'.length);
            app.uploadImage('hang1', app.model.hangGPLX.get, _id, files.HangGPLXImage1[0].path, done);
        }
    };

    const uploadHangGPLX2 = (fields, files, done) => {
        if (fields.userData && fields.userData[0].startsWith('hang2:') && files.HangGPLXImage2 && files.HangGPLXImage2.length > 0) {
            console.log('Hook: uploadHangGPLX image => hang 2 image upload');
            const _id = fields.userData[0].substring('hang2:'.length);
            app.uploadImage('hang2', app.model.hangGPLX.get, _id, files.HangGPLXImage2[0].path, done);
        }
    };

    const uploadHangGPLX3 = (fields, files, done) => {
        if (fields.userData && fields.userData[0].startsWith('hang3:') && files.HangGPLXImage3 && files.HangGPLXImage3.length > 0) {
            console.log('Hook: uploadHangGPLX image => hang 3 image upload');
            const _id = fields.userData[0].substring('hang3:'.length);
            app.uploadImage('hang3', app.model.hangGPLX.get, _id, files.HangGPLXImage3[0].path, done);
        }
    };

    app.uploadHooks.add('uploadHangGPLX1Image', (req, fields, files, params, done) =>
        app.permission.has(req, () => uploadHangGPLX1(fields, files, done), done, 'component:write'));

    app.uploadHooks.add('uploadHangGPLX2Image', (req, fields, files, params, done) =>
        app.permission.has(req, () => uploadHangGPLX2(fields, files, done), done, 'component:write'));

    app.uploadHooks.add('uploadHangGPLX3Image', (req, fields, files, params, done) =>
        app.permission.has(req, () => uploadHangGPLX3(fields, files, done), done, 'component:write'));

    app.uploadHooks.add('uploadHangGPLXCkEditor', (req, fields, files, params, done) =>
        app.permission.has(req, () => app.uploadCkEditorImage('hang', fields, files, params, done), done, 'component:write'));
};
