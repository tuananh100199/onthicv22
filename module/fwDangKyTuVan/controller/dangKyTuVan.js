module.exports = (app) => {
    const menu = {
        parentMenu: { index: 4000, title: 'Đăng ký tư vấn', icon: 'fa-file-text-o', link: '/user/dang-ky-tu-van' }
    };
    app.permission.add({ name: 'dangKyTuVan:read', menu }, { name: 'dangKyTuVan:write', menu },);
    app.get('/user/dang-ky-tu-van', app.permission.check('dangKyTuVan:read'), app.templates.admin);
    
    app.get('/user/dang-ky-tu-van/edit/:_id', app.permission.check('dangKyTuVan:read'), app.templates.admin);


    // APIs -----------------------------------------------------------------------------------------------------------------------------------------
    app.get('/api/dang-ky-tu-van/page/:pageNumber/:pageSize', app.permission.check('dangKyTuVan:read'), (req, res) => {
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

    app.post('/api/dang-ky-tu-van/default', app.permission.check('dangKyTuVan:write'), (req, res) =>
        app.model.dangKyTuVan.create({ title: 'Đăng ký tư vấn', active: false },
            (error, item) => res.send({ error, item })
        ));

    app.delete('/api/dang-ky-tu-van', app.permission.check('dangKyTuVan:write'), (req, res) =>
        app.model.dangKyTuVan.delete(req.body._id, (error) => res.send({ error }))
    );

    app.put('/api/dang-ky-tu-van/swap', app.permission.check('dangKyTuVan:write'), (req, res) => {
        const isMoveUp = req.body.isMoveUp.toString() == 'true';
        app.model.dangKyTuVan.swapPriority(req.body._id, isMoveUp, (error) =>
            res.send({ error })
        );
    });

    app.put('/api/dang-ky-tu-van', app.permission.check('dangKyTuVan:write'), (req, res) =>
        app.model.dangKyTuVan.update(req.body._id, req.body.changes, (error, item) =>
            res.send({ error, item })
        )
    );

    app.get('/dang-ky-tu-van/item/:dangKyTuVanId', (req, res) =>
        app.model.dangKyTuVan.get({ _id: req.params.dangKyTuVanId }, (error, item) => res.send({ error, item })));

    app.get('/api/dang-ky-tu-van/all', app.permission.check('dangKyTuVan:read'), (req, res) => {
        app.model.dangKyTuVan.getAll((error, items) => {
            res.send({ error, items })
        })
    });


    // Home -----------------------------------------------------------------------------------------------------------------------------------------
    app.get('/dang-ky-tu-van/page/:pageNumber/:pageSize', (req, res) => {
        const pageNumber = parseInt(req.params.pageNumber),
            pageSize = parseInt(req.params.pageSize),
            today = new Date(),
            user = req.session.user;
        const condition = {
            $or: [
                { startPost: null },
                { startPost: { $exists: false } },
                { startPost: { $lte: today } },
            ],
            $or: [
                { stopPost: null },
                { stopPost: { $exists: false } },
                { stopPost: { $gte: today } },
            ],
            active: true,
        };

        app.model.dangKyTuVan.getPage(pageNumber, pageSize, condition, (error, page) => {
            const respone = {};
            if (error || page == null) {
                respone.error = 'Danh sách đăng ký tư vấn không sẵn sàng!';
            } else {
                let list = page.list.map((item) => app.clone(item, { description: null }));
                respone.page = app.clone(page, { list });
            }
            res.send(respone);
        });
    });

    app.get('/dang-ky-tu-van/page/:pageNumber/:pageSize/:categoryType', (req, res) => {
        const pageNumber = parseInt(req.params.pageNumber),
            pageSize = parseInt(req.params.pageSize),
            today = new Date(),
            user = req.session.user;
        const condition = {
            categories: req.params.categoryType,
            $or: [
                { startPost: null },
                { startPost: { $exists: false } },
                { startPost: { $lte: today } },
            ],
            $or: [
                { stopPost: null },
                { stopPost: { $exists: false } },
                { stopPost: { $gte: today } },
            ],
            active: true,
        };

        app.model.dangKyTuVan.getPage(pageNumber, pageSize, condition, (error, page) => {
            const respone = {};
            if (error || page == null) {
                respone.error = 'Danh sách đăng ký tư vấn không sẵn sàng!';
            } else {
                let list = page.list.map((item) => app.clone(item, { description: null }));
                respone.page = app.clone(page, { list });
            }
            res.send(respone);
        });
    });



};