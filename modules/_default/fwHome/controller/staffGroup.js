module.exports = app => {
    app.componentModel['staff group'] = app.model.staffGroup;

    app.get('/api/staff-group/all', app.permission.check('component:read'), (req, res) =>
        app.model.staffGroup.getAll((error, items) => res.send({ error, items })));

    app.get('/api/staff-group/item/:_id', app.permission.check('component:read'), (req, res) =>
        app.model.staffGroup.get(req.params._id, (error, item) => res.send({ error, item })));

    app.post('/api/staff-group', app.permission.check('component:write'), (req, res) =>
        app.model.staffGroup.create({ title: req.body.title }, (error, staffGroup) => res.send({ error, staffGroup })));

    app.put('/api/staff-group', app.permission.check('component:write'), (req, res) => {
        const changes = req.body.changes;
        if (changes && changes.staff && changes.staff == 'empty') changes.staff = [];
        app.model.staffGroup.update(req.body._id, changes, (error, staffGroup) => res.send({ error, staffGroup }));
    });

    app.delete('/api/staff-group', app.permission.check('component:write'), (req, res) => app.model.staffGroup.delete(req.body._id, error => res.send({ error })));


    // Home -----------------------------------------------------------------------------------------------------------------------------------------
    app.get('/home/staff-group/:_id', (req, res) =>
        app.model.staffGroup.get(req.params._id, (error, item) => res.send({ error, item })));
};
