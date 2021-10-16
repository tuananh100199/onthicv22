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
    app.get('/user/course/:_id/info', app.permission.check('course:read'), app.templates.admin);
    app.get('/user/course/:_id/subject', app.permission.check('course:read'), app.templates.admin);
    app.get('/user/course/:_id/learning', app.permission.check('course:read'), app.templates.admin);
    app.get('/user/hoc-vien/khoa-hoc/:_id', app.permission.check('user:login'), app.templates.admin);
    app.get('/user/hoc-vien/khoa-hoc/thong-tin/:_id', app.permission.check('user:login'), app.templates.admin);
    app.get('/user/hoc-vien/khoa-hoc/:_id/phan-hoi', app.permission.check('user:login'), app.templates.admin);

    const getCourseData = (_id, sessionUser, done) => {
        app.model.course.get(_id, (error, item) => {
            if (error || !item) {
                done('Khóa học không tồn tại!');
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
                                if (teacher && !teacher.division || teacher && teacher.division._id != division._id) {
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
            condition = req.query.pageCondition || {};
        if (req.query.courseType) condition.courseType = req.query.courseType;
        if (sessionUser.isLecturer && !sessionUser.isCourseAdmin) {
            condition.teacherGroups = { $elemMatch: { teacher: sessionUser._id } };
            condition.active = true;
        }
        if (sessionUser.division && sessionUser.division.isOutside) {
            condition.admins = sessionUser._id;
            condition.active = true;
        }

        app.model.course.getPage(pageNumber, pageSize, condition, (error, page) => {
            res.send({ page, error: error || page == null ? 'Danh sách trống!' : null });
        });
    });

    app.get('/api/course', app.permission.check('course:read'), (req, res) => getCourseData(req.query._id, req.session.user, (error, item) => res.send({ error, item })));

    app.post('/api/course', app.permission.check('course:write'), (req, res) => {
        app.model.course.create(req.body.data || {}, (error, item) => res.send({ error, item }));
    });

    app.put('/api/course', (req, res, next) => (req.session.user && req.session.user.isCourseAdmin) ? next() : app.permission.check('course:write')(req, res, next), (req, res) => {
        app.model.course.get(req.body._id, (error, item) => {
            if (error || !item) {
                res.send({ error: 'Dữ liệu không hợp lệ!' });
            } else {
                let changes = req.body.changes || {};
                const sessionUser = req.session.user,
                    courseFees = app.clone(item.courseFees || {}),
                    division = sessionUser.division;
                if (sessionUser && sessionUser.isCourseAdmin && division && division.isOutside) {
                    if (courseFees) {
                        const index = courseFees.findIndex(courseFee => courseFee.division == division._id);
                        if (index != -1) {
                            courseFees[index].fee = changes.courseFee;
                        } else {
                            courseFees.push({ division: division._id, fee: changes.courseFee });
                        }
                    }
                    if (changes.subjects && changes.subjects === 'empty') changes.subjects = [];

                    //TODO: Với user là isCourseAdmin + isOutside: cho phép họ thêm / xoá lecturer, student thuộc cơ sở của họ
                    changes.teacherGroups = changes.teacherGroups == null || changes.teacherGroups === 'empty' ? [] : changes.teacherGroups;
                } else {
                    if (courseFees) {
                        if (courseFees.length == 0) {
                            courseFees.push({ division: division._id, fee: changes.courseFee });
                        } else {
                            courseFees[0].fee = changes.courseFee;
                        }
                    }
                    if (changes.subjects && changes.subjects === 'empty') changes.subjects = [];
                    if (changes.teacherGroups && changes.teacherGroups === 'empty') changes.teacherGroups = [];
                    if (changes.admins && changes.admins === 'empty') changes.admins = [];
                }

                delete changes.courseFee;
                changes.courseFees = courseFees;
                app.model.course.update(req.body._id, changes, () => getCourseData(req.body._id, req.session.user, (error, course) => {
                    const item = {};
                    course && Object.keys(changes).forEach(key => item[key] = course[key]);
                    res.send({ error, item });
                }));
            }
        });
    });

    app.delete('/api/course', app.permission.check('course:delete'), (req, res) => {
        app.model.course.delete(req.body._id, (error) => res.send({ error }));
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

    // Students APIs --------------------------------------------------------------------------------------------------
    app.put('/api/course/student', app.permission.check('course:read'), (req, res) => {
        const { _courseId, _studentIds, type } = req.body,
            sessionUser = req.session.user;
        new Promise((resolve, reject) => {
            app.model.course.get(_courseId, (error, course) => {
                if (error || course == null) {
                    reject('Khóa học không hợp lệ!');
                } else if (sessionUser.permissions.includes('course:write') || (sessionUser.isCourseAdmin && course.admins.find(admin => admin._id == sessionUser._id))) {
                    if (type == 'add') {
                        const solve = (index = 0) => index < _studentIds.length ?
                            app.model.student.update(_studentIds[index], { course: _courseId }, error => error ? reject('Lỗi khi cập nhật khóa học!') : solve(index + 1)) :
                            resolve();
                        solve();
                    } else if (type == 'remove') {
                        const solve = (index = 0) => {
                            if (index < _studentIds.length) {
                                app.model.student.get({ _id: _studentIds[index], course: _courseId }, (error, student) => {
                                    if (error) {
                                        reject('Lỗi khi cập nhật khóa học!');
                                    } else if (student) {
                                        course.teacherGroups.forEach(group => group.student.forEach((item, index) => item._id == student._id.toString() && group.student.splice(index, 1)));
                                        course.representerGroups.forEach(group => group.student.forEach((item, index) => item._id == student._id.toString() && group.student.splice(index, 1)));
                                        student.course = null;
                                        student.save(error => error ? reject('Lỗi khi cập nhật khóa học!') : solve(index + 1));
                                    } else {
                                        solve(index + 1);
                                    }
                                });
                            } else {
                                course.save(error => error ? reject('Lỗi khi cập nhật khóa học!') : resolve());
                            }
                        };
                        solve();
                    } else {
                        reject('Dữ liệu không hợp lệ!');
                    }
                } else {
                    reject('Khóa học không được phép truy cập!');
                }
            });
        }).then(() => getCourseData(_courseId, sessionUser, (error, item) => {
            error = error || (item ? null : 'Lỗi khi cập nhật khóa học!');
            item = item ? { students: item.students, ...(type == 'remove' && { teacherGroups: item.teacherGroups, representerGroups: item.representerGroups }) } : null;
            res.send({ error, item });
        })).catch(error => console.error(error) || res.send({ error }));
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
            error = error || (item ? null : 'Lỗi khi cập nhật khóa học!');
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
            error = error || (item ? null : 'Lỗi khi cập nhật khóa học!');
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
            error = error || (item ? null : 'Lỗi khi cập nhật khóa học!');
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
            error = error || (item ? null : 'Lỗi khi cập nhật khóa học!');
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

    // Learning Progress API
    app.get('/api/course/learning-progress/admin', app.permission.check('course:write'), (req, res) => {
        app.model.student.getAll({ course: req.query._id }, (error, item) => res.send({ error, item }));
    });

    app.get('/api/course/learning-progress/lecturer', app.permission.check('course:write'), (req, res) => {
        const sessionUser = req.session.user;
        app.model.course.get(req.query._id, (error, items) => {
            if (error || !items) {
                res.send({ error });
            } else {
                items = app.clone(items);
                const { subjects } = items;
                const monLyThuyet = subjects.filter(subject => subject.monThucHanh == false);
                const listStudent = items.teacherGroups.filter(teacherGroup => teacherGroup.teacher && teacherGroup.teacher._id == sessionUser._id);
                let listStudentReturn = listStudent[0].student.map((student => {
                    student.subject = {};
                    subjects.forEach(subject => {
                        const diemLyThuyet =
                            student && student.tienDoHocTap && student.tienDoHocTap[subject._id] ?
                                Number((Object.entries(student.tienDoHocTap[subject._id]).reduce((lessonNext, lesson) =>
                                    Number(lesson[1].score) / Object.keys(lesson[1].trueAnswers).length * 10 + lessonNext, 0)) / subject.lessons.length).toFixed(1) : 0;

                        const completedLessons = (subject && student.tienDoHocTap && student.tienDoHocTap[subject._id] ?
                            (student.tienDoHocTap[subject._id] && Object.keys(student.tienDoHocTap[subject._id]).length > subject.lessons.length ?
                                subject.lessons.length :
                                Object.keys(student.tienDoHocTap[subject._id]).length)
                            : 0);

                        const obj = {};
                        obj[subject._id] = {
                            completedLessons: completedLessons,
                            numberLessons: subject.lessons.length ? subject.lessons.length : 0,
                            diemLyThuyet: diemLyThuyet
                        };
                        Object.assign(student.subject, obj);
                    });
                    const diemLyThuyet = Number((monLyThuyet.reduce((subjectNext, subject) =>
                        (subject && student.tienDoHocTap && student.tienDoHocTap[subject._id] ?
                            Number((Object.keys(student.tienDoHocTap[subject._id]).length ?
                                Object.entries(student.tienDoHocTap[subject._id]).reduce((lessonNext, lesson) =>
                                    Number(lesson[1].score) / Object.keys(lesson[1].trueAnswers).length * 10 + lessonNext, 0) ?
                                    (Number(Object.entries(student.tienDoHocTap[subject._id]).reduce((lessonNext, lesson) =>
                                        Number(lesson[1].score) / Object.keys(lesson[1].trueAnswers).length * 10 + lessonNext, 0)) / subject.lessons.length).toFixed(1) : 0
                                : 0))
                            : 0) + subjectNext, 0) / monLyThuyet.length).toFixed(1));

                    const diemThucHanh = student.diemThucHanh ? Number(student.diemThucHanh) : 0;
                    Object.assign(student, { diemLyThuyet: diemLyThuyet, diemThucHanh: diemThucHanh });

                    return student;
                }));
                res.send({ error, item: listStudentReturn.length ? listStudentReturn : null });
            }
        });
    });

    app.put('/api/course/learning-progress/lecturer', app.permission.check('course:write'), (req, res) => {
        app.model.student.update(req.body._id, req.body.changes, (error, item) => res.send({ error, item }));
    });
    // Chat API
    app.get('/api/course/chat/admin', app.permission.check('course:write'), (req, res) => {
        const sessionUser = req.session.user;
        if (sessionUser.isCourseAdmin) {
            app.model.student.getAll({ course: req.query._id }, (error, item) => res.send({ error, item }));
        } else {
            app.model.course.get(req.query._id, (error, item) => {
                if (error || !item) {
                    res.send({ error });
                } else {
                    const listStudent = item.teacherGroups.filter(teacherGroup => teacherGroup.teacher && teacherGroup.teacher._id == sessionUser._id);
                    res.send({ error, item: listStudent.length ? listStudent[0].student : null });
                }
            });
        }
    });

    // Get Course by Student API
    // API: Mobile
    app.get('/api/mobile/course/student/all', app.permission.check('user:login'), (req, res) => {//mobile
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

    app.get('/api/course/student/all', app.permission.check('user:login'), (req, res) => {
        const _userId = req.session.user._id;
        app.model.student.getAll({ user: _userId }, (error, students) => res.send({ error, students }));
    });

    app.get('/api/course/student', app.permission.check('user:login'), (req, res) => {//mobile
        const _courseId = req.query._id;
        app.model.student.get({ user: req.session.user._id, course: _courseId }, (error, student) => {
            if (error) {
                res.send({ error });
            } else if (!student) {
                res.send({ notify: 'Bạn không thuộc khóa học này!' });
            } else {
                if (student.course && student.course.active) {
                    app.model.course.get(_courseId, (error, item) => {
                        const _studentId = student._id,
                            teacherGroups = item.teacherGroups.find(({ student }) => student.find(({ _id }) => _id == _studentId.toString()) != null),
                            teacher = teacherGroups.teacher || null;
                        res.send({ error, item, _studentId, teacher });
                    });
                } else {
                    res.send({ notify: 'Khóa học chưa được kích hoạt!' });
                }
            }
        });
    });

    app.get('/api/course/student/export/:_courseId', app.permission.check('course:read'), (req, res) => {
        const sessionUser = req.session.user,
            division = sessionUser.division,
            courseId = req.params._courseId;
        if (sessionUser && sessionUser.isCourseAdmin && division && division.isOutside) {
            res.send({ error: 'Bạn không có quyền xuất file excel này!' });
        } else {
            app.model.student.getAll({ course: courseId, division: division._id }, (error, students) => {
                if (error) {
                    res.send({ error: 'Hệ thống bị lỗi!' });
                } else {
                    const workbook = app.excel.create(), worksheet = workbook.addWorksheet('Student');
                    const cells = [
                        { cell: 'A1', value: 'STT', bold: true, border: '1234' },
                        { cell: 'B1', value: 'Họ', bold: true, border: '1234' },
                        { cell: 'C1', value: 'Tên', bold: true, border: '1234' },
                        { cell: 'D1', value: 'CMND/CCCD', bold: true, border: '1234' },
                        { cell: 'E1', value: 'Cơ sở', bold: true, border: '1234' },
                        { cell: 'F1', value: 'Email', bold: true, border: '1234' },
                        { cell: 'G1', value: 'Loại khóa học', bold: true, border: '1234' },
                        { cell: 'H1', value: 'Khóa học', bold: true, border: '1234' },
                    ];

                    worksheet.columns = [
                        { header: 'STT', key: '_id', width: 15 },
                        { header: 'Họ', key: 'lastname', width: 15 },
                        { header: 'Tên', key: 'firstname', width: 15 },
                        { header: 'CMND/CCCD', key: 'identityCard', width: 15 },
                        { header: 'Cơ sở', key: 'division', width: 30 },
                        { header: 'Email', key: 'email', width: 40 },
                        { header: 'Loại khóa học', key: 'courseType', width: 40 },
                        { header: 'Khóa học', key: 'course', width: 80 },
                    ];
                    students.forEach((student, index) => {
                        worksheet.addRow({
                            _id: index + 1,
                            lastname: student.lastname,
                            firstname: student.firstname,
                            identityCard: student.identityCard,
                            division: student.division ? student.division.title : '',
                            email: student.user && student.user.email,
                            courseType: student.courseType ? student.courseType.title : '',
                            course: student.course ? student.course.name : '',
                        });
                    });
                    app.excel.write(worksheet, cells);
                    app.excel.attachment(workbook, res, 'Student.xlsx');
                }
            });
        }
    });

    app.get('/api/course/representer-student/export/:_courseId', app.permission.check('course:read'), (req, res) => {
        const courseId = req.params._courseId;
        app.model.course.get(courseId, (error, course) => {
            if (error) {
                res.send({ error: 'Hệ thống bị lỗi!' });
            } else {
                const workbook = app.excel.create(), worksheet = workbook.addWorksheet('Representer and student');
                const cells = [
                    { cell: 'A1', value: 'Giáo viên', bold: true, border: '1234' },
                    { cell: 'B1', value: 'STT', bold: true, border: '1234' },
                    { cell: 'C1', value: 'Họ', bold: true, border: '1234' },
                    { cell: 'D1', value: 'Tên', bold: true, border: '1234' },
                    { cell: 'E1', value: 'CMND/CCCD', bold: true, border: '1234' },
                    { cell: 'F1', value: 'Cơ sở', bold: true, border: '1234' },
                    { cell: 'G1', value: 'Email', bold: true, border: '1234' },
                    { cell: 'H1', value: 'Loại khóa học', bold: true, border: '1234' },
                    { cell: 'I1', value: 'Khóa học', bold: true, border: '1234' },
                ];
                worksheet.columns = [
                    { header: 'Giáo viên', key: 'representer', width: 30 },
                    { header: 'STT', key: '_id', width: 15 },
                    { header: 'Họ', key: 'lastname', width: 15 },
                    { header: 'Tên', key: 'firstname', width: 15 },
                    { header: 'CMND/CCCD', key: 'identityCard', width: 15 },
                    { header: 'Cơ sở', key: 'division', width: 30 },
                    { header: 'Email', key: 'email', width: 40 },
                    { header: 'Loại khóa học', key: 'courseType', width: 40 },
                    { header: 'Khóa học', key: 'course', width: 80 },
                ];

                let count = 2, mergeStart = 0, mergeEnd = 0;
                course && course.representerGroups.forEach(group => {
                    cells.push({
                        cell: `${'A' + count}`,
                        border: '1234',
                        value: group.representer.lastname + ' ' + group.representer.firstname,
                        font: { size: 12, align: 'center' },
                        bold: true
                    });
                    let indexStudent = 0;
                    if (group.student && group.student.length > 0) {
                        group.student.forEach((student, index) => {
                            worksheet.addRow({
                                _id: index + 1,
                                lastname: student.lastname,
                                firstname: student.firstname,
                                identityCard: student.identityCard,
                                division: student.division ? student.division.title : '',
                                email: student.user && student.user.email,
                                courseType: student.courseType ? student.courseType.title : '',
                                course: student.course ? student.course.name : '',
                            });
                            indexStudent += 1;
                        });
                    } else {
                        worksheet.addRow({});
                        indexStudent = 1;
                    }
                    mergeStart = count;
                    mergeEnd = count + indexStudent - 1;
                    worksheet.mergeCells(`${'A' + mergeStart}:${'A' + mergeEnd}`);
                    count += indexStudent;
                });
                app.excel.write(worksheet, cells);
                app.excel.attachment(workbook, res, 'Representer and student.xlsx');
            }
        });
    });

    app.get('/api/course/teacher-student/export/:_courseId', app.permission.check('course:read'), (req, res) => {
        const sessionUser = req.session.user,
            division = sessionUser.division,
            courseId = req.params._courseId;
        if (sessionUser && sessionUser.isCourseAdmin && division && division.isOutside) {
            res.send({ error: 'Bạn không có quyền xuất file excel này!' });
        } else {
            app.model.course.get(courseId, (error, course) => {
                if (error) {
                    res.send({ error: 'Hệ thống bị lỗi!' });
                } else {
                    const workbook = app.excel.create(), worksheet = workbook.addWorksheet('Teacher and student');
                    const cells = [
                        { cell: 'A1', value: 'Cố vấn học tập', bold: true, border: '1234' },
                        { cell: 'B1', value: 'STT', bold: true, border: '1234' },
                        { cell: 'C1', value: 'Họ', bold: true, border: '1234' },
                        { cell: 'D1', value: 'Tên', bold: true, border: '1234' },
                        { cell: 'E1', value: 'CMND/CCCD', bold: true, border: '1234' },
                        { cell: 'F1', value: 'Cơ sở', bold: true, border: '1234' },
                        { cell: 'G1', value: 'Email', bold: true, border: '1234' },
                        { cell: 'H1', value: 'Loại khóa học', bold: true, border: '1234' },
                        { cell: 'I1', value: 'Khóa học', bold: true, border: '1234' },
                    ];
                    worksheet.columns = [
                        { header: 'Cố vấn học tập', key: 'teacher', width: 30 },
                        { header: 'STT', key: '_id', width: 15 },
                        { header: 'Họ', key: 'lastname', width: 15 },
                        { header: 'Tên', key: 'firstname', width: 15 },
                        { header: 'CMND/CCCD', key: 'identityCard', width: 15 },
                        { header: 'Cơ sở', key: 'division', width: 30 },
                        { header: 'Email', key: 'email', width: 40 },
                        { header: 'Loại khóa học', key: 'courseType', width: 40 },
                        { header: 'Khóa học', key: 'course', width: 80 },
                    ];

                    let count = 2, mergeStart = 0, mergeEnd = 0;
                    course && course.teacherGroups.forEach(group => {
                        cells.push({
                            cell: `${'A' + count}`,
                            border: '1234',
                            value: group.teacher.lastname + ' ' + group.teacher.firstname,
                            font: { size: 12, align: 'center' },
                            bold: true
                        });
                        let indexStudent = 0;
                        if (group.student && group.student.length > 0) {
                            group.student.forEach((student, index) => {
                                worksheet.addRow({
                                    _id: index + 1,
                                    lastname: student.lastname,
                                    firstname: student.firstname,
                                    identityCard: student.identityCard,
                                    division: student.division ? student.division.title : '',
                                    email: student.user && student.user.email,
                                    courseType: student.courseType ? student.courseType.title : '',
                                    course: student.course ? student.course.name : '',
                                });
                                indexStudent += 1;
                            });
                        } else {
                            worksheet.addRow({});
                            indexStudent = 1;
                        }
                        mergeStart = count;
                        mergeEnd = count + indexStudent - 1;
                        worksheet.mergeCells(`${'A' + mergeStart}:${'A' + mergeEnd}`);
                        count += indexStudent;
                    });
                    app.excel.write(worksheet, cells);
                    app.excel.attachment(workbook, res, 'Teacher and student.xlsx');
                }
            });
        }
    });

    // Hook permissionHooks -------------------------------------------------------------------------------------------
    app.permissionHooks.add('courseAdmin', 'course', (user) => new Promise(resolve => {
        app.permissionHooks.pushUserPermission(user, 'course:read', 'course:write');
        resolve();
    }));

    app.permissionHooks.add('lecturer', 'course', (user) => new Promise(resolve => {
        app.permissionHooks.pushUserPermission(user, 'course:read', 'course:write', 'student:write', 'student:read');
        resolve();
    }));
};
