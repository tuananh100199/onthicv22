module.exports = app => {
    const menu = {
        parentMenu: app.parentMenu.trainning,
        menus: {
            4005: { title: 'Cơ sở đào tạo', link: '/user/division', icon: 'fa fa-university', backgroundColor: 'rgb(106, 90, 205)' }
        }
    };
    app.permission.add(
        { name: 'division:read', menu },
        { name: 'division:write' },
        { name: 'division:delete' }
    );

    app.get('/user/division', app.permission.check('division:read'), app.templates.admin);
    app.get('/user/division/edit/:id', app.permission.check('division:write'), app.templates.admin);

    // APIs -----------------------------------------------------------------------------------------------------------
    app.get('/api/division/all', app.permission.check('division:read'), (req, res) => {
        const condition = {},
            searchText = req.query.searchText;
        if (searchText) {
            condition.title = new RegExp(searchText, 'i');
        }
        app.model.division.getAll(condition, (error, list) => res.send({ error, list }));
    });

    app.get('/api/division', app.permission.check('division:read'), (req, res) =>
        app.model.division.get(req.query._id, (error, item) => res.send({ error, item })));

    app.post('/api/division', app.permission.check('division:write'), (req, res) => {
        app.model.division.create(req.body.newData, (error, item) => res.send({ error, item }));
    });

    app.put('/api/division', app.permission.check('division:write'), (req, res) => {
        app.model.division.update(req.body._id, req.body.changes, (error, item) => res.send({ error, item }));
    });

    app.delete('/api/division', app.permission.check('division:write'), (req, res) => {
        app.model.division.delete(req.body._id, error => res.send({ error }));
    });

    // Home -----------------------------------------------------------------------------------------------------------
    app.get('/home/division/all', (req, res) => {
        app.model.division.getAll((error, list) => res.send({ error, list }));
    });

    // Hook upload images ---------------------------------------------------------------------------------------------
    app.createFolder(app.path.join(app.publicPath, '/img/division'));

    const uploadDivision = (req, fields, files, params, done) => {
        if (fields.userData && fields.userData[0].startsWith('division:') && files.DivisionImage && files.DivisionImage.length > 0) {
            console.log('Hook: uploadDivision => division image upload');
            app.uploadComponentImage(req, 'division', app.model.division.get, fields.userData[0].substring('division:'.length), files.DivisionImage[0].path, done);
        }
    };
    app.uploadHooks.add('uploadDivision', (req, fields, files, params, done) =>
        app.permission.has(req, () => uploadDivision(req, fields, files, params, done), done, 'division:write'));
};