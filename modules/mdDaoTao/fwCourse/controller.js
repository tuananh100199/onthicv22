module.exports = (app) => {
    app.componentModel['course'] = app.model.course;
    // thêm quyền lock, close
    const menu = {
        parentMenu: app.parentMenu.trainning,
        menus: {
            4045: { title: 'Khóa học', link: '/user/course' }
        },
    };

    app.permission.add(
        { name: 'course:read' },
        { name: 'course:write', menu },
        { name: 'course:delete' },
        { name: 'course:lock' },
        { name: 'course:export' },
        { name: 'studentCourse:read' }
    );
    app.get('/user/course', app.permission.check('course:read'), app.templates.admin);
    app.get('/user/course/:_id', app.permission.check('course:read'), app.templates.admin);
    app.get('/course/item/:_id', app.templates.home);
    app.get('/user/hoc-vien/khoa-hoc', app.permission.check('studentCourse:read'), app.templates.admin);
    app.get('/user/hoc-vien/khoa-hoc/:_id', app.permission.check('studentCourse:read'), app.templates.admin);
    app.get('/user/hoc-vien/khoa-hoc/thong-tin/:_id', app.permission.check('studentCourse:read'), app.templates.admin);

    // APIs ------------------------------------------------------------------------------------------------------------
    app.get('/api/course/page/:pageNumber/:pageSize', app.permission.check('course:read'), (req, res) => {
        const pageNumber = parseInt(req.params.pageNumber),
            pageSize = parseInt(req.params.pageSize),
            { pageCondition, courseType } = req.query;

        const condition = { courseType, ...pageCondition };
        if (req.session.user.division && req.session.user.division.isOutside) {
            condition.admins = req.session.user._id;
            condition.active = true;
        }

        app.model.course.getPage(pageNumber, pageSize, condition, (error, page) => {
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
                    const teacherGroups = (item.teacherGroups || []).reduce((result, group) => group.teacher && group.teacher.division &&
                        divisions.findIndex(div => div._id.toString() == group.teacher.division.toString()) != -1 ? [...result, group] : result, []);
                    res.send({ error, item: app.clone(item, { teacherGroups }) });
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
        const sessionUser = req.session.user,
            courseFees = changes.courseFees,
            division = sessionUser.division;
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
            const teacherGroups = changes.teacherGroups == null || changes.teacherGroups === 'empty' ? [] : changes.teacherGroups;
            //TODO: Với user là isCourseAdmin + isOutside: cho phép họ thêm / xoá lecturer, student thuộc cơ sở của họ
            changes = { teacherGroups };
        } else {
            if (courseFees) courseFees[0].fee = changes.courseFee;
            if (changes.subjects && changes.subjects === 'empty') changes.subjects = [];
            if (changes.teacherGroups && changes.teacherGroups === 'empty') changes.teacherGroups = [];
            if (changes.admins && changes.admins === 'empty') changes.admins = [];
        }
        delete changes.courseFee;
        app.model.course.update(req.body._id, changes, (error, item) => res.send({ error, item }));
    });

    app.get('/api/course/export/:_courseId', app.permission.check('course:read'), (req, res) => {
        // const currentCourse = req.session.user.currentCourse;
        app.model.course.get(req.params._courseId, (error, course) => {
            if (error) {
                res.send({ error });
            } else {
                const numOfLesson = course.subjects.reduce((a, b) => (b.lessons ? b.lessons.length : 0) + a, 0);

                const workbook = app.excel.create(), worksheet = workbook.addWorksheet(`Danh sách điểm của học viên lớp ${course.name}`);
                const cells = [
                    { cell: 'A1', border: '1234', value: 'STT', font: { size: 12, align: 'center' }, bold: true },
                    { cell: 'B1', border: '1234', value: 'Họ', font: { size: 12, align: 'center' }, bold: true },
                    { cell: 'C1', border: '1234', value: 'Tên', font: { size: 12, align: 'center' }, bold: true },
                ];
                let row = 2;
                course.teacherGroups.forEach(group => {
                    group.student.forEach(item => {
                        row++;
                        worksheet.insertRow(row, [row - 2, item.lastname, item.firstname]);
                    });
                });
                new Promise((resolve, reject) => {
                    let count = 0;
                    let countIndex = 0;
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
                                        let rowCell = 2;
                                        course.teacherGroups.forEach(group => {
                                            group.student.forEach(item => {
                                                rowCell++;
                                                const value = item.tienDoHocTap && item.tienDoHocTap[subject._id] && item.tienDoHocTap[subject._id][lesson._id] && item.tienDoHocTap[subject._id][lesson._id].score || 0;
                                                worksheet.getCell(`${String.fromCharCode('D'.charCodeAt() + count)}${rowCell}`).value = `${value}/${lesson.questions.length}`;
                                            });
                                        });
                                        count++;
                                        if (count == numOfLesson) {
                                            const colAvgWord = String.fromCharCode('D'.charCodeAt() + numOfLesson);
                                            cells.push({
                                                cell: `${colAvgWord}1`,
                                                border: '1234',
                                                value: 'Điểm trung bình',
                                                font: { size: 12, align: 'center' }, bold: true
                                            });
                                            worksheet.mergeCells(`${colAvgWord}1:${colAvgWord}2`);
                                            let rowSum = 2;
                                            course.teacherGroups.forEach(group => {
                                                group.student.forEach(() => {
                                                    rowSum++;
                                                    let sum = 0;
                                                    for (let i = 0; i < numOfLesson; i++) {
                                                        const scoreText = worksheet.getCell(`${String.fromCharCode('D'.charCodeAt() + i)}${rowSum}`).text;
                                                        const scoreSplitted = scoreText.split('/');
                                                        let score = parseInt(scoreSplitted[0]);
                                                        let sumOfQuestion = parseInt(scoreSplitted[1]);
                                                        let div = 0;
                                                        if (sumOfQuestion > 0) {
                                                            div = score / sumOfQuestion;
                                                        }
                                                        sum += div;
                                                    }
                                                    sum /= numOfLesson;
                                                    worksheet.getCell(`${colAvgWord}${rowSum}`).value = parseFloat(sum).toFixed(2);
                                                });
                                            });
                                            resolve();
                                        }
                                    }
                                }
                            });
                        }
                    }
                }).then(() => {
                    app.excel.write(worksheet, cells);
                    app.excel.attachment(workbook, res, `Danh sách điểm của học viên lớp ${course.name}.xlsx`);
                }).catch(error => res.send(error));
            }
        });
    });

    app.delete('/api/course', app.permission.check('course:delete'), (req, res) => {
        app.model.course.delete(req.body._id, (error) => res.send({ error }));
    });
    // TeacherGroups APIs -----------------------------------------------------------------------------------------------------
    app.put('/api/course/teacher-group/teacher/:_teacherId', app.permission.check('course:write'), (req, res) => {
        const { _courseId, type } = req.body,
            _teacherId = req.params._teacherId;
        if (type == 'add') {
            app.model.course.addTeacherGroup(_courseId, _teacherId, (error, item) => res.send({ error, item }));
        } else if (type == 'remove') {
            app.model.course.removeTeacherGroup(_courseId, _teacherId, (error, item) => res.send({ error, item }));
        }
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
    app.get('/api/student/course', app.permission.check('user:login'), (req, res) => { //TODO: Cần sửa lại route
        const _userId = req.session.user._id;
        app.model.student.getAll({ user: _userId }, (error, students) => {
            if (error || students.length == 0) {
                res.send({ error });
            } else {
                const courses = [];
                students.map(student => {
                    student.course && student.course.active && courses.push(student.course);
                });
                res.send({ courses });
            }
        });
    });

    app.get('/api/course/student', app.permission.check('course:read'), (req, res) => { //TODO: Hàm cần phải sửa
        const _courseId = req.query._id,
            _studentId = req.session.user._id;
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
