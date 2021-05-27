module.exports = (app) => {

    const lecturerMenu = {
        parentMenu: app.parentMenu.trainning,
        menus: {
            4050: { title: 'Cố vấn học tập', link: '/user/lecturer' }
        },
    };

    app.permission.add(
        { name: 'lecturer:read', menu: lecturerMenu },
        { name: 'lecturer:write' },
        { name: 'lecturer:delete' },
    );
    app.get('/user/lecturer', app.permission.check('lecturer:read'), app.templates.admin);
    app.get('/user/lecturer/:_id', app.permission.check('lecturer:read'), app.templates.admin);

    // API lecturer
    app.get('/api/lecturer-course/page/:pageNumber/:pageSize', app.permission.check('lecturer:read'), (req, res) => {
        const pageNumber = parseInt(req.params.pageNumber),
            pageSize = parseInt(req.params.pageSize),
            { pageCondition, courseType } = req.query,
            lecturerId = req.session.user._id;
        const condition = { courseType, teacherGroups: { $elemMatch: { teacher: lecturerId } }, active: true, ...pageCondition };
        if (req.session.user.division && req.session.user.division.isOutside) {
            condition.admins = req.session.user._id;
        }
        app.model.course.getPage(pageNumber, pageSize, condition, (error, page) => {
            res.send({ page, error: error || page == null ? 'Danh sách khóa học không sẵn sàng!' : null });
        });
    });
    app.get('/api/lecturer-course/student', app.permission.check('lecturer:read'), (req, res) => {
        const userId = req.session.user._id;
        app.model.course.get(req.body._id, (error, item) => {
            if (error || !item) {
                res.send({ error });
            } else {
                const listStudent = item.teacherGroups.filter(teacherGroup => teacherGroup.teacher && teacherGroup.teacher._id == userId);
                res.send({ error, item: listStudent[0].student });
            }
        });
    });

    // Hook permissionHooks -------------------------------------------------------------------------------------------
    app.permissionHooks.add('lecturer', 'lecturer', (user) => new Promise(resolve => {
        app.permissionHooks.pushUserPermission(user, 'lecturer:read');
        resolve();
    }));
};