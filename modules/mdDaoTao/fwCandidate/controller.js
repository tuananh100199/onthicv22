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
        const condition = { state: { $in: ['MoiDangKy', 'DangLienHe', 'Huy'] } },
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
                res.send({ error });
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
                });
                app.excel.write(worksheet, cells);
                app.excel.attachment(workbook, res, 'Candidate.xlsx');
            }
        });
    });

    app.put('/api/candidate', app.permission.check('candidate:write'), (req, res) => {
        const changes = req.body.changes;
        changes.staff = req.session.user;
        changes.modifiedDate = new Date();
        app.model.candidate.update(req.body._id, changes, (error, item) => {
            if (error) {
                res.send({ error });
            } else if (changes.state == 'UngVien') {
                new Promise((resolve, reject) => { // Tạo user cho candidate
                    const condition = {};
                    if (item.identityCard) {
                        condition.identityCard = item.identityCard;
                    }
                    app.model.user.get(condition, (error, user) => {
                        function convert(str) {
                            let date = new Date(str),
                                mnth = ('0' + (date.getMonth() + 1)).slice(-2),
                                day = ('0' + date.getDate()).slice(-2);
                            return [day, mnth, date.getFullYear()].join('');
                        }
                        if (error) {
                            reject('Lỗi khi đọc thông tin người dùng!');
                        } else if (user) { // Candidate đã là user
                            resolve(user._id);
                        } else { // Candidate chưa là user
                            const dataPassword = convert(item.birthday),
                                newUser = {
                                    identityCard: item.identityCard,
                                    email: item.email,
                                    firstname: item.firstname,
                                    lastname: item.lastname,
                                    phoneNumber: item.phoneNumber,
                                    birthday: item.birthday,
                                    password: dataPassword
                                };
                            app.model.user.create(newUser, (error, user) => {
                                if (error) {
                                    reject('Lỗi khi tạo người dùng!');
                                } else { // Tạo user thành công. Gửi email & password đến người dùng!
                                    resolve(user._id);
                                    // if(user.email) {
                                    //     app.model.setting.get('email', 'emailPassword', 'emailCreateMemberByAdminTitle', 'emailCreateMemberByAdminText', 'emailCreateMemberByAdminHtml', result => {
                                    //         const url = `${app.isDebug || app.rootUrl}/active-user/${user._id}`,
                                    //             fillParams = (data) => data.replaceAll('{name}', `${user.lastname} ${user.firstname}`)
                                    //                 .replaceAll('{firstname}', user.firstname).replaceAll('{lastname}', user.lastname)
                                    //                 .replaceAll('{email}', user.email).replaceAll('{password}', dataPassword).replaceAll('{url}', url),
                                    //             mailTitle = result.emailCreateMemberByAdminTitle,
                                    //             mailText = fillParams(result.emailCreateMemberByAdminText),
                                    //             mailHtml = fillParams(result.emailCreateMemberByAdminHtml);
                                    //         app.email.sendEmail(result.email, result.emailPassword, user.email, app.email.cc, mailTitle, mailText, mailHtml, null);
                                    //     });
                                    // }
                                }
                            });
                        }
                    });
                }).then(_userId => { // Tạo student cho candidate
                    item.user = _userId;
                    item.save();
                    const dataStudent = {
                        user: _userId,
                        identityCard: item.identityCard,
                        birthday: item.birthday,
                        planCourse: item.planCourse,
                        firstname: item.firstname,
                        lastname: item.lastname,
                        courseType: item.courseType,
                        division: item.division,
                    };
                    app.model.student.create(dataStudent, (error) => res.send({ error, item }));
                }).catch(error => res.send({ error }));
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
        const candidate = req.body.candidate;
        app.model.candidate.get({ email: candidate.email, courseType: candidate.courseType, state: 'MoiDangKy' }, (error, userCandidate) => {
            if (error) {
                res.send({ error });
            } else if (userCandidate) {
                res.send({ notify: 'Bạn đã đăng ký khóa học này, xin vui lòng chờ nhân viên chúng tôi liên hệ lại trong thời gian sớm nhất!' });
            } else {
                app.model.candidate.create(candidate, (error, item) => {
                    // if (item) {
                    //     app.model.setting.get('email', 'emailPassword', 'emailCandidateTitle', 'emailCandidateText', 'emailCandidateHtml', result => {
                    //         const fillParams = (data) => data.replaceAll('{name}', `${item.lastname} ${item.firstname}`),
                    //             mailSubject = fillParams(result.emailCandidateTitle),
                    //             mailText = fillParams(result.emailCandidateText),
                    //             mailHtml = fillParams(result.emailCandidateHtml);
                    //         app.email.sendEmail(result.email, result.emailPassword, item.email, [], mailSubject, mailText, mailHtml, null);
                    //     });
                    // }
                    res.send({ error, item });
                });
            }
        });
    });
};