module.exports = app => {
    const menu = {
        parentMenu: app.parentMenu.communication,
        menus: {
            3004: { title: 'Danh mục forum', link: '/user/category/forum' },
        },
    };

    app.permission.add({ name: 'forum:write', menu }, { name: 'forum:delete' });
    app.permission.add({ name: 'user:login', menu: { parentMenu: { index: 3010, title: 'Forum', icon: 'fa-comments', link: '/user/forum' } } });

    app.get('/user/category/forum', app.permission.check('category:read'), app.templates.admin);
    app.get('/user/forum', app.permission.check('user:login'), app.templates.admin);
    app.get('/user/forum/:_id', app.permission.check('user:login'), app.templates.admin);

    // APIs -----------------------------------------------------------------------------------------------------------------------------------------
    app.get('/api/forum/categories', app.permission.check('user:login'), (req, res) => {
        app.model.category.getAll({ type: 'forum' }, (error, items) => {
            if (error || items == null) {
                res.send({ error: 'Lỗi khi lấy danh mục!' });
            } else {
                const categories = [],
                    getForums = (index = 0) => {
                        if (index < items.length) {
                            const { _id, title, image } = items[index];
                            new Promise(resolve => app.model.forum.count({ category: _id }, (error, total) => {
                                if (error || total == 0) {
                                    resolve({ total: 0, page: [] });
                                } else {
                                    app.model.forum.getPage(1, 3, { category: _id }, (error, page) => resolve({ total, page: error || page == null ? [] : page }));
                                }
                            })).then(({ total, page }) => {
                                categories.push({ _id, title, image, total, page });
                                getForums(index + 1);
                            });
                        } else {
                            res.send({ categories });
                        }
                    };
                getForums();
            }
        });
    });

    app.get('/api/forum/page/:pageNumber/:pageSize', app.permission.check('user:login'), (req, res) => {
        const pageNumber = parseInt(req.params.pageNumber),
            pageSize = parseInt(req.params.pageSize),
            { _categoryId, searchText } = req.query,
            pageCondition = { category: _categoryId };
        searchText && (pageCondition.title = new RegExp(searchText, 'i'));
        app.model.category.get(_categoryId, (error, category) => {
            if (error || category == null) {
                res.send({ error: 'Danh mục không hợp lệ!' });
            } else {
                app.model.forum.getPage(pageNumber, pageSize, pageCondition, (error, page) => res.send({ error, category, page }));
            }
        });
    });

    app.get('/api/forum', app.permission.check('user:login'), (req, res) => {
        app.model.category.getAll({ type: 'forum' }, (error, categories) => {
            if (error || categories == null) {
                res.send({ error: 'Lỗi khi lấy danh mục!' });
            } else {
                app.model.forum.get(req.query._id, (error, item) => {
                    res.send({
                        error,
                        item,
                        categories: categories.map((item) => ({ id: item._id, text: item.title, })),
                    });
                });
            }
        });
    });

    app.post('/api/forum', app.permission.check('forum:write'), (req, res) => {
        app.model.forum.create(req.body.data, (error, item) => res.send({ error, item }));
    });

    app.put('/api/forum', app.permission.check('forum:write'), (req, res) => {
        app.model.forum.update(req.body._id, req.body.changes, (error, item) => res.send({ error, item }));
    });

    app.delete('/api/forum', app.permission.check('forum:delete'), (req, res) => {
        app.model.forum.delete(req.body._id, error => res.send({ error }));
    });

    // API Message ----------------------------------------------------------------------------------------------------
    app.post('/api/forum/message', app.permission.check('forum:write'), (req, res) => {
        const { _id, messages } = req.body;
        app.model.forum.update(_id, { modifiedDate: new Date() }, (error, item) => {
            if (error || item == null) {
                res.send({ error: 'Lỗi thêm mới bài viết' });
            } else {
                app.model.forum.addMessage(_id, messages, (error, item) => res.send({ error, item }));
            }
        });
    });

    app.put('/api/forum/message', app.permission.check('forum:write'), (req, res) => {
        const { _id, messages } = req.body;
        app.model.forum.update(_id, { modifiedDate: new Date() }, (error, item) => {
            if (error || item == null) {
                res.send({ error: 'Lỗi cập nhật bài viết' });
            } else {
                app.model.forum.updateMessage(_id, messages, (error, item) => res.send({ error, item }));
            }
        });
    });

    app.delete('/api/forum/message', app.permission.check('forum:write'), (req, res) => {
        const { _id, messageId } = req.body;
        app.model.forum.update(_id, { modifiedDate: new Date() }, (error, item) => {
            if (error || item == null) {
                res.send({ error: 'Lỗi xóa bài viết' });
            } else {
                app.model.forum.deleteMessage(_id, messageId, (error, item) => res.send({ error, item }));
            }
        });
    });
};