module.exports = (app) => {
    const menu = {
        parentMenu: app.parentMenu.trainning,
        menus: {
            4040: { title: 'Ứng viên', link: '/user/pre-student' },
        }
    };
    app.permission.add(
        { name: 'student:read', menu }, { name: 'student:write' }, { name: 'student:delete' }, { name: 'student:import' },
        { name: 'pre-student:read', menu }, { name: 'pre-student:write' }, { name: 'pre-student:delete' }, { name: 'pre-student:import' },
        { name: 'pre-student:template' },
    );

    app.get('/user/pre-student', app.permission.check('pre-student:read'), app.templates.admin);
    app.get('/user/pre-student/import', app.permission.check('pre-student:import'), app.templates.admin);

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
        let data = req.body.student;
        delete data.course; // Không được gán khoá học cho pre-student
        new Promise((resolve, reject) => { // Tạo user cho pre
            app.model.user.get({ email: data.email }, (error, user) => {
                if (error) {
                    reject('Lỗi khi đọc thông tin người dùng!');
                } else if (user) {
                    resolve(user._id);
                } else { // pre chưa là user
                    const dataPassword = app.randomPassword(8),
                        newUser = {
                            email: data.email,
                            firstname: data.firstname,
                            lastname: data.lastname,
                            phoneNumber: data.phoneNumber,
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
        }).then(_userId => { // Tạo student 
            data.user = _userId;   // assign id of user to user field of prestudent
            delete data.email;
            delete data.phoneNumber;
            app.model.student.create(data, (error, item) => {
                if (error || item == null || item.image == null) {
                    res.send({ error, item });
                } else {
                    app.uploadImage('pre-student', app.model.student.get, item._id, item.image, data => {
                        res.send(data)
                    });
                }
            });
        }).catch(error => res.send({ error }));
    });

    app.post('/api/pre-student/import', app.permission.check('pre-student:write'), (req, res) => {
        let students = req.body.students,
            division = req.body.division;
        students.forEach(student => {
            student.division = division;
            delete student.course;
            app.model.student.create(student);
        });
        res.send();
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
                } else if (req.session.user.division && req.session.user.division.isOutside && student.user && req.session.user.division._id != student.user._id) {
                    res.send({ error: 'Bạn không được quyền xoá học viên không thuộc cơ sở của bạn!' });
                } else {
                    app.model.student.delete(_id, (error) => res.send({ error }));
                }
            } else {
                res.send({ error: error ? 'Hệ thống gặp lỗi!' : 'Ứng viên không tồn tại!' });
            }
        });
    });

    // Get All Student Have Course Null--------------------------------------------------------------------------------
    app.get('/api/course/preStudent/all', app.permission.check('pre-student:read'), (req, res) => {
        const { searchText, courseType } = req.query,
            condition = { course: null, courseType };
        if (searchText) {
            const value = { $regex: `.*${searchText}.*`, $options: 'i' };
            condition['$or'] = [
                { firstname: value },
                { lastname: value },
                { email: value },
            ];
        }
        app.model.student.getAll(condition, (error, list) => res.send({ error, list }));
    });


    // Hook permissionHooks -------------------------------------------------------------------------------------------
    app.permissionHooks.add('courseAdmin', 'pre-student', (user) => new Promise(resolve => {
        app.permissionHooks.pushUserPermission(user, 'pre-student:read', 'pre-student:write', 'pre-student:delete');

        // Quản lý khoá học nội bộ (isOutSide=true) thì được import danh sách ứng viên bằng file Excel
        if (user.division && !user.division.isOutside) app.permissionHooks.pushUserPermission(user, 'pre-student:import');
        resolve();
    }));

    // Hook upload images student ---------------------------------------------------------------------------------------------
    app.createFolder(app.path.join(app.publicPath, '/img/student'));


    const uploadStudentImage = (fields, files, done) => {
        if (fields.userData && fields.userData[0].startsWith('student:') && files.StudentImage && files.StudentImage.length > 0) {
            console.log('Hook: uploadStudent => student image upload');
            const _id = fields.userData[0].substring('student:'.length);
            app.uploadImage('student', app.model.student.get, _id, files.StudentImage[0].path, done);
        }
    };
    app.uploadHooks.add('uploadStudent', (req, fields, files, params, done) =>
        app.permission.has(req, () => uploadStudentImage(fields, files, done), done, 'student:write'));
    // Hook upload images pre-student ---------------------------------------------------------------------------------------------
    app.createFolder(app.path.join(app.publicPath, '/img/pre-student'));
    const uploadPreStudentImage = (fields, files, done) => {
        if (fields.userData && fields.userData[0].startsWith('pre-student:') && files.PreStudentImage && files.PreStudentImage.length > 0) {
            console.log('Hook: uploadPreStudent => pre-student image upload');
            const _id = fields.userData[0].substring('pre-student:'.length);
            app.uploadImage('pre-student', app.model.student.get, _id, files.PreStudentImage[0].path, done);
        }
    };
    app.uploadHooks.add('uploadPreStudentImage', (req, fields, files, params, done) =>
        app.permission.has(req, () => uploadPreStudentImage(fields, files, done), done, 'pre-student:write'));

    // Hook upload pre-students excel---------------------------------------------------------------------------------------
    const uploadPreStudentExcelFile = (fields, files, done) => {
        const srcPath = files.CandidateFile[0].path;
        app.excel.readFile(srcPath, workbook => {
            app.deleteFile(srcPath);
            if (workbook) {
                const data = [];
                const handleUpload = (index, worksheet, totalRow, item, data) => {
                    const values = worksheet.getRow(index).values;
                    if (values.length == 0 || index == totalRow + 1) {
                        data.push(item)
                    } else {
                        item.push({
                            firstname: values[2],
                            lastname: values[3],
                            email: values[4],
                            phoneNumber: values[5],
                            sex: values[6].toLowerCase().trim() == 'nam' ? 'male' : 'female',
                            birthday: values[7],
                            nationality: values[8],
                            residence: values[9],
                            regularResidence: values[10],
                            identityCard: values[11],
                            identityIssuedBy: values[12],
                            identityDate: values[13],
                            giayPhepLaiXe2BanhSo: values[14],
                            giayPhepLaiXe2BanhNgay: values[15],
                            giayPhepLaiXe2BanhNoiCap: values[16],
                            giayKhamSucKhoe: values[17].toLowerCase().trim() == 'có' ? true : false,
                            giayKhamSucKhoeNgayKham: values[18],
                        });
                        handleUpload(index + 1, worksheet, totalRow, item, data);
                    }
                };
                workbook.worksheets.map((worksheet) => {
                    handleUpload(2, worksheet, worksheet.lastRow.number, [], data)
                });
                if (data.length > 0) done({ data });
                else done({ error: 'Error' });
            } else done({ error: 'Error' });
        });
    };

    app.uploadHooks.add('uploadPreStudentExcelFile', (req, fields, files, params, done) => {
        if (files.CandidateFile && files.CandidateFile.length > 0) {
            console.log('Hook: uploadPreStudentExcelFile => your excel file upload');
            uploadPreStudentExcelFile(fields, files, done);
        }
    });
    // Hook upload template pre-students ---------------------------------------------------------------------------------------
    const uploadPreStudentTemplateFile = (fields, files, done) => {
        const srcPath = files.CandidateTemplateFile[0].path;
        app.deleteFile(app.path.join(app.publicPath, 'download/candidate.xlsx'));
        app.fs.rename(srcPath, app.path.join(app.publicPath, 'download/candidate.xlsx'), (error) => {
            done({ error })
        });
    };

    app.uploadHooks.add('uploadPreStudentTemplateFile', (req, fields, files, params, done) => {
        if (files.CandidateTemplateFile && files.CandidateTemplateFile.length > 0) {
            console.log('Hook: uploadPreStudentTemplateFile => your excel template file upload');
            uploadPreStudentTemplateFile(fields, files, done);
        }
    });
};