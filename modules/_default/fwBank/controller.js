module.exports = app => {
    const menu = {
        parentMenu: app.parentMenu.setting,
        menus: {
            2030: { title: 'Ngân hàng', link: '/user/bank', icon: 'fa-university', backgroundColor: '#00ffb3' }
        }
    };
    app.permission.add({ name: 'bank:read', menu }, { name: 'bank:write' }, { name: 'bank:delete' });
    app.get('/user/bank', app.permission.check('bank:read'), app.templates.admin);

    // APIs -----------------------------------------------------------------------------------------------------------------------------------------
    app.get('/api/bank/all', app.permission.check('bank:read'), (req, res) => {
        app.model.bank.getAll((error, list) => res.send({ error, list }));
    });

    app.get('/api/bank', app.permission.check('bank:read'), (req, res) => {
        app.model.bank.get({ _id: req.query._id }, (error, item) => res.send({ error, item }));
    });

    app.post('/api/bank', app.permission.check('bank:write'), (req, res) => {
        app.model.bank.create(req.body.bank, (error, item) => res.send({ error, item }));
    });

    app.put('/api/bank', app.permission.check('bank:write'), (req, res) => {
        let changes = {};
        if (req.body.changes == null) {
            changes.permission = [];
        } else {
            changes = req.body.changes;
        }
        app.model.bank.update(req.body._id, changes, (error, item) => res.send({ error, item }));
    });

    app.delete('/api/bank', app.permission.check('bank:delete'), (req, res) => {
        app.model.bank.delete(req.body._id, error => res.send({ error }));
    });
};