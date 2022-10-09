module.exports = app => {
    const menu = {
        parentMenu: app.parentMenu.setting,
        menus: {
            2080: { title: 'Vai trò', link: '/user/role', icon: 'fa-sliders', backgroundColor: '#ff3d00' }
        }
    };
    app.permission.add({ name: 'role:read', menu }, { name: 'role:write' }, { name: 'role:delete' });
    app.get('/user/role', app.permission.check('role:read'), app.templates.admin);

    // APIs -----------------------------------------------------------------------------------------------------------------------------------------
    app.get('/api/role/all', app.permission.check('role:read'), (req, res) => {
        app.model.role.getAll('-description', (error, list) => res.send({ error, list }));
    });

    app.get('/api/role/page/:pageNumber/:pageSize', app.permission.check('role:read'), (req, res) => {
        const pageNumber = parseInt(req.params.pageNumber),
            pageSize = parseInt(req.params.pageSize),
            condition = req.query.condition || {},
            pageCondition = {};
        if (condition.searchText) pageCondition.name = new RegExp(condition.searchText, 'i');
        app.model.role.getPage(pageNumber, pageSize, pageCondition, (error, page) => {
            page.permissions = app.permission.all();
            res.send({ error, page });
        });
    });

    app.get('/api/role', app.permission.check('role:read'), (req, res) => {
        app.model.role.get({ _id: req.query._id }, (error, item) => res.send({ error, item }));
    });

    app.post('/api/role', app.permission.check('role:write'), (req, res) => {
        app.model.role.create(req.body.role, (error, item) => res.send({ error, item }));
    });

    app.put('/api/role', app.permission.check('role:write'), (req, res) => {
        let changes = {};
        if (req.body.changes == null) {
            changes.permission = [];
        } else {
            changes = req.body.changes;
        }
        app.model.role.update(req.body._id, changes, (error, item) => res.send({ error, item }));
    });

    app.delete('/api/role', app.permission.check('role:delete'), (req, res) => {
        app.model.role.delete(req.body._id, error => res.send({ error }));
    });
};