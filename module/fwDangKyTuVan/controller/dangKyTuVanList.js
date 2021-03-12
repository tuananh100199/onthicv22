module.exports = app => {

    const menu = {
        parentMenu: { index: 4000, title: 'Đăng ký tư vấn', icon: 'fa-file-text-o', link: '/user/dang-ky-tu-van-list' }
    };

    app.permission.add({ name: 'dangKyTuVan:read', menu }, { name: 'dangKyTuVan:write', menu },);

    app.permission.add(
        { name: 'dangKyTuVanList:read', menu },
        { name: 'dangKyTuVanList:write', menu },
    );

    app.get('/user/dang-ky-tu-van-list', app.permission.check('dangKyTuVanList:read'), app.templates.admin);

  
    //APIs -------------------------------------------------------------------------------------------------------------
    const emailParams = ['phanHoiDangKyTuVanTitle', 'phanHoiDangKyTuVanText', 'phanHoiDangKyTuVanHtml'];
    app.get('/api/dang-ky-tu-van-list/email/all', app.permission.check('dangKyTuVanList:email'), (req, res) => app.model.setting.get(...emailParams, result => res.send(result)));

    app.put('/api/dang-ky-tu-van-list/item/email/email', app.permission.check('dangKyTuVanList:email'), (req, res) => {
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
    app.get('/api/dang-ky-tu-van-list/page/:pageNumber/:pageSize/:DKTVListId', app.permission.check('dangKyTuVanList:read'), (req, res) => {
        const pageNumber = parseInt(req.params.pageNumber),
            pageSize = parseInt(req.params.pageSize),
            DKTVListId = req.params.DKTVListId;
        app.model.dangKyTuVanList.getPage(pageNumber, pageSize, DKTVListId, (error, page) => {
            page.list = page.list.map(item => app.clone(item, { message: '' }));
            res.send({ error, page });
        });
    });

    app.get('/api/dang-ky-tu-van-list/item/:DKTVListId', app.permission.check('dangKyTuVanList:write'), (req, res) => app.model.dangKyTuVanList.update(req.params.DKTVListId, {read: true}, (error, item) => {
        if (item) app.io.emit('dangKyTuVan-changed', item);
        res.send({ error, item });
    }));


    app.delete('/api/dang-ky-tu-van-list/item', app.permission.check('dangKyTuVanList:write'), (req, res) => app.model.dangKyTuVanList.delete(req.body._id, error => res.send({ error })));

    app.post('/api/dang-ky-tu-van-list/item/', (req, res) => {
        app.model.dangKyTuVanList.create(req.body.dangKyTuVan, (error, item) => {
            res.send({ error, item })
            if (item) {
                app.io.emit('dangKyTuVanList-added', item);

                app.model.setting.get('email', 'emailPassword', 'emailDangKyTuVanTitle', 'emailDangKyTuVanText', 'emailDangKyTuVanHtml', result => {
                    console.log('result', result);
                    let mailSubject = result.emailDangKyTuVanTitle.replaceAll('{name}', item.lastname + ' ' + item.firstname).replaceAll('{subject}', item.subject).replaceAll('{message}', item.message),
                        mailText = result.emailDangKyTuVanText.replaceAll('{name}', item.lastname + ' ' + item.firstname).replaceAll('{subject}', item.subject).replaceAll('{message}', item.message),
                        mailHtml = result.emailDangKyTuVanHtml.replaceAll('{name}', item.lastname + ' ' + item.firstname).replaceAll('{subject}', item.subject).replaceAll('{message}', item.message);
                    app.email.sendEmail(result.email, result.emailPassword, item.email, [], mailSubject, mailText, mailHtml, null)
                });
            }
        })
    });

    app.get('/user/dang-ky-tu-van-list/edit/:_id', app.permission.check('dangKyTuVanList:read'), app.templates.admin);

    app.post('/api/dang-ky-tu-van-list/item/response', app.permission.check('dangKyTuVanList:write'), (req, res) => {
        const { _id, content } = req.body;
        app.model.dangKyTuVanList.get(_id, (error, item) => {
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
                    }
                    app.model.setting.get('emailPhanHoiDangKyTuVanTitle', 'emailPhanHoiDangKyTuVanText', 'emailPhanHoiDangKyTuVanHtml', result => {
                        const mailTitle = result.emailPhanHoiDangKyTuVanTitle,
                            mailText = result.emailPhanHoiDangKyTuVanText.replaceAll('{name}', item.lastname + ' ' + item.firstname).replaceAll('{content}', content),
                            mailHtml = result.emailPhanHoiDangKyTuVanHtml.replaceAll('{name}', item.lastname + ' ' + item.firstname).replaceAll('{content}', content);
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