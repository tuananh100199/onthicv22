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

    app.permission.add(
        { name: 'course:read' },
        { name: 'course:write', menu },
        { name: 'course:delete' },
        { name: 'course:lock' },
        { name: 'course:export' },
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
        const { _id } = req.query, sessionUser = req.session.user;
        app.model.course.get(_id, (error, item) => {
            const division = sessionUser.division, courseFees = item.courseFees;
            if (item && sessionUser.isCourseAdmin && division && division.isOutside) {
                // Với user là isCourseAdmin + isOutside: ẩn đi các lecturer, student thuộc cơ sở của họ
                const courseFee = courseFees.find(courseFee => courseFee.division == division._id);
                if (courseFee) item.courseFee = courseFee.fee;
                app.model.division.getAll({ isOutside: true }, (error, divisions) => {
                    const groups = (item.groups || []).reduce((result, group) => group.teacher && group.teacher.division &&
                        divisions.findIndex(div => div._id.toString() == group.teacher.division.toString()) != -1 ? [...result, group] : result, []);
                    res.send({ error, item: app.clone(item, { groups }) });
                });
            } else {
                item.courseFee = courseFees[0] && courseFees[0].fee;
                res.send({ error, item });
            }
        });
    });

    app.post('/api/course', app.permission.check('course:write'), (req, res) => {
        app.model.course.create(req.body.data || {}, (error, item) => res.send({ error, item }));
    });

    app.put('/api/course', (req, res, next) => (req.session.user && req.session.user.isCourseAdmin) ? next() : app.permission.check('course:write')(req, res, next), (req, res) => {
        let changes = req.body.changes || {};
        const sessionUser = req.session.user, courseFees = changes.courseFees, division = sessionUser.division;
        if (sessionUser && sessionUser.isCourseAdmin && division && division.isOutside) {
            if (courseFees) {
                const index = courseFees.findIndex(courseFee => courseFee.division == division._id);
                if (index != -1) courseFees[index].fee = changes.courseFee;
                else courseFees.push({
                    division: division._id,
                    fee: changes.courseFee
                });
            }
            if (changes.subjects && changes.subjects === 'empty') changes.subjects = [];
            const groups = changes.groups == null || changes.groups === 'empty' ? [] : changes.groups;
            //TODO: Với user là isCourseAdmin + isOutside: cho phép họ thêm / xoá lecturer, student thuộc cơ sở của họ
            changes = { groups };
        } else {
            if (courseFees) courseFees[0].fee = changes.courseFee;
            if (changes.subjects && changes.subjects === 'empty') changes.subjects = [];
            if (changes.groups && changes.groups === 'empty') changes.groups = [];
            if (changes.admins && changes.admins === 'empty') changes.admins = [];
        }
        delete changes.courseFee;
        app.model.course.update(req.body._id, changes, (error, item) => res.send({ error, item }));
    });
    // app.permission.check('course:export'),
    app.get('/api/course/export', (req, res) => {
        const currentCourse = req.session.user.currentCourse;
        app.model.course.get(currentCourse, (error, course) => {
            if (error) {
                res.send({ error });
            } else {
                const numOfLesson = course.subjects.reduce((a, b) => (b.lessons ? b.lessons.length : 0) + a, 0);

                const workbook = app.excel.create(), worksheet = workbook.addWorksheet('Student');
                const cells = [
                    { cell: 'A1', border: '1234', value: 'STT', font: { size: 12, align: 'center' }, bold: true },
                    { cell: 'B1', border: '1234', value: 'Họ', font: { size: 12, align: 'center' }, bold: true },
                    { cell: 'C1', border: '1234', value: 'Tên', font: { size: 12, align: 'center' }, bold: true },
                ];
                worksheet.columns = [
                    { header: 'STT', key: 'id', width: 15 },
                    { header: 'Họ', key: 'lastname', width: 20 },
                    { header: 'Tên', key: 'firstname', width: 20 },
                ];
                let row = 1;
                course.groups.forEach(group => {
                    group.student.forEach(item => {
                        row++;
                        worksheet.insertRow(row, [row - 1, item.lastname, item.firstname]);
                    });
                });
                // ['A1:A2', 'B1:B2', 'C1:C2'].forEach((item, index) => worksheet.mergeCells(item));
                // let countIndex = 0;
                // const mergeCells = course.subjects.map((item, index) => {
                //     cells.push({
                //         cell: `${String.fromCharCode('D'.charCodeAt() + countIndex)}1`,
                //         border: '1234',
                //         value: item.title,
                //         font: { size: 12, align: 'center' }, bold: true
                //     });
                //     const currentCountIndex = countIndex;
                //     countIndex += item.lessons.length;
                //     return `${String.fromCharCode('D'.charCodeAt() + currentCountIndex)}1:${String.fromCharCode('D'.charCodeAt() + (countIndex - 1))}1`;
                // })
                // mergeCells.forEach((item, index) => worksheet.mergeCells(item));
                new Promise((resolve, reject) => {
                    let count = 0;
                    let countIndex = 0;
                    // const mergeCells = course.subjects.map((item) => {
                    //     cells.push({
                    //         cell: `${String.fromCharCode('D'.charCodeAt() + countIndex)}1`,
                    //         border: '1234',
                    //         value: item.title,
                    //         font: { size: 12, align: 'center' }, bold: true
                    //     });
                    //     const currentCountIndex = countIndex;
                    //     countIndex += item.lessons.length;
                    //     return `${String.fromCharCode('D'.charCodeAt() + currentCountIndex)}1:${String.fromCharCode('D'.charCodeAt() + (countIndex - 1))}1`;
                    // });
                    // mergeCells.forEach((item) => worksheet.mergeCells(item));
                    ['A1:A2', 'B1:B2', 'C1:C2'].forEach((item) => worksheet.mergeCells(item));
                    for (const item of course.subjects) {
                        if (item) {
                            app.model.subject.get(item._id, (error, subject) => {
                                if (error) {
                                    reject(error);
                                } else {
                                    cells.push({
                                        cell: `${String.fromCharCode('D'.charCodeAt() + countIndex)}1`,
                                        border: '1234',
                                        value: subject.title,
                                        font: { size: 12, align: 'center' }, bold: true
                                    });
                                    const currentCountIndex = countIndex;
                                    countIndex += subject.lessons.length;
                                    worksheet.mergeCells(`${String.fromCharCode('D'.charCodeAt() + currentCountIndex)}1:${String.fromCharCode('D'.charCodeAt() + (countIndex - 1))}1`);
                                    for (const lesson of subject.lessons) {
                                        cells.push(
                                            {
                                                cell: `${String.fromCharCode('D'.charCodeAt() + count)}2`,
                                                border: '1234',
                                                value: lesson.title,
                                                font: { size: 12, align: 'center' },
                                                bold: true
                                            }
                                        );
                                        count++;
                                        if (count == numOfLesson) {
                                            resolve();
                                        }
                                    }
                                }
                            });
                        }
                    }
                }).then(() => {
                    app.excel.write(worksheet, cells);
                    app.excel.attachment(workbook, res, 'Student.xlsx');
                }).catch(error => res.send(error));
                // worksheet.columns = [
                //     { header: 'STT', key: 'id', width: 15 },
                //     { header: 'Họ', key: 'lastname', width: 20 },
                //     { header: 'Tên', key: 'firstname', width: 20 },
                // ];
                // worksheet.mergeCells
                // list.forEach((item, index) => {
                //     worksheet.addRow({
                //         id: index + 1,
                //         lastname: item.lastname,
                //         firstname: item.firstname,
                //         email: item.email,
                //         phoneNumber: item.phoneNumber,
                //         courseType: item.courseType ? item.courseType.title : 'Chưa đăng ký',
                //         state: item.state,
                //         createdDate: item.createdDate
                //     });
                // });
            }
        });
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
    // APIs Get Course Of Student -------------------------------------------------------------------------------------
    app.get('/api/student/course', app.permission.check('user:login'), (req, res) => {
        const _userId = req.session.user._id;
        app.model.student.getAll({ user: _userId }, (error, students) => {
            if (error || students.length == 0) {
                res.send({ error });
            } else {
                const courses = [];
                students.map(student => {
                    if (student.course && student.course.active) {
                        courses.push(student.course);
                    }
                });
                res.send({ courses });
            }
        });
    });

    app.get('/api/course/student', app.permission.check('course:read'), (req, res) => {
        const _courseId = req.query._id,
            _studentId = req.session.user._id;
        req.session.user.currentCourse = _courseId;
        app.model.student.getAll({ user: _studentId, course: _courseId }, (error, students) => {
            if (error) {
                res.send({ error });
            } else if (students.length == 0) {
                res.send({ notify: 'Bạn không thuộc khóa học này!' });
            } else {
                if (students[0].course && students[0].course.active) {
                    app.model.course.get(_courseId, (error, item) => res.send({ error, item, _studentId: students[0]._id }));
                } else {
                    res.send({ notify: 'Khóa học chưa được kích hoạt!' });
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
