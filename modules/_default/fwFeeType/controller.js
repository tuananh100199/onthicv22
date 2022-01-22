module.exports = (app) => {
    const menu = {
        parentMenu: app.parentMenu.accountant,
        menus: {
            7002: { title: 'Loại gói học phí', link: '/user/fee-type' },
        }
    };

    app.permission.add(
        { name: 'fee-type:read', menu },
        { name: 'fee-type:write' },
        { name: 'fee-type:delete' },
    );

    app.get('/user/fee-type', app.permission.check('fee-type:read'), app.templates.admin);

    // APIs ------------------------------------------------------------------------------------------------------------
    app.get('/api/fee-type/page/:pageNumber/:pageSize', app.permission.check('fee-type:read'), (req, res) => {
        const pageNumber = parseInt(req.params.pageNumber),
            pageSize = parseInt(req.params.pageSize),
            condition = req.params.condition?req.params.condition:{};
        app.model.feeType.getPage(pageNumber, pageSize, condition, (error, page) => {
            res.send({ page, error });
        });
    });

    app.get('/api/fee-type/all', app.permission.check('fee-type:read'), (req, res) => {
        app.model.feeType.getAll((error, list) => res.send({ error, list }));
    });

    app.get('/api/fee-type', app.permission.check('fee-type:read'), (req, res) => {
        app.model.feeType.get(req.query._id, (error, item) => res.send({ error, item }));
    });

    app.post('/api/fee-type', app.permission.check('fee-type:write'), (req, res) => {
        app.model.feeType.create(req.body.data, (error, item) => res.send({ error, item }));
    });

    app.put('/api/fee-type', app.permission.check('fee-type:write'), (req, res) => {
        const { _id, changes } = req.body;
        app.model.feeType.update(_id, changes, (error, item) => res.send({ error, item }));
    });

    app.delete('/api/fee-type', app.permission.check('fee-type:delete'), (req, res) => {
        const { _id } = req.body;
        app.model.feeType.delete(_id, (error) => res.send({ error }));
    });
};