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
        const condition = {}, searchText = req.query.searchText;
        if (searchText) {
            condition.email = new RegExp(searchText, 'i');
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
        app.model.candidate.getAll((error, list) => {
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

    app.delete('/api/candidate', app.permission.check('candidate:delete'), (req, res) => {
        app.model.candidate.delete(req.body._id, error => res.send({ error }));
    });


    // Home -----------------------------------------------------------------------------------------------------------------------------------------
    app.post('/api/candidate', (req, res) => {
        app.model.candidate.create(req.body.candidate, (error, item) => {
            if (error) {
                res.send({ error });
            } else if (item) {
                app.io.emit('candidate-added', item);
                app.model.setting.get('email', 'emailPassword', 'emailCandidateTitle', 'emailCandidateText', 'emailCandidateHtml', result => {
                    let mailSubject = result.emailCandidateTitle.replaceAll('{name}', item.firstname + ' ' + item.lastname),
                        mailText = result.emailCandidateText.replaceAll('{name}', item.firstname + ' ' + item.lastname),
                        mailHtml = result.emailCandidateHtml.replaceAll('{name}', item.firstname + ' ' + item.lastname);
                    app.email.sendEmail(result.email, result.emailPassword, item.email, [], mailSubject, mailText, mailHtml, null)
                });

                app.model.user.get({ email: item.email }, (error, user) => {
                    if (error) {
                        res.send({ error: `Ops! có lỗi xảy ra!` });
                    } else if (!user) {
                        const dataPassword = app.randomPassword(8),
                            data = {
                                email: item.email,
                                firstname: item.firstname,
                                lastname: item.lastname,
                                phoneNumber: item.phoneNumber,
                                password: dataPassword
                            };
                        app.model.user.create(data, (error, user) => {
                            if (error) {
                                res.send({ error })
                            }
                            if (user) {
                                app.model.setting.get('email', 'emailPassword', 'emailCreateMemberByAdminTitle', 'emailCreateMemberByAdminText', 'emailCreateMemberByAdminHtml', result => {
                                    const url = (app.isDebug ? app.debugUrl : app.rootUrl) + '/active-user/' + user._id,
                                        mailTitle = result.emailCreateMemberByAdminTitle,
                                        mailText = result.emailCreateMemberByAdminText.replaceAll('{lastname}', user.firstname + ' ' + user.lastname)
                                            .replaceAll('{firstname}', user.firstname).replaceAll('{lastname}', user.lastname)
                                            .replaceAll('{email}', user.email).replaceAll('{password}', dataPassword).replaceAll('{url}', url),
                                        mailHtml = result.emailCreateMemberByAdminHtml.replaceAll('{name}', user.firstname + ' ' + user.lastname)
                                            .replaceAll('{firstname}', user.firstname).replaceAll('{lastname}', user.lastname)
                                            .replaceAll('{email}', user.email).replaceAll('{password}', dataPassword).replaceAll('{url}', url);
                                    app.email.sendEmail(result.email, result.emailPassword, user.email, app.email.cc, mailTitle, mailText, mailHtml, null);
                                });
                            }
                        });
                    }
                    res.send({ error, item });
                });
            }
        });
    });
};
