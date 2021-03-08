module.exports = (app) => {
    const menu = {
        parentMenu: { index: 8000, title: 'Đào tạo', link: '/user/dao-tao', icon: 'fa-graduation-cap', subMenusRender: false },
        menus: {
            8020: { title: 'Quản lý môn học', link: '/user/dao-tao/mon-hoc/list', icon: 'fa-list', backgroundColor: '#032b91', groupIndex: 0 },
            8021: { title: 'Quản lý bài học', link: '/user/dao-tao/bai-hoc/list', icon: 'fa-list', backgroundColor: '#032b91', groupIndex: 0 },
        }
    };
    app.permission.add({ name: 'lesson:read', menu }, { name: 'lesson:write', menu });
    app.get('/user/dao-tao', app.permission.check('lesson:read'), app.templates.admin);
    app.get('/user/dao-tao/mon-hoc/list', app.permission.check('lesson:read'), app.templates.admin);
    app.get('/user/dao-tao/mon-hoc/edit/:monHocId', app.templates.admin);

    // APIs ------------------------------------------------------------------------------------------------------------
    app.get('/api/mon-hoc/page/:pageNumber/:pageSize', app.permission.check('lesson:read'), (req, res) => {
        const pageNumber = parseInt(req.params.pageNumber),
            pageSize = parseInt(req.params.pageSize);
        app.model.MonHoc.getPage(pageNumber, pageSize, {}, (error, page) => {
            const response = {};
            if (error || page == null) {
                response.error = 'Danh sách môn học không sẵn sàng!';
            } else {
                response.page = page;
            }
            res.send(response);
        });
    });

    app.get('/api/mon-hoc/edit/:monHocId', app.permission.check('lesson:read'), (req, res) =>
        app.model.MonHoc.get(req.params.monHocId, (error, item) => res.send({ error, item })));


    app.post('/api/mon-hoc', app.permission.check('lesson:write'), (req, res) =>
        app.model.MonHoc.create(req.body.data || {}, (error, item) => res.send({ error, item })
        ));

    app.put('/api/mon-hoc', app.permission.check('lesson:write'), (req, res) => {
        const changes = req.body.changes;
        if (changes.categories && changes.categories == 'empty') changes.categories = [];
        app.model.MonHoc.update(req.body._id, req.body.changes, (error, item) => res.send({ error, item }))
    });

    app.delete('/api/mon-hoc', app.permission.check('lesson:write'), (req, res) =>
        app.model.MonHoc.delete(req.body._id, (error) => res.send({ error }))
    );
};
