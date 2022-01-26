module.exports = (app) => {
    const menu = {
        parentMenu: app.parentMenu.accountant,
        menus: {
            7006: { title: 'Số lần thanh toán', link: '/user/course-payment', icon: 'fa-money', backgroundColor: '#00897b' },
        },
    };

    app.permission.add(
        { name: 'coursePayment:read', menu }, { name: 'coursePayment:write' }, { name: 'coursePayment:delete' },
    );

    app.get('/user/course-payment', app.permission.check('coursePayment:read'), app.templates.admin);


    // APIs ------------------------------------------------------------------------------------------------------------
    app.get('/api/course-payment/page/:pageNumber/:pageSize', (req, res) => {
        const pageNumber = parseInt(req.params.pageNumber),
            pageSize = parseInt(req.params.pageSize),
            condition = req.query.condition?req.query.condition:{};
        app.model.coursePayment.getPage(pageNumber, pageSize, condition, (error, page) => {
            res.send({ page, error });
        });
    });

    app.get('/api/course-payment/all', (req, res) => {
        const condition = req.query.condition || {};
        app.model.coursePayment.getAll(condition,(error, list) => res.send({ error, list }));
    });

    app.get('/api/course-payment', (req, res) => {
        app.model.coursePayment.get(req.query._id, (error, item) => res.send({ error, item }));
    });

    app.post('/api/course-payment', app.permission.check('coursePayment:write'), (req, res) => {
        app.model.coursePayment.create(req.body.data, (error, item) => res.send({ error, item }));
    });

    app.put('/api/course-payment', app.permission.check('coursePayment:write'), (req, res) => {
        const { _id, changes } = req.body;
        app.model.coursePayment.update(_id, changes, (error, item) => res.send({ error, item }));

    });

    app.delete('/api/course-payment', app.permission.check('coursePayment:delete'), (req, res) => {
        const { _id } = req.body;
        app.model.coursePayment.delete(_id, (error) => res.send({ error }));
    });

};