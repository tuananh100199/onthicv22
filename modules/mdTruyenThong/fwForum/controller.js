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
    app.get('/user/forum/:_categoryId', app.permission.check('user:login'), app.templates.admin);
    app.get('/user/forum/message/:_forumId', app.permission.check('user:login'), app.templates.admin);

    // APIs -----------------------------------------------------------------------------------------------------------------------------------------
    app.get('/api/forum/categories', app.permission.check('user:login'), (req, res) => {
        const isForumWrite = req.session.user.permissions ? req.session.user.permissions.includes('forum:write') : false;
        let condition = { type: 'forum' };
        if (!isForumWrite) condition.active = true;
        app.model.category.getAll(condition, (error, items) => {
            if (error || items == null) {
                res.send({ error: 'Lỗi khi lấy danh mục!' });
            } else {
                const categories = [],
                    getForums = (index = 0) => {
                        if (index < items.length) {
                            const { _id, title, image } = items[index];
                            condition = { category: _id };
                            if (!isForumWrite) condition.state == 'approved';

                            new Promise(resolve => app.model.forum.count(condition, (error, total) => {
                                if (error || total == 0) {
                                    resolve({ total: 0, page: [] });
                                } else {
                                    app.model.forum.getPage(1, 3, condition, (error, page) => resolve({ total, page: error || page == null ? [] : page }));
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
                app.model.forum.getPage(pageNumber, pageSize, pageCondition, (error, page) => {
                    res.send({ error, category, page });
                });
            }
        });
    });

    app.get('/api/forum', app.permission.check('user:login'), (req, res) => { //TODO
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

    app.post('/api/forum', app.permission.check('user:login'), (req, res) => {
        const data = app.clone(req.body.data);
        data.user = req.session.user._id;
        app.model.forum.create(data, (error, item) => res.send({ error, item }));
    });

    app.put('/api/forum', app.permission.check('user:login'), (req, res) => {
        // Người có quyền forum:write hoặc tác giả của forum
        const { _id, changes } = req.body;
        if (req.session.user.permissions && req.session.user.permissions.includes('forum:write')) {
            app.model.forum.update(_id, changes, (error, item) => res.send({ error, item }));
        } else {
            app.model.forum.get({ _id, user: req.session.user._id }, (error, forum) => {
                if (error == null && forum) {
                    if (changes && changes.title != null) {
                        app.model.forum.update(_id, { title: changes.title }, (error, item) => res.send({ error, item }));
                    } else {
                        res.send({ error: 'Lỗi khi cập nhật forum!' });
                    }
                } else {
                    res.send({ error: 'Lỗi khi cập nhật forum!' });
                }
            });
        }
    });

    app.delete('/api/forum', app.permission.check('user:login'), (req, res) => {
        // Người có quyền forum:delete hoặc tác giả của forum
        const { _id } = req.body;
        if (req.session.user.permissions && req.session.user.permissions.includes('forum:delete')) {
            app.model.forum.delete(_id, (error, item) => res.send({ error, item }));
        } else {
            app.model.forum.get({ _id, user: req.session.user._id }, (error, forum) => {
                if (error == null && forum) {
                    app.model.forum.delete(_id, (error, item) => res.send({ error, item }));
                } else {
                    res.send({ error: 'Lỗi khi xoá forum!' });
                }
            });
        }
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