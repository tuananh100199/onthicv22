module.exports = app => {
    const menu = {
        parentMenu: app.parentMenu.communication,
        menus: {
            3003: { title: 'Đăng ký nhận tin', link: '/user/subscribe', icon: 'fa-envelope-o', backgroundColor: '#00897b' },
        },
    };
    app.permission.add({ name: 'subscribe:read', menu }, { name: 'subscribe:write' }, { name: 'subscribe:delete' });

    app.get('/user/subscribe', app.permission.check('subscribe:read'), app.templates.admin);

    // APIs -----------------------------------------------------------------------------------------------------------------------------------------
    app.get('/api/subscribe/page/:pageNumber/:pageSize', app.permission.check('subscribe:read'), (req, res) => {
        const pageNumber = parseInt(req.params.pageNumber),
            pageSize = parseInt(req.params.pageSize);
        const condition = {}, searchText = req.query.searchText;
        if (searchText) {
            condition.email = new RegExp(searchText, 'i');
        }
        app.model.subscribe.getPage(pageNumber, pageSize, condition, (error, page) => {
            page.list = page.list.map(item => app.clone(item, { message: '' }));
            res.send({ error, page });
        });
    });

    app.get('/api/subscribe/all', app.permission.check('subscribe:read'), (req, res) => app.model.subscribe.getAll((error, list) => res.send({ error, list })));

    app.get('/api/subscribe/unread', app.permission.check('subscribe:read'), (req, res) => app.model.subscribe.getUnread((error, list) => res.send({ error, list })));

    app.get('/api/subscribe/item/:_id', app.permission.check('subscribe:read'), (req, res) => app.model.subscribe.read(req.params._id, (error, item) => {
        if (item) app.io.emit('subscribe-changed', item);
        res.send({ error, item });
    }));

    app.get('/api/subscribe/export', app.permission.check('subscribe:read'), (req, res) => {
        app.model.subscribe.getAll((error, items) => {
            if (error) {
                res.send({ error });
            } else {
                const workbook = app.excel.create(), worksheet = workbook.addWorksheet('Subscribe');
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
                });
                app.excel.write(worksheet, cells);
                app.excel.attachment(workbook, res, 'Subscribe.xlsx');
            }
        });
    });

    app.delete('/api/subscribe', app.permission.check('subscribe:delete'), (req, res) => {
        app.model.subscribe.delete(req.body._id, error => res.send({ error }));
    });


    // Home -----------------------------------------------------------------------------------------------------------------------------------------
    app.post('/api/subscribe', (req, res) => app.model.subscribe.create(req.body.subscribe, (error, item) => {
        if (item) {
            app.io.emit('subscribe-added', item);

            app.model.setting.get('email', 'emailPassword', 'emailContactTitle', 'emailContactText', 'emailContactHtml', result => {
                let mailSubject = result.emailContactTitle.replaceAll('{name}', item.name).replaceAll('{subject}', item.subject).replaceAll('{message}', item.message),
                    mailText = result.emailContactText.replaceAll('{name}', item.name).replaceAll('{subject}', item.subject).replaceAll('{message}', item.message),
                    mailHtml = result.emailContactHtml.replaceAll('{name}', item.name).replaceAll('{subject}', item.subject).replaceAll('{message}', item.message);
                app.email.sendEmail(result.email, result.emailPassword, item.email, [], mailSubject, mailText, mailHtml, null);
            });
        }
        res.send({ error, item });
    }));
};