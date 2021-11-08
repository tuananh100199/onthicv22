module.exports = (app) => {
    const menu = {
        parentMenu: app.parentMenu.trainning,
        menus: {
            4050: { title: 'Thời khóa biểu', link: '/user/time-table' },
        }
    };
    app.permission.add(
        { name: 'timeTable:read' }, { name: 'timeTable:write' }, { name: 'timeTable:delete' }, { name: 'timeTable:create', menu }
    );

    app.get('/user/time-table', app.permission.check('timeTable:read'), app.templates.admin);
    app.get('/user/hoc-vien/khoa-hoc/:_id/thoi-khoa-bieu', app.permission.check('user:login'), app.templates.admin);
    app.get('/user/lecturer/student-time-table', app.permission.check('timeTable:write'), app.templates.admin);
    app.get('/user/course-admin/student-time-table', app.permission.check('timeTable:write'), app.templates.admin);
    app.get('/user/course/:courseId/student/:studentId/time-table', app.permission.check('timeTable:write'), app.templates.admin);

    // APIs -----------------------------------------------------------------------------------------------------------
    app.get('/api/time-table/page/:pageNumber/:pageSize', app.permission.check('timeTable:read'), (req, res) => {
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
            app.model.timeTable.getPage(pageNumber, pageSize, pageCondition, (error, page) => res.send({ error, page }));
        } catch (error) {
            res.send({ error });
        }
    });

    app.get('/api/time-table', app.permission.check('timeTable:read'), (req, res) => {
        app.model.timeTable.get(req.query._id, (error, item) => res.send({ error, item }));
    });

    app.get('/api/time-table/date-number', app.permission.check('user:login'), (req, res) => {
        let { _id, student, date, startHour, numOfHours } = req.query,
            dateTime = new Date(date).getTime();
        startHour = Number(startHour);
        numOfHours = Number(numOfHours);
        const endHour = startHour + numOfHours;
        let currentList = null ;
        app.model.timeTable.getAll({ student }, (error, items) => {
        new Promise((resolve) => {
            if (error) {
                res.send({ error: 'Lỗi khi lấy dữ liệu thời khóa biểu' });
            } else {
                currentList = items.map(item => app.clone(item));
                if (_id) {
                    app.model.timeTable.get(_id, (error, timeTable) => {
                        if(timeTable) {
                            currentList = currentList.filter(item => item._id != timeTable._id);
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
            console.log('dateNumber', dateNumber);
            res.send({ dateNumber });
        });
    });
    });

    app.post('/api/time-table', app.permission.check('timeTable:write'), (req, res) => {
        app.model.timeTable.create(req.body.data, (error, item) => res.send({ error, item }));
    });

    app.post('/api/time-table/admin', app.permission.check('timeTable:write'), (req, res) => {
        app.model.timeTable.create(req.body.data, (error, item) => {
            if (error && !item) {
                res.send({ error });
            } else {
                app.model.timeTable.get(item._id, (error, item) => res.send({ error, item }));
            }
        });
    });

    app.put('/api/time-table', app.permission.check('timeTable:write'), (req, res) => {
        app.model.timeTable.update(req.body._id, req.body.changes, (error, item) => res.send({ error, item }));
    });

    app.put('/api/time-table/admin', app.permission.check('timeTable:write'), (req, res) => {
        app.model.timeTable.update(req.body._id, req.body.changes, (error, item) => {
            if (error && !item) {
                res.send({ error });
            } else {
                app.model.timeTable.get(item._id, (error, item) => res.send({ error, item }));
            }
        });
    });

    app.delete('/api/time-table', app.permission.check('timeTable:delete'), (req, res) => {
        app.model.timeTable.delete(req.body._id, (error) => res.send({ error }));
    });

    app.delete('/api/time-table/admin', app.permission.check('timeTable:delete'), (req, res) => {
        app.model.timeTable.delete(req.body._id, (error) => res.send({ error }));
    });

    // Course Admin && Lecturer API----------------------------------------------------------------------------------
    app.get('/api/time-table/page/admin/:pageNumber/:pageSize', app.permission.check('timeTable:read'), (req, res) => {
        let pageNumber = parseInt(req.params.pageNumber),
            pageSize = parseInt(req.params.pageSize),
            condition = req.query.pageCondition || {},
            pageCondition = {},
            filterOn = JSON.parse(condition.filterOn);
        app.model.course.get(condition.courseId, (error, item) => {
            if (error || !item) {
                res.send({ error });
            } else {
                item = app.clone(item);
                const listStudent = item.teacherGroups.filter(teacherGroup => teacherGroup.teacher && teacherGroup.teacher._id == condition.lecturerId),
                studentIds = listStudent.length && listStudent[0].student.map(student => student._id);
                pageCondition = { student: { $in:  studentIds } };
                if (filterOn){
                    let today  = new Date();
                    pageCondition.date = new Date(today.getFullYear(), today.getMonth(), today.getDate());
                }
                app.model.timeTable.getPage(pageNumber, pageSize, pageCondition, (error, page) => res.send({ error, page }));
            }
        });
    });

    app.get('/api/time-table/lecturer', app.permission.check('timeTable:read'), (req, res) => {
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
                app.model.timeTable.getAll(lecturerCondition, (error, items) => res.send({ error, items }));
            }
        });
    });
    
    // Student API-----------------------------------------------------------------------------------------------------
    app.get('/api/time-table/student', app.permission.check('user:login'), (req, res) => {
        const userId = req.session.user._id;
        app.model.student.get({ user: userId }, (error, item) => {
            if (error || item == null) {
                res.send({ error: 'Lỗi khi lấy thời khóa biểu học viên' });
            } else {
                app.model.timeTable.getPage(undefined, undefined, { student: item._id }, (error, page) => res.send({ error, page }));
            }
        });
    });
    app.post('/api/time-table/student', app.permission.check('user:login'), (req, res) => {
        const userId = req.session.user._id,
        data = app.clone(req.body.data);
        data.state = 'waiting';
        app.model.student.get({ user: userId }, (error, student) => {
            if (error || student == null) {
                res.send({ error: 'Lỗi khi tạo lịch học học viên' });
            } else {
                data.student = student._id;
                app.model.timeTable.create(data, (error, item) => {
                    if (error && !item) {
                        res.send({ error });
                    } else {
                        app.model.timeTable.get(item._id, (error, item) => res.send({ error, item }));
                    }
                });
            }
        });
      
    });

    // Hook permissionHooks -------------------------------------------------------------------------------------------
    app.permissionHooks.add('lecturer', 'timeTable', (user) => new Promise(resolve => {
        app.permissionHooks.pushUserPermission(user, 'timeTable:read', 'timeTable:write');
        resolve();
    }));

    app.permissionHooks.add('courseAdmin', 'timeTable', (user) => new Promise(resolve => {
        app.permissionHooks.pushUserPermission(user, 'timeTable:read', 'timeTable:write', 'timeTable:delete');
        resolve();
    }));
};