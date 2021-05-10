module.exports = app => {
    const menu = {
        parentMenu: app.parentMenu.trainning,
        menus: {
            4003: { title: 'Danh mục biển báo', link: '/user/sign/category' },
            4004: { title: 'Biển báo', link: '/user/sign' },
        },
    };
    app.permission.add({ name: 'sign:read', menu }, { name: 'sign:write' }, { name: 'sign:delete' });

    app.get('/user/sign/category', app.permission.check('category:read'), app.templates.admin);
    app.get('/user/sign', app.permission.check('sign:read'), app.templates.admin);

    // APIs -----------------------------------------------------------------------------------------------------------
    app.get('/api/sign/all', app.permission.check('sign:read'), (req, res) => {
        const condition = {},
            searchText = req.query.searchText;
        if (searchText) {
            condition.title = new RegExp(searchText, 'i');
        }
        app.model.sign.getAll(condition, (error, list) => res.send({ error, list }));
    });

    app.get('/api/sign/page/:pageNumber/:pageSize', (req, res) => {
        const pageNumber = parseInt(req.params.pageNumber),
            pageSize = parseInt(req.params.pageSize),
            { searchText, categories } = req.query,
            pageCondition = {};
        if (categories) {
            pageCondition.categories = [categories];
        }
        if (searchText) {
            pageCondition.title = new RegExp(searchText, 'i');
        }
        app.model.sign.getPage(pageNumber, pageSize, pageCondition, (error, page) => res.send({ error, page }));
    });

    app.get('/api/sign', app.permission.check('sign:read'), (req, res) => {
        app.model.sign.get(req.query._id, (error, item) => res.send({ error, item }));
    });

    app.post('/api/sign', app.permission.check('sign:write'), (req, res) => {
        app.model.sign.create(req.body.data, (error, item) => {
            if (error || item == null || item.image == null) {
                res.send({ error, item });
            } else {
                app.uploadImage('sign', app.model.sign.get, item._id, item.image, data => res.send(data));
            }
        });
    });

    app.put('/api/sign', app.permission.check('sign:write'), (req, res) => {
        app.model.sign.update(req.body._id, req.body.changes, (error, item) => res.send({ error, item }));
    });

    app.put('/api/sign/swap', app.permission.check('sign:write'), (req, res) => {
        const isMoveUp = req.body.isMoveUp.toString() == 'true';
        app.model.sign.swapPriority(req.body._id, isMoveUp, (error) => res.send({ error }));
    });

    app.delete('/api/sign', app.permission.check('sign:delete'), (req, res) => {
        app.model.sign.delete(req.body._id, error => res.send({ error }));
    });

    app.delete('/api/sign/image', app.permission.check('sign:write'), (req, res) => {
        app.model.sign.get(req.body._id, (error, item) => {
            if (item) {
                app.deleteImage(item.image);
                item.image = null;
                item.save(error => res.send({ error }));
            } else {
                res.send({ error: error || 'Id không hợp lệ!' });
            }
        });
    });

    // Hook upload images ---------------------------------------------------------------------------------------------
    app.createFolder(app.path.join(app.publicPath, '/img/sign'), app.path.join(app.publicPath, '/img/signCategory'));

    const uploadSign = (fields, files, done) => {
        if (fields.userData && fields.userData[0].startsWith('sign:') && files.SignImage && files.SignImage.length > 0) {
            console.log('Hook: uploadSign => sign image upload');
            const _id = fields.userData[0].substring('sign:'.length);
            app.uploadImage('sign', app.model.sign.get, _id, files.SignImage[0].path, done);
        }
    };
    app.uploadHooks.add('uploadSign', (req, fields, files, params, done) =>
        app.permission.has(req, () => uploadSign(fields, files, done), done, 'sign:write'));
};
