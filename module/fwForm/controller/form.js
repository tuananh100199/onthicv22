module.exports = app => {
    const menu = { parentMenu: { index: 9900, title: 'Form', link: '/user/form/list', icon: 'fa-file-text-o' }, };
    app.permission.add(
        { name: 'form:read', menu },
        { name: 'form:write', menu }
    );

    app.get('/user/form/list', app.permission.check('form:read'), app.templates.admin);
    app.get('/user/form/edit/:_id', app.permission.check('form:read'), app.templates.admin);
    app.get('/user/form/registration/:_id', app.permission.check('form:read'), app.templates.admin);
    app.get('/form/registration/item/:id', app.templates.home);

    //APIs --------------------------------------------------------------------------------------------------------------
    //Form --------------------------------------------------------------------------------------------------------------
    app.get('/api/form/page/:pageNumber/:pageSize', app.permission.check('form:read'), (req, res) => {
        const pageNumber = parseInt(req.params.pageNumber),
            pageSize = parseInt(req.params.pageSize),
            pageCondition = req.query.pageCondition ? req.query.pageCondition : {};
        app.model.form.getPage(pageNumber, pageSize, pageCondition, (error, page) => {
            if (error || page == null) {
                res.send({ error: 'Danh sách form không sẵn sàng!' });
            } else {
                res.send({ page });
            }
        });
    });

    app.get('/api/form/item/:id', app.permission.check('form:read'), (req, res) => {
        app.model.form.get(req.params.id, req.query.option ? req.query.option : {}, (error, item) => res.send({ error, item }));
    });

    app.post('/api/form', app.permission.check('form:write'), (req, res) => app.model.form.create(req.body.data, (error, item) => {
        res.send({ error, item })
    }));

    app.put('/api/form', app.permission.check('form:write'), (req, res) => {
        const $set = req.body.changes, $unset = {};
        if ($set && $set.questions && $set.questions === 'empty') $set.questions = [];
        if ($set.startRegister && $set.startRegister == 'empty') {
            $unset.startRegister = '';
            delete $set.startRegister;
        }
        if ($set.stopRegister && $set.stopRegister == 'empty') {
            $unset.stopRegister = '';
            delete $set.stopRegister;
        }
        app.model.form.update(req.body._id, $set, $unset, (error, item) => res.send({ error, item }));
    });

    app.delete('/api/form', app.permission.check('form:write'), (req, res) => app.model.form.delete(req.body._id, error => res.send({ error })));

    app.get('/form/item/:id', (req, res) => {
        const condition = {
            _id: req.params.id,
            active: true,
            lock: false
        };
        const option = {
            select: '-lock -active',
            populate: true
        };
        app.model.form.get(condition, option, (error, item) => res.send({ error, item }));
    });
    //End form ---------------------------------------------------------------------------------------------------------

    //Question ---------------------------------------------------------------------------------------------------------
    app.get('/api/questions/:formId', (req, res) => {
        const formId = req.params.formId;
        app.model.form.get(formId, { select: '_id questions', populate: true }, (error, item) => {
            res.send({ error, item });
        });
    });

    app.post('/api/question/:_id', app.permission.check('form:write'), (req, res) => {
        const _id = req.params._id, data = req.body.data;
        app.model.question.create(data, (error, question) => {
            if (error || !question) {
                res.send({ error });
            } else {
                app.model.form.pushQuestion({ _id }, question._id, (error, item) => {
                    res.send({ error, item });
                });
            }
        });
    });

    app.put('/api/question', app.permission.check('form:write'), (req, res) => {
        const _id = req.body._id, data = req.body.data;
        app.model.question.update(_id, data, (error, question) => {
            res.send({ error, question });
        });
    });

    app.put('/api/question/swap', app.permission.check('form:write'), (req, res) => {
        const data = req.body.data, formId = req.body.formId;
        app.model.form.update(formId, data, (error, item) => {
            res.send({ error, item });
        });
    });

    app.delete('/api/question', app.permission.check('form:write'), (req, res) => {
        const { data, formId, _id } = req.body;
        if (data.questions && data.questions == 'empty') data.questions = [];
        app.model.form.update(formId, data, (error, _) => {
            if (error) {
                res.send({ error });
            } else {
                app.model.question.delete(_id, error => res.send({ error }));
            }
        });
    });
    //End question -----------------------------------------------------------------------------------------------------


    // Hook upload images ----------------------------------------------------------------------------------------------
    app.createFolder(
        app.path.join(app.publicPath, '/img/form'),
    );

    const uploadFormCkEditor = (req, fields, files, params, done) => {
        if (files.upload && files.upload.length > 0 && fields.ckCsrfToken && params.Type == 'File' && params.category == 'form') {
            console.log('Hook: uploadFormCkEditor => ckEditor upload');

            const srcPath = files.upload[0].path;
            app.jimp.read(srcPath).then(image => {
                app.fs.unlinkSync(srcPath);

                if (image) {
                    if (image.bitmap.width > 1024) image.resize(1024, app.jimp.AUTO);
                    const url = '/img/form/' + app.path.basename(srcPath);
                    image.write(app.path.join(app.publicPath, url), error => {
                        done({ uploaded: error == null, url, error: { message: error ? 'Upload has errors!' : '' } });
                    });
                } else {
                    done({ uploaded: false, error: 'Upload has errors!' });
                }
            });
        } else {
            done();
        }
    };
    app.uploadHooks.add('uploadFormCkEditor', (req, fields, files, params, done) =>
        app.permission.has(req, () => uploadFormCkEditor(req, fields, files, params, done), done, 'form:write'));

    const uploadFormImage = (req, fields, files, params, done) => {
        if (fields.userData && fields.userData[0].startsWith('form:') && files.FormImage && files.FormImage.length > 0) {
            console.log('Hook: uploadFormImage => form image upload');
            app.uploadComponentImage(req, 'form', app.model.form.get, fields.userData[0].substring(5), files.FormImage[0].path, done);
        }
    };
    app.uploadHooks.add('uploadFormImage', (req, fields, files, params, done) =>
        app.permission.has(req, () => uploadFormImage(req, fields, files, params, done), done, 'form:write'));
};
