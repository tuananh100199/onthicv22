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
        { name: 'course:audit' },
        { name: 'course:export' },
        { name: 'course:import' },
        { name: 'course:report' },
    );

    app.get('/user/course', app.permission.check('course:read'), app.templates.admin);
    app.get('/user/course/:_id', app.permission.check('course:read'), app.templates.admin);
    app.get('/user/course/:_id/info', app.permission.check('course:read'), app.templates.admin);
    app.get('/user/course/:_id/study-program', app.permission.check('course:read'), app.templates.admin);
    app.get('/user/course/:_id/subject', app.permission.check('course:read'), app.templates.admin);
    app.get('/user/course/:_id/graduation-subject', app.permission.check('course:read'), app.templates.admin);
    app.get('/user/course/:_id/final-exam-setting', app.permission.check('course:read'), app.templates.admin);
    app.get('/user/course/:courseId/final-exam-setting/:_id', app.permission.check('course:read'), app.templates.admin);
    app.get('/user/course/:_id/manager', app.permission.check('course:read'), app.templates.admin);
    app.get('/user/course/:_id/student', app.permission.check('course:read'), app.templates.admin);
    app.get('/user/course/:_id/teacher', app.permission.check('course:read'), app.templates.admin);
    app.get('/user/course/:_id/rate-teacher', app.permission.check('course:read'), app.templates.admin);
    app.get('/user/course/:_courseId/rate-teacher/:_id', app.permission.check('course:read'), app.templates.admin);
    app.get('/user/course/:_id/feedback', app.permission.check('course:write'), app.templates.admin);
    app.get('/user/course/:_id/feedback/:_feedbackId', app.permission.check('course:write'), app.templates.admin);
    app.get('/user/course/:_id/feedback-lecturer', app.permission.check('course:read'), app.templates.admin);
    app.get('/user/course/:_id/your-students', app.permission.check('course:read'), app.templates.admin);
    app.get('/user/course/:_id/your-students/:_studentId', app.permission.check('course:read'), app.templates.admin);
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
    app.get('/user/course/:_id/comment', app.permission.check('comment:read'), app.templates.admin);
    app.get('/user/course/:_courseId/comment/:_id', app.permission.check('comment:read'), app.templates.admin);
    app.get('/user/course/:_id/import-final-score', app.permission.check('course:import'), app.templates.admin);
    app.get('/user/course/:_courseId/photo/:_id', app.permission.check('user:login'), app.templates.admin);
    app.get('/user/course/:_courseId/additional-profile', app.permission.check('course:read'), app.templates.admin);
    
    app.get('/user/course/:_id/report', app.permission.check('course:report'), app.templates.admin);
    app.get('/user/course/:_id/report/dang-ky-sat-hach', app.permission.check('course:report'), app.templates.admin);
    app.get('/user/course/:_id/report/xe-tap-lai', app.permission.check('course:report'), app.templates.admin);
    app.get('/user/course/:_id/report/danh-sach-hoc-vien', app.permission.check('course:report'), app.templates.admin);
    app.get('/user/course/:_id/report/danh-sach-du-thi-sat-hach', app.permission.check('course:report'), app.templates.admin);
    app.get('/user/course/:_id/report/danh-sach-du-thi-sat-hach-gplx-hang', app.permission.check('course:report'), app.templates.admin);
    app.get('/user/course/:_id/report/danh-sach-du-thi-sat-hach-gplx', app.permission.check('course:report'), app.templates.admin);
    app.get('/user/course/:_id/report/danh-sach-du-thi-sat-hach-lai-gplx', app.permission.check('course:report'), app.templates.admin);
    app.get('/user/course/:_id/report/ke-hoach-dao-tao', app.permission.check('course:report'), app.templates.admin);
    app.get('/user/course/:_id/report/sat-hach-lai-xe', app.permission.check('course:report'), app.templates.admin);
    app.get('/user/course/:_id/report/tien-do-dao-tao', app.permission.check('course:report'), app.templates.admin);
    app.get('/user/course/:_id/report/danh-sach-du-thi-tot-nghiep', app.permission.check('course:report'), app.templates.admin);
    app.get('/user/course/:_id/report/theo-doi-thuc-hanh', app.permission.check('course:report'), app.templates.admin);
    app.get('/user/course/:_id/report/bien-ban-du-thi-tot-nghiep', app.permission.check('course:report'), app.templates.admin);
    app.get('/user/course/:_id/report/hoi-dong-thi-tot-nghiep', app.permission.check('course:report'), app.templates.admin);
    app.get('/user/course/:_id/report/ban-coi-cham-thi', app.permission.check('course:report'), app.templates.admin);
    app.get('/user/course/:_id/report/hop-hoi-dong-thi-tot-nghiep', app.permission.check('course:report'), app.templates.admin);
    app.get('/user/course/:_id/report/xet-ket-qua-tot-nghiep', app.permission.check('course:report'), app.templates.admin);
    app.get('/user/course/:_id/report/danh-sach-hoc-vien-thi-tot-nghiep', app.permission.check('course:report'), app.templates.admin);
    app.get('/user/course/:_id/report/danh-sach-hoc-vien-tot-nghiep', app.permission.check('course:report'), app.templates.admin);
    app.get('/user/course/:_id/report/bang-diem-thi-tot-nghiep', app.permission.check('course:report'), app.templates.admin);
    app.get('/user/course/:_id/report/danh-sach-du-thi-sat-hach-lai', app.permission.check('course:report'), app.templates.admin);
    app.get('/user/course/:_id/report/bang-diem-thi-sat-hach', app.permission.check('course:report'), app.templates.admin);
    app.get('/user/course/:_id/report/thi-het-mon', app.permission.check('course:report'), app.templates.admin);
    
    app.get('/user/course/:_id/class', app.permission.check('course:read'), app.templates.admin);
    
    app.get('/user/hoc-vien/khoa-hoc/:_id', app.permission.check('user:login'), app.templates.admin);
    app.get('/user/hoc-vien/khoa-hoc/thong-tin/:_id', app.permission.check('user:login'), app.templates.admin);
    app.get('/user/hoc-vien/khoa-hoc/chuong-trinh-hoc/:_id', app.permission.check('user:login'), app.templates.admin);
    app.get('/user/hoc-vien/khoa-hoc/:_id/phan-hoi', app.permission.check('user:login'), app.templates.admin);
    app.get('/user/hoc-vien/khoa-hoc/:_id/tien-do-hoc-tap', app.permission.check('user:login'), app.templates.admin);
    app.get('/user/hoc-vien/khoa-hoc/:_id/cong-no', app.permission.check('user:login'), app.templates.admin);
    app.get('/user/hoc-vien/khoa-hoc/:_id/cong-no/chinh-thuc', app.permission.check('user:login'), app.templates.admin);
    app.get('/user/hoc-vien/khoa-hoc/:_id/cong-no/tang-them', app.permission.check('user:login'), app.templates.admin);
    app.get('/user/hoc-vien/khoa-hoc/:_id/cong-no/lich-su', app.permission.check('user:login'), app.templates.admin);

    
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
                    // Với user là isCourseAdmin + isOutside: chỉ hiện teacherGroups, students thuộc cơ sở của họ
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
    app.get('/api/course/page/:pageNumber/:pageSize', (req, res) => {
        const pageNumber = parseInt(req.params.pageNumber),
            pageSize = parseInt(req.params.pageSize),
            sessionUser = req.session.user,
            condition = req.query.pageCondition || {};
        if (req.query.courseType) {
            if (typeof req.query.courseType == 'string') {
                condition.courseType = req.query.courseType;
                condition.isDefault = { $ne: true };
            }
            else condition.isDefault = true;
        }
        if (sessionUser.isLecturer && !sessionUser.isCourseAdmin) {
            condition.teacherGroups = { $elemMatch: { teacher: sessionUser._id } };
            condition.active = true;
        }
        if (sessionUser.isCourseAdmin && !sessionUser.isLecturer) {
            condition.admins = sessionUser._id;
            condition.active = true;
        }

        // if (sessionUser.isStaff && !sessionUser.isLecturer && !sessionUser.isCourseAdmin) {
        //     condition.roleManager = {$elemMatch:{user:sessionUser._id}};
        //     condition.active = true;
        // }
        if(req.query.isDefault){
            condition.isDefault=req.query.isDefault=='true'?true:{$ne:true};
        }
        app.model.course.getPage(pageNumber, pageSize, condition, (error, page) => {
            if (error || !page) {
                res.send({ error });
            } else if (page.list && !page.list.length) {
                res.send({ page });
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

    app.get('/api/course/all',app.permission.check('course:read'),(req,res)=>{
        const sessionUser = req.session.user,
            condition = req.query.condition || {};
        if (sessionUser.isLecturer && !sessionUser.isCourseAdmin) {
            condition.teacherGroups = { $elemMatch: { teacher: sessionUser._id } };
            condition.active = true;
        }
        if (sessionUser.isCourseAdmin && !sessionUser.isLecturer) {
            condition.admins = sessionUser._id;
            condition.active = true;
        }
        // if (sessionUser.isStaff && !sessionUser.isLecturer && !sessionUser.isCourseAdmin) {
        //     condition.roleManager = {$elemMatch:{user:sessionUser._id}};
        //     condition.active = true;
        // }
        if(condition.isDefault){
            condition.isDefault=condition.isDefault=='true'?true:{$ne:true};
        }
        app.model.course.getAll(condition, (error, list) => {
            res.send({error,list});            
        });
    });

    app.get('/api/course', app.permission.check('user:login'), (req, res) => {
        getCourseData(req.query._id, req.session.user, (error, item) => res.send({ error, item }));
    });

    app.post('/api/course', app.permission.check('course:write'), (req, res) => {
        app.model.course.create(req.body.data || {}, (error, item) => res.send({ error, item }));
    });

    app.post('/api/course/default', app.permission.check('course:write'), (req, res) => {
        app.model.course.getAll({ isDefault: true }, (error, courses) => {
            if (error) res.send({ error });
            else {
                let err = null;
                app.model.courseType.getAll({}, (error, courseTypes) => {
                    if (error) res.send({ error });
                    else {
                        const listCourseType = courseTypes.map(courseType => ({ _id: courseType._id, name: courseType.title }));
                        const listCourse = courses.map(course => (course.courseType));
                        const list = [];
                        for (let i = 0; i < listCourseType.length; i++) {
                            if (listCourse.findIndex(course => course.toString() == listCourseType[i]._id.toString()) == -1)
                                list.push(listCourseType[i]);
                        }
                        const handleCreateDefaultCourse = (index = 0) => {
                            if (index == list.length) {
                                res.send({ error: err });
                            } else {
                                const data = {
                                    name: list[index].name + ' (Mặc định)',
                                    courseType: list[index]._id,
                                    isDefault: true,
                                    chatActive: false,
                                    commentActive: false,
                                    active: true,
                                };
                                app.model.course.create(data, (error) => {
                                    err = error;
                                    handleCreateDefaultCourse(index + 1);
                                });
                            }
                        };
                        handleCreateDefaultCourse();
                    }
                });
            }
        });
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
                    if(changes.close != undefined){
                        const listTeacher = [];
                        course && course.teacherGroups && course.teacherGroups.forEach(teacherGroup => {
                            if(teacherGroup && teacherGroup.teacher)
                            listTeacher.push(teacherGroup.teacher._id);
                        });
                        const handleUpdateCar = (index = 0) => {
                            if (index == listTeacher.length) {
                                if(course && course.close && !item.close){// course được update trạng thái close từ false =>true
                                    app.model.teacher.updateDoneCourse(course._id,error=>{
                                        res.send({error,item:course});
                                    });
                                }else if(course && !course.close && item.close){
                                    app.model.teacher.updateUnDoneCourse(course._id,error=>{
                                        res.send({error,item:course});
                                    });
                                } else {
                                    res.send({ item: course });
                                }
                            } else {
                                const teacher = listTeacher[index];
                                app.model.car.get({user: teacher}, (error, car) => {
                                    if(error || !car){
                                        handleUpdateCar(index + 1);
                                    } else {
                                        app.model.car.update({_id: car._id}, {currentCourseClose: changes.close}, () => {
                                            handleUpdateCar(index + 1);
                                        });
                                    }
                                });
                            }
                        };
                        handleUpdateCar();
                    } else res.send({ error, item: course });
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
                        // gán khóa mặc định khi remove course.
                        const {courseType} = course;
                        app.model.course.get({courseType,isDefault:true},(error,defaultCourse)=>{
                            if(error) reject('không tìm thấy khóa mặc định');
                            else{
                                const solve = (index = 0) => {
                                    if (index < _studentIds.length) {
                                        app.model.student.get({ _id: _studentIds[index], course: _courseId }, (error, student) => {
                                            if (error) {
                                                reject('Lỗi khi cập nhật khóa học!');
                                            } else if (student) {
                                                course.teacherGroups.forEach(group => group.student.forEach((item, index) => item._id == student._id.toString() && group.student.splice(index, 1)));
                                                //gán lại khóa mặc định
                                                student.course = defaultCourse;
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
                            }
                        });
                        
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

    //Teacher API
    app.put('/api/course/teacher-group/teacher', app.permission.check('course:write'), (req, res) => {
        const { _courseId,_teacherUserId, type, description='' } = req.body;
        const user = req.session.user;
        new Promise((resolve, reject) => {
            if (type == 'add') {
                app.model.course.addTeacherGroup(_courseId, _teacherUserId, error => error ? reject(error) :
                    app.model.course.get(_courseId, (error, course) => {
                        if (error || !course) reject(error);
                        else {
                            const courseType = course.courseType;
                            app.model.car.get({ user: _teacherUserId, courseType: courseType._id }, (error, item) => {
                                if (error) {
                                    reject(error);
                                } else if (!item || item.status == 'daThanhLy') {
                                    resolve();
                                } else {
                                    app.model.car.addCourseHistory({ _id: item._id }, { course: course._id, user: _teacherUserId }, error => {
                                        if (error) reject(error);
                                        else app.model.car.update({ _id: item._id }, { currentCourseClose: course.close }, error => error ? reject(error) : resolve());
                                    });
                                }
                            });
                        }
                    })
                );
            } else if (type == 'remove') {
                app.model.course.removeTeacherGroup(_courseId, _teacherUserId, error => error ? reject(error) :
                    app.model.car.get({ user: _teacherUserId }, (error, item) => {
                        if (error) {
                            reject(error);
                        } else if (!item || item.status == 'daThanhLy') {
                            resolve();
                        } else {
                            app.model.car.deleteCar({ _id: item._id }, { _courseId }, error => {
                                if (error) reject(error);
                                else resolve();
                            });
                        }
                    })
                );
            } else {
                reject('Dữ liệu không hợp lệ!');
            }
        }).then(() => new Promise((resolve,reject)=>{
            getCourseData(_courseId, req.session.user, (error, item) => {
                error = error || (item ? null : 'Lỗi khi cập nhật khóa học!');
                item = item || null;
                error?reject(error):resolve(item);
            });
        })).then((item) => {
            // thêm khóa học cho giáo viên.
            app.model.teacher.get({user:_teacherUserId},(error,teacher)=>{
                if(error) res.send({error});
                else if(!teacher) res.send({item});
                else{
                    if(type=='add'){
                        app.model.teacher.addCourse(teacher._id,_courseId,(error)=>{
                            if(error) res.send({error});
                            else{
                                const courseHistory = {
                                    user:user._id,
                                    course:_courseId,
                                    type:'add',
                                    description,
                                };
                                app.model.teacher.addCourseHistory(teacher._id,courseHistory,error=>res.send({error,item}));
                                // res.send({error,item})        
                            }
                        });
                    }else{
                        app.model.teacher.deleteCourse(teacher._id,_courseId,(error)=>{
                            if(error) res.send({error});
                            else{
                                const courseHistory = {
                                    user:user._id,
                                    course:_courseId,
                                    type:'remove',
                                    description,
                                };
                                app.model.teacher.addCourseHistory(teacher._id,courseHistory,error=>res.send({error,item}));
                                // res.send({error,item})        
                            }
                        });
                    }
                }
            });
            
        }).catch(error => console.error(error) || res.send({ error }));
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
    app.get('/api/course/lecturer/all', app.permission.check('course:read'), (req, res) => {
        let _teacherId = req.query._teacherId || {};
        const condition = {teacherGroups:{ $elemMatch :{teacher:{$in:[_teacherId]}}}};
        app.model.course.getAll(condition, (error, list) => {
            res.send({ error, list });
        });
    });
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
                    let diemMonHoc = 0, thoiGianHoc = 0, completedLessons = 0, numberLessons = subject.lessons ? subject.lessons.length : 0;
                    if (numberLessons) {
                        if (student && student.tienDoHocTap && student.tienDoHocTap[subject._id] && !subject.monThucHanh) {
                            const listLessons = Object.entries(student.tienDoHocTap[subject._id]);
                            let tongDiemMonHoc = 0;
                            (listLessons || []).forEach(lesson => {
                                tongDiemMonHoc += lesson[1].trueAnswers ? Number(lesson[1].score) / Object.keys(lesson[1].trueAnswers).length * 10 : 0;
                                thoiGianHoc += lesson[1].totalSeconds ? parseInt(lesson[1].totalSeconds) : 0;
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
                if (isAdmin || sessionUser.isLecturer) {
                    const tienDoThiHetMon = student && student.tienDoThiHetMon && student.tienDoThiHetMon;
                    const listIdThiHetMon = tienDoThiHetMon && Object.keys(tienDoThiHetMon);
                    if (listIdThiHetMon && listIdThiHetMon.length) {
                        for (let i = 0; i < monLyThuyet.length; i++) {
                            const index = listIdThiHetMon.findIndex(monThi => monThi == monLyThuyet[i]._id);
                            if (index == -1) {
                                filterThiTotNghiep = false;
                                break;
                            } else {
                                if (!(tienDoThiHetMon[listIdThiHetMon[index]].score && (parseInt(tienDoThiHetMon[listIdThiHetMon[index]].score) >= 5))) {
                                    filterThiTotNghiep = false;
                                    break;
                                }
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

    //additional-profile API

    app.get('/api/course/additional-profile/page/:pageNumber/:pageSize', app.permission.check('course:read'), (req, res) => {
        const pageNumber = parseInt(req.params.pageNumber),
            pageSize = parseInt(req.params.pageSize),
            condition = req.query.pageCondition || {},
            pageCondition = {course:condition.courseId};
        // handle searchText
        pageCondition['$or'] =[];
        if (condition.searchText) {
            const value = { $regex: `.*${condition.searchText}.*`, $options: 'i' };
            pageCondition['$or'] = [
                { firstname: value },
                { lastname: value },
                { identityCard: value },
            ];
        }

        // handleFilter
        if(condition.filterCondition && condition.filterCondition.profileType){
            let filterCondition = condition.filterCondition;
            if(condition.filterCondition.profileType=='done'){
                pageCondition.isDon=true;
                pageCondition.isHinh=true;
                pageCondition.isIdentityCard=true;
                pageCondition.isGiayKhamSucKhoe=true;
                pageCondition.isBangLaiA1=true;
            }else if(condition.filterCondition.profileType=='notDone'){
                delete filterCondition.profileType;
                if(filterCondition.isDon=='false' && filterCondition.isHinh=='false' &&filterCondition.isIdentityCard=='false' && filterCondition.isGiayKhamSucKhoe=='false' && filterCondition.isBangLaiA1=='false'){
                    for(const key in filterCondition) pageCondition['$or'].push({[key]:false});
                }else{
                    for(const key in filterCondition) filterCondition[key]=='true' && pageCondition['$or'].push({[key]:false});
                }
            }
        }
        if(pageCondition['$or'].length==0) delete delete pageCondition.$or;
        app.model.student.getPage(pageNumber, pageSize, pageCondition, (error, page) => {
            res.send({error,page});
            // res.send({ page, error: error || page == null ? 'Danh sách trống!' : null });
        });
    });

    app.put('/api/course/additional-profile', app.permission.check('course:write'), (req, res) => {
        app.model.student.update(req.body._id, req.body.changes, (error, item) => res.send({ error, item }));
    });

    // course assign role

    app.put('/api/course/assign-role/course-admin', app.permission.check('course:write'), (req, res) => {
        // role:admins,enrolls,teacherManagers,...
        //type=add,remove...
        // const user = req.session.user;
        const {_userId,action,_courseId} = req.body;
        const type='admins';
        app.model.course.get(_courseId,(error,course)=>{
            if(error){
                res.send({error});
            }
            else{
                let data = course[type];
                if(action=='add'){
                    // check if _userId exist in data
                    if(data.find(item=>item._id==_userId)){
                        res.send({error:'Người dùng đã được gán quyền'});
                        return;
                    }else{
                        (data=data.map(item=>item._id)).push(_userId);
                    }
                }else{//action==remove
                    data = data.filter(item=>item._id!=_userId);
                }
                app.model.course.update(_courseId,{[type]:data},(error,item)=>res.send({error,item}));
            }
        });
    });

    app.put('/api/course/assign-role', app.permission.check('course:write'), (req, res) => {
        // role:admins,enrolls,teacherManagers,...
        //type=add,remove...
        // const user = req.session.user;
        const {role,data,type,_courseId} = req.body;
        const {_userId} = data||{};
        app.model.course.get(_courseId,(error,course)=>{
            if(error){
                res.send({error});
            }
            else{
                let data = course.roleManager && course.roleManager.length?course.roleManager.filter(item=>item.role==role):[];
                if(type=='add'){
                    // check if _userId exist in data
                    if(data.find(item=>item.user._id==_userId)){
                        res.send({error:'Người dùng đã được gán quyền'});
                        return;
                    }else{
                        (data=data.map(item=>({user:item.user._id,role:item.role}))).push({user:_userId,role});
                    }
                }else if(type=='remove'){//type==remove
                    data = data.filter(item=>item.user && item.user._id!=_userId|| (item.user.id==_userId && item.role!=role) );
                }
                data=(course.roleManager && course.roleManager.length?course.roleManager:[]).map(item=>({user:item.user._id,role:item.role})).filter(item=>item.role!=role).concat(data);
                app.model.course.update(_courseId,{roleManager:data},(error,item)=>{
                    if(error)res.send({error});
                    else{
                        res.send({item});
                    }
                });
            }
        });
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
                if (student.course && (student.course.active || student.course.isDefault)) {
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
        app.permissionHooks.pushUserPermission(user, 'course:read', 'course:write', 'course:audit');
        // Quản lý khóa học nội bộ thì được import danh sách học viên bằng file Excel
        if (user.division && !user.division.isOutside) app.permissionHooks.pushUserPermission(user, 'course:export', 'course:import', 'course:report');
        resolve();
    }));

    app.permissionHooks.add('lecturer', 'course', (user) => new Promise(resolve => {
        app.permissionHooks.pushUserPermission(user, 'course:read', 'student:write', 'student:read');
        if (user.division && !user.division.isOutside) app.permissionHooks.pushUserPermission(user, 'course:export');
        resolve();
    }));
};
