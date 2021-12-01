module.exports = (app) => {
    // const menu = {
    //     parentMenu: app.parentMenu.trainning,
    //     menus: {
    //         4050: { title: 'Thời khóa biểu', link: '/user/time-table' },
    //     }
    // };
    app.permission.add(
        { name: 'timeTable:read' }, { name: 'timeTable:write' }, { name: 'timeTable:delete' }, { name: 'timeTable:create' }
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
            res.send({ dateNumber });
        });
    });
    });

    app.post('/api/time-table', app.permission.check('timeTable:write'), (req, res) => {
        app.model.timeTable.create(req.body.data, (error, item) => res.send({ error, item }));
    });

    app.post('/api/time-table/admin', app.permission.check('timeTable:write'), (req, res) => {
        let data = app.clone(req.body.data);
        if (data.car == '') {
            delete data.car;
        }
        app.model.student.get(data.student, (error, item) => {
            if (error || item == null) {
                res.send({ error: 'Lỗi khi tạo thời khóa biểu học viên' });
            } else {
                let soGioThucHanhDaHoc = item.soGioThucHanhDaHoc ? Number(item.soGioThucHanhDaHoc) : 0,
                tongSoGioHocThucHanh = item.course && item.course.practiceNumOfHours ? Number(item.course.practiceNumOfHours) : 0;

                if (soGioThucHanhDaHoc < tongSoGioHocThucHanh) {
                    if (data.state == 'approved') {
                        soGioThucHanhDaHoc += Number(data.numOfHours);
                    }

                    if (soGioThucHanhDaHoc > tongSoGioHocThucHanh) {
                        res.send({ error: 'Tổng số giờ học lớn hơn giờ học quy định, học viên vui lòng mua thêm giờ học'});
                    } else {
                        app.model.timeTable.create(data, (error, newItem) => {
                            if (error && !newItem) {
                                res.send({ error });
                            } else {
                                app.model.student.update(newItem.student && newItem.student._id, { soGioThucHanhDaHoc }, () => {
                                    app.model.timeTable.get(newItem._id, (error, item) => res.send({ error, item }));
                                });
                            }
                        });
                    }
                } else {
                    res.send({ error: 'Học viên đã hết số giờ học thực hành quy định' });
                }
            }
        });        
    });

    app.put('/api/time-table', app.permission.check('timeTable:write'), (req, res) => {
        app.model.timeTable.update(req.body._id, req.body.changes, (error, item) => res.send({ error, item }));
    });

    app.put('/api/time-table/admin', app.permission.check('timeTable:write'), (req, res) => {
        const { _id,  changes } = req.body;
        if (changes.car == '') {
            delete changes.car;
        }
        
        app.model.timeTable.get(_id, (error, item) => {
            if (error) {
                res.send({ error });
            } else if(!item) {
                res.send({ error: 'Lỗi khi lấy thông tin thời khóa biểu học viên' });
            } else {
                let tongSoGioHocThucHanh = item.student && item.student.course ? item.student.course.practiceNumOfHours : 0,
                soGioThucHanhDaHoc = item.student ?  Number(item.student.soGioThucHanhDaHoc) : 0;

                if (changes.state != 'approved' && item.state == 'approved') {
                    soGioThucHanhDaHoc -= changes.numOfHours ? Number(changes.numOfHours) : Number(item.numOfHours);
                } else if (changes.state == 'approved' && item.state != 'approved') {
                    soGioThucHanhDaHoc += changes.numOfHours ? Number(changes.numOfHours) : Number(item.numOfHours);
                } else if (changes.state == 'approved' && item.state == 'approved' && (changes.numOfHours != item.numOfHours)) {
                    const numHoursChange = Number(changes.numOfHours) - Number(item.numOfHours);
                    soGioThucHanhDaHoc += numHoursChange;
                }

                if (soGioThucHanhDaHoc > tongSoGioHocThucHanh) {
                    res.send({ error: 'Tổng số giờ học lớn hơn giờ học quy định, học viên vui lòng mua thêm giờ học'});
                } else {
                    app.model.timeTable.update(_id, changes, (error, timeTable) => {
                        if (error && !timeTable) {
                            res.send({ error });
                        } else {
                            app.model.student.update(item.student && item.student._id, { soGioThucHanhDaHoc }, () => {
                                app.model.timeTable.get(timeTable._id, (error, item) => res.send({ error, item }));
                            });
                        }
                    });
                }
            }
        });
    });

    app.delete('/api/time-table', app.permission.check('timeTable:delete'), (req, res) => {
        app.model.timeTable.delete(req.body._id, (error) => res.send({ error }));
    });

    app.delete('/api/time-table/admin', app.permission.check('timeTable:delete'), (req, res) => {
        app.model.timeTable.get(req.body._id, (error, item) => {
            if (error) {
                res.send({ error });
            } else if(!item) {
                res.send({ error: 'Lỗi khi lấy thông tin thời khóa biểu học viên' });
            } else {
                let soGioThucHanhDaHoc = item.student.soGioThucHanhDaHoc;
                if (item.state == 'approved') {
                        soGioThucHanhDaHoc -= item.numOfHours;
                }
                app.model.student.update(item.student && item.student._id, { soGioThucHanhDaHoc }, () => {
                    app.model.timeTable.delete(req.body._id, (error) => res.send({ error }));
                });
            }
        });
    });

    // Course Admin && Lecturer API----------------------------------------------------------------------------------
    app.get('/api/time-table/page/admin/:pageNumber/:pageSize', app.permission.check('timeTable:read'), (req, res) => {
        let pageNumber = parseInt(req.params.pageNumber),
            pageSize = parseInt(req.params.pageSize),
            condition = req.query.pageCondition || {},
            pageCondition = {};
        app.model.course.get(condition.courseId, (error, item) => {
            if (error || !item) {
                res.send({ error });
            } else {
                item = app.clone(item);
                const listStudent = item.teacherGroups.filter(teacherGroup => teacherGroup.teacher && teacherGroup.teacher._id == condition.lecturerId),
                studentIds = listStudent.length && listStudent[0].student.map(student => student._id);
                pageCondition = { student: { $in:  studentIds } };
                if (condition.filterOn && JSON.parse(condition.filterOn)){
                    let today  = new Date();
                    pageCondition.date = new Date(today.getFullYear(), today.getMonth(), today.getDate());
                }
                if (condition.official && JSON.parse(condition.official)) {
                    pageCondition.state = 'approved';
                }
                app.model.timeTable.getPage(pageNumber, pageSize, pageCondition, (error, page) => res.send({ error, page }));
            }
        });
    });

    app.get('/api/time-table/lecturer', app.permission.check('timeTable:read'), (req, res) => {
        const { isCourseAdmin } = req.session.user || {};
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
                if (condition.date) {
                    lecturerCondition.date = condition.date;
                }
                if (condition.official && JSON.parse(condition.official)) {
                    lecturerCondition.state = 'approved';
                } else {
                    if (isCourseAdmin) {
                        lecturerCondition.state = { $in: ['approved', 'waiting', 'reject', 'cancel', 'autoCancel' ] };
                    } else {
                        lecturerCondition.state = { $in: ['approved', 'waiting', 'reject', 'cancel' ] };
                    }
                }
                app.model.timeTable.getAll(lecturerCondition, (error, items) => res.send({ error, items }));
            }
        });
    });
   
    // Car Calendar API -------------------------------------------------------------------------------------------
    app.get('/api/time-table/car/page/:pageNumber/:pageSize', app.permission.check('timeTable:read'), (req, res) => {
        let pageNumber = parseInt(req.params.pageNumber),
            pageSize = parseInt(req.params.pageSize),
            condition = req.query.pageCondition || {},
            pageCondition = {};
        if (condition.filterOn && JSON.parse(condition.filterOn)){
            let today  = new Date();
            pageCondition.date = new Date(today.getFullYear(), today.getMonth(), today.getDate());
        }
        if (condition.official && JSON.parse(condition.official)) {
            pageCondition.state = 'approved';
        }
        pageCondition.car = condition.carId;
        app.model.timeTable.getPage(pageNumber, pageSize, pageCondition, (error, page) => res.send({ error, page }));
    });

    app.get('/api/time-table/car', app.permission.check('timeTable:read'), (req, res) => {
        const condition = req.query.condition || {};
        let carCondition = {};
        if (condition.date) {
            carCondition.date = condition.date;
        }
        if (condition.official && JSON.parse(condition.official)) {
            carCondition.state = 'approved';
        }
        carCondition.car = condition.carId;
        app.model.timeTable.getAll(carCondition, (error, items) => res.send({ error, items }));
    });
    
    // Student API-----------------------------------------------------------------------------------------------------
    app.get('/api/time-table/student', app.permission.check('user:login'), (req, res) => {
        const userId = req.session.user._id;
        app.model.student.get({ user: userId }, (error, item) => {
            if (error || item == null) {
                res.send({ error: 'Lỗi khi lấy thời khóa biểu học viên' });
            } else {
                app.model.timeTable.getPage(undefined, undefined, { student: item._id, state: 'approved' }, (error, page) => res.send({ error, page }));
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

    app.put('/api/time-table/student', app.permission.check('user:login'), (req, res) => {
        app.model.timeTable.update(req.body._id, req.body.changes, (error, item) => {
            if (error && !item) {
                res.send({ error });
            } else {
                app.model.timeTable.get(item._id, (error, item) => res.send({ error, item }));
            }
        });
    });

    app.delete('/api/time-table/student', app.permission.check('user:login'), (req, res) => {
        app.model.timeTable.delete(req.body._id, (error) => res.send({ error }));
    });


    // Hook permissionHooks -------------------------------------------------------------------------------------------
    app.permissionHooks.add('lecturer', 'timeTable', (user) => new Promise(resolve => {
        app.permissionHooks.pushUserPermission(user, 'timeTable:read', 'timeTable:write', 'timeTable:delete');
        resolve();
    }));

    app.permissionHooks.add('courseAdmin', 'timeTable', (user) => new Promise(resolve => {
        app.permissionHooks.pushUserPermission(user, 'timeTable:read', 'timeTable:write', 'timeTable:delete');
        resolve();
    }));
};