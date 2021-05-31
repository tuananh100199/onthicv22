module.exports = app => {
    const menu = {
        parentMenu: app.parentMenu.communication,
        menus: {
            3004: { title: 'Danh mục forum', link: '/user/forum/category', backgroundColor: '#00897b' },

            3005: { title: 'Forum', link: '/user/forum', backgroundColor: '#00897b' },
        },
    };
    app.permission.add({ name: 'forum:read', menu }, { name: 'forum:write' }, { name: 'forum:delete' });

    // app.get('/forum(.htm(l)?)?', app.templates.home);
    app.get('/user/forum', app.permission.check('forum:read'), app.templates.admin);
    app.get('/user/forum/category', app.permission.check('category:read'), app.templates.admin);

    // APIs -----------------------------------------------------------------------------------------------------------------------------------------
    app.get('/api/forum/page/:pageNumber/:pageSize', app.permission.check('forum:write'), (req, res) => {
        const pageNumber = parseInt(req.params.pageNumber),
            pageSize = parseInt(req.params.pageSize);
        app.model.forum.getPage(pageNumber, pageSize, {}, (error, page) => {
            page.list = page.list.map(item => app.clone(item, { message: '' }));
            res.send({ error, page });
        });
    });

    app.get('/api/forum/all', app.permission.check('forum:write'), (req, res) => {
        app.model.forum.getAll((error, list) => res.send({ error, list }));
    });

    app.get('/api/forum/unread', app.permission.check('forum:write'), (req, res) => {
        app.model.forum.getUnread((error, list) => res.send({ error, list }));
    });

    app.get('/api/forum/item/:_id', app.permission.check('forum:write'), (req, res) => {
        app.model.forum.read(req.params._id, (error, item) => {
            if (item) app.io.emit('forum-changed', item);
            res.send({ error, item });
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

    app.put('/api/forum/swap', app.permission.check('forum:write'), (req, res) => {
        const isMoveUp = req.body.isMoveUp.toString() == 'true';
        app.model.forum.swapPriority(req.body._id, isMoveUp, (error) => res.send({ error }));
    });

    app.delete('/api/forum', app.permission.check('forum:delete'), (req, res) => {
        app.model.forum.delete(req.body._id, error => res.send({ error }));
    });

    // User create forum-----------------------------------------------------------------------------------------------
};