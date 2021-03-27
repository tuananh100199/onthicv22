module.exports = (app) => {
    const menu = {
        parentMenu: app.parentMenu.trainning,
        menus: {
            4040: { title: 'Khóa học', link: '/user/course' },
        },
    };
    app.permission.add({ name: 'course:read', menu }, { name: 'course:write' }, { name: 'course:delete' }, { name: 'course:lock' });

    app.get('/user/course', app.permission.check('course:read'), app.templates.admin);
    app.get('/user/course/:_id', app.permission.check('course:read'), app.templates.admin);
    app.get('/course/item/:_id', app.templates.home);

    // APIs ------------------------------------------------------------------------------------------------------------
    app.get('/api/course/page/:pageNumber/:pageSize', app.permission.check('course:read'), (req, res) => {
        const pageNumber = parseInt(req.params.pageNumber),
            pageSize = parseInt(req.params.pageSize);
        app.model.course.getPage(pageNumber, pageSize, {}, (error, page) => {
            res.send({ page, error: error || page == null ? 'Danh sách khóa học không sẵn sàng!' : null });
        });
    });

    app.get('/api/course', app.permission.check('course:read'), (req, res) => {
        app.model.course.get(req.query._id, (error, item) => res.send({ error, item }));
    });

    app.post('/api/course', app.permission.check('course:write'), (req, res) => {
        app.model.course.create(req.body.newData || {}, (error, item) => res.send({ error, item }));
    });

    app.put('/api/course', app.permission.check('course:write'), (req, res) => {
        const $set = req.body.changes;
        if ($set && $set.subjects && $set.subjects === 'empty') $set.subjects = [];
        if ($set && $set.groups && $set.groups === 'empty') $set.groups = [];
        if ($set && $set.admins && $set.admins === 'empty') $set.admins = [];
        app.model.course.update(req.body._id, $set, (error, item) => res.send({ error, item }))
    });

    app.delete('/api/course', app.permission.check('course:delete'), (req, res) => {
        app.model.course.delete(req.body._id, (error) => res.send({ error }));
    });

    // Home -----------------------------------------------------------------------------------------------------------------------------------------
    app.get('/course/page/:pageNumber/:pageSize', (req, res) => {
        const pageNumber = parseInt(req.params.pageNumber),
            pageSize = parseInt(req.params.pageSize);
        app.model.course.getPage(pageNumber, pageSize, { active: true }, (error, page) => {
            res.send({ page, error: error || page == null ? 'Danh sách khóa học không sẵn sàng!' : null });
        });
    });

    app.get('/course/item/id/:courseId', (req, res) => {
        app.model.course.get({ _id: req.params.courseId, active: true }, (error, item) => res.send({ error, item }));
    });
};