module.exports = (app) => {
    const menu = {
        parentMenu: app.parentMenu.accountant,
        menus: {
            70041: { title: 'Lịch sử giảm giá', link: '/user/discount-history', icon: 'fa-money', backgroundColor: '#00897b' },
        },
    };

    app.permission.add(
        { name: 'discountHistory:read', menu }, { name: 'discountHistory:write' }, { name: 'discountHistory:delete' },
    );

    app.get('/user/discount-history', app.permission.check('discountHistory:read'), app.templates.admin);


    // APIs ------------------------------------------------------------------------------------------------------------
    app.get('/api/discount-history/page/:pageNumber/:pageSize', (req, res) => {
        const pageNumber = parseInt(req.params.pageNumber),
            pageSize = parseInt(req.params.pageSize), sort=req.query.sort||null;
        app.model.discountHistory.getPage(pageNumber, pageSize, {}, sort, (error, page) => {
            res.send({ page, error: error ? 'Danh sách gói học phí không sẵn sàng!' : null });
        });
    });

    app.get('/api/discount-history/all', (req, res) => {//mobile
        const condition = req.query.condition || {};
        app.model.discountHistory.getAll(condition,(error, list) => res.send({ error, list }));
    });

    app.get('/api/discount-history', (req, res) => {
        app.model.discountHistory.get(req.query._id, (error, item) => res.send({ error, item }));
    });

    app.post('/api/discount-history', app.permission.check('discountHistory:write'), (req, res) => {
        app.model.discountHistory.create(req.body.data, (error, item) => res.send({ error, item }));
    });

    app.put('/api/discount-history', app.permission.check('discountHistory:write'), (req, res) => {
        const { _id, changes } = req.body;
        app.model.discountHistory.update(_id, changes, (error, item) => res.send({ error, item }));

    });

    app.delete('/api/discount-history', app.permission.check('discountHistory:delete'), (req, res) => {
        const { _id } = req.body;
        app.model.discountHistory.delete(_id, (error) => res.send({ error }));
    });

};