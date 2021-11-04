module.exports = (app) => {
    const menu = {
        parentMenu: app.parentMenu.trainning,
        menus: {
            4050: { title: 'Lịch dạy', link: '/user/register-calendar' },
        }
    };
    app.permission.add(
        { name: 'registerCalendar:read' }, { name: 'registerCalendar:write' }, { name: 'registerCalendar:delete' }, { name: 'registerCalendar:create', menu }
    );

    app.get('/user/register-calendar', app.permission.check('registerCalendar:read'), app.templates.admin);

    // APIs -----------------------------------------------------------------------------------------------------------
    app.get('/api/register-calendar/page/:pageNumber/:pageSize', app.permission.check('registerCalendar:read'), (req, res) => {
        let pageNumber = parseInt(req.params.pageNumber),
            pageSize = parseInt(req.params.pageSize),
            condition = req.query.pageCondition || {},
            pageCondition = {};
        try {
            if (condition) {
                pageCondition.$or = [];
                if (condition.searchText) {
                    const value = { $regex: `.*${condition.searchText}.*`, $options: 'i' };
                    pageCondition.$or.push(
                        { firstname: value },
                        { lastname: value },
                    );
                }
                if (condition.student) {
                    pageCondition.student = condition.student;
                }
                if (pageCondition.$or.length == 0) delete pageCondition.$or;
            }
            app.model.registerCalendar.getPage(pageNumber, pageSize, pageCondition, (error, page) => res.send({ error, page }));
        } catch (error) {
            res.send({ error });
        }
    });

    app.get('/api/register-calendar', app.permission.check('registerCalendar:read'), (req, res) => {
        app.model.registerCalendar.get(req.query._id, (error, item) => res.send({ error, item }));
    });

    app.get('/api/register-calendar/date-number', app.permission.check('registerCalendar:read'), (req, res) => {
        let { _id, student, date, startHour, numOfHours } = req.query,
            dateTime = new Date(date).getTime();
        startHour = Number(startHour);
        numOfHours = Number(numOfHours);
        const endHour = startHour + numOfHours;
        let currentList = null ;
        app.model.registerCalendar.getAll({ student }, (error, items) => {
        new Promise((resolve) => {
            if (error) {
                res.send({ error: 'Lỗi khi lấy dữ liệu thời khóa biểu' });
            } else {
                currentList = items.map(item => app.clone(item));
                if (_id) {
                    app.model.registerCalendar.get(_id, (error, registerCalendar) => {
                        if(registerCalendar) {
                            currentList = currentList.filter(item => item._id != registerCalendar._id);
                            resolve(currentList);
                        }
                    });
                } else {
                    resolve(currentList);
                }
            }
        }).then((currentList) => {
            let dateNumber = 1;
            currentList = currentList || [];
            for (let i = 0; i < currentList.length; i++) {
                const item = currentList[i],
                itemEndHour =  item.startHour + item.numOfHours;
                item.date = new Date(item.date);
                if (item.date.getTime() == dateTime && ((startHour >= item.startHour && startHour < itemEndHour) || (startHour < item.startHour && endHour > item.startHour))) {
                    dateNumber = -1;
                    break;
                } else if (item.date.getTime() <= dateTime && item.startHour <= startHour) {
                    dateNumber++;
                }
            }
            res.send({ dateNumber });
        });
    });
    });

    app.post('/api/register-calendar', app.permission.check('registerCalendar:write'), (req, res) => {
        app.model.registerCalendar.create(req.body.data, (error, item) => res.send({ error, item }));
    });

    app.post('/api/register-calendar/admin', app.permission.check('registerCalendar:write'), (req, res) => {
        const data = app.clone(req.body.data);
        data.lecturer = req.session.user._id;
        app.model.registerCalendar.create(data, (error, item) => {
            if (error && !item) {
                res.send({ error });
            } else {
                app.model.registerCalendar.get(item._id, (error, item) => res.send({ error, item }));
            }
        });
    });

    app.put('/api/register-calendar', app.permission.check('registerCalendar:write'), (req, res) => {
        app.model.registerCalendar.update(req.body._id, req.body.changes, (error, item) => res.send({ error, item }));
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

    app.delete('/api/register-calendar', app.permission.check('registerCalendar:delete'), (req, res) => {
        app.model.registerCalendar.delete(req.body._id, (error) => res.send({ error }));
    });

    app.delete('/api/register-calendar/admin', app.permission.check('registerCalendar:delete'), (req, res) => {
        app.model.registerCalendar.delete(req.body._id, (error) => res.send({ error }));
    });

    // Course Admin && Lecturer API----------------------------------------------------------------------------------
    app.get('/api/register-calendar/page/admin/:pageNumber/:pageSize', app.permission.check('registerCalendar:read'), (req, res) => {
        let pageNumber = parseInt(req.params.pageNumber),
            pageSize = parseInt(req.params.pageSize),
            condition = req.query.pageCondition || {},
            pageCondition = {};
    
            pageCondition = { lecturer: condition.lecturerId };
            if (JSON.parse(condition.filterOn)){
                let today  = new Date();
                pageCondition.dateOff = new Date(today.getFullYear(), today.getMonth(), today.getDate());
            }
            console.log('pageCondition', pageCondition);
            app.model.registerCalendar.getPage(pageNumber, pageSize, pageCondition, (error, page) =>{
                console.log('error', error);
                console.log('page', page);

                res.send({ error, page });
            } );
    });

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
        app.model.student.get({ user: userId }, (error, item) => {
            if (error || item == null) {
                res.send({ error: 'Lỗi khi lấy thời khóa biểu học viên' });
            } else {
                app.model.registerCalendar.getPage(undefined, undefined, { student: item._id }, (error, page) => res.send({ error, page }));
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