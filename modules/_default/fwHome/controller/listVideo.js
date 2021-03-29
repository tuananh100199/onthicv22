module.exports = app => {
    app.get('/api/list-video/all', (req, res) => {
        app.model.listVideo.getAll((error, items) => res.send({ error, items }))
    });

    app.get('/api/list-video', app.permission.check('component:read'), (req, res) =>
        app.model.listVideo.get(req.query._id, (error, item) => res.send({ error, item })));

    app.post('/api/list-video', app.permission.check('component:write'), (req, res) =>
        app.model.listVideo.create(req.body.data, (error, item) => res.send({ error, item })));

    app.put('/api/list-video', app.permission.check('component:write'), (req, res) =>
        app.model.listVideo.update(req.body._id, req.body.changes, (error, item) => res.send({ error, item })));

    app.delete('/api/list-video', app.permission.check('component:delete'), (req, res) => app.model.listVideo.delete(req.body._id, error => res.send({ error })));


    app.post('/api/list-video/item', app.permission.check('component:write'), (req, res) => app.model.listVideo.create(req.body.data, (error, item) => {
        res.send({ error, item });
    }));

    app.put('/api/list-video/item/swap', app.permission.check('component:write'), (req, res) => {
        const isMoveUp = req.body.isMoveUp.toString() == 'true';
        app.model.listVideo.swapPriority(req.body._id, isMoveUp, (error, item1, item2) => res.send({ error, item1, item2 }));
    });

    app.delete('/api/list-video/item', app.permission.check('component:write'), (req, res) =>
        app.model.listVideo.delete(req.body._id, (error, item) => res.send({ error, listVideoId: item.listVideoId })));

    // Home ------------------------------------------------------------------------------------------------------------
    app.get('/home/list-video/:_id', (req, res) =>
        app.model.listVideo.get(req.params._id, (error, item) => res.send({ error, item })));


    // Hook upload images ----------------------------------------------------------------------------------------------
};
