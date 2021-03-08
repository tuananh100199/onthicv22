module.exports = app => {
    const menu = {
        parentMenu: app.parentMenu.setting,
        menus: {
            2110: { title: 'Cơ sở', link: '/user/address/all', icon: 'fa fa-university', backgroundColor: 'rgb(106, 90, 205)' }
        }
    };
    app.permission.add({ name: 'component:write', menu }, { name: 'component:read', menu });

    app.get('/user/address/all', app.permission.check('component:read'), app.templates.admin);
    app.get('/user/address/edit/:id', app.permission.check('component:read'), app.templates.admin);

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
    app.delete('/api/address', app.permission.check('component:write'), (req, res) => app.model.address.delete(req.body._id, error => res.send({ error })));
    //Home
    app.get('/address/all', (req, res) => app.model.address.getAll((error, items) => res.send({ error, items: items.filter(i => i.active === true) })));
    // Hook upload images ---------------------------------------------------------------------------------------------------------------------------s

    app.createFolder(app.path.join(app.publicPath, '/img/address'));

    const uploadAddress = (req, fields, files, params, done) => {
        if (fields.userData && fields.userData[0].startsWith('address:') && files.AddressImage && files.AddressImage.length > 0) {
            console.log('Hook: uploadAddress => address image upload');
            app.uploadComponentImage(req, 'address', app.model.address.get, fields.userData[0].substring(8), files.AddressImage[0].path, done);
        }
    };
    app.uploadHooks.add('uploadAddress', (req, fields, files, params, done) =>
        app.permission.has(req, () => uploadAddress(req, fields, files, params, done), done, 'component:write'));
};
