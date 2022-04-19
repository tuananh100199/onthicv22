module.exports = (app) => {
    const menu = {
        parentMenu: app.parentMenu.trainning,
        menus: {
            4057: { title: 'Danh mục kỳ sát hạch', link: '/user/license-test', icon: 'fa-bars', backgroundColor: '#00b0ff' },
        },
    };

    app.permission.add(
        { name: 'licenseTest:read', menu }, { name: 'licenseTest:write' }, { name: 'licenseTest:delete' },
    );

    app.get('/user/license-test', app.permission.check('teacherDiploma:read'), app.templates.admin);


    // APIs ------------------------------------------------------------------------------------------------------------
    app.get('/api/license-test/page/:pageNumber/:pageSize', (req, res) => {
        const pageNumber = parseInt(req.params.pageNumber),
            pageSize = parseInt(req.params.pageSize);
        app.model.teacherDiploma.getPage(pageNumber, pageSize, {}, (error, page) => {
            res.send({ page, error });
        });
    });

    app.get('/api/license-test/all', (req, res) => {//mobile
        const condition = req.query.condition || {};
        app.model.teacherDiploma.getAll(condition,(error, list) => res.send({ error, list }));
    });

    app.get('/api/license-test', (req, res) => {
        app.model.teacherDiploma.get(req.query._id, (error, item) => res.send({ error, item }));
    });

    app.post('/api/license-test', app.permission.check('licenseTest:write'), (req, res) => {
        app.model.teacherDiploma.create(req.body.data, (error, item) => res.send({ error, item }));
    });

    app.put('/api/license-test', app.permission.check('licenseTest:write'), (req, res) => {
        const { _id, changes } = req.body;
        app.model.teacherDiploma.update(_id, changes, (error, item) => res.send({ error, item }));

    });

    app.delete('/api/license-test', app.permission.check('licenseTest:delete'), (req, res) => {
        const { _id } = req.body;
        app.model.teacherDiploma.delete(_id, (error) => res.send({ error }));
    });

};