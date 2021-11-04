module.exports = app => {
    const menu = {
        parentMenu: app.parentMenu.trainning,
        menus: {
            4035: { title: 'Quản lý xe', link: '/user/car' },
        },
    };
    app.permission.add({ name: 'car:read', menu }, { name: 'car:write' }, { name: 'car:delete' });

    app.get('/user/car', app.permission.check('car:read'), app.templates.admin);

    // APIs -----------------------------------------------------------------------------------------------------------------------------------------
    app.get('/api/car/page/:pageNumber/:pageSize', app.permission.check('car:read'), (req, res) => {
        const pageNumber = parseInt(req.params.pageNumber),
            pageSize = parseInt(req.params.pageSize),
            pageCondition = req.query.pageCondition,
            searchText = pageCondition && pageCondition.searchText,
            condition = pageCondition;
        if (searchText) {
            delete condition.searchText;
            condition.licensePlates = new RegExp(searchText, 'i');
        }
        app.model.car.getPage(pageNumber, pageSize, condition, (error, page) => {
            res.send({ page, error });
        });
    });

    app.post('/api/car', app.permission.check('car:write'), (req, res) => {
        app.model.car.create(req.body.data, (error, item) => {
            res.send({ error, item });
        });
    });

    app.put('/api/car', app.permission.check('car:write'), (req, res) => {
        app.model.car.update(req.body._id, req.body.changes, (error, item) => res.send({ error, item }));
    });


    app.delete('/api/car', app.permission.check('car:write'), (req, res) => {
        app.model.car.delete(req.body._id, error => res.send({ error }));
    });

    // Hook permissionHooks -------------------------------------------------------------------------------------------
    // app.permissionHooks.add('courseAdmin', 'notificationTemplate', (user) => new Promise(resolve => {
    //     app.permissionHooks.pushUserPermission(user, 'notificationTemplate:read', 'notificationTemplate:write', 'notificationTemplate:delete');
    //     resolve();
    // }));

};
