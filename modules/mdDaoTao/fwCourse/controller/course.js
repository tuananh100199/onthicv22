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
        { name: 'course:read', },
        { name: 'course:write', menu },
        { name: 'course:delete' },
        { name: 'course:lock' },
        { name: 'course:export' },
        { name: 'course:learn' }
    );

    app.get('/user/course', app.permission.check('course:read'), app.templates.admin);
    app.get('/user/course/:_id', app.permission.check('course:read'), app.templates.admin);
    app.get('/user/hoc-vien/khoa-hoc/:_id', app.permission.check('course:learn'), app.templates.admin);
    app.get('/user/hoc-vien/khoa-hoc/thong-tin/:_id', app.permission.check('course:learn'), app.templates.admin);

    const getCourseData = (_id, sessionUser, done) => {
        app.model.course.get(_id, (error, item) => {
            if (error || !item) {
                done('Khoá học không tồn tại!');
            } else {
                const division = sessionUser.division,
                    courseFees = item.courseFees;
                item = app.clone(item);
                delete item.courseFees;

                if (item && sessionUser.isCourseAdmin && division && division.isOutside) {
                    // Với user là isCourseAdmin + isOutside: chỉ hiện teacherGroups, representerGroups, students thuộc cơ sở của họ
                    app.model.student.getAll({ course: _id, division: division._id }, (error, students) => {
                        if (error) {
                            done('Hệ thống bị lỗi!');
                        } else {
                            const courseFee = courseFees.find(courseFee => courseFee.division == division._id);
                            item.courseFee = courseFee && courseFee.fee ? courseFee.fee : 0;
                            item.students = students || [];

                            let i = 0;
                            if (!item.teacherGroups) item.teacherGroups = [];
                            while (i < item.teacherGroups.length) {
                                const teacher = item.teacherGroups[i].teacher;
                                if (!teacher.division || teacher.division._id != division._id) {
                                    item.teacherGroups.splice(i, 1);
                                } else {
                                    i++;
                                }
                            }

                            i = 0;
                            if (!item.representerGroups) item.representerGroups = [];
                            while (i < item.representerGroups.length) {
                                const teacher = item.representerGroups[i].teacher;
                                if (!teacher.division || teacher.division._id != division._id) {
                                    item.representerGroups.splice(i, 1);
                                } else {
                                    i++;
                                }
                            }

                            done(null, item);
                        }
                    });
                } else {
                    app.model.student.getAll({ course: _id }, (error, students) => {
                        if (error) {
                            done('Hệ thống bị lỗi!');
                        } else {
                            item.courseFee = courseFees[0] && courseFees[0].fee ? courseFees[0].fee : 0;
                            item.students = students || [];
                            done(null, item);
                        }
                    });
                }
            }
        });
    };

    // APIs ------------------------------------------------------------------------------------------------------------
    app.get('/api/course/page/:pageNumber/:pageSize', app.permission.check('course:read'), (req, res) => {
        const pageNumber = parseInt(req.params.pageNumber),
            pageSize = parseInt(req.params.pageSize),
            sessionUser = req.session.user,
            { pageCondition, courseType } = req.query;
        const condition = { courseType, active: true, ...pageCondition };
        if (sessionUser.isLecturer && !sessionUser.isCourseAdmin) {
            condition.teacherGroups = { $elemMatch: { teacher: sessionUser._id } };
        }
        if (sessionUser.division && sessionUser.division.isOutside) {
            condition.admins = sessionUser._id;
        }

        app.model.course.getPage(pageNumber, pageSize, condition, (error, page) => {
            res.send({ page, error: error || page == null ? 'Danh sách khóa học không sẵn sàng!' : null });
        });
    });

    app.get('/api/course', app.permission.check('course:read'), (req, res) => getCourseData(req.query._id, req.session.user, (error, item) => res.send({ error, item })));

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
        app.model.course.update(req.body._id, changes, () => getCourseData(req.body._id, req.session.user, (error, course) => {
            const item = {};
            course && Object.keys(changes).forEach(key => item[key] = course[key]);
            res.send({ error, item });
        }));
    });

    app.get('/api/course/export/:_courseId', app.permission.check('course:read'), (req, res) => {
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
                                        cells.push({
                                            cell: `${String.fromCharCode('D'.charCodeAt() + count)}2`,
                                            border: '1234',
                                            value: lesson.title,
                                            font: { size: 12, align: 'center' },
                                            bold: true
                                        });
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

    // Students APIs --------------------------------------------------------------------------------------------------
    app.put('/api/course/student', app.permission.check('course:read'), (req, res) => {
        const { _courseId, _studentIds, type } = req.body,
            sessionUser = req.session.user;
        new Promise((resolve, reject) => {
            app.model.course.get(_courseId, (error, course) => {
                if (error || course == null) {
                    reject('Khoá học không hợp lệ!');
                } else if (sessionUser.permissions.includes('course:write') || (sessionUser.isCourseAdmin && course.admins.find(admin => admin._id == sessionUser._id))) {
                    if (type == 'add') {
                        const solve = (index = 0) => index < _studentIds.length ?
                            app.model.student.update(_studentIds[index], { course: _courseId }, error => error ? reject('Lỗi khi cập nhật khoá học!') : solve(index + 1)) :
                            resolve();
                        solve();
                    } else if (type == 'remove') {
                        const solve = (index = 0) => {
                            if (index < _studentIds.length) {
                                app.model.student.get({ _id: _studentIds[index], course: _courseId }, (error, student) => {
                                    if (error) {
                                        reject('Lỗi khi cập nhật khoá học!');
                                    } else if (student) {
                                        course.teacherGroups.forEach(group => group.student.forEach((item, index) => item._id == student._id.toString() && group.student.splice(index, 1)));
                                        course.representerGroups.forEach(group => group.student.forEach((item, index) => item._id == student._id.toString() && group.student.splice(index, 1)));
                                        student.course = null;
                                        student.save(error => error ? reject('Lỗi khi cập nhật khoá học!') : solve(index + 1));
                                    } else {
                                        solve(index + 1);
                                    }
                                });
                            } else {
                                course.save(error => error ? reject('Lỗi khi cập nhật khoá học!') : resolve());
                            }
                        };
                        solve();
                    } else {
                        reject('Dữ liệu không hợp lệ!');
                    }
                } else {
                    reject('Khoá học không được phép truy cập!');
                }
            });
        }).then(() => getCourseData(_courseId, sessionUser, (error, item) => {
            error = error || (item ? null : 'Lỗi khi cập nhật khoá học!');
            item = item ? { students: item.students, ...(type == 'remove' && { teacherGroups: item.teacherGroups, representerGroups: item.representerGroups }) } : null;
            res.send({ error, item });
        })).catch(error => console.error(error) || res.send({ error }));
    });

    // Get courses by user
    app.get('/api/course/user', app.permission.check('course:read'), (req, res) => { //TODO: Cần sửa lại route
        const _userId = req.session.user._id;
        app.model.student.getAll({ user: _userId }, (error, students) => {
            res.send({ error, students });
        });
    });

    // APIs Get Course Of Student -------------------------------------------------------------------------------------
    app.get('/api/course-active/student', app.permission.check('user:login'), (req, res) => { //TODO: Cần sửa lại route
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

    //Representer API
    app.put('/api/course/representer-group/representer', app.permission.check('course:write'), (req, res) => {
        const { _courseId, _representerId, type } = req.body;
        new Promise((resolve, reject) => {
            if (type == 'add') {
                app.model.course.addRepresenterGroup(_courseId, _representerId, error => error ? reject(error) : resolve());
            } else if (type == 'remove') {
                app.model.course.removeRepresenterGroup(_courseId, _representerId, error => error ? reject(error) : resolve());
            } else {
                reject('Dữ liệu không hợp lệ!');
            }
        }).then(() => getCourseData(_courseId, req.session.user, (error, item) => {
            error = error || (item ? null : 'Lỗi khi cập nhật khoá học!');
            item = item ? { representerGroups: item.representerGroups } : null;
            res.send({ error, item });
        })).catch(error => console.error(error) || res.send({ error }));
    });

    app.put('/api/course/representer-group/student', app.permission.check('course:write'), (req, res) => {
        const { _courseId, _representerId, _studentIds, type } = req.body;
        new Promise((resolve, reject) => {
            if (type == 'add' || type == 'remove') {
                const changeGroup = type == 'add' ? app.model.course.addStudentToRepresenterGroup : app.model.course.removeStudentFromRepresenterGroup;
                const solve = (index = 0) => (index < _studentIds.length) ?
                    changeGroup(_courseId, _representerId, _studentIds[index], error => error ? reject(error) : solve(index + 1)) : resolve();
                solve();
            } else {
                reject('Dữ liệu không hợp lệ!');
            }
        }).then(() => getCourseData(_courseId, req.session.user, (error, item) => {
            error = error || (item ? null : 'Lỗi khi cập nhật khoá học!');
            item = item ? { representerGroups: item.representerGroups } : null;
            res.send({ error, item });
        })).catch(error => console.error(error) || res.send({ error }));
    });

    //Teacher API
    app.put('/api/course/teacher-group/teacher', app.permission.check('course:write'), (req, res) => {
        const { _courseId, _teacherId, type } = req.body;
        new Promise((resolve, reject) => {
            if (type == 'add') {
                app.model.course.addTeacherGroup(_courseId, _teacherId, error => error ? reject(error) : resolve());
            } else if (type == 'remove') {
                app.model.course.removeTeacherGroup(_courseId, _teacherId, error => error ? reject(error) : resolve());
            } else {
                reject('Dữ liệu không hợp lệ!');
            }
        }).then(() => getCourseData(_courseId, req.session.user, (error, item) => {
            error = error || (item ? null : 'Lỗi khi cập nhật khoá học!');
            item = item ? { teacherGroups: item.teacherGroups } : null;
            res.send({ error, item });
        })).catch(error => console.error(error) || res.send({ error }));
    });

    app.put('/api/course/teacher-group/student', app.permission.check('course:write'), (req, res) => {
        const { _courseId, _teacherId, _studentIds, type } = req.body;
        new Promise((resolve, reject) => {
            if (type == 'add' || type == 'remove') {
                const changeGroup = type == 'add' ? app.model.course.addStudentToTeacherGroup : app.model.course.removeStudentFromTeacherGroup;
                const solve = (index = 0) => (index < _studentIds.length) ?
                    changeGroup(_courseId, _teacherId, _studentIds[index], error => error ? reject(error) : solve(index + 1)) : resolve();
                solve();
            } else {
                reject('Dữ liệu không hợp lệ!');
            }
        }).then(() => getCourseData(_courseId, req.session.user, (error, item) => {
            error = error || (item ? null : 'Lỗi khi cập nhật khoá học!');
            item = item ? { teacherGroups: item.teacherGroups } : null;
            res.send({ error, item });
        })).catch(error => console.error(error) || res.send({ error }));
    });

    // Lecturer API
    app.get('/api/course/lecturer/student', app.permission.check('course:read'), (req, res) => {
        const userId = req.session.user._id;
        app.model.course.get(req.query._id, (error, item) => {
            if (error || !item) {
                res.send({ error });
            } else {
                const listStudent = item.teacherGroups.filter(teacherGroup => teacherGroup.teacher && teacherGroup.teacher._id == userId);
                res.send({ error, item: listStudent.length ? listStudent[0].student : null });
            }
        });
    });

    // Hook permissionHooks -------------------------------------------------------------------------------------------
    app.permissionHooks.add('courseAdmin', 'course', (user) => new Promise(resolve => {
        app.permissionHooks.pushUserPermission(user, 'course:read');
        resolve();
    }));
    app.permissionHooks.add('lecturer', 'course', (user) => new Promise(resolve => {
        app.permissionHooks.pushUserPermission(user, 'course:write');
        resolve();
    }));
};
