module.exports = app => {
    const menu = {
        parentMenu: app.parentMenu.trainning,
        menus: {
            4007: { title: 'Thay đổi giáo viên', link: '/user/change-lecturer', icon: 'fa fa-university', backgroundColor: 'rgb(106, 90, 205)' }
        }
    };
    app.permission.add({ name: 'changeLecturer:read', menu }, { name: 'changeLecturer:write' }, { name: 'changeLecturer:delete' });

    app.get('/user/change-lecturer', app.permission.check('changeLecturer:read'), app.templates.admin);

    // APIs -----------------------------------------------------------------------------------------------------------
    app.get('/api/change-lecturer/all', (req, res) => {
        const condition = {daNghiDay: false},
            searchText = req.query.searchText;
        if (searchText) {
            condition.title = new RegExp(searchText, 'i');
        }
        app.model.changeLecturer.getAll(condition, (error, list) => res.send({ error, list }));
    });

    app.get('/api/change-lecturer/page/:pageNumber/:pageSize', app.permission.check('changeLecturer:read'), (req, res) => {
        const pageNumber = parseInt(req.params.pageNumber),
            pageSize = parseInt(req.params.pageSize),
            pageCondition = req.query.pageCondition || {};
        app.model.changeLecturer.getPage(pageNumber, pageSize, pageCondition, (error, page) => res.send({ error, page }));
    });

    app.get('/api/change-lecturer', app.permission.check('changeLecturer:read'), (req, res) =>
        app.model.changeLecturer.get(req.query._id, (error, item) => res.send({ error, item })));

    app.post('/api/change-lecturer', app.permission.check('user:login'), (req, res) => {
        let data = req.body.data;
        if (!data.lecturer) {
            delete data.lecturer;
        }
        app.model.changeLecturer.create(req.body.data, (error, item) => res.send({ error, item }));
    });

    app.put('/api/change-lecturer', app.permission.check('changeLecturer:write'), (req, res) => {
        let { _id, changes } = req.body;
        if (!changes.lecturer) {
            delete changes.lecturer;
        }
        app.model.changeLecturer.get(_id, (error, item) => {
            if (error || !item) {
                res.send({ error: 'Lỗi khi lấy thông tin thay đổi giáo viên'});
            } else {
                if (changes.state == 'approved' && changes.lecturer) {
                    const condition= {},
                        _courseId = item && item.student && item.student.course && item.student.course._id,
                    _newTeacherId = changes.lecturer,
                    _studentId = item && item.student && item && item.student._id;

                    const teacherGroups = item.student && item.student.course && item.student.course.teacherGroups.find(({ student }) => student.find(({ _id }) => _id == _studentId.toString()) != null),
                    _oldTeacherId = (teacherGroups && teacherGroups.teacher) || null;  

                    app.model.course.removeStudentFromTeacherGroup(_courseId, _oldTeacherId, _studentId, () => {
                        app.model.course.addStudentToTeacherGroup(_courseId, _newTeacherId, _studentId, () => {
                            if (changes.state == 'approved' && (changes.lecturer || item.lecturer)) {
                                condition.student = _studentId;
                                condition.date = {
                                    $gte: new Date(),
                                };
                                app.model.timeTable.getAll(condition, (error, list) => {
                                    if (list && list.length && (_newTeacherId != _oldTeacherId)) {
                                        const timeTables = list.map(item => app.clone(item));
                                        const handleUpdateTimeTable = (index = 0) => {
                                            if (index == timeTables.length) {
                                                app.model.changeLecturer.update(_id, changes, (error, item) => res.send({ error, item }));
                                            } else {
                                                const timeTable = timeTables[index];
                                                app.model.timeTable.delete({ _id: timeTable._id }, () => {
                                                    handleUpdateTimeTable(index + 1);
                                                });
                                            }
                                        };
                                        handleUpdateTimeTable();
                                    } else {
                                        app.model.changeLecturer.update(_id, changes, (error, item) => res.send({ error, item }));
                                    }
                                });
                            } else {
                                app.model.changeLecturer.update(_id, changes, (error, item) => res.send({ error, item }));
                            }
                        });
                    });
                } else {
                    app.model.changeLecturer.update(_id, changes, (error, item) => res.send({ error, item }));
                }
                
            }
        });
    });

    app.delete('/api/change-lecturer', app.permission.check('changeLecturer:write'), (req, res) => {
        app.model.changeLecturer.delete(req.body._id, error => res.send({ error }));
    });
};