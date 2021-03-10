module.exports = app => {
   
    const menu = {
        parentMenu: { index: 4000, title: 'Danh sách đăng ký tư vấn', icon: 'fa-file-text-o', link: '/user/dang-ky-tu-van-list' }
    };

    app.permission.add(
        { name: 'dangKyTuVanList:read', menu },
        { name: 'dangKyTuVanList:write', menu },
    );

    app.get('/user/dang-ky-tu-van-list', app.permission.check('dangKyTuVanList:read'), app.templates.admin);

     // Init ------------------------------------------------------------------------------------------------------------
    app.readyHooks.add('emailPhanHoiDangKyTuVanInit', {
        ready: () => app.model != null && app.model.setting != null && app.state,
        run: () => {
            const enableInit = process.env['enableInit'] == 'true';
            if (enableInit) {
                app.model.setting.init({
                    phanHoiDangKyTuVanTitle: 'Hiệp Phát: Phản hồi đăng ký tư vấn!',
                    phanHoiDangKyTuVanText: 'Chào {lastname}, Hiệp Phát đã gửi phản hồi đăng ký tư vấn cho bạn: {content} Trân trọng, Giảng viên hướng dẫn, Website: ' + app.rootUrl + '',
                    phanHoiDangKyTuVanHtml: 'Chào <b>{lastname}</b>,<br/><br/>' +
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
    app.get('/api/dang-ky-tu-van-list/page/:pageNumber/:pageSize', app.permission.check('dangKyTuVanList:read'), (req, res) => {
        const pageNumber = parseInt(req.params.pageNumber),
            pageSize = parseInt(req.params.pageSize);
        app.model.dangKyTuVanList.getPage(pageNumber, pageSize, {}, (error, page) => {
            page.list = page.list.map(item => app.clone(item, { message: '' }));
            res.send({ error, page });
        });
    });

    app.get('/api/dang-ky-tu-van-list/all', app.permission.check('dangKyTuVanList:read'), (req, res) => app.model.dangKyTuVanList.getAll((error, items) => res.send({ error, items })));

    app.get('/api/dang-ky-tu-van-list/item/:_id', app.permission.check('dangKyTuVanList:write'), (req, res) => {
        app.model.dangKyTuVanList.update(req.params._id, {read: 'true'}, (error, item) => {
        if (item) app.io.emit('dangKyTuVanList-changed', item);
        res.send({ error, item });
        })
    });

    app.delete('/api/dang-ky-tu-van-list/item', app.permission.check('dangKyTuVanList:write'), (req, res) => app.model.dangKyTuVanList.delete(req.body._id, error => res.send({ error })));

    // // Home -----------------------------------------------------------------------------------------------------------------------------------------
    // app.post('/api/dang-ky-tu-van-list/item/:_id', (req, res) => {
    //     app.model.dangKyTuVan.get(req._id, (error, item) => {
    //         if(item){
    //             app.model.dangKyTuVanList.create(req.body.dangKyTuVan, (error, item) => {
    //                  res.send({ error, item })))
    //                 if (item) {
    //                     app.io.emit('dangKyTuVanList-added', item);
                        
    //                     app.model.setting.get('email', 'emailPassword', 'emailDangKyTuVanTitle', 'emailDangKyTuVanText', 'emailDangKyTuVanHtml', result => {
    //                         let mailSubject = result.emailDangKyTuVanTitle.replaceAll('{name}', item.lastname).replaceAll('{subject}', item.subject).replaceAll('{message}', item.message),
    //                             mailText = result.emailDangKyTuVanText.replaceAll('{name}', item.lastname).replaceAll('{subject}', item.subject).replaceAll('{message}', item.message),
    //                             mailHtml = result.emailDangKyTuVanHtml.replaceAll('{name}', item.lastname).replaceAll('{subject}', item.subject).replaceAll('{message}', item.message);
    //                         app.email.sendEmail(result.email, result.emailPassword, item.email, [], mailSubject, mailText, mailHtml, null)
    //                     });
    //                 }
    //         }
    //     };
    // })});
    
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
                    app.model.setting.get('phanHoiDangKyTuVanTitle', 'phanHoiDangKyTuVanText', 'phanHoiDangKyTuVanHtml', result => {
                        const mailTitle = result.phanHoiDangKyTuVanTitle,
                            mailText = result.phanHoiDangKyTuVanText.replaceAll('{lastname}', item.lastname).replaceAll('{content}', content),
                            mailHtml = result.phanHoiDangKyTuVanHtml.replaceAll('{lastname}', item.lastname).replaceAll('{content}', content);
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