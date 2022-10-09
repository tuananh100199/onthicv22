module.exports = (app) => {
    const menu = {
        parentMenu: app.parentMenu.communication,
        menus: {
            3103: { title: 'Quy định pháp luật', link: '/user/law' },
        }
    };

    app.permission.add(
        { name: 'law:read', menu },
        { name: 'law:write' },
        { name: 'law:delete' },
    );

    app.get('/user/law', app.permission.check('law:read'), app.templates.admin);
    app.get('/user/law/:_id', app.permission.check('law:read'), app.templates.admin);
    app.get('/law', app.templates.home);
    app.get('/law/:_id', app.templates.home);

    // APIs ------------------------------------------------------------------------------------------------------------
    app.get('/api/law/page/:pageNumber/:pageSize', app.permission.check('law:read'), (req, res) => {
        const pageNumber = parseInt(req.params.pageNumber),
            pageSize = parseInt(req.params.pageSize),
            condition = req.params.condition?req.params.condition:{};
        app.model.law.getPage(pageNumber, pageSize, condition, (error, page) => {
            res.send({ page, error });
        });
    });

    app.get('/api/law/all', app.permission.check('law:read'), (req, res) => {
        app.model.law.getAll((error, list) => res.send({ error, list }));
    });

    app.get('/api/law', app.permission.check('law:read'), (req, res) => {
        app.model.law.get(req.query._id, (error, item) => res.send({ error, item }));
    });

    app.post('/api/law', app.permission.check('law:write'), (req, res) => {
        app.model.law.create(req.body.data, (error, item) => res.send({ error, item }));
    });

    app.put('/api/law', app.permission.check('law:write'), (req, res) => {
        const { _id, changes } = req.body;
        app.model.law.update(_id, changes, (error, item) => res.send({ error, item }));
    });

    app.put('/api/law/swap', app.permission.check('law:write'), (req, res) => {
        const isMoveUp = req.body.isMoveUp.toString() == 'true';
        app.model.law.swapPriority(req.body._id, isMoveUp, (error) => res.send({ error }));
    });

    app.delete('/api/law', app.permission.check('law:delete'), (req, res) => {
        const { _id } = req.body;
        app.model.law.delete(_id, (error) => res.send({ error }));
    });

    app.get('/api/home/law/page/:pageNumber/:pageSize', (req, res) => {
        const pageNumber = parseInt(req.params.pageNumber),
            pageSize = parseInt(req.params.pageSize),
            condition ={};
            condition.active=true;
        app.model.law.getPage(pageNumber, pageSize, condition, (error, page) => {
            res.send({ page, error });
        });
    });

    app.get('/home/law/item', (req, res) => {
        const { _id } = req.query;
        app.model.law.get({ _id, active: true }, (error, item) => res.send({item,error}));
    });


    // Hook upload images ---------------------------------------------------------------------------------------------------------------------------s
    app.createFolder(app.path.join(app.publicPath, '/img/law'));

    app.uploadHooks.add('uploadLawCkEditor', (req, fields, files, params, done) => {
        app.permission.has(req, () => app.uploadCkEditorImage('law', fields, files, params, done), done, 'law:write');
    });

    const uploadLawImg = (fields, files, done) => {
        if (fields.userData && fields.userData[0].startsWith('law:') && files.LawImage && files.LawImage.length > 0) {
            console.log('Hook: uploadLaw => law image upload');
            const _id = fields.userData[0].substring('law:'.length);
            app.uploadImage('law', app.model.law.get, _id, files.LawImage[0].path, done);
        }
    };
    app.uploadHooks.add('uploadLawImg', (req, fields, files, params, done) =>
        app.permission.has(req, () => uploadLawImg(fields, files, done), done, 'law:write'));

    
};