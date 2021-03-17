module.exports = (app) => {
    app.get('/user/dang-ky-tu-van', app.permission.check('component:read'), app.templates.admin);
    app.get('/user/dang-ky-tu-van/edit/:_id', app.permission.check('component:read'), app.templates.admin);

    // APIs -----------------------------------------------------------------------------------------------------------------------------------------
    app.get('/api/dang-ky-tu-van/page/:pageNumber/:pageSize', app.permission.check('component:read'), (req, res) => {
        const pageNumber = parseInt(req.params.pageNumber),
            pageSize = parseInt(req.params.pageSize);
        app.model.dangKyTuVan.getPage(pageNumber, pageSize, {}, (error, page) => {
            const respone = {};
            if (error || page == null) {
                respone.error = 'Danh sách đăng ký tư vấn không sẵn sàng!';
            } else {
                let list = page.list.map((item) =>
                    app.clone(item, { description: null })
                );
                respone.page = app.clone(page, { list });
            }
            res.send(respone);
        });
    });

    app.get('/api/dang-ky-tu-van/all', app.permission.check('component:read'), (req, res) => {
        app.model.dangKyTuVan.getAll((error, items) => res.send({ error, items }));
    });

    app.get('/api/dang-ky-tu-van/item/:dangKyTuVanId', app.permission.check('component:read'), (req, res) => {
        app.model.dangKyTuVan.get(req.params.dangKyTuVanId, (error, item) => res.send({ error, item }));
    });

    app.post('/api/dang-ky-tu-van', app.permission.check('component:write'), (req, res) => {
        app.model.dangKyTuVan.create(req.body.newData, (error, item) => res.send({ error, item }))
    });
    
    app.put('/api/dang-ky-tu-van', app.permission.check('component:write'), (req, res) => {
        const changes = req.body.changes;
        if (changes.statistic && changes.statistic == 'empty') changes.statistic = [];
        app.model.dangKyTuVan.update(req.body._id, changes, (error, item) => res.send({ error, item }));
    });

    app.delete('/api/dang-ky-tu-van', app.permission.check('component:write'), (req, res) => {
        app.model.dangKyTuVan.delete(req.body._id, error => res.send({ error }));
    });


    // Home -----------------------------------------------------------------------------------------------------------------------------------------
    app.get('/home/dang-ky-tu-van/:_id', (req, res) => {
        app.model.dangKyTuVan.get(req.params._id, (error, item) => res.send({ error, item }));
    });
};