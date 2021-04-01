module.exports = app => {
    const menu = {
        parentMenu: app.parentMenu.communication,
        menus: {
            3001: { title: 'Đăng ký tư vấn', link: '/user/candidate', icon: 'fa-envelope-o', backgroundColor: '#00897b' },
        },
    };
    app.permission.add({ name: 'candidate:read', menu }, { name: 'candidate:write' }, { name: 'candidate:delete' }, { name: 'candidate:export' });

    app.get('/user/candidate', app.permission.check('candidate:read'), app.templates.admin);

    // APIs -----------------------------------------------------------------------------------------------------------------------------------------
    app.get('/api/candidate/page/:pageNumber/:pageSize', app.permission.check('candidate:read'), (req, res) => {
        const pageNumber = parseInt(req.params.pageNumber),
            pageSize = parseInt(req.params.pageSize);
        const condition = { state: { $in: ['MoiDangKy', 'DangLienHe', 'Huy', 'UngVien'] } },
            searchText = req.query.searchText;
        if (searchText) {
            const value = new RegExp(searchText, 'i');
            condition.email = value;
            condition.firstname = value;
            condition.lastname = value;
        }

        app.model.candidate.getPage(pageNumber, pageSize, condition, (error, page) => {
            page.list = page.list.map(item => app.clone(item, { message: '' }));
            res.send({ error, page });
        });
    });

    app.get('/api/candidate', app.permission.check('candidate:read'), (req, res) => {
        app.model.candidate.get(req.query._id, (error, item) => res.send({ error, item }));
    });

    app.get('/api/candidate/export', app.permission.check('candidate:export'), (req, res) => {
        const condition = { state: { $in: ['MoiDangKy', 'DangLienHe', 'Huy'] } };
        app.model.candidate.getAll(condition, (error, list) => {
            if (error) {
                res.send({ error })
            } else {
                const workbook = app.excel.create(), worksheet = workbook.addWorksheet('Candidate');
                const cells = [
                    { cell: 'A1', value: 'STT', bold: true, border: '1234' },
                    { cell: 'B1', value: 'Họ', bold: true, border: '1234' },
                    { cell: 'C1', value: 'Tên', bold: true, border: '1234' },
                    { cell: 'D1', value: 'Email', bold: true, border: '1234' },
                    { cell: 'E1', value: 'Số điện thoại', bold: true, border: '1234' },
                    { cell: 'F1', value: 'Loại khóa học', bold: true, border: '1234' },
                    { cell: 'G1', value: 'Trạng thái', bold: true, border: '1234' },
                    { cell: 'H1', value: 'Ngày đăng ký', bold: true, border: '1234' },
                ];

                worksheet.columns = [
                    { header: 'STT', key: 'id', width: 15 },
                    { header: 'Họ', key: 'lastname', width: 20 },
                    { header: 'Tên', key: 'firstname', width: 20 },
                    { header: 'Email', key: 'email', width: 40 },
                    { header: 'Số điện thoại', key: 'phoneNumber', width: 20 },
                    { header: 'Loại khóa học', key: 'courseType', width: 20 },
                    { header: 'Trạng thái', key: 'state', width: 30 },
                    { header: 'Ngày đăng ký', key: 'createdDate', width: 30 }
                ];
                list.forEach((item, index) => {
                    worksheet.addRow({
                        id: index + 1,
                        lastname: item.lastname,
                        firstname: item.firstname,
                        email: item.email,
                        phoneNumber: item.phoneNumber,
                        courseType: item.courseType ? item.courseType.title : 'Chưa đăng ký',
                        state: item.state,
                        createdDate: item.createdDate
                    });
                })
                app.excel.write(worksheet, cells);
                app.excel.attachment(workbook, res, `Candidate.xlsx`);
            }
        })
    });
    app.put('/api/candidate', app.permission.check('candidate:write'), (req, res) => {
        const changes = req.body.changes;
        changes.staff = req.session.user;
        changes.modifiedDate = new Date();
        app.model.candidate.update(req.body._id, changes, (error, item) => {
            if (error) {
                res.send({ error });
            } else if (changes.state == 'UngVien') {
                const createStudent = (_userId) => { // create Student after create User or get User
                    item.user = _userId;
                    item.save();
                    const dataStudent = {
                        user: _userId,
                        firstname: item.firstname,
                        lastname: item.lastname,
                        courseType: item.courseType,
                    };
                    app.model.student.create(dataStudent, (error) => {
                        res.send({ error, item }) // item from callback of  app.model.candidate.update
                    });
                };
                app.model.user.get({ email: item.email }, (error, user) => {
                    if (error) {
                        res.send({ error: `Ops! có lỗi xảy ra!` });
                    } else if (!user) { // user not => found create new user => create new Student
                        const dataPassword = app.randomPassword(8),
                            dataUser = {
                                email: item.email,
                                firstname: item.firstname,
                                lastname: item.lastname,
                                phoneNumber: item.phoneNumber,
                                password: dataPassword
                            };
                        app.model.user.create(dataUser, (error, user) => {
                            if (error) {
                                res.send({ error });
                            } else { // user already created => send mail to new user => createStudent
                                app.model.setting.get('email', 'emailPassword', 'emailCreateMemberByAdminTitle', 'emailCreateMemberByAdminText', 'emailCreateMemberByAdminHtml', result => {
                                    const url = `${app.isDebug || app.rootUrl}/active-user/${user._id}`,
                                        replace = (data) => data.replaceAll('{name}', `${user.lastname} ${user.firstname}`)
                                            .replaceAll('{firstname}', user.firstname).replaceAll('{lastname}', user.lastname)
                                            .replaceAll('{email}', user.email).replaceAll('{password}', dataPassword).replaceAll('{url}', url),
                                        mailTitle = result.emailCreateMemberByAdminTitle,
                                        mailText = replace(result.emailCreateMemberByAdminText),
                                        mailHtml = replace(result.emailCreateMemberByAdminHtml);
                                    app.email.sendEmail(result.email, result.emailPassword, user.email, app.email.cc, mailTitle, mailText, mailHtml, null);
                                });
                                createStudent(user._id);
                            }
                        })
                    } else { // user found => still create new Student
                        createStudent(user._id);
                    }
                })
            } else {
                res.send({ error, item });
            }
        });
    });

    app.delete('/api/candidate', app.permission.check('candidate:delete'), (req, res) => {
        app.model.candidate.delete(req.body._id, error => res.send({ error }));
    });

    // Home -----------------------------------------------------------------------------------------------------------------------------------------
    app.post('/api/candidate', (req, res) => {
        app.model.candidate.create(req.body.candidate, (error, item) => {
            if (item) {
                app.model.setting.get('email', 'emailPassword', 'emailCandidateTitle', 'emailCandidateText', 'emailCandidateHtml', result => {
                    let mailSubject = result.emailCandidateTitle.replaceAll('{name}', item.firstname + ' ' + item.lastname),
                        mailText = result.emailCandidateText.replaceAll('{name}', item.firstname + ' ' + item.lastname),
                        mailHtml = result.emailCandidateHtml.replaceAll('{name}', item.firstname + ' ' + item.lastname);
                    app.email.sendEmail(result.email, result.emailPassword, item.email, [], mailSubject, mailText, mailHtml, null)
                });
            }
            res.send({ error, item });
        });
    });
};
