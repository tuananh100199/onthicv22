module.exports = (app) => {
    const menu = {
        parentMenu: { index: 3100, title: 'Tin tức', icon: 'fa-newspaper-o' },
        menus: {
            3101: { title: 'Danh mục tin tức', link: '/user/news/category' },
            3102: { title: 'Tin tức', link: '/user/news' },
        },
    };

    app.permission.add({ name: 'news:read', menu }, { name: 'news:write' }, { name: 'news:delete' });

    app.get('/user/news/category', app.permission.check('category:read'), app.templates.admin);
    app.get('/user/news', app.permission.check('news:read'), app.templates.admin);
    app.get('/user/news/:_id', app.permission.check('news:read'), app.templates.admin);

    app.get('/news/:_id', app.templates.home);
    app.get('/tintuc/:link', app.templates.home);

    // News APIs ------------------------------------------------------------------------------------------------------------------------------------
    app.get('/api/news/page/:pageNumber/:pageSize', app.permission.check('news:read'), (req, res) => {
        const pageNumber = parseInt(req.params.pageNumber),
            pageSize = parseInt(req.params.pageSize);
        app.model.news.getPage(pageNumber, pageSize, {}, (error, page) => res.send({ error, page }));
    });

    app.get('/api/news/:_id', app.permission.check('news:read'), (req, res) => {
        app.model.category.getAll({ type: 'news', active: true }, (error, categories) => {
            if (error || categories == null) {
                res.send({ error: 'Lỗi khi lấy danh mục!' });
            } else {
                app.model.news.get(req.params._id, (error, item) => {
                    res.send({
                        error,
                        categories: categories.map((item) => ({ id: item._id, text: item.title, })),
                        item,
                    });
                });
            }
        });
    });

    app.put('/api/news/swap', app.permission.check('news:write'), (req, res) => {
        const isMoveUp = req.body.isMoveUp.toString() == 'true';
        app.model.news.swapPriority(req.body._id, isMoveUp, (error) => res.send({ error }));
    });

    app.put('/api/news', app.permission.check('news:write'), (req, res) => {
        const changes = { $set: {}, $unset: {} };
        if (req.body.changes.startPost == 'Invalid Date') {
            changes['$unset'].startPost = 1;
            delete changes['$set'].startPost
        }
        if (req.body.changes.stopPost == 'Invalid Date') {
            changes['$unset'].stopPost = 1;
            delete changes['$set'].stopPost
        }

        app.model.news.update(req.body._id, changes, (error, item) => res.send({ error, item }))
    });

    app.post('/api/news/default', app.permission.check('news:write'), (req, res) => {
        app.model.news.create({ title: 'Bài viết', active: false }, (error, item) => res.send({ error, item }));
    });

    app.delete('/api/news', app.permission.check('news:write'), (req, res) =>
        app.model.news.delete(req.body._id, (error) => res.send({ error }))
    );

    // Home -----------------------------------------------------------------------------------------------------------------------------------------
    app.get('/news/page/:pageNumber/:pageSize', (req, res) => {
        const pageNumber = parseInt(req.params.pageNumber),
            pageSize = parseInt(req.params.pageSize),
            today = new Date();
        const condition = {
            active: true,
            $or: [
                { startPost: null },
                { startPost: { $exists: false } },
                { startPost: { $lte: today } },
            ],
            $or: [
                { stopPost: null },
                { stopPost: { $exists: false } },
                { stopPost: { $gte: today } },
            ],
        };
        app.model.news.getPage(pageNumber, pageSize, condition, (error, page) => res.send({ error, page }));
    });

    app.get('/news/page/:pageNumber/:pageSize/:categoryType', (req, res) => {
        const pageNumber = parseInt(req.params.pageNumber),
            pageSize = parseInt(req.params.pageSize),
            today = new Date();
        const condition = {
            active: true,
            categories: req.params.categoryType,
            $or: [
                { startPost: null },
                { startPost: { $exists: false } },
                { startPost: { $lte: today } },
            ],
            $or: [
                { stopPost: null },
                { stopPost: { $exists: false } },
                { stopPost: { $gte: today } },
            ],
        };
        app.model.news.getPage(pageNumber, pageSize, condition, (error, page) => res.send({ error, page }));
    });

    app.get('/news/item/id/:newsId', (req, res) => {
        app.model.news.read({ _id: req.params.newsId, active: true }, (error, item) => res.send({ error, item }));
    });
    app.get('/news/item/link/:newsLink', (req, res) => {
        app.model.news.read({ link: req.params.newsLink, active: true }, (error, item) => res.send({ error, item }));
    });

    app.put('/news/item/check-link', (req, res) => {
        app.model.news.get({ link: req.body.link }, (error, item) => {
            res.send({
                error: error ? 'Lỗi hệ thống' : (item == null || item._id == req.body._id ? null : 'Link không hợp lệ'),
            });
        })
    });

    // Hook upload images ---------------------------------------------------------------------------------------------------------------------------s
    app.createFolder(app.path.join(app.publicPath, '/img/news'));

    app.uploadHooks.add('uploadNewsCkEditor', (req, fields, files, params, done) => {
        app.permission.has(req, () => app.uploadCkEditorImage('news', fields, files, params, done), done, 'news:write');
    });

    const uploadNewsAvatar = (fields, files, done) => {
        if (
            fields.userData &&
            fields.userData[0].startsWith('news:') &&
            files.NewsImage &&
            files.NewsImage.length > 0
        ) {
            console.log('Hook: uploadNewsAvatar => news image upload');
            const _id = fields.userData[0].substring('news:'.length);
            app.uploadImage('news', app.model.news.get, _id, files.NewsImage[0].path, done);
        }
    };
    app.uploadHooks.add('uploadNewsAvatar', (req, fields, files, params, done) => {
        app.permission.has(req, () => uploadNewsAvatar(fields, files, done), done, 'news:write');
    });
};