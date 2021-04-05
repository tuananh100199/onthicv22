module.exports = app => {
    app.componentModel['staff group'] = app.model.staffGroup;

    app.get('/api/staff-group/all', app.permission.check('component:read'), (req, res) =>
        app.model.staffGroup.getAll((error, list) => res.send({ error, list })));

    app.get('/api/staff-group/', app.permission.check('component:read'), (req, res) =>
        app.model.staffGroup.get(req.query._id, (error, item) => res.send({ error, item })));

    app.post('/api/staff-group', app.permission.check('component:write'), (req, res) =>
        app.model.staffGroup.create(req.body.data, (error, item) => res.send({ error, item })));

    app.put('/api/staff-group', app.permission.check('component:write'), (req, res) => {
        //remove content from items , req.body.changes in this case is index:number
        if (!isNaN(req.body.changes)) {
            app.model.staffGroup.get(req.body._id, (error, item) => {
                item.staffs.splice(req.body.changes, 1);
                item.save();
                res.send({ error, item });
            });
        } else if (req.body.changes.index) { //swap content in items
            const { index, isMoveUp } = req.body.changes;
            app.model.staffGroup.get(req.body._id, (error, item) => {
                const temp = item.staffs[index];
                const newIndex = parseInt(index) + (isMoveUp == 'true' ? -1 : +1);
                if (0 <= index && index < item.staffs.length && 0 <= newIndex && newIndex < item.staffs.length) {
                    item.staffs.splice(index, 1);
                    item.staffs.splice(newIndex, 0, temp);
                    item.save();
                }
                res.send({ error, item });
            });
        } else {
            app.model.staffGroup.update(req.body._id, req.body.changes, (error, item) => res.send({ error, item }));
        }
    });

    app.delete('/api/staff-group', app.permission.check('component:write'), (req, res) => app.model.staffGroup.delete(req.body._id, error => res.send({ error })));

    // Home -----------------------------------------------------------------------------------------------------------------------------------------
    app.get('/home/staff-group/:_id', (req, res) =>
        app.model.staffGroup.get(req.params._id, (error, item) => res.send({ error, item })));
    // Hook upload images ----------------------------------------------------------------------------------------------
};
