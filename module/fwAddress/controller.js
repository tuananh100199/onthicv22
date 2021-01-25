module.exports = app => {
    app.get('/api/address/all', app.permission.check('component:read'), (req, res) => {
        app.model.address.getAll((error, items) => {
            res.send({ error, items })
        })
    });

    app.get('/api/address/item/:addressId', app.permission.check('component:read'), (req, res) =>
        app.model.address.get(req.params.addressId, (error, item) => res.send({ error, item })));

    app.post('/api/address', app.permission.check('component:write'), (req, res) => {
        app.model.address.create(req.body.newData, (error, item) => res.send({ error, item }))
    });

    app.put('/api/address', app.permission.check('component:write'), (req, res) => {
        app.model.address.update(req.body._id, req.body.changes, (error, item) => res.send({ error, item }))
    });

    app.put('/api/address/swap', app.permission.check('component:write'), (req, res) => {
        const isMoveUp = req.body.isMoveUp.toString() == 'true';
        app.model.address.swapPriority(req.body._id, isMoveUp, (error) =>
            res.send({ error })
        );
    });

    app.delete('/api/address', app.permission.check('component:write'), (req, res) => app.model.address.delete(req.body._id, error => res.send({ error })));

    // Hook upload images ---------------------------------------------------------------------------------------------------------------------------s

    app.createFolder(app.path.join(app.publicPath, '/img/address'));

    const uploadAddress = (req, fields, files, params, done) => {
        if (fields.userData && fields.userData[0].startsWith('address:') && files.AddressImage && files.AddressImage.length > 0) {
            console.log('Hook: uploadVideo => video image upload');
            app.uploadComponentImage(req, 'address', app.model.address.get, fields.userData[0].substring(8), files.AddressImage[0].path, done);
        }
    };
    app.uploadHooks.add('uploadAddress', (req, fields, files, params, done) =>
        app.permission.has(req, () => uploadAddress(req, fields, files, params, done), done, 'component:write'));
};
