module.exports = app => {
    const menu = {
        parentMenu: app.parentMenu.communication,
        menus: {
            3300: { title: 'Cấu hình thông báo', link: '/user/notification/template' },
        },
    };
    app.permission.add({ name: 'notificationTemplate:read', menu }, { name: 'notificationTemplate:write' }, { name: 'notificationTemplate:delete' });

    app.get('/user/notification/template', app.permission.check('notificationTemplate:read'), app.templates.admin);

    // APIs -----------------------------------------------------------------------------------------------------------------------------------------
    app.get('/api/notification-template/all', (req, res) => {
        const condition = req.query.condition;
        app.model.notificationTemplate.getAll(condition, (error, items) => res.send({ error, items }));
    });

    app.get('/api/notification-template', app.permission.check('notificationTemplate:read'), (req, res) => {
        app.model.notificationTemplate.get(req.query._id, (error, item) => res.send({ error, item }));
    });

    app.post('/api/notification-template', app.permission.check('notificationTemplate:write'), (req, res) => {
        app.model.notificationTemplate.create(req.body.data, (error, item) => {
            res.send({ error, item });
        });
    });

    app.put('/api/notification-template', app.permission.check('notificationTemplate:write'), (req, res) => {
        app.model.notificationTemplate.update(req.body._id, req.body.changes, (error, item) => res.send({ error, item }));
    });


    app.delete('/api/notification-template', app.permission.check('notificationTemplate:write'), (req, res) => {
        app.model.notificationTemplate.delete(req.body._id, error => res.send({ error }));
    });

    // Hook permissionHooks -------------------------------------------------------------------------------------------
    app.permissionHooks.add('courseAdmin', 'notificationTemplate', (user) => new Promise(resolve => {
        app.permissionHooks.pushUserPermission(user, 'notificationTemplate:read', 'notificationTemplate:write', 'notificationTemplate:delete');
        resolve();
    }));

};
