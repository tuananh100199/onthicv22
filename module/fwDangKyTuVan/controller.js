module.exports = app => {
    const menu = {
        parentMenu: app.parentMenu.setting,
        menus: {
            2110: { title: 'Đăng ký tư vấn', link: '/user/dang-ky-tu-van', icon: 'fa fa-quote-right', backgroundColor: '#b2c' },
        },
    };
    app.permission.add(
        { name: 'DangKyTuVan:read', menu },
        { name: 'DangKyTuVan:write', menu },
    );

    app.get('/user/dang-ky-tu-van', app.permission.check('DangKyTuVan:read'), app.templates.admin);

     // Init ------------------------------------------------------------------------------------------------------------
    app.readyHooks.add('emailPhanHoiDangKyTuVanInit', {
        ready: () => app.model != null && app.model.setting != null && app.state,
        run: () => {
            const enableInit = process.env['enableInit'] == 'true';
            if (enableInit) {
                app.model.setting.init({
                    phanHoiDangKyTuVanTitle: 'Hiệp Phát: Phản hồi đăng ký tư vấn!',
                    phanHoiDangKyTuVanText: 'Chào {name}, Hiệp Phát đã gửi phản hồi đăng ký tư vấn cho bạn: {content} Trân trọng, Giảng viên hướng dẫn, Website: ' + app.rootUrl + '',
                    phanHoiDangKyTuVanHtml: 'Chào <b>{name}</b>,<br/><br/>' +
                        'Hiệp Phát đã gửi phản hồi đăng ký tư vấn cho bạn:<br/><br/>' +
                        '<b>{content}</b><br/><br/>' +
                        'Trân trọng,<br/>' +
                        'Hiệp Phát<br/>' +
                        'Website: <a href="' + app.rootUrl + '">' + app.rootUrl + '</a>'
                })
            }
        },
    });
    //APIs -------------------------------------------------------------------------------------------------------------
    const emailParams = ['phanHoiDangKyTuVanTitle', 'phanHoiDangKyTuVanText', 'phanHoiDangKyTuVanHtml'];
    app.get('/api/dang-ky-tu-van/email/all', app.permission.check('DangKyTuVan:email'), (req, res) => app.model.setting.get(...emailParams, result => res.send(result)));

    app.put('/api/dang-ky-tu-van/email/email', app.permission.check('DangKyTuVan:email'), (req, res) => {
        const emailType = req.body.type;
        const title = emailType + 'Title',
            text = emailType + 'Text',
            html = emailType + 'Html',
            changes = {};

        if (emailParams.indexOf(title) != -1) changes[title] = req.body.email.title;
        if (emailParams.indexOf(text) != -1) changes[text] = req.body.email.text;
        if (emailParams.indexOf(html) != -1) changes[html] = req.body.email.html;

        app.model.setting.set(changes, error => res.send({ error }));
    });

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
    app.post('/api/dang-ky-tu-van/response', app.permission.check('DangKyTuVan:write'), (req, res) => {
        const { _id, content } = req.body;
        app.model.DangKyTuVan.get(_id, (error, item) => {
            if (error || item == null) {
                res.send({ error: `System has errors!` })
            } else {
                    if (error != null) {
                        res.send({ error: `Ops! có lỗi xảy ra!` });
                    } else {
                        app.model.setting.get('phanHoiDangKyTuVanTitle', 'phanHoiDangKyTuVanText', 'phanHoiDangKyTuVanHtml', result => {
                            const mailTitle = result.phanHoiDangKyTuVanTitle,
                                mailText = result.phanHoiDangKyTuVanText.replaceAll('{name}', item.name).replaceAll('{content}', content),
                                mailHtml = result.phanHoiDangKyTuVanHtml.replaceAll('{name}', item.name).replaceAll('{content}', content);
                            app.email.sendEmail(app.state.data.email, app.state.data.emailPassword, item.email, [], mailTitle, mailText, mailHtml, null, () => {
                                item.content = content;
                                item.save(error => res.send({ error }))
                            }, (error) => {
                                res.send({ error })
                            });
                        });
                    }
            }
        });
    });
};