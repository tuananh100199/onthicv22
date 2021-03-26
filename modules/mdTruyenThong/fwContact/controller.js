module.exports = app => {
    const menu = {
        parentMenu: app.parentMenu.communication,
        menus: {
            3002: { title: 'Liên hệ', link: '/user/contact', icon: 'fa-envelope-o', backgroundColor: '#00897b' },
        },
    };
    app.permission.add({ name: 'contact:read', menu }, { name: 'contact:write' }, { name: 'contact:delete' });

    app.get('/contact(.htm(l)?)?', app.templates.home);
    app.get('/user/contact', app.permission.check('contact:read'), app.templates.admin);

    // APIs -----------------------------------------------------------------------------------------------------------------------------------------
    app.get('/api/contact/page/:pageNumber/:pageSize', app.permission.check('contact:read'), (req, res) => {
        const pageNumber = parseInt(req.params.pageNumber),
            pageSize = parseInt(req.params.pageSize);
        app.model.contact.getPage(pageNumber, pageSize, {}, (error, page) => {
            page.list = page.list.map(item => app.clone(item, { message: '' }));
            res.send({ error, page });
        });
    });

    app.get('/api/contact/all', app.permission.check('contact:read'), (req, res) => {
        app.model.contact.getAll((error, list) => res.send({ error, list }));
    });

    app.get('/api/contact/unread', app.permission.check('contact:read'), (req, res) => {
        app.model.contact.getUnread((error, list) => res.send({ error, list }));
    });

    app.get('/api/contact/item/:_id', app.permission.check('contact:write'), (req, res) => {
        app.model.contact.read(req.params._id, (error, item) => {
            if (item) app.io.emit('contact-changed', item);
            res.send({ error, item });
        });
    });

    app.get('/api/contact/export', app.permission.check('contact:read'), (req, res) => {
        app.model.contact.getAll((error, items) => {
            if (error) {
                res.send({ error })
            } else {
                const workbook = app.excel.create(), worksheet = workbook.addWorksheet('Subscribe');
                const cells = [
                    { cell: 'A1', value: 'STT', bold: true, border: '1234' },
                    { cell: 'B1', value: 'Tên', bold: true, border: '1234' },
                    { cell: 'C1', value: 'Email', bold: true, border: '1234' },
                    { cell: 'D1', value: 'Chủ đề', bold: true, border: '1234' },
                    { cell: 'E1', value: 'Nội dung', bold: true, border: '1234' },
                    { cell: 'F1', value: 'Ngày đăng ký', bold: true, border: '1234' },
                ];

                worksheet.columns = [
                    { header: 'STT', key: 'id', width: 15 },
                    { header: 'Tên', key: 'name', width: 15 },
                    { header: 'Email', key: 'email', width: 40 },
                    { header: 'Chủ đề', key: 'subject', width: 40 },
                    { header: 'Nội dung', key: 'message', width: 80 },
                    { header: 'Ngày đăng ký', key: 'createdDate', width: 30 }
                ];
                items.forEach((item, index) => {
                    worksheet.addRow({
                        id: index + 1,
                        name: item.name,
                        email: item.email,
                        subject: item.subject,
                        message: item.message,
                        createdDate: item.createdDate
                    });
                })
                app.excel.write(worksheet, cells);
                app.excel.attachment(workbook, res, `Contact.xlsx`);
            }
        })
    });

    app.delete('/api/contact', app.permission.check('contact:delete'), (req, res) => {
        app.model.contact.delete(req.body._id, error => res.send({ error }));
    });

    // Home -----------------------------------------------------------------------------------------------------------------------------------------
    app.post('/api/contact', (req, res) => app.model.contact.create(req.body.contact, (error, item) => {
        if (item) {
            app.io.emit('contact-added', item);

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