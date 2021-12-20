module.exports = app => {
    const menu = {
        parentMenu: app.parentMenu.communication,
        menus: {
            3200: { title: 'Danh mục forum', link: '/user/category/forum' },
        },
    };

    app.permission.add({ name: 'forum:write' }, { name: 'forum:delete', menu });
    app.permission.add({ name: 'user:login', menu: { parentMenu: { index: 3010, title: 'Forum', icon: 'fa-users', link: '/user/forum' } } });

    app.get('/user/category/forum', app.permission.check('category:read'), app.templates.admin);
    app.get('/user/forum', app.permission.check('user:login'), app.templates.admin);
    app.get('/user/forum/:_categoryId', app.permission.check('user:login'), app.templates.admin);
    app.get('/user/forum/message/:_forumId', app.permission.check('user:login'), app.templates.admin);
    app.get('/user/course/:_courseId/forum', app.permission.check('user:login'), app.templates.admin);
    app.get('/user/course/:_courseId/forum/:_categoryId', app.permission.check('user:login'), app.templates.admin);
    app.get('/user/course/:_courseId/forum/:_forumId/message', app.permission.check('user:login'), app.templates.admin);

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
                            const condition = { category: _id, course: req.query.course };
                            if (!isForumWrite) condition.state = 'approved';

                            new Promise(resolve => app.model.forum.count(condition, (error, total) => {
                                if (error || total == 0) {
                                    resolve({ total: 0, page: [] });
                                } else {
                                    app.model.forum.getPage(1, 5, condition, (error, page) => resolve({ total, page: error || page == null ? [] : page }));
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
            { categoryId, searchText, courseId } = req.query,
            pageCondition = { category: categoryId };
        pageCondition.course = courseId ? courseId : null;

        if (searchText) {
            pageCondition.title = new RegExp(searchText, 'i');
            pageCondition.content = new RegExp(searchText, 'i');
        }
        if (!(req.session.user.permissions && req.session.user.permissions.includes('forum:write'))) {
            pageCondition.state = 'approved';
        }

        app.model.category.get(categoryId, (error, category) => {
            if (error || category == null) {
                res.send({ error: 'Danh mục không hợp lệ!' });
            } else {
                app.model.forum.getPage(pageNumber, pageSize, pageCondition, (error, page) => {
                    res.send({ error, category, page });
                });
            }
        });
    });

    app.get('/api/forum', app.permission.check('user:login'), (req, res) => {
        app.model.forum.get(req.query._id, (error, item) => {
            res.send({ error, item });
        });
    });

    app.post('/api/forum', app.permission.check('user:login'), (req, res) => {
        const data = app.clone(req.body.data);
        data.user = req.session.user._id;
        if (!(req.session.user.permissions && req.session.user.permissions.includes('forum:write'))) {
            data.state = 'waiting';
        }
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
                    const data = {};
                    if (changes.title) data.title = changes.title;
                    if (changes.content) data.content = changes.content.substring(0, 200);
                    if (changes.title || changes.content) {
                        data.modifiedDate = new Date().getTime();
                        app.model.forum.update(_id, data, (error, item) => res.send({ error, item }));
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
    app.get('/api/forum/message/page/:pageNumber/:pageSize', app.permission.check('user:login'), (req, res) => {
        const pageNumber = parseInt(req.params.pageNumber),
            pageSize = parseInt(req.params.pageSize),
            { _forumId, searchText } = req.query,
            pageCondition = { forum: _forumId };
        const user = req.session.user;
        if (searchText) {
            pageCondition.content = new RegExp(searchText, 'i');
        }
        if (!(user.isCourseAdmin || user.isLecturer && user.isTrustLecturer || user.permissions && user.permissions.includes('forum:delete'))) {
            pageCondition.state = 'approved';
        }

        app.model.forumMessage.getPage(pageNumber, pageSize, pageCondition, (error, page) => {
            res.send({ error, page });
        });
    });

    app.post('/api/forum/message', app.permission.check('user:login'), (req, res) => {
        let { forum, content, state } = req.body;
        app.model.forum.get(forum, (error, item) => {
            if (error || item == null || content == '') {
                res.send({ error: 'Dữ liệu không hợp lệ!' });
            } else {
                if (!(req.session.user.permissions && req.session.user.permissions.includes('forum:write'))) {
                    state = 'waiting';
                }

                // Tạo bài viết trong forum
                app.model.forumMessage.create({ user: req.session.user._id, forum, content, state }, (error, item) => {
                    if (error || item == null) {
                        res.send({ error: 'Tạo bài viết bị lỗi!' });
                    } else {
                        // Cập nhật thời gian forum.modifiedDate
                        app.model.forum.update(item.forum, { modifiedDate: new Date() }, (error) => res.send({ error, item }));
                    }
                });
            }
        });
    });

    app.put('/api/forum/message', app.permission.check('user:login'), (req, res) => {
        const { _id, changes } = req.body;
        app.model.forumMessage.get(_id, (error, item) => {
            if (error || item == null || changes == null || changes.content == '') {
                res.send({ error: 'Dữ liệu không hợp lệ!' });
            } else {
                app.model.forum.get(item.forum, (error, forum) => {
                    if (error || forum == null) {
                        res.send({ error: 'Dữ liệu không hợp lệ!' });
                    } else {
                        let modifiedDateChanged = true;
                        if (changes.state && req.session.user.permissions && req.session.user.permissions.includes('forum:write')) {
                            item.state = changes.state;
                            modifiedDateChanged = Object.keys(changes).includes('content');
                        } else {
                            item.state = 'waiting';
                        }
                        if (changes.content) {
                            item.content = changes.content;
                            if (modifiedDateChanged) {// Cập nhật thời gian forum.modifiedDate
                                item.modifiedDate = new Date();
                                forum.modifiedDate = new Date();
                                forum.save();
                            }
                        }
                        item.save(error => res.send({ error, item }));
                    }
                });
            }
        });
    });

    app.delete('/api/forum/message', app.permission.check('user:login'), (req, res) => {
        const { _id } = req.body;
        app.model.forumMessage.get(_id, (error, item) => {
            if (error || item == null) {
                res.send({ error: 'Dữ liệu không hợp lệ!' });
            } else if ((req.session.user.permissions && req.session.user.permissions.includes('forum:delete')) || req.session.user._id == item.user._id) {
                // Xoá bài viết trong forum
                app.model.forumMessage.delete(_id, (error) => {
                    if (error) {
                        res.send({ error });
                    } else {
                        // Cập nhật thời gian forum.modifiedDate
                        app.model.forum.update(_id, { modifiedDate: new Date() }, (error) => res.send({ error, item }));
                    }
                });
            } else {
                res.send({ error: 'Bạn không được phép xoá bài viết này!' });
            }
        });
    });

    // Hook permissionHooks -------------------------------------------------------------------------------------------
    app.permissionHooks.add('lecturer', 'forum', (user) => new Promise(resolve => {
        app.permissionHooks.pushUserPermission(user, 'forum:write');
        resolve();
    }));

    app.permissionHooks.add('courseAdmin', 'forum', (user) => new Promise(resolve => {
        app.permissionHooks.pushUserPermission(user, 'forum:write', 'forum:delete');
        resolve();
    }));

    // Upload Hooks -----------------------------------------------------------------------------------------------------
    app.createFolder(app.path.join(app.publicPath, '/img/forum'));
    app.uploadHooks.add('uploadForumCkEditor', (req, fields, files, params, done) => {
        app.permission.has(req, () => app.uploadCkEditorImage('forum', fields, files, params, done), done, 'user:login');
    });
};