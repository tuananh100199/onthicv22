module.exports = (app) => {
    const menu = {
        parentMenu: app.parentMenu.setting,
        menus: {
            2120: { title: 'Loại khoá học', link: '/user/course-type/list', icon: 'fa fa-file-text-o', backgroundColor: 'rgb(255, 165, 0)' },
        }
    };
    app.permission.add({ name: 'course:read', menu }, { name: 'course:write', menu });
    app.get('/user/course-type/list', app.permission.check('course:read'), app.templates.admin);
    app.get('/user/course-type/edit/:_id', app.permission.check('course:read'), app.templates.admin);
    app.get('/course-type/:_id', app.templates.home);

    // APIs ------------------------------------------------------------------------------------------------------------
    app.get('/api/course-type/page/:pageNumber/:pageSize', app.permission.check('course:read'), (req, res) => {
        const pageNumber = parseInt(req.params.pageNumber),
            pageSize = parseInt(req.params.pageSize);
        app.model.courseType.getPage(pageNumber, pageSize, {}, (error, page) => {
            const response = {};
            if (error || page == null) {
                response.error = 'Danh sách loại khoá học không sẵn sàng!';
            } else {
                response.page = page;
            }
            res.send(response);
        });
    });

    app.get('/api/course-type/edit/:courseTypeId', app.permission.check('course:read'), (req, res) =>
        app.model.courseType.get(req.params.courseTypeId, (error, item) => res.send({ error, item })));


    app.post('/api/course-type', app.permission.check('course:write'), (req, res) =>
        app.model.courseType.create(req.body.data || {}, (error, item) => res.send({ error, item })
        ));

    app.put('/api/course-type', app.permission.check('course:write'), (req, res) => {
        const changes = req.body.changes;
        if (changes.categories && changes.categories == 'empty') changes.categories = [];
        app.model.courseType.update(req.body._id, req.body.changes, (error, item) => res.send({ error, item }))
    });

    app.delete('/api/course-type', app.permission.check('course:write'), (req, res) =>
        app.model.courseType.delete(req.body._id, (error) => res.send({ error }))
    );
    //Home
    app.get('/course-type/all/', (req, res) => app.model.courseType.getAll((error, items) => res.send({ error, items })));
};
