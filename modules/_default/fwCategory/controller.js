module.exports = app => {
    app.permission.add({ name: 'category:read' }, { name: 'category:write' }, { name: 'category:delete' });

    // APIs -----------------------------------------------------------------------------------------------------------------------------------------
    app.get('/api/category/:type', (req, res) => { //mobile
        const condition = { type: req.params.type },
            searchText = req.query.searchText,
            active = req.query.active;
        if (searchText) condition.title = new RegExp(searchText, 'i');
        if (active) condition.active = active == 'true';
        app.model.category.getAll(condition, (error, items) => res.send({ error, items }));
    });

    app.post('/api/category', app.permission.check('category:write'), (req, res) => {
        app.model.category.create(req.body.data, (error, item) => {
            if (error || item == null || item.image == null) {
                res.send({ error, item });
            } else {
                app.uploadImage(item.type + 'Category', app.model.category.get, item._id, item.image, data => res.send(data));
            }
        });
    });

    app.put('/api/category', app.permission.check('category:write'), (req, res) => {
        app.model.category.update(req.body._id, req.body.changes, (error, item) => res.send({ error, item }));
    });

    app.put('/api/category/swap', app.permission.check('category:write'), (req, res) => {
        const isMoveUp = req.body.isMoveUp.toString() == 'true';
        app.model.category.swapPriority(req.body._id, isMoveUp, error => res.send({ error }));
    });

    app.delete('/api/category', app.permission.check('category:write'), (req, res) => {
        app.model.category.delete(req.body._id, error => res.send({ error }));
    });

    // Hook upload images ---------------------------------------------------------------------------------------------------------------------------
    app.createFolder(app.path.join(app.publicPath, '/img/category'),
        app.path.join(app.publicPath, '/img/newsCategory'), app.path.join(app.publicPath, '/img/forumCategory'),
        app.path.join(app.publicPath, '/img/driveQuestionCategory'), app.path.join(app.publicPath, '/img/signCategory'),
        app.path.join(app.publicPath, '/img/carCategory')
    );

    const uploadCategoryImage = (fields, files, done) => {
        if (fields.userData && fields.userData[0].startsWith('newsCategoryImage:') && files.CategoryImage && files.CategoryImage.length > 0) {
            console.log('Hook: uploadCategoryImage => news');
            const _id = fields.userData[0].substring('newsCategoryImage:'.length);
            app.uploadImage('newsCategory', app.model.category.get, _id, files.CategoryImage[0].path, done);
        } else if (fields.userData && fields.userData[0].startsWith('driveQuestionCategoryImage:') && files.CategoryImage && files.CategoryImage.length > 0) {
            console.log('Hook: uploadCategoryImage => drive-question');
            const _id = fields.userData[0].substring('driveQuestionCategoryImage:'.length);
            app.uploadImage('driveQuestionCategory', app.model.category.get, _id, files.CategoryImage[0].path, done);
        } else if (fields.userData && fields.userData[0].startsWith('signCategoryImage:') && files.CategoryImage && files.CategoryImage.length > 0) {
            console.log('Hook: uploadCategoryImage => sign');
            const _id = fields.userData[0].substring('signCategoryImage:'.length);
            app.uploadImage('signCategory', app.model.category.get, _id, files.CategoryImage[0].path, done);
        } else if (fields.userData && fields.userData[0].startsWith('forumCategoryImage:') && files.CategoryImage && files.CategoryImage.length > 0) {
            console.log('Hook: uploadCategoryImage => forum');
            const _id = fields.userData[0].substring('forumCategoryImage:'.length);
            app.uploadImage('forumCategory', app.model.category.get, _id, files.CategoryImage[0].path, done);
        } else if (fields.userData && fields.userData[0].startsWith('carCategoryImage:') && files.CategoryImage && files.CategoryImage.length > 0) {
            console.log('Hook: uploadCategoryImage => car');
            const _id = fields.userData[0].substring('carCategoryImage:'.length);
            app.uploadImage('carCategory', app.model.category.get, _id, files.CategoryImage[0].path, done);
        }
    };

    app.uploadHooks.add('uploadCategoryImage', (req, fields, files, params, done) =>
        app.permission.has(req, () => uploadCategoryImage(fields, files, done), done, 'category:write'));
};
