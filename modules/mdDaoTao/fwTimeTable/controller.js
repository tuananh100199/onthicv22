module.exports = (app) => {
    const menu = {
        parentMenu: app.parentMenu.trainning,
        menus: {
            4050: { title: 'Thời khóa biểu', link: '/user/time-table' },
        }
    };
    app.permission.add(
        { name: 'timeTable:read' }, { name: 'timeTable:write' }, { name: 'timeTable:delete' },  { name: 'timeTable:create', menu }
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

    app.get('/api/time-table/date-number', app.permission.check('timeTable:read'), (req, res) => {
        let { student, date, startHour, numOfHours } = req.query,
            dateTime = new Date(date).getTime();
        startHour = Number(startHour);
        numOfHours = Number(numOfHours);
        const endHour = startHour + numOfHours;

        app.model.timeTable.getAll({ student }, (error, items) => {
            if (error) {
                res.send({ error: 'Lỗi khi lấy dữ liệu thời khóa biểu' });
            } else {
                let dateNumber = 1;
                items = items || [];
                for (let i = 0; i < items.length; i++) {
                    const item = items[i],
                    itemEndHour =  item.startHour + item.numOfHours;

                    if (item.date.getTime() == dateTime && ((startHour >= item.startHour && startHour < itemEndHour) || (startHour < item.startHour && endHour > item.startHour))) {
                        dateNumber = -1;
                        break;
                    } else if (item.date.getTime() <= dateTime && item.startHour <= startHour) {
                        dateNumber++;
                    }
                    //  else {
                    //     break;
                    // }
                }
                res.send({ dateNumber });
            }
        });
    });

    app.post('/api/time-table', app.permission.check('timeTable:write'), (req, res) => {
        app.model.timeTable.create(req.body.data, (error, item) => res.send({ error, item }));
    });

    app.post('/api/time-table/admin', app.permission.check('timeTable:write'), (req, res) => {
        app.model.timeTable.create(req.body.data, (error, item) => res.send({ error, item }));
    });

    app.put('/api/time-table', app.permission.check('timeTable:write'), (req, res) => {
        app.model.timeTable.update(req.body._id, req.body.changes, (error, item) => res.send({ error, item }));
    });

    app.put('/api/time-table/admin', app.permission.check('timeTable:write'), (req, res) => {
        app.model.timeTable.update(req.body._id, req.body.changes, (error, item) => res.send({ error, item }));
    });
    
    app.delete('/api/time-table', app.permission.check('timeTable:delete'), (req, res) => {
        app.model.timeTable.delete(req.body._id, (error) => res.send({ error }));
    });

    app.delete('/api/time-table/admin', app.permission.check('timeTable:delete'), (req, res) => {
        app.model.timeTable.delete(req.body._id, (error) => res.send({ error }));
    });
    

    // Student API-----------------------------------------------------------------------------------------------------
    app.get('/api/time-table/student', app.permission.check('user:login'), (req, res) => {
        const userId = req.session.user._id;
        app.model.student.get({user: userId}, (error, item) => {
            if (error || item == null) {
                res.send({ error: 'Lỗi khi lấy thời khóa biểu học viên' });
            } else {
                app.model.timeTable.getPage(undefined, undefined, {student: item._id}, (error, page) => res.send({ error, page }));
            }
        });
    });

    // Hook permissionHooks -------------------------------------------------------------------------------------------
    app.permissionHooks.add('lecturer', 'timeTable', (user) => new Promise(resolve => {
        app.permissionHooks.pushUserPermission(user,'timeTable:read', 'timeTable:write');
        resolve();
    }));

    app.permissionHooks.add('courseAdmin', 'timeTable', (user) => new Promise(resolve => {
        app.permissionHooks.pushUserPermission(user, 'timeTable:read', 'timeTable:write', 'timeTable:delete');
        resolve();
    }));
  };