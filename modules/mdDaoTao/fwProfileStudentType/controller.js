module.exports = app => {
    const menu = {
        parentMenu: app.parentMenu.enrollment,
        menus: {
            8025: { title: 'Loại giấy tờ học viên', link: '/user/profile-student-type', icon: 'fa-envelope-o', backgroundColor: '#00897b' },
        },
    };
    app.permission.add({ name: 'profileStudentType:read', menu }, { name: 'profileStudentType:write' }, { name: 'profileStudentType:delete' },);

    app.get('/user/profile-student-type', app.permission.check('profileStudentType:read'), app.templates.admin);

    // APIs -----------------------------------------------------------------------------------------------------------
    app.get('/api/profile-student-type/page/:pageNumber/:pageSize',app.permission.check('profileStudentType:read'), (req, res) => {
        const pageNumber = parseInt(req.params.pageNumber),
            pageSize = parseInt(req.params.pageSize),
            condition=req.query.condition;
        app.model.profileStudentType.getPage(pageNumber, pageSize, condition, (error, page) => res.send({ error, page }));
    });

    app.post('/api/profile-student-type', app.permission.check('profileStudentType:write'), (req, res) => {
        app.model.profileStudentType.create(req.body.data, (error, item) => res.send({ error, item }));
    });

    app.put('/api/profile-student-type', app.permission.check('profileStudentType:write'), (req, res) => {
        app.model.profileStudentType.update(req.body._id, req.body.changes, (error, item) => res.send({ error, item }));
    });

    app.delete('/api/profile-student-type', app.permission.check('profileStudentType:delete'), (req, res) => {
        app.model.profileStudentType.delete(req.body._id, error => res.send({ error }));
    });
};