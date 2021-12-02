module.exports = (app) => {
    app.permission.add(
        { name: 'registerCalendar:read' }, { name: 'registerCalendar:write' }, { name: 'registerCalendar:delete' }
    );

    app.get('/user/register-calendar', app.permission.check('registerCalendar:read'), app.templates.admin);
    app.get('/user/hoc-vien/khoa-hoc/:_id/dang-ky-lich-hoc', app.permission.check('user:login'), app.templates.admin);

    // APIs -----------------------------------------------------------------------------------------------------------

    app.get('/api/register-calendar/all', app.permission.check('registerCalendar:read'), (req, res) => {
        const condition = req.query.condition;
        app.model.registerCalendar.getAll({ lecturer: condition.lecturerId }, (error, list) => res.send({ error, list }));
    });

    app.get('/api/register-calendar', app.permission.check('registerCalendar:read'), (req, res) => {
        app.model.registerCalendar.get(req.query._id, (error, item) => res.send({ error, item }));
    });

    app.post('/api/register-calendar', app.permission.check('registerCalendar:write'), (req, res) => {
        app.model.registerCalendar.create(req.body.data, (error, item) => res.send({ error, item }));
    });

    app.post('/api/register-calendar/admin', app.permission.check('registerCalendar:write'), (req, res) => {
        app.model.registerCalendar.create(req.body.data, (error, item) => {
            if (error && !item) {
                res.send({ error });
            } else {
                app.model.registerCalendar.get(item._id, (error, item) => res.send({ error, item }));
            }
        });
    });

    app.put('/api/register-calendar/admin', app.permission.check('registerCalendar:write'), (req, res) => {
        app.model.registerCalendar.update(req.body._id, req.body.changes, (error, item) => {
            if (error && !item) {
                res.send({ error });
            } else {
                app.model.registerCalendar.get(item._id, (error, item) => res.send({ error, item }));
            }
        });
    });

    app.delete('/api/register-calendar/admin', app.permission.check('registerCalendar:delete'), (req, res) => {
        app.model.registerCalendar.delete(req.body._id, (error) => res.send({ error }));
    });

    // Course Admin && Lecturer API----------------------------------------------------------------------------------
    app.get('/api/register-calendar/page/admin/:pageNumber/:pageSize', app.permission.check('registerCalendar:read'), (req, res) => {
        // const { isCourseAdmin } = req.session.user || {};
        let pageNumber = parseInt(req.params.pageNumber),
            pageSize = parseInt(req.params.pageSize),
            condition = req.query.pageCondition || {},
            pageCondition = {};
            pageCondition = { lecturer: condition.lecturerId };
            // if (isCourseAdmin) {
            //     pageCondition.state = { $in:  ['approved', 'waiting', 'reject'] };
            // }
            if (condition.filterOn && JSON.parse(condition.filterOn)){
                let today  = new Date();
                pageCondition.dateOff = new Date(today.getFullYear(), today.getMonth(), today.getDate());
            }
            app.model.registerCalendar.getPage(pageNumber, pageSize, pageCondition, (error, page) =>{
                res.send({ error, page });
            } );
    });

    // Lecturer API---------------------------------------------------------------------------------------------------
    app.get('/api/register-calendar/lecturer', app.permission.check('registerCalendar:read'), (req, res) => {
        const condition = req.query.condition || {};
        let lecturerCondition = {};
        app.model.course.get(condition.courseId, (error, item) => {
            if (error || !item) {
                res.send({ error });
            } else {
                item = app.clone(item);
                const listStudent = item.teacherGroups.filter(teacherGroup => teacherGroup.teacher && teacherGroup.teacher._id == condition.lecturerId),
                studentIds = listStudent.length && listStudent[0].student.map(student => student._id);
                lecturerCondition.student = { $in:  studentIds };
                lecturerCondition.date = condition.date;
                app.model.registerCalendar.getAll(lecturerCondition, (error, items) => res.send({ error, items }));
            }
        });
    });

    // Student API-----------------------------------------------------------------------------------------------------
    app.get('/api/register-calendar/student', app.permission.check('user:login'), (req, res) => {
        const userId = req.session.user._id;
        const condition = req.query.condition || {};
        let lecturerCondition = {};
        app.model.student.get({ user: userId }, (error, item) => {
            if (error || item == null) {
                res.send({ error: 'Lỗi khi lấy đăng ký lịch học học viên' });
            } else {
                item = app.clone(item);
                const teacherGroups = item.course && item.course.teacherGroups && item.course.teacherGroups.length ? item.course.teacherGroups : [],
                teacherGroupOfStudent = teacherGroups.find(teacherGroup => teacherGroup.student && teacherGroup.student.length && teacherGroup.student.find(i => i == item._id)); // group chứa teacher của học viên
                
                if (teacherGroupOfStudent && teacherGroupOfStudent.teacher) {
                    const listStudent = teacherGroups.filter(teacherGroup => teacherGroup.teacher && teacherGroup.teacher == teacherGroupOfStudent.teacher),
                    studentIds = listStudent.length ? listStudent[0].student.map(student => student) : [];
                    lecturerCondition.student = { $in:  studentIds };
                    condition.date ? lecturerCondition.date = condition.date : null;
                    app.model.registerCalendar.getAll({ lecturer: teacherGroupOfStudent.teacher, state: 'approved' }, (error, list) => {
                        if(error) {
                            res.send({ error });
                        } else {
                            app.model.timeTable.getAll(lecturerCondition, (error, items) =>{
                                let listTimeTable = [];
                                items.forEach(item => {
                                    const expiredDate = new Date(item.createdAt).getTime() + 1000*3600*24;
                                    const now = new Date().getTime();
                                    if (item.state != 'waiting' || (item.state == 'waiting' && expiredDate > now)) {
                                        listTimeTable.push(item);
                                    }
                                });
                                app.model.car.get({ user: teacherGroupOfStudent.teacher, courseType: item.course && item.course.courseType }, (error, car) => {
                                    res.send({ error, listTimeTable, listRegisterCalendar: list ? list: [], car: car });
                                });
                            });

                        }
                    });
                }
            }
        });
    });

    // Hook permissionHooks -------------------------------------------------------------------------------------------
    app.permissionHooks.add('lecturer', 'registerCalendar', (user) => new Promise(resolve => {
        app.permissionHooks.pushUserPermission(user, 'registerCalendar:read', 'registerCalendar:write');
        resolve();
    }));

    app.permissionHooks.add('courseAdmin', 'registerCalendar', (user) => new Promise(resolve => {
        app.permissionHooks.pushUserPermission(user, 'registerCalendar:read', 'registerCalendar:write', 'registerCalendar:delete');
        resolve();
    }));
};