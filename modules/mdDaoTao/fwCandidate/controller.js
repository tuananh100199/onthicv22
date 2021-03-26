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
    app.post('/api/candidate', (req, res) => app.model.candidate.create(req.body.candidate, (error, item) => {
        if (item) {
            app.io.emit('candidate-added', item);

            app.model.setting.get('email', 'emailPassword', 'emailContactTitle', 'emailContactText', 'emailContactHtml', result => {
                let mailSubject = result.emailContactTitle.replaceAll('{name}', item.name).replaceAll('{subject}', item.subject).replaceAll('{message}', item.message),
                    mailText = result.emailContactText.replaceAll('{name}', item.name).replaceAll('{subject}', item.subject).replaceAll('{message}', item.message),
                    mailHtml = result.emailContactHtml.replaceAll('{name}', item.name).replaceAll('{subject}', item.subject).replaceAll('{message}', item.message);
                app.email.sendEmail(result.email, result.emailPassword, item.email, [], mailSubject, mailText, mailHtml, null)
            });
        }
        res.send({ error, item });
    }));
};