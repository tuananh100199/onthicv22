module.exports = app => {
    const menu = {
        parentMenu: app.parentMenu.setting,
        menus: {
            2130: { title: 'Phòng ban', link: '/user/department', icon: 'fa fa-university', backgroundColor: 'rgb(106, 90, 205)' }
        }
    };
    app.permission.add({ name: 'department:read', menu }, { name: 'department:write' }, { name: 'department:delete' });

    app.get('/user/department', app.permission.check('department:read'), app.templates.admin);

    // APIs -----------------------------------------------------------------------------------------------------------
    app.get('/api/department/all',app.permission.check('department:read'), (req, res) => {
        const condition = {},
            searchText = req.query.searchText;
        if (searchText) {
            condition.name = new RegExp(searchText, 'i');
        }
        app.model.department.getAll(condition, (error, list) => res.send({ error, list }));
    });

    app.get('/api/department/page/:pageNumber/:pageSize',app.permission.check('department:read'), (req, res) => {
        const pageNumber = parseInt(req.params.pageNumber),
            pageSize = parseInt(req.params.pageSize),
            { searchText='' } = req.query,
            condition={};
            searchText!='' && (condition.title = new RegExp(searchText, 'i'));
        app.model.department.getPage(pageNumber, pageSize, condition, (error, page) => res.send({ error, page }));
    });

    app.post('/api/department', app.permission.check('department:write'), (req, res) => {
        app.model.department.create(req.body.data, (error, item) => res.send({ error, item }));
    });

    app.put('/api/department', app.permission.check('department:write'), (req, res) => {
        app.model.department.update(req.body._id, req.body.changes, (error, item) => res.send({ error, item }));
    });

    app.delete('/api/department', app.permission.check('department:write'), (req, res) => {
        app.model.department.delete(req.body._id, error => res.send({ error }));
    });
};