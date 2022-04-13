module.exports = (app) => {
    const menu = {
        parentMenu: app.parentMenu.enrollment,
        menus: {
            8091: { title: 'Danh mục chứng chỉ', link: '/user/teacher-diploma', icon: 'fa-bars', backgroundColor: '#00b0ff' },
        },
    };

    app.permission.add(
        { name: 'teacherDiploma:read', menu }, { name: 'teacherDiploma:write' }, { name: 'teacherDiploma:delete' },
    );

    app.get('/user/teacher-diploma', app.permission.check('teacherDiploma:read'), app.templates.admin);


    // APIs ------------------------------------------------------------------------------------------------------------
    app.get('/api/teacher-diploma/page/:pageNumber/:pageSize', (req, res) => {
        const pageNumber = parseInt(req.params.pageNumber),
            pageSize = parseInt(req.params.pageSize);
        app.model.teacherDiploma.getPage(pageNumber, pageSize, {}, (error, page) => {
            res.send({ page, error: error ? 'Danh sách chứng chỉ giáo viên không sẵn sàng!' : null });
        });
    });

    app.get('/api/teacher-diploma/all', (req, res) => {//mobile
        const condition = req.query.condition || {};
        app.model.teacherDiploma.getAll(condition,(error, list) => res.send({ error, list }));
    });

    app.get('/api/teacher-diploma', (req, res) => {
        app.model.teacherDiploma.get(req.query._id, (error, item) => res.send({ error, item }));
    });

    app.post('/api/teacher-diploma', app.permission.check('teacherDiploma:write'), (req, res) => {
        app.model.teacherDiploma.create(req.body.data, (error, item) => res.send({ error, item }));
    });

    app.put('/api/teacher-diploma', app.permission.check('teacherDiploma:write'), (req, res) => {
        const { _id, changes } = req.body;
        app.model.teacherDiploma.update(_id, changes, (error, item) => res.send({ error, item }));

    });

    app.put('/api/teacher-diploma/default', app.permission.check('teacherDiploma:write'), (req, res) => {
        const { diploma } = req.body;
        app.model.teacherDiploma.update({}, { isSuPham: false }, (error) => {
            if (error) res.send({ error });
            else app.model.teacherDiploma.update(diploma._id, { isSuPham: true }, (error, item) => {
                res.send({ error, item });
            });
        });

    });

    app.delete('/api/teacher-diploma', app.permission.check('teacherDiploma:delete'), (req, res) => {
        const { _id } = req.body;
        app.model.teacherDiploma.delete(_id, (error) => res.send({ error }));
    });

};