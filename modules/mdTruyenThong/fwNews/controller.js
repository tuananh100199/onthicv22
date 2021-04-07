module.exports = (app) => {
    const menu = {
        parentMenu: { index: 3100, title: 'Tin tức', icon: 'fa-newspaper-o' },
        menus: {
            3101: { title: 'Danh mục tin tức', link: '/user/category/news' },
            3102: { title: 'Tin tức', link: '/user/news' },
        },
    };

    app.permission.add({ name: 'news:read', menu }, { name: 'news:write' }, { name: 'news:delete' });

    app.get('/user/category/news', app.permission.check('category:read'), app.templates.admin);
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

    app.get('/api/news', app.permission.check('news:read'), (req, res) => {
        app.model.category.getAll({ type: 'news', active: true }, (error, categories) => {
            if (error || categories == null) {
                res.send({ error: 'Lỗi khi lấy danh mục!' });
            } else {
                app.model.news.get(req.query._id, (error, item) => {
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
        const changes = { $set: req.body.changes, $unset: {} };
        if (changes['$set'].startPost == 'Invalid Date') {
            changes['$unset'].startPost = 1;
            delete changes['$set'].startPost
        }
        if (changes['$set'].stopPost == 'Invalid Date') {
            changes['$unset'].stopPost = 1;
            delete changes['$set'].stopPost
        }

        app.model.news.update(req.body._id, changes, (error, item) => res.send({ error, item }))
    });

    app.put('/api/news/check-link', app.permission.check('news:write'), (req, res) => {
        app.model.news.get({ link: req.body.link }, (error, item) => {
            res.send({
                error: error ? 'Lỗi hệ thống' : (item == null || item._id == req.body._id ? null : 'Link không hợp lệ'),
            });
        })
    });

    app.post('/api/news', app.permission.check('news:write'), (req, res) => {
        app.model.news.create({ title: 'Bài viết', active: false }, (error, item) => res.send({ error, item }));
    });

    app.delete('/api/news', app.permission.check('news:delete'), (req, res) =>
        app.model.news.delete(req.body._id, (error) => res.send({ error }))
    );

    // Home -----------------------------------------------------------------------------------------------------------------------------------------
    const getPageByUser = (req, res) => {
        let { pageNumber, pageSize, categoryType } = req.params, today = new Date();
        pageNumber = parseInt(pageNumber);
        pageSize = parseInt(pageSize);
        const condition = {
            active: true,
            $and: [
                {
                    $or: [
                        { stopPost: null },
                        { stopPost: { $exists: false } },
                        { stopPost: { $gte: today } },
                    ],
                },
                {
                    $or: [
                        { startPost: null },
                        { startPost: { $exists: false } },
                        { startPost: { $lte: today } },
                    ],
                }
            ]
        };
        console.log(condition)
        if (categoryType) condition.categories = categoryType;
        app.model.news.getPage(pageNumber, pageSize, condition, (error, page) => res.send({ error, page }));
    };
    app.get('/home/news/page/:pageNumber/:pageSize', getPageByUser);
    app.get('/home/news/page/:pageNumber/:pageSize/:categoryType', getPageByUser);

    app.get('/home/news/item', (req, res) => {
        const { _id, link } = req.query;
        new Promise((resolve, reject) => {
            if (_id) {
                app.model.news.get({ _id, active: true }, (error, item) => item ? resolve(item) : reject(error ? 'Lỗi khi lấy tin tức!' : 'Tin tức không tồn tại'));
            } else if (link) {
                app.model.news.get({ link, active: true }, (error, item) => item ? resolve(item) : reject(error ? 'Lỗi khi lấy tin tức!' : 'Tin tức không tồn tại'));
            }
        }).then(item => {
            item.view++;
            item.save(error => res.send({ error, item }));
        }).catch(error => res.send({ error }));
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