module.exports = app => {
    const menu = {
        parentMenu: app.parentMenu.communication,
        menus: {
            3004: { title: 'Danh mục forum', link: '/user/category/forum' },
            3005: { title: 'Forum', link: '/user/forum' },
        },
    };
    app.permission.add({ name: 'forum:read', menu }, { name: 'forum:write' }, { name: 'forum:delete' });
    
    app.get('/user/category/forum', app.permission.check('category:read'), app.templates.admin);
    app.get('/user/forum', app.permission.check('forum:read'), app.templates.admin);
    app.get('/user/forum/:_id', app.permission.check('forum:read'), app.templates.admin);
    // APIs -----------------------------------------------------------------------------------------------------------------------------------------
    app.get('/api/forum/page/:pageNumber/:pageSize', app.permission.check('forum:write'), (req, res) => {
        const pageNumber = parseInt(req.params.pageNumber),
            pageSize = parseInt(req.params.pageSize),
            { searchText } = req.query,
            pageCondition = {};
        searchText && (pageCondition.title = new RegExp(searchText, 'i'));
        app.model.forum.getPage(pageNumber, pageSize, pageCondition, (error, page) => res.send({ error, page }));
    });

    app.get('/api/forum/all', app.permission.check('forum:write'), (req, res) => {
        app.model.forum.getAll((error, list) => res.send({ error, list }));
    });

    app.get('/api/forum', app.permission.check('forum:read'), (req, res) => {
        app.model.category.getAll({ type: 'forum' }, (error, categories) => {
            if (error || categories == null) {
                res.send({ error: 'Lỗi khi lấy danh mục!' });
            } else {
                app.model.forum.get(req.query._id, (error, item) => {
                    res.send({
                        error,
                        categories: categories.map((item) => ({ id: item._id, text: item.title, })),
                        item,
                    });
                });
            }
        });
    });

    app.post('/api/forum', app.permission.check('forum:write'), (req, res) => {
        app.model.forum.create(req.body.data, (error, item) => {
            if (error || item == null || item.image == null) {
                res.send({ error, item });
            } else {
                app.uploadImage('forum', app.model.forum.get, item._id, item.image, data => res.send(data));
            }
        });
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
        app.model.forum.update(_id, {}, (error, item) => { //update ModifiedDate
            if (error || item == null) {
                res.send({error: 'Lỗi thêm mới bài viết'});
            } else {
                app.model.forum.addMessage(_id, messages, (error, item) => res.send({ error, item }));
            }
        });
    });

    app.put('/api/forum/message', app.permission.check('forum:write'), (req, res) => {
        const { _id, messages } = req.body;
        app.model.forum.update(_id, {}, (error, item) => { //update ModifiedDate
            if (error || item == null) {
                res.send({error: 'Lỗi cập nhật bài viết'});
            } else {
                app.model.forum.updateMessage(_id, messages, (error, item) => res.send({ error, item }));
            }
        });
    });

    app.delete('/api/forum/message', app.permission.check('forum:write'), (req, res) => {
        const { _id, messageId } = req.body;
        app.model.forum.update(_id, {}, (error, item) => { //update ModifiedDate
            if (error || item == null) {
                res.send({error: 'Lỗi xóa bài viết'});
            } else {
                app.model.forum.deleteMessage(_id, messageId, (error, item) => res.send({ error, item }));
            }
        });
    });
};