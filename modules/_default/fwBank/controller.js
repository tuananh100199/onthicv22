module.exports = app => {
    const menu = {
        parentMenu: app.parentMenu.setting,
        menus: {
            2030: { title: 'Ngân hàng', link: '/user/bank', icon: 'fa-university', backgroundColor: '#00ffb3' }
        }
    };
    app.permission.add({ name: 'bank:read', menu }, { name: 'bank:write' }, { name: 'bank:delete' });
    app.get('/user/bank', app.permission.check('bank:read'), app.templates.admin);
    app.get('/user/bank/:id', app.permission.check('bank:read'), app.templates.admin);

    // APIs -----------------------------------------------------------------------------------------------------------------------------------------
    app.get('/api/bank/all', app.permission.check('bank:read'), (req, res) => {
        app.model.bank.getAll((error, list) => res.send({ error, list }));
    });

    app.get('/api/bank', app.permission.check('bank:read'), (req, res) => {
        app.model.bank.get({ _id: req.query._id }, (error, item) => res.send({ error, item }));
    });

    app.get('/api/bank/student', app.permission.check('user:login'), (req, res) => {
        app.model.bank.get(req.query.condition, (error, item) => res.send({ error, item }));
    });

    app.post('/api/bank', app.permission.check('bank:write'), (req, res) => {
        app.model.bank.create(req.body.bank, (error, item) => res.send({ error, item }));
    });

    app.put('/api/bank', app.permission.check('bank:write'), (req, res) => {
        if (req.body.changes && req.body.changes.accounts && req.body.changes.accounts == 'empty' ) {
            req.body.changes.accounts = [];
        }
        app.model.bank.update(req.body._id, req.body.changes, (error, item) => res.send({ error, item }));
    });

    app.delete('/api/bank', app.permission.check('bank:delete'), (req, res) => {
        const user = req.session.user;
        if (user.roles.some(role => role.name == 'admin')) {
            app.model.bank.delete(req.body._id, error => res.send({ error }));
        } else res.send({ error: 'Bạn không có quyền xóa ngân hàng' });
    });
};