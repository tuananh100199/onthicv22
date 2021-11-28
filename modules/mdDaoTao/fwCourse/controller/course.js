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
        { name: 'course:read', menu },
        { name: 'course:write' },
        { name: 'course:delete' },
        { name: 'course:lock' },
        { name: 'course:export' }, { name: 'course:import' },
    );

    app.get('/user/course', app.permission.check('course:read'), app.templates.admin);
    app.get('/user/course/:_id', app.permission.check('course:read'), app.templates.admin);
    app.get('/user/course/:_id/info', app.permission.check('course:read'), app.templates.admin);
    app.get('/user/course/:_id/subject', app.permission.check('course:read'), app.templates.admin);
    app.get('/user/course/:_id/graduation-subject', app.permission.check('course:read'), app.templates.admin);
    app.get('/user/course/:_id/manager', app.permission.check('course:read'), app.templates.admin);
    app.get('/user/course/:_id/student', app.permission.check('course:read'), app.templates.admin);
    app.get('/user/course/:_id/teacher', app.permission.check('course:read'), app.templates.admin);
    app.get('/user/course/:_id/representer', app.permission.check('course:read'), app.templates.admin);
    app.get('/user/course/:_id/rate-teacher', app.permission.check('course:read'), app.templates.admin);
    app.get('/user/course/:_id/feedback', app.permission.check('course:write'), app.templates.admin);
    app.get('/user/course/:_id/feedback/:_feedbackId', app.permission.check('course:write'), app.templates.admin);
    app.get('/user/course/:_id/your-students', app.permission.check('course:read'), app.templates.admin);
    app.get('/user/course/:_id/learning', app.permission.check('course:read'), app.templates.admin);
    app.get('/user/course/:_id/import-graduation-exam-score', app.permission.check('course:import'), app.templates.admin);
    app.get('/user/course/:_id/calendar', app.permission.check('course:read'), app.templates.admin);
    app.get('/user/course/:_id/register-calendar', app.permission.check('course:read'), app.templates.admin);
    app.get('/user/course/:_id/student-register-calendar', app.permission.check('course:read'), app.templates.admin);
    app.get('/user/course/:_id/lecturer/calendar', app.permission.check('course:read'), app.templates.admin);
    app.get('/user/course/:_id/lecturer/register-calendar', app.permission.check('course:read'), app.templates.admin);
    app.get('/user/course/:_id/lecturer/student-register-calendar', app.permission.check('course:read'), app.templates.admin);
    app.get('/user/course/:_id/rate-subject', app.permission.check('course:read'), app.templates.admin);
    app.get('/user/course/:_id/chat-all', app.permission.check('user:login'), app.templates.admin);
    app.get('/user/course/:_id/chat', app.permission.check('user:login'), app.templates.admin);
    app.get('/user/course/:_id/import-final-score', app.permission.check('course:import'), app.templates.admin);

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
        if (sessionUser.isCourseAdmin && !sessionUser.isLecturer ) {
            condition.admins = sessionUser._id;
            condition.active = true;
        }
        console.log(condition);
        app.model.course.getPage(pageNumber, pageSize, condition, (error, page) => {
            if (error || !page) {
                res.send({ error: error || 'Danh sách trống!' });
            } else {
                page = app.clone(page);
                const promiseList = page.list && page.list.length > 0 && page.list.map(item => {
                    return new Promise((resolve, reject) => {
                        if (item) {
                            app.model.student.count({ course: item._id }, (error, numberOfStudent) => {
                                if (error) {
                                    reject('Đếm số lượng học viên của khóa học bị lỗi!');
                                } else {
                                    resolve(numberOfStudent);
                                }
                            });
                        }
                    });
                });
                promiseList && Promise.all(promiseList).then(numberOfStudents => {
                    page.list.forEach((item, index) => {
                        item.numberOfStudent = numberOfStudents[index];
                    });
                    res.send({ page });
                }).catch(error => console.error(error) || res.send({ error }));
            }
            // res.send({ page, error: error || page == null ? 'Danh sách trống!' : null });
        });
    });

    app.get('/api/course', app.permission.check('user:login'), (req, res) => {
        getCourseData(req.query._id, req.session.user, (error, item) => res.send({ error, item }));
    });

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
                    if (changes.monThiTotNghiep && changes.monThiTotNghiep === 'empty') changes.admins = [];
                }

                delete changes.courseFee;
                changes.courseFees = courseFees;
                app.model.course.update(req.body._id, changes, () => getCourseData(req.body._id, req.session.user, (error, course) => {
                    // const item = {};
                    // course && Object.keys(changes).forEach(key => item[key] = course[key]);
                    res.send({ error, item: course });
                }));
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
            item = item || null;
            res.send({ error, item });
        })).catch(error => console.error(error) || res.send({ error }));
    });

    app.put('/api/course/student/assign-auto', app.permission.check('course:write'), (req, res) => {
        const { _courseId } = req.body,
            sessionUser = req.session.user;
        new Promise((resolve, reject) => {
            app.model.course.get(_courseId, (error, course) => {
                if (error || course == null) {
                    reject('Khóa học không hợp lệ!');
                } else if (sessionUser.permissions.includes('course:write') || (sessionUser.isCourseAdmin && course.admins.find(admin => admin._id == sessionUser._id))) { //object == string ?
                    const condition = {
                        course: course._id,
                        courseType: course.courseType._id,
                    };
                    app.model.student.getAllPreStudent(course.maxStudent, condition, (error, listPreStudent) => {
                        if (error) {
                            reject(error);
                        } else if (!listPreStudent || listPreStudent.length == 0) {
                            reject('Chưa có ứng viên đăng ký loại của khóa học này');
                        } else {
                            const solve = (index = 0) => index < listPreStudent.length ?
                                app.model.student.update(listPreStudent[index] && listPreStudent[index]._id, { course: _courseId }, error => error ? reject('Lỗi khi cập nhật khóa học!') : solve(index + 1)) :
                                resolve();
                            solve();
                        }
                    });
                } else {
                    reject('Khóa học không được phép truy cập!');
                }
            });
        }).then(() => getCourseData(_courseId, sessionUser, (error, item) => {
            error = error || (item ? null : 'Lỗi khi cập nhật khóa học!');
            item = item || null;
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
            item = item || null;
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
            item = item || null;
            res.send({ error, item });
        })).catch(error => console.error(error) || res.send({ error }));
    });

    //Teacher API
    app.put('/api/course/teacher-group/teacher', app.permission.check('course:write'), (req, res) => {
        const { _courseId, _teacherId, type } = req.body;
        new Promise((resolve, reject) => {
            if (type == 'add') {
                app.model.course.addTeacherGroup(_courseId, _teacherId, error => error ? reject(error) :
                    app.model.course.get(_courseId, (error, course) => {
                        if (error || !course) reject(error);
                        else {
                            const courseType = course.courseType;
                            console.log(course.close);
                            app.model.car.get({ user: _teacherId, courseType: courseType._id }, (error, item) => {
                                if (error) {
                                    reject(error);
                                } else if (!item || item.status == 'daThanhLy') {
                                    resolve();
                                } else {
                                    app.model.car.addCourseHistory({ _id: item._id }, { course: course._id, user: _teacherId }, error => {
                                        console.log(error);
                                        if(error) reject(error);
                                        else app.model.car.update({ _id: item._id }, {currentCourseClose: course.close},error => error ? reject(error) : resolve());
                                    });
                                }
                            });
                        }
                    })
                );
            } else if (type == 'remove') {
                app.model.course.removeTeacherGroup(_courseId, _teacherId, error => error ? reject(error) :
                app.model.car.get({ user: _teacherId}, (error, item) => {
                    if (error) {
                        reject(error);
                    } else if (!item || item.status == 'daThanhLy') {
                        resolve();
                    } else {
                        app.model.car.deleteCar({ _id: item._id }, { _courseId }, error => {
                            if(error) reject(error);
                            else resolve();
                        });
                    }
                })
                );
            } else {
                reject('Dữ liệu không hợp lệ!');
            }
        }).then(() => getCourseData(_courseId, req.session.user, (error, item) => {
            error = error || (item ? null : 'Lỗi khi cập nhật khóa học!');
            item = item || null;
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
            item = item || null;
            res.send({ error, item });
        })).catch(error => console.error(error) || res.send({ error }));
    });

    app.put('/api/course/teacher-group/student/auto', app.permission.check('course:write'), (req, res) => {
        const { _courseId, teacherGroupsUpdate = [], type } = req.body;
        const promiseList = teacherGroupsUpdate.length && teacherGroupsUpdate.map(teacherGroup => {
            const { _teacherId, _studentIds = [] } = teacherGroup;
            return new Promise((resolve, reject) => {
                if (type == 'add' || type == 'remove') {
                    const changeGroup = type == 'add' ? app.model.course.addStudentToTeacherGroup : app.model.course.removeStudentFromTeacherGroup;
                    const solve = (index = 0) => (index < _studentIds.length) ?
                        changeGroup(_courseId, _teacherId, _studentIds[index], error => error ? reject(error) : solve(index + 1)) : resolve();
                    solve();
                } else {
                    reject('Dữ liệu không hợp lệ!');
                }
            });
        });
        promiseList && Promise.all(promiseList).then(() => getCourseData(_courseId, req.session.user, (error, item) => {
            error = error || (item ? null : 'Lỗi khi cập nhật khóa học!');
            item = item || null;
            res.send({ error, item });
        })).catch(error => console.error(error) || res.send({ error }));
    });


    // Lecturer API
    app.get('/api/course/lecturer/student', app.permission.check('course:read'), (req, res) => {
        const { courseId, lecturerId } = req.query.condition;
        app.model.course.get(courseId, (error, item) => {
            if (error || !item) {
                res.send({ error });
            } else {
                const listStudent = item.teacherGroups.filter(teacherGroup => teacherGroup.teacher && teacherGroup.teacher._id == lecturerId);
                res.send({ error, list: listStudent.length ? listStudent[0].student : null });
            }
        });
    });

    app.get('/api/course/learning-progress/page/:pageNumber/:pageSize', app.permission.check('course:read'), (req, res) => {
        const pageNumber = parseInt(req.params.pageNumber),
            pageSize = parseInt(req.params.pageSize),
            sessionUser = req.session.user,
            condition = req.query.pageCondition || {},
            pageCondition = { course: condition.courseId || { $ne: null } },
            filter = condition.filter;
        let listStudent = [], subjects = [], pageReturn = {};
        const isAdmin = sessionUser.isCourseAdmin || sessionUser.permissions.includes('course:write');

        new Promise((resolve, reject) => {
            if (isAdmin) {
                if (condition.searchText) {
                    const value = { $regex: `.*${condition.searchText}.*`, $options: 'i' };
                    pageCondition.$or = [
                        { firstname: value },
                        { lastname: value },
                    ];
                }
                app.model.student.getPage(pageNumber, pageSize, pageCondition, (error, page) => {
                    if (error || !page) {
                        error && console.error(error);
                        reject('Lỗi khi đọc danh sách sinh viên!');
                    } else {
                        pageReturn = page;
                        page = app.clone(page);
                        listStudent = page && page.list ? page.list.map(item => item = app.clone(item)) : [];
                        subjects = listStudent.length && listStudent[0].course && listStudent[0].course.subjects ? listStudent[0].course.subjects : [];
                        resolve();
                    }
                });
            } else if (sessionUser.isLecturer) {
                app.model.course.get(condition.courseId, (error, item) => {
                    if (error || !item) {
                        error && console.error(error);
                        reject('Lỗi khi đọc thông tin khóa học!');
                    } else {
                        item = app.clone(item);
                        const studentTeacherGroup = item.teacherGroups.find(teacherGroup => teacherGroup.teacher && teacherGroup.teacher._id == sessionUser._id);
                        listStudent = studentTeacherGroup && studentTeacherGroup.student ? studentTeacherGroup.student : [];
                        subjects = item.subjects ? item.subjects : [];
                        resolve();
                    }
                });
            } else {
                reject('Bạn không đủ quyền!');
            }
        }).then(() => {
            const monLyThuyet = subjects.filter(subject => subject.monThucHanh == false),
                students = [];
            listStudent.forEach((student => {
                student = app.clone(student, { subject: {} });
                let tongDiemLyThuyet = 0;
                subjects.forEach(subject => {
                    let diemMonHoc = 0,thoiGianHoc = 0, completedLessons = 0, numberLessons = subject.lessons ? subject.lessons.length : 0;
                    if (numberLessons) {
                        if (student && student.tienDoHocTap && student.tienDoHocTap[subject._id] && !subject.monThucHanh) {
                            const listLessons = Object.entries(student.tienDoHocTap[subject._id]);
                            let tongDiemMonHoc = 0;
                            (listLessons || []).forEach(lesson => {
                                tongDiemMonHoc += lesson[1].trueAnswers ? Number(lesson[1].score) / Object.keys(lesson[1].trueAnswers).length * 10 : 0;
                                thoiGianHoc +=  lesson[1].totalSeconds ? parseInt(lesson[1].totalSeconds) : 0;
                            });
                            diemMonHoc = Number(tongDiemMonHoc / numberLessons).toFixed(1);
                        }
                        if (subject && student.tienDoHocTap && student.tienDoHocTap[subject._id]) {
                            completedLessons = (Object.keys(student.tienDoHocTap[subject._id]).length > numberLessons ?
                                numberLessons :
                                Object.keys(student.tienDoHocTap[subject._id]).length);
                        }
                    }
                    if (!subject.monThucHanh) {
                        tongDiemLyThuyet += Number(diemMonHoc);
                    }

                    const obj = {};
                    obj[subject._id] = { completedLessons, diemMonHoc, numberLessons, thoiGianHoc };
                    student.subject = app.clone(student.subject, obj);
                });

                const diemLyThuyet = Number((tongDiemLyThuyet / monLyThuyet.length).toFixed(1));
                const diemThucHanh = student.diemThucHanh ? Number(student.diemThucHanh) : 0;

                let filterThiTotNghiep = true;
                if (isAdmin) {
                    const diemThiHetMon = student && student.diemThiHetMon && student.diemThiHetMon;
                    if (diemThiHetMon.length) {
                        for (let i = 0; i < diemThiHetMon.length; i++) {
                            if (diemThiHetMon[i].point < 5) {
                                filterThiTotNghiep = false;
                                break;
                            }
                        }
                    } else {
                        filterThiTotNghiep = false;
                    }
                }

                if ((filter == 'thiHetMon' && 5 <= ((diemLyThuyet + diemThucHanh) / 2).toFixed(1)) ||
                    (filter == 'thiTotNghiep' && filterThiTotNghiep) ||
                    (filter == 'totNghiep' && student.totNghiep) ||
                    (filter == 'satHach' && student.datSatHach) ||
                    !['thiHetMon', 'thiTotNghiep', 'totNghiep', 'satHach'].includes(filter)) {
                    students.push(app.clone(student, { diemLyThuyet, diemThucHanh }));
                }
            }));
            res.send({ page: pageReturn ? pageReturn : null, students, subjects });
        }).catch(error => console.error(error) || res.send({ error }));
    });

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
                            teacher = (teacherGroups && teacherGroups.teacher) || null;
                        res.send({ error, item, teacher, student });
                    });
                } else {
                    res.send({ notify: 'Khóa học chưa được kích hoạt!' });
                }
            }
        });
    });

    // Hook permissionHooks -------------------------------------------------------------------------------------------
    app.permissionHooks.add('courseAdmin', 'course', (user) => new Promise(resolve => {
        app.permissionHooks.pushUserPermission(user, 'course:read', 'course:write');
        // Quản lý khóa học nội bộ thì được import danh sách học viên bằng file Excel
        if (user.division && !user.division.isOutside) app.permissionHooks.pushUserPermission(user, 'course:export', 'course:import');
        resolve();
    }));

    app.permissionHooks.add('lecturer', 'course', (user) => new Promise(resolve => {
        app.permissionHooks.pushUserPermission(user, 'course:read', 'student:write', 'student:read');
        if (user.division && !user.division.isOutside) app.permissionHooks.pushUserPermission(user, 'course:export');
        resolve();
    }));
};
