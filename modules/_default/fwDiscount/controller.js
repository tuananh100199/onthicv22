module.exports = (app) => {
    const menu = {
        parentMenu: app.parentMenu.accountant,
        menus: {
            7003: { title: 'Giảm giá', link: '/user/discount', icon: 'fa-money', backgroundColor: '#00897b' },
        },
    };

    app.permission.add(
        { name: 'discount:read', menu }, { name: 'discount:write' }, { name: 'discount:delete' },
    );

    app.get('/user/discount', app.permission.check('discount:read'), app.templates.admin);


    // APIs ------------------------------------------------------------------------------------------------------------
    app.get('/api/discount/page/:pageNumber/:pageSize', (req, res) => {
        const pageNumber = parseInt(req.params.pageNumber),
            pageSize = parseInt(req.params.pageSize);
        app.model.discount.getPage(pageNumber, pageSize, {}, (error, page) => {
            res.send({ page, error: error ? 'Danh sách gói học phí không sẵn sàng!' : null });
        });
    });

    app.get('/api/discount/all', (req, res) => {//mobile
        app.model.discount.getAll((error, list) => res.send({ error, list }));
    });

    app.get('/api/discount', (req, res) => {
        app.model.discount.get(req.query._id, (error, item) => res.send({ error, item }));
    });

    app.post('/api/discount', app.permission.check('discount:write'), (req, res) => {
        app.model.discount.create(req.body.data, (error, item) => res.send({ error, item }));
    });

    app.put('/api/discount', app.permission.check('discount:write'), (req, res) => {
        const { _id, changes } = req.body;
        app.model.discount.update(_id, changes, (error, item) => res.send({ error, item }));

    });

    app.put('/api/discount/default', app.permission.check('discount:write'), (req, res) => {
        const { discount } = req.body;
        app.model.discount.update({}, { isDefault: false }, (error) => {
            if (error) res.send({ error });
            else app.model.discount.update(discount._id, { isDefault: true }, (error, item) => {
                res.send({ error, item });
            });
        });

    });

    app.delete('/api/discount', app.permission.check('discount:delete'), (req, res) => {
        const { _id } = req.body;
        app.model.discount.delete(_id, (error) => res.send({ error }));
    });

};