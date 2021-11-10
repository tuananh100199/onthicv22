module.exports = (app) => {
    const menu = {
        parentMenu: app.parentMenu.trainning,
        menus: {
            4040: { title: 'Ứng viên', link: '/user/pre-student' },
        }
    }, menuFailStudent = {
        parentMenu: app.parentMenu.trainning,
        menus: {
            4055: { title: 'Học viên chưa tốt nghiệp', link: '/user/student/fail-graduation' },
            4060: { title: 'Học viên chưa đạt sát hạch', link: '/user/student/fail-exam' },
        }
    };

    app.permission.add(
        { name: 'student:read' }, { name: 'student:write' }, { name: 'student:delete', menu }, { name: 'student:import', menu: menuFailStudent },//TODO: Thầy TÙNG
        { name: 'pre-student:read', menu }, { name: 'pre-student:write' }, { name: 'pre-student:delete' }, { name: 'pre-student:import' },
    );

    app.get('/user/student/import-fail-pass', app.permission.check('student:import'), app.templates.admin);
    app.get('/user/student/fail-exam', app.permission.check('student:read'), app.templates.admin);
    app.get('/user/student/fail-graduation', app.permission.check('student:read'), app.templates.admin);
    app.get('/user/pre-student', app.permission.check('pre-student:read'), app.templates.admin);
    app.get('/user/pre-student/import', app.permission.check('pre-student:import'), app.templates.admin);

    // Student APIs ---------------------------------------------------------------------------------------------------
    app.get('/api/student/page/:pageNumber/:pageSize', app.permission.check('student:read'), (req, res) => {
        let pageNumber = parseInt(req.params.pageNumber),
            pageSize = parseInt(req.params.pageSize),
            condition = req.query.pageCondition || {},
            pageCondition = { course: req.query.course || { $ne: null } };
        try {
            if (req.session.user.isCourseAdmin && req.session.user.division && req.session.user.division.isOutside) { // Session user là quản trị viên khóa học
                pageCondition.division = req.session.user.division._id;
            }

            if (condition.courseType) pageCondition.courseType = condition.courseType;
            if (condition.datSatHach) pageCondition.datSatHach = condition.datSatHach;
            if (condition.totNghiep) pageCondition.totNghiep = condition.totNghiep;
            if (condition.searchText) {
                const value = { $regex: `.*${condition.searchText}.*`, $options: 'i' };
                pageCondition.$or = [
                    // { phoneNumber: value },
                    // { email: value },
                    { firstname: value },
                    { lastname: value },
                    { identityCard: value },
                ];
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

    app.get('/api/student/score', app.permission.check('user:login'), (req, res) => {//mobile
        const _userId = req.session.user._id,
            _courseId = req.query.courseId;
        app.model.student.get({ user: _userId, course: _courseId }, (error, item) => {
            res.send({ error, item: item && item.tienDoHocTap });
        });
    });

    app.get('/api/student/export/:_courseId/:filter', app.permission.check('course:read'), (req, res) => {
        let pageNumber = parseInt(req.params.pageNumber),
            pageSize = parseInt(req.params.pageSize),
            condition = req.query.pageCondition || {},
            pageCondition = { courseType: req.params._courseId || { $ne: null }, course: { $ne: null } },
            filter = req.params.filter;
        function dateToText(date) {
            const newDate = new Date(date);
            let year = newDate.getFullYear();
            let month = (1 + newDate.getMonth()).toString().padStart(2, '0');
            let day = newDate.getDate().toString().padStart(2, '0');
            return day + '/' + month + '/' + year;
        }
        try {
            if (req.session.user.isCourseAdmin && req.session.user.division && req.session.user.division.isOutside) { // Session user là quản trị viên khóa học
                pageCondition.division = req.session.user.division._id;
            }

            if (condition.courseType) pageCondition.courseType = condition.courseType;
            if (filter == 'HVChuaDatSatHach') pageCondition.datSatHach = false;
            if (filter == 'HVChuaTotNghiep') pageCondition.totNghiep = false;
            if (condition.searchText) {
                const value = { $regex: `.*${condition.searchText}.*`, $options: 'i' };
                pageCondition.$or = [
                    // { phoneNumber: value },
                    // { email: value },
                    { firstname: value },
                    { lastname: value },
                    { identityCard: value },
                ];
            }
            app.model.student.getPage(pageNumber, pageSize, pageCondition, (error, page) => {
                const students = page && page.list ? page.list.map(item => item = app.clone(item)) : [];
                const workbook = app.excel.create(), worksheet = workbook.addWorksheet(filter);
                const cells = [
                    { cell: 'A1', value: 'STT', bold: true, border: '1234' },
                    { cell: 'B1', value: 'Họ', bold: true, border: '1234' },
                    { cell: 'C1', value: 'Tên', bold: true, border: '1234' },
                    { cell: 'D1', value: 'CMND/CCCD', bold: true, border: '1234' },
                    { cell: 'E1', value: 'Khóa học', bold: true, border: '1234' },
                ];

                let columns = [
                    { header: 'STT', key: '_id', width: 5 },
                    { header: 'Họ', key: 'lastname', width: 15 },
                    { header: 'Tên', key: 'firstname', width: 15 },
                    { header: 'CMND/CCCD', key: 'identityCard', width: 15 },
                    { header: 'Khóa học', key: 'course', width: 40 },
                ];

                if (filter == 'HVChuaTotNghiep') {
                    cells.push(
                        { cell: 'F1', value: 'Ngày dự kiến thi tốt nghiệp', bold: true, border: '1234' },
                        { cell: 'G1', value: 'Lý do chưa tốt nghiệp', bold: true, border: '1234' }
                    );
                    columns.push(
                        { header: 'Ngày dự kiến thi tốt nghiệp', key: 'ngayDuKienThiTotNghiep', width: 30 },
                        { header: 'Lý do chưa tốt nghiệp', key: 'liDoChuaTotNghiep', width: 80 },
                    );
                } else if (filter == 'HVChuaDatSatHach') {
                    cells.push(
                        { cell: 'F1', value: 'Ngày dự kiến thi sát hạch', bold: true, border: '1234' },
                        { cell: 'G1', value: 'Lý do chưa đạt sát hạch', bold: true, border: '1234' }
                    );
                    columns.push(
                        { header: 'Ngày dự kiến thi sát hạch', key: 'ngayDuKienThiSatHach', width: 30 },
                        { header: 'Lý do chưa đạt sát hạch', key: 'liDoChuaDatSatHach', width: 80 },
                    );
                }
                worksheet.columns = columns;
                students.forEach((student, index) => {
                    const obj = {
                        _id: index + 1,
                        lastname: student.lastname,
                        firstname: student.firstname,
                        identityCard: student.identityCard,
                        course: student.course ? student.course.name : '',
                    };
                    if (filter == 'HVChuaTotNghiep') {
                        obj['ngayDuKienThiTotNghiep'] = student.ngayDuKienThiTotNghiep ? dateToText(student.ngayDuKienThiTotNghiep) : '';
                        obj['liDoChuaTotNghiep'] = student.liDoChuaTotNghiep ? student.liDoChuaTotNghiep : '';
                    } else if (filter == 'HVChuaDatSatHach') {
                        obj['ngayDuKienThiSatHach'] = student.ngayDuKienThiSatHach;
                        obj['liDoChuaDatSatHach'] = student.liDoChuaDatSatHach ? student.liDoChuaDatSatHach : '';
                    }
                    worksheet.addRow(obj);
                });
                app.excel.write(worksheet, cells);
                app.excel.attachment(workbook, res, 'DanhSachHocVien.xlsx');
            });
        } catch (error) {
            res.send({ error });
        }
    });

    // Pre-student APIs -----------------------------------------------------------------------------------------------
    app.get('/api/pre-student/page/:pageNumber/:pageSize', app.permission.check('pre-student:read'), (req, res) => {
        let pageNumber = parseInt(req.params.pageNumber),
            pageSize = parseInt(req.params.pageSize),
            condition = req.query.condition || {},
            pageCondition = { course: null };
        try {
            if (req.session.user.isCourseAdmin && req.session.user.division && req.session.user.division.isOutside) { // Session user là quản trị viên khóa học
                pageCondition.division = req.session.user.division._id;
            }

            if (condition.courseType) pageCondition.courseType = condition.courseType;
            if (condition.searchPlanCourse) pageCondition.planCourse = { $regex: `.*${condition.searchPlanCourse}.*`, $options: 'i' };
            if (condition.searchText) {
                const value = { $regex: `.*${condition.searchText}.*`, $options: 'i' };
                pageCondition['$or'] = [
                    { firstname: value },
                    { lastname: value },
                    { identityCard: value },
                ];
            }

            app.model.student.getPage(pageNumber, pageSize, pageCondition, req.query.sort, (error, page) => {
                res.send({ error, page });
            });
        } catch (error) {
            res.send({ error });
        }
    });

    app.post('/api/pre-student', app.permission.check('pre-student:write'), (req, res) => {
        let data = req.body.student;
        function convert(str) {
            let date = new Date(str),
                mnth = ('0' + (date.getMonth() + 1)).slice(-2),
                day = ('0' + date.getDate()).slice(-2);
            return [day, mnth, date.getFullYear()].join('');
        }
        delete data.course; // Không được gán khóa học cho pre-student
        new Promise((resolve, reject) => { // Tạo user cho pre
            app.model.user.get({ identityCard: data.identityCard }, (error, user) => {
                if (error) {
                    reject('Lỗi khi đọc thông tin người dùng!');
                } else if (user) {
                    resolve(user._id);
                } else { // pre chưa là user
                    const dataPassword = convert(data.birthday),
                        newUser = {
                            identityCard: data.identityCard,
                            email: data.email,
                            firstname: data.firstname,
                            lastname: data.lastname,
                            phoneNumber: data.phoneNumber,
                            division: data.division || req.session.user.division,
                            password: dataPassword,
                            birthday: data.birthday,
                        };
                    app.model.user.create(newUser, (error, user) => {
                        if (error) {
                            reject('Lỗi khi tạo người dùng!');
                        } else { // Tạo user thành công. Gửi email & password đến người dùng!
                            resolve(user._id);
                            // app.model.setting.get('email', 'emailPassword', 'emailCreateMemberByAdminTitle', 'emailCreateMemberByAdminText', 'emailCreateMemberByAdminHtml', result => {
                            //     const url = `${app.isDebug || app.rootUrl}/active-user/${user._id}`,
                            //         fillParams = (data) => data.replaceAll('{name}', `${user.lastname} ${user.firstname}`)
                            //             .replaceAll('{firstname}', user.firstname).replaceAll('{lastname}', user.lastname)
                            //             .replaceAll('{email}', user.email).replaceAll('{password}', dataPassword).replaceAll('{url}', url),
                            //         mailTitle = result.emailCreateMemberByAdminTitle,
                            //         mailText = fillParams(result.emailCreateMemberByAdminText),
                            //         mailHtml = fillParams(result.emailCreateMemberByAdminHtml);
                            //     app.email.sendEmail(result.email, result.emailPassword, user.email, app.email.cc, mailTitle, mailText, mailHtml, null);
                            // });
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
                        res.send(data);
                    });
                }
            });
        }).catch(error => res.send({ error }));
    });

    app.post('/api/pre-student/import', app.permission.check('pre-student:write'), (req, res) => {
        let students = req.body.students;
        let studentError = []; // những học viên có số CMND,CCCD của cố vấn dự kiến sai
        let err = null;
        function convert(str) {
            let date = new Date(str),
                mnth = ('0' + (date.getMonth() + 1)).slice(-2),
                day = ('0' + date.getDate()).slice(-2);
            return [day, mnth, date.getFullYear()].join('');
        }
        if (students && students.length) {
            const handleCreateStudent = (index = 0) => {
                if (index == students.length) {
                    res.send({ error: err, studentError });
                } else {
                    const student = students[index];
                    student.division = req.body.division;
                    const dataPassword = convert(student.birthday),
                        newUser = { ...student, password: dataPassword, active: true };
                    app.model.user.create(newUser, (error, user) => {
                        if (error && !user) {
                            err = error;
                            handleCreateStudent(index + 1);
                        } else { // pre chưa là user
                            if (!error && user) {
                                // app.model.setting.get('email', 'emailPassword', 'emailCreateMemberByAdminTitle', 'emailCreateMemberByAdminText', 'emailCreateMemberByAdminHtml', result => {
                                //     const url = `${app.isDebug || app.rootUrl}/active-user/${user._id}`,
                                //         fillParams = (student) => student.replaceAll('{name}', `${user.lastname} ${user.firstname}`)
                                //             .replaceAll('{firstname}', user.firstname).replaceAll('{lastname}', user.lastname)
                                //             .replaceAll('{email}', user.email).replaceAll('{password}', dataPassword).replaceAll('{url}', url),
                                //         mailTitle = result.emailCreateMemberByAdminTitle,
                                //         mailText = fillParams(result.emailCreateMemberByAdminText),
                                //         mailHtml = fillParams(result.emailCreateMemberByAdminHtml);
                                //     app.email.sendEmail(result.email, result.emailPassword, user.email, app.email.cc, mailTitle, mailText, mailHtml, null);
                                // });
                            }
                            student.user = user._id;   // assign id of user to user field of prestudent
                            student.courseType = req.body.courseType;
                            app.model.user.get({ identityCard: student.lecturerIdentityCard, isLecturer: true }, (error, user) => {
                                if (error || !user) {
                                    studentError.push({ error: `${student.lecturerIdentityCard}` });
                                    handleCreateStudent(index + 1);
                                } else {
                                    student.planLecturer = user._id;
                                    app.model.student.create(student, () => {
                                        handleCreateStudent(index + 1);
                                    });
                                }
                            });
                        }
                    });
                }
            };
            handleCreateStudent();
        } else {
            res.send({ error: 'Danh sách ứng viên trống!' });
        }
    });

    app.put('/api/pre-student', app.permission.check('pre-student:write'), (req, res) => {
        let { _id, changes } = req.body;
        delete changes.course; // Không được gán khóa học cho pre-student
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

    // Hook permissionHooks -------------------------------------------------------------------------------------------
    app.permissionHooks.add('courseAdmin', 'pre-student', (user) => new Promise(resolve => {
        app.permissionHooks.pushUserPermission(user, 'pre-student:read', 'pre-student:write', 'pre-student:delete');

        // Quản lý khóa học nội bộ (isOutSide=true) thì được import danh sách ứng viên bằng file Excel
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
                            const stringToDate = (values) => {
                                values = values ? values.trim() : '';
                                return values.length >= 10 ? new Date(values.slice(6, 10), values.slice(3, 5) - 1, values.slice(0, 2)) : null;
                            };
                            const email = values[4] && values[4] != undefined ? values[4] : '';
                            data.push({
                                id: index - 1,
                                lastname: values[2],
                                firstname: values[3],
                                email: email.text || email,
                                phoneNumber: values[5],
                                sex: values[6] && values[6].toLowerCase().trim() == 'nam' ? 'male' : 'female',
                                birthday: stringToDate(values[7]),
                                nationality: values[8],
                                residence: values[9],
                                regularResidence: values[10],
                                identityCard: values[11],
                                identityIssuedBy: values[12],
                                identityDate: stringToDate(values[13]),
                                giayPhepLaiXe2BanhSo: values[14],
                                giayPhepLaiXe2BanhNgay: stringToDate(values[15]),
                                giayPhepLaiXe2BanhNoiCap: values[16],
                                giayKhamSucKhoe: values[17] && values[17].toLowerCase().trim() == 'x' ? true : false,
                                giayKhamSucKhoeNgayKham: values[17] && values[17].toLowerCase().trim() == 'x' ? stringToDate(values[18]) : null,
                                hinhThe3x4: values[19] && values[19].toLowerCase().trim() == 'x' ? true : false,
                                hinhChupTrucTiep: values[20] && values[20].toLowerCase().trim() == 'x' ? true : false,
                                lecturerIdentityCard: values[21],
                                lecturerName: values[22],
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

    // Hook upload fail pass student excel---------------------------------------------------------------------------------------
    app.uploadHooks.add('uploadExcelFailPassStudentFile', (req, fields, files, params, done) => {
        if (files.FailPassStudentFile && files.FailPassStudentFile.length > 0 && fields.userData && fields.userData.length > 0 && fields.userData[0].startsWith('FailPassStudentFile:')) {
            console.log('Hook: uploadExcelFailPassStudentFile => your excel fail pass student file upload');
            const srcPath = files.FailPassStudentFile[0].path;
            app.excel.readFile(srcPath, workbook => {
                app.deleteFile(srcPath);
                if (workbook) {
                    const userData = fields.userData[0], userDatas = userData.split(':'), worksheet = workbook.getWorksheet(1), data = [],
                        getCellValue = (row, col) => worksheet.getCell(`${col}${row}`).text,
                        setCellValue = (row, col, value) => {
                            worksheet.getCell(`${col}${row}`).value = value;
                        },
                        startRow = parseInt(userDatas[1]), endRow = parseInt(userDatas[2]),
                        // totalRow = endRow - startRow + 1,
                        colCourseType = userDatas[6], courseTypeSelected = userDatas[7], colIdCard = userDatas[8];

                    const handleUpload = (index = startRow) => {
                        if (index > endRow) { // end loop  
                            if (data.some(({ identityCard }) => identityCard == undefined)) { //check map not 100%, map fail then not push identityCard to data
                                const tempFolderName = app.date.getDateFolderName(), tempFilePath = app.path.join(app.assetPath, 'temp', tempFolderName);
                                if (!app.fs.existsSync(tempFilePath)) {
                                    app.createFolder(tempFilePath);
                                }
                                setCellValue(startRow - 6, colIdCard, 'CMND/CCCD');
                                const colIdCardValues = worksheet.getColumn(colIdCard);
                                colIdCardValues.width = 20;
                                colIdCardValues.eachCell({ includeEmpty: false }, (cell) => { //highlight nhap cmnd 
                                    if (cell.text == '\'') {
                                        cell.fill = {
                                            type: 'pattern',
                                            pattern: 'solid',
                                            fgColor: { argb: 'FFFFFF00' },
                                        };
                                    }
                                });
                                workbook.xlsx.writeFile(app.path.join(tempFilePath, 'abc.xlsx')).then(() => { //wait for write file done, then resolve,if not, file res maybe empty
                                    done({ fileName: 'abc.xlsx', notify: 'Vui lòng chờ file được tải về máy' });
                                });
                            } else {
                                done({ data, notify: 'Tải lên file thành công' });
                            }
                        } else {
                            if (getCellValue(index, colCourseType).trim() == courseTypeSelected) {
                                let identityCard = getCellValue(index, colIdCard); //check getCellValue null
                                const fullname = getCellValue(index, userDatas[3]).trim(),
                                    birthday = getCellValue(index, userDatas[4]),
                                    course = getCellValue(index, userDatas[5]).trim(),
                                    toDateObject = str => {
                                        const dateParts = str.split('/');
                                        return new Date(+dateParts[2], dateParts[1] - 1, +dateParts[0]);
                                    },
                                    name = { $regex: course, $options: 'i' };
                                identityCard = typeof identityCard == 'string' ? identityCard.trim() : '';
                                if (identityCard == '' || identityCard == '\'') { // find identitycard = '' => map
                                    app.model.course.get({ name }, (error, item) => {
                                        if (error || !item) {
                                            setCellValue(index, colIdCard, '\''); //Nhập CMND/CCCD
                                            data.push({ fullname, birthday, courseName: course });
                                            handleUpload(index + 1);
                                        } else {
                                            const condition = {
                                                fullname,
                                                birthday: typeof birthday == 'object' ? birthday : toDateObject(birthday.trim()),
                                                course: item._id,
                                            };
                                            app.model.student.mapToId(condition, (error, list) => {
                                                if (error || list.length == 0 || list.length > 2) {
                                                    setCellValue(index, colIdCard, '\''); //Nhập CMND/CCCD
                                                    data.push({ fullname, birthday, courseName: course });
                                                    handleUpload(index + 1);
                                                } else if (list.length == 1 && list[0]) { //map success
                                                    const { identityCard } = list[0];
                                                    setCellValue(index, colIdCard, `'${identityCard}`); // add ' before it to check 00..
                                                    data.push({ fullname, birthday, courseName: course, course: item._id, identityCard });
                                                    handleUpload(index + 1);
                                                }
                                            });

                                        }
                                    });
                                } else { // available identity card
                                    app.model.course.get({ name }, (error, item) => {
                                        if (error || !item) {
                                            data.push({ fullname, birthday, courseName: course }); // course shoud be push ?
                                            handleUpload(index + 1);
                                        } else {
                                            data.push({
                                                fullname, birthday, courseName: course, course: item._id, identityCard
                                            });
                                            handleUpload(index + 1);
                                        }
                                    });
                                }
                            } else {
                                handleUpload(index + 1);
                            }
                        }
                    };
                    handleUpload();
                } else {
                    done({ error: 'Đọc file Excel bị lỗi!' });
                }
            });
        }
    });

    app.put('/api/student/import-fail-pass', app.permission.check('student:import'), (req, res) => {
        const sessionUser = req.session.user, division = sessionUser.division;
        if (sessionUser && !sessionUser.isLecturer && division && !division.isOutside) {
            const { student, type } = req.body,
                changes = [
                    { datSatHach: true, liDoChuaDatSatHach: '' }, //Pass
                    { datSatHach: false, liDoChuaDatSatHach: '' }, //Fail liDoChuaDatSatHach for admin define
                    { datSatHach: false, liDoChuaDatSatHach: 'Vắng thi' }, //Absence 
                ];
            let err = null;
            if (student && student.length > 0) {
                if (type) {
                    const handleImport = (index = 0) => {
                        if (index == student.length) {
                            res.send({ error: err });
                        } else {
                            const { identityCard, course } = student[index];
                            app.model.student.get({ identityCard, course }, (error, item) => {
                                if (error || !item) {
                                    err = error;
                                    handleImport(index + 1);
                                } else {
                                    Object.entries(changes[parseInt(type)]).forEach(([key, value]) => {
                                        item[key] = value;
                                    });
                                    item.modifiedDate = new Date();
                                    item.save((error, student) => {
                                        if (error || !student) {
                                            err = error;
                                        }
                                        handleImport(index + 1);
                                    });
                                }
                            });
                        }
                    };
                    handleImport();
                } else {
                    res.send({ error: 'Kiểu import file trống!' });
                }
            } else {
                res.send({ error: 'Danh sách học viên trống!' });
            }
        } else {
            res.send({ error: 'Bạn không có quyền import danh sách học viên!' });
        }
    });

    app.get('/api/student/download-fail-pass', app.permission.check('student:import'), (req, res) => {
        const sessionUser = req.session.user,
            tempFolderName = app.date.getDateFolderName(), tempFolderPath = app.path.join(app.assetPath, 'temp', tempFolderName),
            division = sessionUser.division;
        if (sessionUser && sessionUser.isLecturer && division && division.isOutside) {
            res.send({ error: 'Bạn không có quyền tải file excel này!' });
        } else {
            if (app.fs.existsSync(app.path.join(tempFolderPath, 'abc.xlsx'))) {
                res.download(app.path.join(tempFolderPath, 'abc.xlsx'), 'Danh sách học viên.xlsx', (error) => {
                    if (error) {
                        res.send({ error });
                    } else {
                        app.deleteFile(app.path.join(tempFolderPath, 'abc.xlsx'));
                    }
                });
            } else res.send({ error: 'File không tồn tại trên server' });

        }
    });

    // Hook permissionHooks -------------------------------------------------------------------------------------------
    app.permissionHooks.add('courseAdmin', 'student', (user) => new Promise(resolve => {
        app.permissionHooks.pushUserPermission(user, 'student:read', 'student:write');
        // Quản lý khóa học nội bộ thì được import danh sách học viên bằng file Excel
        if (user.division && !user.division.isOutside) app.permissionHooks.pushUserPermission(user, 'student:import');
        resolve();
    }));
};