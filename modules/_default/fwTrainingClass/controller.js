module.exports = (app) => {
    const menu = {
        parentMenu: app.parentMenu.enrollment,
        menus: {
            8099: { title: 'Lớp tập huấn', link: '/user/training-class', icon: 'fa-bars', backgroundColor: '#00b0ff' },
        },
    };

    app.permission.add(
        { name: 'trainingClass:read', menu }, { name: 'trainingClass:write' }, { name: 'trainingClass:delete' },
    );

    app.get('/user/training-class', app.permission.check('trainingClass:read'), app.templates.admin);
    app.get('/user/training-class/:_id', app.permission.check('trainingClass:read'), app.templates.admin);


    // APIs ------------------------------------------------------------------------------------------------------------
    app.get('/api/training-class/page/:pageNumber/:pageSize', app.permission.check('trainingClass:read'), (req, res) => {
        const pageNumber = parseInt(req.params.pageNumber),
            pageSize = parseInt(req.params.pageSize);
        app.model.trainingClass.getPage(pageNumber, pageSize, {}, (error, page) => {
            res.send({ page, error: error ? 'Danh sách gói học phí không sẵn sàng!' : null });
        });
    });

    app.get('/api/training-class', (req, res) => {
        app.model.trainingClass.get(req.query._id, (error, item) => res.send({ error, item }));
    });

    app.post('/api/training-class', app.permission.check('trainingClass:write'), (req, res) => {
        app.model.trainingClass.create(req.body.data, (error, item) => res.send({ error, item }));
    });

    app.put('/api/training-class', app.permission.check('trainingClass:write'), (req, res) => {
        const { _id, changes } = req.body;
        app.model.trainingClass.update(_id, changes, (error, item) => res.send({ error, item }));

    });

    app.delete('/api/training-class', app.permission.check('trainingClass:delete'), (req, res) => {
        const { _id } = req.body;
        app.model.trainingClass.delete(_id, (error) => res.send({ error }));
    });

};