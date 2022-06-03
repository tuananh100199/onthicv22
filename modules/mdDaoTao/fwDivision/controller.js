module.exports = app => {
    const menu = {
        parentMenu: app.parentMenu.facility,
        menus: {
            40002: { title: 'Cơ sở đào tạo', link: '/user/division', icon: 'fa fa-university', backgroundColor: 'rgb(106, 90, 205)' }
        }
    };
    app.permission.add({ name: 'division:read', menu }, { name: 'division:write' }, { name: 'division:delete' });

    app.get('/user/division', app.permission.check('division:read'), app.templates.admin);
    app.get('/user/division/:id', app.permission.check('division:write'), app.templates.admin);

    // APIs -----------------------------------------------------------------------------------------------------------
    app.get('/api/division/all', (req, res) => {
        const condition = {},
            searchText = req.query.searchText;
        if (searchText) {
            condition.title = new RegExp(searchText, 'i');
        }
        app.model.division.getAll(condition, (error, list) => res.send({ error, list }));
    });

    app.get('/api/division', app.permission.check('division:read'), (req, res) =>
        app.model.division.get(req.query._id, (error, item) => res.send({ error, item })));

    app.post('/api/division', app.permission.check('division:write'), (req, res) => {
        app.model.division.create(req.body.data, (error, item) => res.send({ error, item }));
    });

    app.put('/api/division', app.permission.check('division:write'), (req, res) => {
        app.model.division.update(req.body._id, req.body.changes, (error, item) => res.send({ error, item }));
    });

    app.delete('/api/division', app.permission.check('division:write'), (req, res) => {
        app.model.division.delete(req.body._id, error => res.send({ error }));
    });

    app.put('/api/division/swap', app.permission.check('division:write'), (req, res) => {
        const isMoveUp = req.body.isMoveUp.toString() == 'true';
        app.model.division.swapPriority(req.body._id, isMoveUp, error => res.send({ error }));
    });

    // Home -----------------------------------------------------------------------------------------------------------
    app.get('/home/division/all', (req, res) => {
        app.model.division.getAll((error, list) => res.send({ error, list }));
    });

    app.get('/api/division/export', app.permission.check('division:write'), (req, res) => {
        const sessionUser = req.session.user,
            division = sessionUser.division;
        if (sessionUser && sessionUser.isCourseAdmin && division && division.isOutside) {
            res.send({ error: 'Bạn không có quyền xuất file excel này!' });
        } else {
            app.model.division.getAll({}, (error, list) => {
                if (error || !list) {
                    res.send({ error: 'Hệ thống bị lỗi!' });
                } else {
                    const workbook = app.excel.create(), worksheet = workbook.addWorksheet('Danh sách cơ sở đào tạo');
                    const cells = [
                        { cell: 'A1', value: 'STT', bold: true, border: '1234' },
                        { cell: 'B1', value: 'Tên cơ sở', bold: true, border: '1234' },
                        { cell: 'C1', value: 'Địa chỉ', bold: true, border: '1234' },
                        { cell: 'D1', value: 'Email', bold: true, border: '1234' },
                        { cell: 'E1', value: 'Số điện thoại', bold: true, border: '1234' },
                        { cell: 'F1', value: 'Di động', bold: true, border: '1234' },
                        { cell: 'G1', value: 'Đường dẫn Google Map', bold: true, border: '1234' },
                        { cell: 'H1', value: 'Cơ sở ngoài', bold: true, border: '1234' },
                    ];
                    worksheet.columns = [
                        { header: 'STT', key: '_id', width: 15 },
                        { header: 'Tên cơ sở', key: 'title', width: 15 },
                        { header: 'Địa chỉ', key: 'address', width: 15 },
                        { header: 'Email', key: 'email', width: 15 },
                        { header: 'Số điện thoại', key: 'phoneNumber', width: 15 },
                        { header: 'Di động', key: 'mobile', width: 15 },
                        { header: 'Đường dẫn Google Map', key: 'mapURL', width: 25 },
                        { header: 'Cơ sở ngoài', key: 'isOutside', width: 15 },
                    ];
                    list.forEach((division, index) => {
                        worksheet.addRow({
                            _id: index + 1,
                            title: division.title,
                            address: division.address,
                            email: division.email,
                            phoneNumber: division.phoneNumber,
                            mobile: division.mobile,
                            mapURL: division.mapURL,
                            isOutside: division.isOutside ? 'X' : '',
                        });
                    });
                    app.excel.write(worksheet, cells);
                    app.excel.attachment(workbook, res, 'Danh sách cơ sở đào tạo.xlsx');
                }
            });
        }
    });

    // Hook upload images ---------------------------------------------------------------------------------------------
    app.createFolder(app.path.join(app.publicPath, '/img/division'));

    const uploadDivision = (fields, files, done) => {
        if (fields.userData && fields.userData[0].startsWith('division:') && files.DivisionImage && files.DivisionImage.length > 0) {
            console.log('Hook: uploadDivision => division image upload');
            const _id = fields.userData[0].substring('division:'.length);
            app.uploadImage('division', app.model.division.get, _id, files.DivisionImage[0].path, done);
        }
    };
    app.uploadHooks.add('uploadDivision', (req, fields, files, params, done) =>
        app.permission.has(req, () => uploadDivision(fields, files, done), done, 'division:write'));
};