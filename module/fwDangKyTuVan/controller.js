module.exports = app => {
    const menu = {
        parentMenu: app.parentMenu.setting,
        menus: {
            2110: { title: 'Đăng ký tư vấn', link: '/user/dang-ky-tu-van', icon: 'fa-envelope-o', backgroundColor: '#00897b' },
        },
    };
    app.permission.add(
        { name: 'DangKyTuVan:read', menu },
        { name: 'DangKyTuVan:write', menu },
    );

    app.get('/user/dang-ky-tu-van', app.permission.check('DangKyTuVan:read'), app.templates.admin);

    // APIs -----------------------------------------------------------------------------------------------------------------------------------------
    app.get('/api/dang-ky-tu-van/page/:pageNumber/:pageSize', app.permission.check('DangKyTuVan:read'), (req, res) => {
        const pageNumber = parseInt(req.params.pageNumber),
            pageSize = parseInt(req.params.pageSize);
        app.model.DangKyTuVan.getPage(pageNumber, pageSize, {}, (error, page) => {
            page.list = page.list.map(item => app.clone(item, { message: '' }));
            res.send({ error, page });
        });
    });

    app.get('/api/dang-ky-tu-van/all', app.permission.check('DangKyTuVan:read'), (req, res) => app.model.DangKyTuVan.getAll((error, items) => res.send({ error, items })));

    app.get('/api/dang-ky-tu-van/unread', app.permission.check('DangKyTuVan:read'), (req, res) => app.model.DangKyTuVan.getUnread((error, items) => res.send({ error, items })));

    app.get('/api/dang-ky-tu-van/item/:_id', app.permission.check('DangKyTuVan:write'), (req, res) => app.model.DangKyTuVan.read(req.params._id, (error, item) => {
        if (item) app.io.emit('DangKyTuVan-changed', item);
        res.send({ error, item });
    }));

    app.delete('/api/dang-ky-tu-van', app.permission.check('DangKyTuVan:write'), (req, res) => app.model.DangKyTuVan.delete(req.body._id, error => res.send({ error })));


    // Home -----------------------------------------------------------------------------------------------------------------------------------------
    app.post('/api/dang-ky-tu-van', (req, res) => app.model.DangKyTuVan.create(req.body.DangKyTuVan, (error, item) => {
        if (item) {
            app.io.emit('DangKyTuVan-added', item);

            app.model.setting.get('email', 'emailPassword', 'emailDangKyTuVanTitle', 'emailDangKyTuVanText', 'emailDangKyTuVanHtml', result => {
                let mailSubject = result.emailDangKyTuVanTitle.replaceAll('{name}', item.name).replaceAll('{subject}', item.subject).replaceAll('{message}', item.message),
                    mailText = result.emailDangKyTuVanText.replaceAll('{name}', item.name).replaceAll('{subject}', item.subject).replaceAll('{message}', item.message),
                    mailHtml = result.emailDangKyTuVanHtml.replaceAll('{name}', item.name).replaceAll('{subject}', item.subject).replaceAll('{message}', item.message);
                app.email.sendEmail(result.email, result.emailPassword, item.email, [], mailSubject, mailText, mailHtml, null)
            });
        }
        res.send({ error, item });
    }));
};