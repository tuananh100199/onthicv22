module.exports = app => {
    app.permission.add(
        { name: 'category:read' },
        { name: 'category:write' },
    );

    // APIs -----------------------------------------------------------------------------------------------------------------------------------------
    app.get('/api/category/:type', app.permission.check('category:read'), (req, res) =>
        app.model.category.getAll({ type: req.params.type }, (error, items) => res.send({ error, items })));

    app.post('/api/category', app.permission.check('category:write'), (req, res) => app.model.category.create(req.body.data, (error, item) => {
        const categoryType = item.type + 'CategoryImage';
        if (item && req.session[categoryType]) {
            app.adminUploadImage(item.type + 'Category', app.model.category.get, item._id, req.session[categoryType], req, res);
        } else {
            res.send({ error, item });
        }
    }));

    app.put('/api/category', app.permission.check('category:write'), (req, res) =>
        app.model.category.update(req.body._id, req.body.changes, (error, item) => res.send({ error, item })));

    app.put('/api/category/swap', app.permission.check('category:write'), (req, res) => {
        const isMoveUp = req.body.isMoveUp.toString() == 'true';
        app.model.category.swapPriority(req.body._id, isMoveUp, error => res.send({ error }));
    });

    app.delete('/api/category', app.permission.check('category:write'), (req, res) => app.model.category.delete(req.body._id, error => res.send({ error })));


    // Hook upload images ---------------------------------------------------------------------------------------------------------------------------
    app.createFolder(app.path.join(app.publicPath, '/img/category'));

    const uploadCategoryImage = (req, fields, files, params, done) => {
        if (fields.userData && fields.userData[0].startsWith('eventCategoryImage:') && files.CategoryImage && files.CategoryImage.length > 0) {
            console.log('Hook: uploadCategoryImage => event');
            app.uploadComponentImage(req, 'category', app.model.category.get, fields.userData[0].substring(19), files.CategoryImage[0].path, done);
        }
    };
    app.uploadHooks.add('uploadCategoryImage', (req, fields, files, params, done) =>
        app.permission.has(req, () => uploadCategoryImage(req, fields, files, params, done), done, 'category:write'));
};
