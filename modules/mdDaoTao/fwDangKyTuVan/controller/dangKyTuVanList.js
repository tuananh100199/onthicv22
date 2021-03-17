module.exports = app => {
    const menu = {
        parentMenu: app.parentMenu.communication,
        menus: {
            3001: { title: 'Đăng ký tư vấn', link: '/user/dang-ky-tu-van-list', icon: 'fa-envelope-o', backgroundColor: '#00897b' },
        },
    };

    app.permission.add(
        { name: 'dangKyTuVan:read', menu },
        { name: 'dangKyTuVan:write' },
    );

    app.get('/user/dang-ky-tu-van-list', app.permission.check('dangKyTuVan:read'), app.templates.admin);
    app.get('/user/dang-ky-tu-van-list/edit/:_id', app.permission.check('dangKyTuVan:read'), app.templates.admin);

    // APIs -----------------------------------------------------------------------------------------------------------

    app.get('/api/dang-ky-tu-van-list/page/:pageNumber/:pageSize', app.permission.check('dangKyTuVan:read'), (req, res) => {
        const pageNumber = parseInt(req.params.pageNumber),
            pageSize = parseInt(req.params.pageSize);
        app.model.dangKyTuVanList.getPage(pageNumber, pageSize, {}, (error, page) => {
            page.list = page.list.map(item => app.clone(item, { message: '' }));
            res.send({ error, page });
        });
    });

    app.get('/api/dang-ky-tu-van-list/item/:DKTVListId', app.permission.check('dangKyTuVan:write'), (req, res) => {
        app.model.dangKyTuVanList.update(req.params.DKTVListId, { read: true }, (error, item) => {
            if (item) app.io.emit('dangKyTuVan-changed', item);
            res.send({ error, item });
        });
    });

    app.put('/api/dang-ky-tu-van-list/item/', app.permission.check('dangKyTuVan:write'), (req, res) => {
        const changes = req.body.changes;
        app.model.dangKyTuVanList.update(req.body._id, changes, (error, item) => res.send({ error, item }));
    });

    app.delete('/api/dang-ky-tu-van-list/item', app.permission.check('dangKyTuVan:write'), (req, res) => {
        app.model.dangKyTuVanList.delete(req.body._id, error => res.send({ error }));
    });

    app.get('/api/dang-ky-tu-van-list/export', app.permission.check('dangKyTuVan:write'), (req, res) => {
        app.model.dangKyTuVanList.getAll((error, items) => {
            if (error) {
                res.send({ error })
            } else {
                const workbook = app.excel.create(), worksheet = workbook.addWorksheet('Sheet1');
                let cells = [
                    { cell: 'A1', value: 'STT', bold: true, border: '1234' },
                    { cell: 'B1', value: 'Họ', bold: true, border: '1234' },
                    { cell: 'C1', value: 'Tên', bold: true, border: '1234' },
                    { cell: 'D1', value: 'Số điện thoại', bold: true, border: '1234' },
                    { cell: 'E1', value: 'Email', bold: true, border: '1234' },
                    { cell: 'F1', value: 'Loại khóa học', bold: true, border: '1234' },
                ];

                worksheet.columns = [
                    { header: 'STT', key: 'id', width: 15},
                    { header: 'Họ', key: 'lastname', width: 20 },
                    { header: 'Tên', key: 'firstname', width: 20 },
                    { header: 'Số điện thoại', key: 'phone', width: 20},
                    { header: 'Email', key: 'email', width: 40 },
                    { header: 'Loại khóa học', key: 'courseType', width: 20 }
                ];
                items.forEach((item, index) => {
                    worksheet.addRow({
                        id: index + 1,
                        lastname: item.lastname,
                        firstname: item.firstname,
                        phone: item.phone,
                        email: item.email,
                        courseType: item.courseType ? item.courseType.title : 'Chưa đăng ký'
                    });
                })
                app.excel.write(worksheet, cells);
                app.excel.attachment(workbook, res, `result.xlsx`);
            }
        })
    });

    // Home -----------------------------------------------------------------------------------------------------------
    app.post('/home/dang-ky-tu-van-list/item/', (req, res) => {
        app.model.dangKyTuVanList.create(req.body.dangKyTuVan, (error, item) => {
            res.send({ error, item })
            if (item.email) {
                app.io.emit('dangKyTuVanList-added', item);

                app.model.setting.get('email', 'emailPassword', 'emailDangKyTuVanTitle', 'emailDangKyTuVanText', 'emailDangKyTuVanHtml', result => {
                    let mailSubject = result.emailDangKyTuVanTitle.replaceAll('{name}', item.lastname + ' ' + item.firstname).replaceAll('{subject}', item.subject).replaceAll('{message}', item.message),
                        mailText = result.emailDangKyTuVanText.replaceAll('{name}', item.lastname + ' ' + item.firstname).replaceAll('{subject}', item.subject).replaceAll('{message}', item.message),
                        mailHtml = result.emailDangKyTuVanHtml.replaceAll('{name}', item.lastname + ' ' + item.firstname).replaceAll('{subject}', item.subject).replaceAll('{message}', item.message);
                    app.email.sendEmail(result.email, result.emailPassword, item.email, [], mailSubject, mailText, mailHtml, null)
                });
            }
        })
    });
};