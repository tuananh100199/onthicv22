module.exports = (app) => {
    const menu = {
        parentMenu: app.parentMenu.setting,
        menus: {
            2150: { title: 'Nhân sự', link: '/user/assign-role', icon: 'fa-bars', backgroundColor: '#00b0ff' },
        },
    };

    app.permission.add(
        { name: 'assignRole:read', menu }, { name: 'assignRole:write' }, { name: 'assignRole:delete' },
    );

    app.get('/user/assign-role', app.permission.check('assignRole:read'), app.templates.admin);
    app.get('/user/assign-role/course-admin', app.permission.check('assignRole:read'), app.templates.admin);
    app.get('/user/assign-role/course-enroll', app.permission.check('assignRole:read'), app.templates.admin);
    app.get('/user/assign-role/course-teacher', app.permission.check('assignRole:read'), app.templates.admin);
    app.get('/user/assign-role/course-device', app.permission.check('assignRole:read'), app.templates.admin);
    app.get('/user/assign-role/course-accountant', app.permission.check('assignRole:read'), app.templates.admin);


    // APIs ------------------------------------------------------------------------------------------------------------
    app.get('/api/assign-role/page/:pageNumber/:pageSize', (req, res) => {
        const pageNumber = parseInt(req.params.pageNumber),
            pageSize = parseInt(req.params.pageSize);
        app.model.assignRole.getPage(pageNumber, pageSize, {}, (error, page) => {
            res.send({ page, error: error ? 'Danh sách chứng chỉ giáo viên không sẵn sàng!' : null });
        });
    });

    app.get('/api/assign-role/all', (req, res) => {//mobile
        const condition = req.query.condition || {};
        app.model.assignRole.getAll(condition,(error, list) => res.send({ error, list }));
    });

    app.get('/api/assign-role', (req, res) => {
        app.model.assignRole.get(req.query._id, (error, item) => res.send({ error, item }));
    });

    app.post('/api/assign-role', app.permission.check('teacherDiploma:write'), (req, res) => {
        app.model.assignRole.create(req.body.data, (error, item) => res.send({ error, item }));
    });

    app.put('/api/assign-role', app.permission.check('teacherDiploma:write'), (req, res) => {
        const { _id, changes } = req.body;
        app.model.assignRole.update(_id, changes, (error, item) => res.send({ error, item }));

    });

    app.delete('/api/assign-role', app.permission.check('teacherDiploma:delete'), (req, res) => {
        const { _id } = req.body;
        app.model.assignRole.delete(_id, (error) => res.send({ error }));
    });
};