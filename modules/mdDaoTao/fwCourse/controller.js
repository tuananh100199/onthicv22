module.exports = (app) => {
    app.componentModel['course'] = app.model.course;
    // thêm quyền lock, close
    const menu = {
        parentMenu: app.parentMenu.trainning,
        menus: {
            4045: { title: 'Khóa học', link: '/user/course' }
        },
    };

    const courseMenu = {
        parentMenu: app.parentMenu.studentCourse,
        menus: {},
    };

    app.permission.add({
        name: 'course:read'
    },
        { name: 'course:write', menu },
        { name: 'course:delete' },
        { name: 'course:lock' },
        { name: 'studentCourse:read', menu: courseMenu }
    );
    app.get('/user/course', app.permission.check('course:read'), app.templates.admin);
    app.get('/user/course/:_id', app.permission.check('course:read'), app.templates.admin);
    app.get('/course/item/:_id', app.templates.home);
    app.get('/user/hoc-vien/khoa-hoc', app.permission.check('studentCourse:read'), app.templates.admin);
    app.get('/user/hoc-vien/khoa-hoc/:_id', app.permission.check('studentCourse:read'), app.templates.admin);
    app.get('/user/hoc-vien/khoa-hoc/thong-tin/:_id', app.permission.check('studentCourse:read'), app.templates.admin);
    app.get('/user/hoc-vien/khoa-hoc/de-thi-thu/:_id', app.permission.check('studentCourse:read'), app.templates.admin);
    app.get('/user/hoc-vien/khoa-hoc/de-thi-ngau-nhien/:_id', app.permission.check('studentCourse:read'), app.templates.admin);



    // APIs ------------------------------------------------------------------------------------------------------------
    app.get('/api/course/page/:pageNumber/:pageSize', app.permission.check('course:read'), (req, res) => {
        const pageNumber = parseInt(req.params.pageNumber),
            pageSize = parseInt(req.params.pageSize),
            pageCondition = {};
        if (req.session.user.division && req.session.user.division.isOutside) {
            pageCondition.admins = req.session.user._id;
            pageCondition.active = true;
        }
        app.model.course.getPage(pageNumber, pageSize, pageCondition, (error, page) => {
            res.send({ page, error: error || page == null ? 'Danh sách khóa học không sẵn sàng!' : null });
        });
    });

    app.get('/api/course', app.permission.check('course:read'), (req, res) => {
        const { _id } = req.query;
        app.model.course.get(_id, (error, item) => {
            if (item && req.session.user.isCourseAdmin && req.session.user.division && req.session.user.division.isOutside) {
                // Với user là isCourseAdmin + isOutside: ẩn đi các lecturer, student thuộc cơ sở của họ
                app.model.division.getAll({ isOutside: true }, (error, divisions) => {
                    const isOusideDivisions = [];
                    (divisions || []).forEach(division => division.isOutside && isOusideDivisions.push(division._id.toString()));

                    const groups = (item.groups || []).filter(group => group.teacher && group.teacher.division && isOusideDivisions.includes(group.teacher.division.toString()));
                    res.send({ error, item: app.clone(item, { groups }) });
                });
            } else {
                res.send({ error, item });
            }
        });
    });

    app.post('/api/course', app.permission.check('course:write'), (req, res) => {
        app.model.course.create(req.body.data || {}, (error, item) => res.send({ error, item }));
    });

    app.put('/api/course', (req, res, next) => (req.session.user && req.session.user.isCourseAdmin) ? next() : app.permission.check('course:write')(req, res, next), (req, res) => {
        let changes = req.body.changes || {};
        if (req.session.user && req.session.user.isCourseAdmin && req.session.user.division && req.session.user.division.isOutside) {
            if (changes.subjects && changes.subjects === 'empty') changes.subjects = [];
            const groups = changes.groups == null || changes.groups === 'empty' ? [] : changes.groups;
            //TODO: Với user là isCourseAdmin + isOutside: cho phép họ thêm / xoá lecturer, student thuộc cơ sở của họ
            changes = { groups };
        } else {
            if (changes.subjects && changes.subjects === 'empty') changes.subjects = [];
            if (changes.groups && changes.groups === 'empty') changes.groups = [];
            if (changes.admins && changes.admins === 'empty') changes.admins = [];
        }
        app.model.course.update(req.body._id, changes, (error, item) => res.send({ error, item }));
    });

    app.delete('/api/course', app.permission.check('course:delete'), (req, res) => {
        app.model.course.delete(req.body._id, (error) => res.send({ error }));
    });

    // Home -----------------------------------------------------------------------------------------------------------
    app.get('/home/course/page/:pageNumber/:pageSize', (req, res) => {
        const pageNumber = parseInt(req.params.pageNumber),
            pageSize = parseInt(req.params.pageSize);
        app.model.course.getPage(pageNumber, pageSize, { active: true }, (error, page) => {
            res.send({ page, error: error || page == null ? 'Danh sách khóa học không sẵn sàng!' : null });
        });
    });

    app.get('/home/course', (req, res) => {
        app.model.course.get({ _id: req.query._id, active: true }, (error, item) => res.send({ error, item }));
    });
    // Get courses by user
    app.get('/api/user-course', app.permission.check('course:read'), (req, res) => {
        const _userId = req.session.user._id;
        app.model.student.getAll({ user: _userId }, (error, students) => {
            res.send({ error, students });
        });
    });

    // APIs Get Course Of Student Mobile -------------------------------------------------------------------------------------
    app.get('/api/student/course', app.permission.check('course:read'), (req, res) => {
        const { _id } = req.query,
            studentId = req.session.user._id;
        req.session.user.currentCourse = _id;
        app.model.student.getAll({ user: studentId }, (error, students) => {
            if (error) {
                res.send({ error });
            } else {
                const studentMapper = {};

                students.forEach(item => studentMapper[item.course && item.course._id] = item._id);
                if (studentMapper[_id]) {
                    const _studentId = studentMapper[_id];
                    app.model.course.get(_id, (error, item) => res.send({ error, item, _studentId }));
                } else {
                    res.send({ notify: 'Bạn không thuộc khóa học này!' });
                }
            }
        });
    });

    // Hook permissionHooks -------------------------------------------------------------------------------------------
    app.permissionHooks.add('courseAdmin', 'course', (user) => new Promise(resolve => {
        app.permissionHooks.pushUserPermission(user, 'course:read');
        resolve();
    }));
};
