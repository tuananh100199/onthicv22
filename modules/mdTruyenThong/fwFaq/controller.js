module.exports = (app) => {
    const menu = {
        parentMenu: app.parentMenu.communication,
        menus: {
            3100: { title: 'Câu hỏi thường gặp', link: '/user/faq' },
        }
    };

    app.permission.add(
        { name: 'faq:read', menu },
        { name: 'faq:write' },
        { name: 'faq:delete' },
    );

    app.get('/user/faq', app.permission.check('faq:read'), app.templates.admin);
    app.get('/user/faq/:_id', app.permission.check('faq:read'), app.templates.admin);
    app.get('/faq', app.templates.home);

    // APIs ------------------------------------------------------------------------------------------------------------
    app.get('/api/faq/page/:pageNumber/:pageSize', app.permission.check('faq:read'), (req, res) => {
        const pageNumber = parseInt(req.params.pageNumber),
            pageSize = parseInt(req.params.pageSize),
            condition = req.params.condition?req.params.condition:{};
        app.model.faq.getPage(pageNumber, pageSize, condition, (error, page) => {
            res.send({ page, error });
        });
    });

    app.get('/api/faq/all', app.permission.check('faq:read'), (req, res) => {
        app.model.faq.getAll((error, list) => res.send({ error, list }));
    });

    app.get('/api/faq', app.permission.check('faq:read'), (req, res) => {
        app.model.faq.get(req.query._id, (error, item) => res.send({ error, item }));
    });

    app.post('/api/faq', app.permission.check('faq:write'), (req, res) => {
        app.model.faq.create(req.body.data, (error, item) => res.send({ error, item }));
    });

    app.put('/api/faq', app.permission.check('faq:write'), (req, res) => {
        const { _id, changes } = req.body;
        app.model.faq.update(_id, changes, (error, item) => res.send({ error, item }));
    });

    app.put('/api/faq/swap', app.permission.check('faq:write'), (req, res) => {
        const isMoveUp = req.body.isMoveUp.toString() == 'true';
        app.model.faq.swapPriority(req.body._id, isMoveUp, (error) => res.send({ error }));
    });

    app.delete('/api/faq', app.permission.check('faq:delete'), (req, res) => {
        const { _id } = req.body;
        app.model.faq.delete(_id, (error) => res.send({ error }));
    });

    app.get('/api/home/faq/page/:pageNumber/:pageSize', (req, res) => {
        const pageNumber = parseInt(req.params.pageNumber),
            pageSize = parseInt(req.params.pageSize),
            condition ={};
            condition.active=true;
        app.model.faq.getPage(pageNumber, pageSize, condition, (error, page) => {
            console.log({page});
            res.send({ page, error });
        });
    });


    // Hook upload images ---------------------------------------------------------------------------------------------------------------------------s
    app.createFolder(app.path.join(app.publicPath, '/img/faq'));

    app.uploadHooks.add('uploadFaqCkEditor', (req, fields, files, params, done) => {
        app.permission.has(req, () => app.uploadCkEditorImage('faq', fields, files, params, done), done, 'faq:write');
    });

    
};