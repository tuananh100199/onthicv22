module.exports = app => {
    app.componentModel['loginForm'] = app.model.loginForm;

    app.get('/api/loginForm/page/:pageNumber/:pageSize', app.permission.check('component:read'), (req, res) => {
        const pageNumber = parseInt(req.params.pageNumber),
            pageSize = parseInt(req.params.pageSize);
        app.model.loginForm.getPage(pageNumber, pageSize, {}, (error, page) => {
            res.send({ error: error || page == null ? '.loginForm is not ready!' : null, page });
        });
    });

    app.get('/api/loginForm/all', app.permission.check('component:read'), (req, res) => {
        app.model.loginForm.getAll((error, list) => res.send({ error, list }));
    });

    app.get('/api/loginForm', (req, res) => {
        app.model.loginForm.get(req.query._id, (error, item) => res.send({ error, item }));
    });

    app.post('/api/loginForm', app.permission.check('component:write'), (req, res) => {
        app.model.loginForm.create(req.body.data, (error, item) => res.send({ error, item }));
    });

    app.put('/api/loginForm', app.permission.check('component:write'), (req, res) => {
        app.model.loginForm.update({ _id: req.body._id }, req.body.changes, (error, item) => res.send({ error, item }));
    });

    app.delete('/api/loginForm', app.permission.check('component:write'), (req, res) => {
        app.model.loginForm.delete(req.body._id, error => res.send({ error }));
    });

    // Home -----------------------------------------------------------------------------------------------------------------------------------------
    app.get('/loginForm/:_id', app.templates.home);

    app.get('/home/loginForm', (req, res) => {//mobile
        app.model.loginForm.get({ _id: req.query._id }, (error, item) => res.send({ error, item }));
    });

    // Hook upload images ---------------------------------------------------------------------------------------------------------------------------
    app.createFolder(app.path.join(app.publicPath, '/img/loginForm'));

    const uploadLoginForm = (fields, files, done) => {
        if (fields.userData && fields.userData[0].startsWith('loginForm:') && files.LoginFormImage && files.LoginFormImage.length > 0) {
            console.log('Hook: uploadLoginForm image => login form image upload');
            const _id = fields.userData[0].substring('loginForm:'.length);
            app.uploadImage('loginForm', app.model.loginForm.get, _id, files.LoginFormImage[0].path, done);
        }
    };

    app.uploadHooks.add('uploadLoginFormImage', (req, fields, files, params, done) =>
        app.permission.has(req, () => uploadLoginForm(fields, files, done), done, 'component:write'));

};
