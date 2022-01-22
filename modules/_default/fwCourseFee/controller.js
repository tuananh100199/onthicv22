module.exports = (app) => {
    const menu = {
        parentMenu: app.parentMenu.accountant,
        menus: {
            7001: { title: 'Gói học phí', link: '/user/course-fee', icon: 'fa-money', backgroundColor: '#00897b' },
        },
    };

    app.permission.add(
        { name: 'courseFee:read', menu }, { name: 'courseFee:write' }, { name: 'courseFee:delete' },
    );

    app.get('/user/course-fee', app.permission.check('courseFee:read'), app.templates.admin);


    // APIs ------------------------------------------------------------------------------------------------------------
    app.get('/api/course-fee/page/:pageNumber/:pageSize', (req, res) => {
        const pageNumber = parseInt(req.params.pageNumber),
            pageSize = parseInt(req.params.pageSize);
        app.model.courseFee.getPage(pageNumber, pageSize, {}, (error, page) => {
            res.send({ page, error: error ? 'Danh sách gói học phí không sẵn sàng!' : null });
        });
    });

    app.get('/api/course-fee/all', (req, res) => {//mobile
        app.model.courseFee.getAll((error, list) => res.send({ error, list }));
    });

    app.get('/api/course-fee', (req, res) => {
        app.model.courseFee.get(req.query._id, (error, item) => res.send({ error, item }));
    });

    app.post('/api/course-fee', app.permission.check('course-fee:write'), (req, res) => {
        app.model.courseFee.create(req.body.data, (error, item) => res.send({ error, item }));
    });

    app.put('/api/course-fee', app.permission.check('course-fee:write'), (req, res) => {
        const { _id, changes } = req.body;
        app.model.courseFee.update(_id, changes, (error, item) => res.send({ error, item }));

    });

    app.delete('/api/course-fee', app.permission.check('course-fee:delete'), (req, res) => {
        const { _id } = req.body;
        app.model.courseType.delete(_id, (error) => res.send({ error }));
    });

};