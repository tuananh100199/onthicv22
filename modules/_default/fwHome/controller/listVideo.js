module.exports = app => {
    app.get('/api/list-video/all', app.permission.check('component:read'), (req, res) => {
        app.model.listVideo.getAll((error, list) => { res.send({ error, list }) });
    });

    app.get('/api/list-video', app.permission.check('component:read'), (req, res) =>
        app.model.listVideo.get(req.query._id, (error, item) => res.send({ error, item })));

    app.post('/api/list-video', app.permission.check('component:write'), (req, res) =>
        app.model.listVideo.create(req.body.data, (error, item) => res.send({ error, item })));

    app.put('/api/list-video', app.permission.check('component:write'), (req, res) => {
        //remove content from items , req.body.changes in this case is index:number
        if (!isNaN(req.body.changes)) app.model.ListVideo.get(req.body._id, (error, item) => {
            item.items.splice(req.body.changes, 1);
            item.save();
            res.send({ error, item });
        });
        else if (req.body.changes.index) { //swap content in items
            const { index, isMoveUp } = req.body.changes;
            app.model.ListVideo.get(req.body._id, (error, item) => {
                const temp = item.items[index];
                const newIndex = parseInt(index) + (isMoveUp == 'true' ? -1 : +1);
                if (0 <= index && index < item.items.length && 0 <= newIndex && newIndex < item.items.length) {
                    item.items.splice(index, 1);
                    item.items.splice(newIndex, 0, temp);
                    item.save();
                }
                res.send({ error, item });
            });
        } else app.model.ListVideo.update(req.body._id, req.body.changes, (error, item) => res.send({ error, item }));
    });
    app.delete('/api/list-video', app.permission.check('component:delete'), (req, res) => app.model.listVideo.delete(req.body._id, error => res.send({ error })));

    // Home ------------------------------------------------------------------------------------------------------------
    app.get('/home/list-video/:_id', (req, res) =>
        app.model.listVideo.get(req.params._id, (error, item) => res.send({ error, item })));


    // Hook upload images ----------------------------------------------------------------------------------------------
};
