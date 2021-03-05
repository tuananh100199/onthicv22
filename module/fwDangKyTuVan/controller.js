module.exports = app => {
    const menu = {
        parentMenu: app.parentMenu.setting,
        menus: {
            2110: { title: 'Đăng ký tư vấn', link: '/user/dang-ky-tu-van', icon: 'fa fa-quote-right', backgroundColor: '#b2c' },
        },
    };
    app.permission.add(
        { name: 'dangKyTuVan:read', menu },
        { name: 'dangKyTuVan:write', menu },
    );

    app.get('/user/dang-ky-tu-van', app.permission.check('dangKyTuVan:read'), app.templates.admin);

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
    app.get('/api/dang-ky-tu-van/email/all', app.permission.check('dangKyTuVan:email'), (req, res) => app.model.setting.get(...emailParams, result => res.send(result)));

    app.put('/api/dang-ky-tu-van/email/email', app.permission.check('dangKyTuVan:email'), (req, res) => {
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
    app.get('/api/dang-ky-tu-van/page/:pageNumber/:pageSize', app.permission.check('dangKyTuVan:read'), (req, res) => {
        const pageNumber = parseInt(req.params.pageNumber),
            pageSize = parseInt(req.params.pageSize);
        app.model.dangKyTuVan.getPage(pageNumber, pageSize, {}, (error, page) => {
            page.list = page.list.map(item => app.clone(item, { message: '' }));
            res.send({ error, page });
        });
    });

    app.get('/api/dang-ky-tu-van/all', app.permission.check('dangKyTuVan:read'), (req, res) => app.model.dangKyTuVan.getAll((error, items) => res.send({ error, items })));

    app.get('/api/dang-ky-tu-van/item/:_id', app.permission.check('dangKyTuVan:write'), (req, res) => {
        app.model.dangKyTuVan.update(req.params._id, {read: 'true'}, (error, item) => {
        if (item) app.io.emit('dangKyTuVan-changed', item);
        res.send({ error, item });
        })
    });

    app.delete('/api/dang-ky-tu-van', app.permission.check('dangKyTuVan:write'), (req, res) => app.model.dangKyTuVan.delete(req.body._id, error => res.send({ error })));


    // Home -----------------------------------------------------------------------------------------------------------------------------------------
    app.post('/api/dang-ky-tu-van', (req, res) => app.model.dangKyTuVan.create(req.body.dangKyTuVan, (error, item) => {
        if (item) {
            app.io.emit('dangKyTuVan-added', item);

            app.model.setting.get('email', 'emailPassword', 'emailDangKyTuVanTitle', 'emailDangKyTuVanText', 'emailDangKyTuVanHtml', result => {
                let mailSubject = result.emailDangKyTuVanTitle.replaceAll('{name}', item.name).replaceAll('{title}', item.title).replaceAll('{subject}', item.subject).replaceAll('{message}', item.message),
                    mailText = result.emailDangKyTuVanText.replaceAll('{name}', item.name).replaceAll('{title}', item.title).replaceAll('{subject}', item.subject).replaceAll('{message}', item.message),
                    mailHtml = result.emailDangKyTuVanHtml.replaceAll('{name}', item.name).replaceAll('{title}', item.title).replaceAll('{subject}', item.subject).replaceAll('{message}', item.message);
                app.email.sendEmail(result.email, result.emailPassword, item.email, [], mailSubject, mailText, mailHtml, null)
            });
        }
        res.send({ error, item });
    }));
    
    app.post('/api/dang-ky-tu-van/response', app.permission.check('dangKyTuVan:write'), (req, res) => {
        const { _id, content } = req.body;
        app.model.dangKyTuVan.get(_id, (error, item) => {
            if (error || item == null) {
                res.send({ error: `Hệ thống lỗi!` })
            } else {
                    if (error != null) {
                        res.send({ error: `Ops! có lỗi xảy ra!` });
                    } else {
                        app.model.user.get({ email: item.email }, (error, user) => {
                            if (error != null) {
                                res.send({ error: `Ops! có lỗi xảy ra!` });
                            }
                            if (!user) {
                                const dataPassword = app.randomPassword(8),
                                data = {
                                        email: item.email,
                                        firstname: item.name,
                                        lastname: '',
                                        password: dataPassword
                                    }; 
                                    app.model.user.create(data, (error, user) => {
                                        res.send({ error, user });
                                        if (user) {
                                            app.model.setting.get('email', 'emailPassword', 'emailCreateMemberByAdminTitle', 'emailCreateMemberByAdminText', 'emailCreateMemberByAdminHtml', result => {
                                                const url = (app.isDebug ? app.debugUrl : app.rootUrl) + '/active-user/' + user._id,
                                                    mailTitle = result.emailCreateMemberByAdminTitle,
                                                    mailText = result.emailCreateMemberByAdminText.replaceAll('{name}', user.firstname + ' ' + user.lastname)
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
                    }
                    app.model.setting.get('phanHoiDangKyTuVanTitle', 'phanHoiDangKyTuVanText', 'phanHoiDangKyTuVanHtml', result => {
                        const mailTitle = result.phanHoiDangKyTuVanTitle,
                            mailText = result.phanHoiDangKyTuVanText.replaceAll('{name}', item.name).replaceAll('{content}', content).replaceAll('{title}', item.title),
                            mailHtml = result.phanHoiDangKyTuVanHtml.replaceAll('{name}', item.name).replaceAll('{content}', content).replaceAll('{title}', item.title);
                        app.email.sendEmail(app.state.data.email, app.state.data.emailPassword, item.email, [], mailTitle, mailText, mailHtml, null, () => {
                            item.save(error => res.send({ error }))
                        }, (error) => {
                            res.send({ error })
                    });
                });
            }
        });
    });
};