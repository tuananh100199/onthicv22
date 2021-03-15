module.exports = (app) => {
    const menu = {
        parentMenu: { index: 3100, title: 'Tin tức', icon: 'fa-newspaper-o' },
        menus: {
            3101: { title: 'Danh mục', link: '/user/news/category' },
            3102: { title: 'Tin tức', link: '/user/news/list' },
            3103: { title: 'Chờ duyệt', link: '/user/news/draft' },
        },
    };

    app.permission.add(
        { name: 'news:read', menu },
        { name: 'news:write' },
        { name: 'news:draft', menu }
    );

    app.get('/user/news/category', app.permission.check('category:read'), app.templates.admin);
    app.get('/user/news/list', app.permission.check('news:read'), app.templates.admin);
    app.get('/user/news/edit/:_id', app.permission.check('news:read'), app.templates.admin);
    app.get('/user/news/draft', app.permission.check('news:read'), app.templates.admin);
    app.get('/user/news/draft/edit/:_id', app.permission.check('news:draft'), app.templates.admin);

    app.get('/news/item/:_id', app.templates.home);
    app.get('/tintuc/:link', app.templates.home);

    // APIs -----------------------------------------------------------------------------------------------------------------------------------------
    app.get('/api/news/page/:pageNumber/:pageSize', app.permission.check('news:read'), (req, res) => {
        const pageNumber = parseInt(req.params.pageNumber),
            pageSize = parseInt(req.params.pageSize);
        app.model.news.getPage(pageNumber, pageSize, {}, (error, page) => {
            const respone = {};
            if (error || page == null) {
                respone.error = 'Danh sách tin tức không sẵn sàng!';
            } else {
                let list = page.list.map((item) =>
                    app.clone(item, { content: null })
                );
                respone.page = app.clone(page, { list });
            }
            res.send(respone);
        });
    });
    app.get('/api/draft/news/:userId', app.permission.check('news:read'), (req, res) => {
        userId = req.params.userId;
        app.model.draft.userGet('news', userId, (error, page) => {
            if (error) respone.error = 'Danh sách mẫu tin tức không sẵn sàng!';
            res.send(page);
        });
    });

    app.get('/api/draft-news/page/:pageNumber/:pageSize', app.permission.check('news:draft'), (req, res) => {
        const user = req.session.user,
            condition = user.permissions.includes('news:write') ? { documentType: 'news' } : { documentType: 'news', editorId: user._id };
        const pageNumber = parseInt(req.params.pageNumber),
            pageSize = parseInt(req.params.pageSize);
        app.model.draft.getPage(pageNumber, pageSize, condition, (error, page) => {
            res.send({ error, page });
        });
    });

    app.post('/api/news/default', app.permission.check('news:write'), (req, res) =>
        app.model.news.create({ title: 'Bài viết', active: false },
            (error, item) => res.send({ error, item })
        ));

    app.delete('/api/news', app.permission.check('news:write'), (req, res) =>
        app.model.news.delete(req.body._id, (error) => res.send({ error }))
    );

    app.post('/api/news/draft', app.permission.check('news:draft'), (req, res) =>
        app.model.draft.create(req.body, (error, item) => res.send({ error, item }))
    );

    app.delete('/api/draft-news', app.permission.check('news:draft'), (req, res) =>
        app.model.draft.delete(req.body._id, (error) => res.send({ error }))
    );

    app.put('/api/news/swap', app.permission.check('news:write'), (req, res) => {
        const isMoveUp = req.body.isMoveUp.toString() == 'true';
        app.model.news.swapPriority(req.body._id, isMoveUp, (error) =>
            res.send({ error })
        );
    });

    app.put('/api/news', app.permission.check('news:write'), (req, res) =>
        app.model.news.update(req.body._id, req.body.changes, (error, item) =>
            res.send({ error, item })
        )
    );

    app.get(
        '/api/news/item/:newsId',
        app.permission.check('news:read'),
        (req, res) => {
            app.model.category.getAll({ type: 'news', active: true },
                (error, categories) => {
                    if (error || categories == null) {
                        res.send({ error: 'Lỗi khi lấy danh mục!' });
                    } else {
                        app.model.news.get(req.params.newsId, (error, item) => {
                            res.send({
                                error,
                                categories: categories.map((item) => ({
                                    id: item._id,
                                    text: item.title,
                                })),
                                item,
                            });
                        });
                    }
                }
            );
        }
    );
    app.get(
        '/api/draft-news/toNews/:draftId',
        app.permission.check('news:write'),
        (req, res) => {
            app.model.draft.toNews(req.params.draftId, (error, item) =>
                res.send({ error, item })
            );
        }
    );
    app.get(
        '/api/draft-news/item/:newsId',
        app.permission.check('news:draft'),
        (req, res) => {
            app.model.category.getAll({ type: 'news', active: true },
                (error, categories) => {
                    if (error || categories == null) {
                        res.send({ error: 'Lỗi khi lấy danh mục!' });
                    } else {
                        app.model.draft.get(req.params.newsId, (error, item) => {
                            res.send({
                                error,
                                categories: categories.map((item) => ({
                                    id: item._id,
                                    text: item.title,
                                })),
                                item,
                            });
                        });
                    }
                }
            );
        }
    );

    app.put('/api/draft-news', app.permission.check('news:draft'), (req, res) =>
        app.model.draft.update(req.body._id, req.body.changes, (error, item) =>
            res.send({ error, item })
        )
    );

    // Home -----------------------------------------------------------------------------------------------------------------------------------------
    app.get('/news/page/:pageNumber/:pageSize', (req, res) => {
        const pageNumber = parseInt(req.params.pageNumber),
            pageSize = parseInt(req.params.pageSize),
            today = new Date(),
            user = req.session.user;
        const condition = {
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
            active: true,
        };

        app.model.news.getPage(pageNumber, pageSize, condition, (error, page) => {
            const respone = {};
            if (error || page == null) {
                respone.error = 'Danh sách tin tức không sẵn sàng!';
            } else {
                let list = page.list.map((item) => app.clone(item, { content: null }));
                respone.page = app.clone(page, { list });
            }
            res.send(respone);
        });
    });

    app.get('/news/page/:pageNumber/:pageSize/:categoryType', (req, res) => {
        const pageNumber = parseInt(req.params.pageNumber),
            pageSize = parseInt(req.params.pageSize),
            today = new Date(),
            user = req.session.user;
        const condition = {
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
            active: true,
        };

        app.model.news.getPage(pageNumber, pageSize, condition, (error, page) => {
            const respone = {};
            if (error || page == null) {
                respone.error = 'Danh sách tin tức không sẵn sàng!';
            } else {
                let list = page.list.map((item) => app.clone(item, { content: null }));
                respone.page = app.clone(page, { list });
            }
            res.send(respone);
        });
    });

    const readNews = (req, res, error, item) => {
        // if (item) {
        //     item.content = app.language.parse(req, item.content);
        // }
        res.send({ error, item });
    };
    app.get('/news/item/id/:newsId', (req, res) =>
        app.model.news.readById(req.params.newsId, (error, item) =>
            readNews(req, res, error, item)
        )
    );
    app.get('/news/item/link/:newsLink', (req, res) =>
        app.model.news.readByLink(req.params.newsLink, (error, item) =>
            readNews(req, res, error, item)
        )
    );
    app.put('/news/item/check-link', (req, res) =>
        app.model.news.getByLink(req.body.link, (error, item) => {
            res.send({
                error: error ?
                    'Lỗi hệ thống' : item == null || item._id == req.body._id ?
                        null : 'Link không hợp lệ',
            });
        })
    );

    // Hook upload images ---------------------------------------------------------------------------------------------------------------------------s
    app.createFolder(
        app.path.join(app.publicPath, '/img/draft'),
        app.path.join(app.publicPath, '/img/draft/news'),
        app.path.join(app.publicPath, '/img/news'),
        app.path.join(app.publicPath, '/img/draftNews')
    );

    app.uploadHooks.add(
        'uploadNewsCkEditor',
        (req, fields, files, params, done) =>
            app.permission.has(
                req,
                () => app.uploadCkEditorImage('news', fields, files, params, done),
                done,
                'news:write'
            )
    );

    const uploadNewsAvatar = (req, fields, files, params, done) => {
        if (
            fields.userData &&
            fields.userData[0].startsWith('news:') &&
            files.NewsImage &&
            files.NewsImage.length > 0
        ) {
            console.log('Hook: uploadNewsAvatar => news image upload');
            app.uploadComponentImage(
                req,
                'news',
                app.model.news.get,
                fields.userData[0].substring(5),
                files.NewsImage[0].path,
                done
            );
        }
    };
    app.uploadHooks.add('uploadNewsAvatar', (req, fields, files, params, done) =>
        app.permission.has(
            req,
            () => uploadNewsAvatar(req, fields, files, params, done),
            done,
            'news:write'
        )
    );

    const uploadNewsDraftAvatar = (req, fields, files, params, done) => {
        if (
            fields.userData &&
            fields.userData[0].startsWith('draftNews:') &&
            files.NewsDraftImage &&
            files.NewsDraftImage.length > 0
        ) {
            console.log('Hook: uploadNewsDraftAvatar => news draft image upload');
            app.uploadComponentImage(
                req,
                'draftNews',
                app.model.draft.get,
                fields.userData[0].substring(10),
                files.NewsDraftImage[0].path,
                done
            );
        }
    };
    app.uploadHooks.add(
        'uploadNewsDraftAvatar',
        (req, fields, files, params, done) =>
            app.permission.has(
                req,
                () => uploadNewsDraftAvatar(req, fields, files, params, done),
                done,
                'news:draft'
            )
    );
};