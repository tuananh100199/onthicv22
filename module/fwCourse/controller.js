module.exports = (app) => {
    const menu = {
        parentMenu: {
            index: 7000, title: 'Khóa học', link: '/user/course/list', icon: 'fa-book'
            // , subMenusRender: false
            // , groups: ['Thông tin chung', 'Thông tin người quản trị' ]
        },
        // menus: {
        //     7001: { title: 'Thông tin chung', link: '/user/course/edit/common/:_id', icon: 'fa-book ', backgroundColor: '#032b91', groupIndex: 0 },
        //     7002: { title: 'Quản lý chung', link: '', icon: 'fa-list', backgroundColor: '#000001', groupIndex: 1 },
        // }
    };
    app.permission.add({ name: 'course:read', menu }, { name: 'course:write', menu });
    app.get('/user/course/list', app.permission.check('course:read'), app.templates.admin);
    app.get('/user/course/edit/:_id', app.permission.check('course:read'), app.templates.admin);

    app.get('/course/item/:_id', app.templates.home);

    // APIs ------------------------------------------------------------------------------------------------------------
    app.get('/api/course/page/:pageNumber/:pageSize', app.permission.check('course:read'), (req, res) => {
        const pageNumber = parseInt(req.params.pageNumber),
            pageSize = parseInt(req.params.pageSize);
        app.model.course.getPage(pageNumber, pageSize, {}, (error, page) => {
            const response = {};
            if (error || page == null) {
                response.error = 'Danh sách khoá học không sẵn sàng!';
            } else {
                response.page = page;
            }
            res.send(response);
        });
    });

    app.get('/api/course/item/:courseId', app.permission.check('course:read'), (req, res) =>
        app.model.course.get(req.params.courseId, (error, item) => res.send({ error, item })));


    app.post('/api/course', app.permission.check('course:write'), (req, res) =>
        app.model.course.create(req.body.newData || {}, (error, item) => res.send({ error, item })
        ));

    app.put('/api/course', app.permission.check('course:write'), (req, res) => {
        // const changes = req.body.changes;
        // if (changes.categories && changes.categories == 'empty') changes.categories = [];
        app.model.course.update(req.body._id, req.body.changes, (error, item) => res.send({ error, item }))
    });

    app.delete('/api/course', app.permission.check('course:write'), (req, res) =>
        app.model.course.delete(req.body._id, (error) => res.send({ error }))
    );

    // Home -----------------------------------------------------------------------------------------------------------------------------------------
    app.get('/course/page/:pageNumber/:pageSize', (req, res) => {
        const pageNumber = parseInt(req.params.pageNumber),
            pageSize = parseInt(req.params.pageSize);
        app.model.course.getPage(pageNumber, pageSize, { active: true }, (error, page) => {
            const response = {};
            if (error || page == null) {
                response.error = 'Danh sách khoá học không sẵn sàng!';
            } else {
                response.page = page;
            }
            res.send(response);
        });
    });

    app.get('/course/item/id/:courseId', (req, res) => {
        app.model.course.get({ _id: req.params.courseId, active: true }, (error, item) => res.send({ error, item }))
    });
};