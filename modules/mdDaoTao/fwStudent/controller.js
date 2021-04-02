module.exports = (app) => {
    const menu = {
        parentMenu: app.parentMenu.trainning,
        menus: {
            4040: { title: 'Ứng viên', link: '/user/pre-student' },
        }
    };
    // const menu = {
    //     parentMenu: app.parentMenu.trainning,
    //     menus: {
    //         4041: { title: 'Học viên', link: '/user/student' },
    //     }
    // };

    app.permission.add(
        { name: 'student:read', menu }, { name: 'student:write' }, { name: 'student:delete' }, { name: 'student:import' },
        { name: 'pre-student:read', menu }, { name: 'pre-student:write' }, { name: 'pre-student:delete' }, { name: 'pre-student:import' },
    );

    app.get('/user/pre-student', app.permission.check('pre-student:read'), app.templates.admin);
    app.get('/user/pre-student/import', app.permission.check('pre-student:import'), app.templates.admin);

    // app.get('/user/student/', app.permission.check('student:read'), app.templates.admin);
    // app.get('/student/:_id', app.templates.home);

    // Student APIs ---------------------------------------------------------------------------------------------------
    app.get('/api/student/page/:pageNumber/:pageSize', app.permission.check('student:read'), (req, res) => {
        let pageNumber = parseInt(req.params.pageNumber),
            pageSize = parseInt(req.params.pageSize),
            condition = req.query.condition || {},
            pageCondition = {};
        try {
            if (condition) {
                if (condition.searchText) {
                    const value = { $regex: `.*${condition.searchText}.*`, $options: 'i' };
                    pageCondition['$or'] = [
                        { phoneNumber: value },
                        { email: value },
                        { firstname: value },
                        { lastname: value },
                    ];
                }
            }
            app.model.student.getPage(pageNumber, pageSize, pageCondition, (error, page) => res.send({ error, page }));
        } catch (error) {
            res.send({ error });
        }
    });

    app.get('/api/student', app.permission.check('student:read'), (req, res) => {
        app.model.student.get(req.query._id, (error, item) => res.send({ error, item }));
    });

    app.put('/api/student', app.permission.check('student:write'), (req, res) => {
        app.model.student.update(req.body._id, req.body.changes, (error, item) => res.send({ error, item }));
    });

    app.delete('/api/student', app.permission.check('student:delete'), (req, res) => {
        app.model.student.delete(req.body._id, (error) => res.send({ error }));
    });

    // Pre-student APIs -----------------------------------------------------------------------------------------------
    app.get('/api/pre-student/page/:pageNumber/:pageSize', app.permission.check('pre-student:read'), (req, res) => {
        let pageNumber = parseInt(req.params.pageNumber),
            pageSize = parseInt(req.params.pageSize),
            condition = req.query.condition || {},
            pageCondition = { course: null };
        try {
            if (req.session.user.isCourseAdmin && req.session.user.division && req.session.user.division.isOutside) { // Session user là quản trị viên khoá học
                pageCondition.division = req.session.user.division._id;
            }

            if (condition.searchText) {
                const value = { $regex: `.*${condition.searchText}.*`, $options: 'i' };
                pageCondition['$or'] = [
                    { phoneNumber: value },
                    { email: value },
                    { firstname: value },
                    { lastname: value },
                ];
            }
            app.model.student.getPage(pageNumber, pageSize, pageCondition, (error, page) => res.send({ error, page }));
        } catch (error) {
            res.send({ error });
        }
    });

    app.post('/api/pre-student', app.permission.check('pre-student:write'), (req, res) => {
        let data = req.body.data;
        delete data.course; // Không được gán khoá học cho pre-student
        if (data.division == null) data.division = req.session.user.division;
        app.model.student.create(data, (error, item) => {
            if (error || item == null || item.image == null) {
                res.send({ error, item });
            } else {
                app.uploadImage('student', app.model.student.get, item._id, item.image, data => res.send(data));
            }
        });
    });



    app.post('/api/pre-student/import', app.permission.check('pre-student:write'), (req, res) => {
        let students = req.body.students,
            division = req.body.division;
        students.forEach(student => {
            student.division = division;
            delete student.course;
            delete student.id;
            delete student.email
            app.model.student.create(student, (error, item) => {
                if (error || item == null || item.image == null) {
                    res.send({ error, item });
                } else {
                    new Promise((resolve, reject) => { // Tạo user
                        app.model.user.get({ email: item.email }, (error, user) => {
                            if (error) {
                                reject('Lỗi khi đọc thông tin người dùng!');
                            } else if (user) { // Đã là user
                                resolve(user._id);
                            } else { // Chưa là user
                                const dataPassword = app.randomPassword(8),
                                    newUser = {
                                        email: item.email,
                                        firstname: item.firstname,
                                        lastname: item.lastname,
                                        phoneNumber: item.phoneNumber,
                                        password: dataPassword
                                    };
                                app.model.user.create(newUser, (error, user) => {
                                    if (error) {
                                        reject('Lỗi khi tạo người dùng!');
                                    } else { // Tạo user thành công. Gửi email & password đến người dùng!
                                        resolve(user._id);
                                        app.model.setting.get('email', 'emailPassword', 'emailCreateMemberByAdminTitle', 'emailCreateMemberByAdminText', 'emailCreateMemberByAdminHtml', result => {
                                            const url = `${app.isDebug || app.rootUrl}/active-user/${user._id}`,
                                                fillParams = (data) => data.replaceAll('{name}', `${user.lastname} ${user.firstname}`)
                                                    .replaceAll('{firstname}', user.firstname).replaceAll('{lastname}', user.lastname)
                                                    .replaceAll('{email}', user.email).replaceAll('{password}', dataPassword).replaceAll('{url}', url),
                                                mailTitle = result.emailCreateMemberByAdminTitle,
                                                mailText = fillParams(result.emailCreateMemberByAdminText),
                                                mailHtml = fillParams(result.emailCreateMemberByAdminHtml);
                                            app.email.sendEmail(result.email, result.emailPassword, user.email, app.email.cc, mailTitle, mailText, mailHtml, null);
                                        });
                                    }
                                });
                            }
                        });
                    }).then(_userId => { // Tạo student cho candidate
                        item.user = _userId;
                        item.save();
                        const dataStudent = {
                            user: _userId,
                            firstname: item.firstname,
                            lastname: item.lastname,
                            courseType: item.courseType,
                        };
                        app.model.student.create(dataStudent, (error) => res.send({ error, item }));
                    }).catch(error => res.send({ error }));
                }
            })
        });
    });

    app.put('/api/pre-student', app.permission.check('pre-student:write'), (req, res) => {
        let { _id, changes } = req.body;
        delete changes.course; // Không được gán khoá học cho pre-student
        app.model.student.update(_id, changes, (error, item) => res.send({ error, item }));
    });

    app.delete('/api/pre-student', app.permission.check('pre-student:delete'), (req, res) => {
        const { _id } = req.body;
        app.model.student.get(_id, (error, student) => {
            if (student) {
                if (student.course) {
                    res.send({ error: 'Bạn không được quyền xoá học viên!' });
                } else {
                    app.model.student.delete(_id, (error) => res.send({ error }));
                }
            } else {
                res.send({ error: error ? 'Hệ thống gặp lỗi!' : 'Ứng viên không tồn tại!' });
            }
        });
    });

    app.uploadHooks.add('uploadExcelFile', (req, fields, files, params, done) => {
        if (files.CandidateFile && files.CandidateFile.length > 0) {
            console.log('Hook: uploadExcelFile => your excel file upload');
            const srcPath = files.CandidateFile[0].path;
            app.excel.readFile(srcPath, workbook => {
                app.deleteFile(srcPath);
                if (workbook) {
                    const worksheet = workbook.getWorksheet(1), data = [], totalRow = worksheet.lastRow.number;
                    const handleUpload = (index = 2) => {
                        const values = worksheet.getRow(index).values;
                        if (values.length == 0 || index == totalRow + 1) {
                            done({ data });
                        } else {
                            data.push({
                                id: index - 1,
                                firstname: values[2],
                                lastname: values[3],
                                email: values[4],
                                phoneNumber: values[5],
                                courseType: values[6],
                                sex: values[7],
                                birthday: values[8],
                                nationality: values[9],
                                residence: values[10],
                                regularResidence: values[11],
                                identityCard: values[12],
                                identityIssuedBy: values[13],
                                identityDate: values[14],
                                giayPhepLaiXe2BanhSo: values[15],
                                giayPhepLaiXe2BanhNgay: values[16],
                                giayPhepLaiXe2BanhNoiCap: values[17],
                                giayKhamSucKhoe: values[18],//Đổi tên
                                giayKhamSucKhoeNgayKham: values[19],
                            });
                            handleUpload(index + 1);
                        }
                    };
                    handleUpload();
                } else {
                    done({ error: 'Error' });
                }
            });
        }
    });
    // Hook permissionHooks -------------------------------------------------------------------------------------------
    app.permissionHooks.add('courseAdmin', 'pre-student', (user) => new Promise(resolve => {
        app.permissionHooks.pushUserPermission(user, 'pre-student:read', 'pre-student:write', 'pre-student:delete', 'pre-student:import');
        resolve();
    }));

    // Hook upload images ---------------------------------------------------------------------------------------------
    app.createFolder(app.path.join(app.publicPath, '/img/student'));

    const uploadStudent = (fields, files, done) => {
        if (fields.userData && fields.userData[0].startsWith('student:') && files.StudentImage && files.StudentImage.length > 0) {
            console.log('Hook: uploadStudent => student image upload');
            const _id = fields.userData[0].substring('student:'.length);
            app.uploadImage('student', app.model.student.get, _id, files.StudentImage[0].path, done);
        }
    };
    app.uploadHooks.add('uploadStudent', (req, fields, files, params, done) =>
        app.permission.has(req, () => uploadStudent(fields, files, done), done, 'student:write'));
};