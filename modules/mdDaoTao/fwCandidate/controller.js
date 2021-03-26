module.exports = app => {
    const menu = {
        parentMenu: app.parentMenu.communication,
        menus: {
            3004: { title: 'Candidate', link: '/user/candidate', icon: 'fa-envelope-o', backgroundColor: '#00897b' },
        },
    };
    app.permission.add({ name: 'candidate:read', menu }, { name: 'candidate:write' }, { name: 'candidate:delete' });

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

    app.get('/api/candidate/all', app.permission.check('candidate:read'), (req, res) => app.model.candidate.getAll((error, list) => res.send({ error, list })));

    app.get('/api/candidate/unread', app.permission.check('candidate:read'), (req, res) => app.model.candidate.getUnread((error, list) => res.send({ error, list })));

    app.get('/api/candidate/item/:_id', app.permission.check('candidate:read'), (req, res) => app.model.candidate.read(req.params._id, (error, item) => {
        if (item) app.io.emit('candidate-changed', item);
        res.send({ error, item });
    }));

    app.get('/api/candidate/export', app.permission.check('candidate:read'), (req, res) => {
        app.model.candidate.getAll((error, items) => {
            if (error) {
                res.send({ error })
            } else {
                const workbook = app.excel.create(), worksheet = workbook.addWorksheet('Candidate');
                const cells = [
                    { cell: 'A1', value: 'STT', bold: true, border: '1234' },
                    { cell: 'B1', value: 'Email', bold: true, border: '1234' },
                    { cell: 'C1', value: 'Ngày đăng ký', bold: true, border: '1234' },
                ];

                worksheet.columns = [
                    { header: 'STT', key: 'id', width: 15 },
                    { header: 'Email', key: 'email', width: 40 },
                    { header: 'Ngày đăng ký', key: 'createdDate', width: 30 }
                ];
                items.forEach((item, index) => {
                    worksheet.addRow({
                        id: index + 1,
                        email: item.email,
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
                res.send({ error })
            } 
            if (item) {
                app.io.emit('candidate-added', item);

                app.model.user.get({ email: item.email }, (error, user) => {
                    if (error != null) {
                        res.send({ error: `Ops! có lỗi xảy ra!` });
                    }
                    if (!user) {
                        const dataPassword = app.randomPassword(8),
                            data = {
                                    email: item.email,
                                    firstname: item.firstname,
                                    lastname: item.lastname,
                                    password: dataPassword
                                }; 
                                app.model.user.create(data, (error, user) => {
                                    res.send({ error, user });
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
                    });
                app.model.setting.get('email', 'emailPassword', 'emailCandidateTitle', 'emailCandidateText', 'emailCandidateHtml', result => {
                    let mailSubject = result.emailCandidateTitle.replaceAll('{name}', item.firstname + ' ' + item.lastname),
                        mailText = result.emailCandidateText.replaceAll('{name}', item.firstname + ' ' + item.lastname),
                        mailHtml = result.emailCandidateHtml.replaceAll('{name}', item.firstname + ' ' + item.lastname);
                    app.email.sendEmail(result.email, result.emailPassword, item.email, [], mailSubject, mailText, mailHtml, null)
                });
            }
        });
    });
};
