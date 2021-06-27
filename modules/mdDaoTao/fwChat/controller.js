module.exports = app => {



    app.get('/user/chat/:id', app.templates.admin);
    // app.get('/user/division/:id', app.permission.check('division:write'), app.templates.admin);

    app.get('/api/chat/all', (req, res) => {
        app.model.chat.getAll({ room: req.query.roomId }, (error, item) => {
            res.send({ error, item });
        });
    });

    app.post('/api/chat', (req, res) => {
        app.model.chat.create(req.body.data || {}, (error, item) => res.send({ error, item }));
    });
};