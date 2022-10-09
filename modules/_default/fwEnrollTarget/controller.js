module.exports = app => {
    const menu = {
        parentMenu: app.parentMenu.enrollment,
        menus: {
            8009: { title: 'Chỉ tiêu tuyển sinh', link: '/user/enroll-target', icon: 'fa-envelope-o', backgroundColor: '#00897b' },
            8008: { title: 'Hướng dẫn', link: '/user/enroll-tutorial', icon: 'fa-envelope-o', backgroundColor: '#00897b' },
        },
    };
    app.permission.add({ name: 'enrollTarget:read', menu }, { name: 'enrollTarget:write' }, { name: 'enrollTarget:delete' }, { name: 'enrollTarget:export' });

    app.get('/user/enroll-target', app.permission.check('enrollTarget:read'), app.templates.admin);
    app.get('/user/enroll-tutorial', app.permission.check('enrollTarget:read'), app.templates.admin);

    // APIs -----------------------------------------------------------------------------------------------------------
    app.get('/api/enroll-target/all',app.permission.check('enrollTarget:read'), (req, res) => {
        const condition = {},
            searchText = req.query.searchText;
        if (searchText) {
            condition.name = new RegExp(searchText, 'i');
        }
        app.model.enrollTarget.getAll(condition, (error, list) => res.send({ error, list }));
    });

    app.get('/api/enroll-target/page/:pageNumber/:pageSize',app.permission.check('enrollTarget:read'), (req, res) => {
        const pageNumber = parseInt(req.params.pageNumber),
            pageSize = parseInt(req.params.pageSize),
            condition=req.query.condition;
        app.model.enrollTarget.getPage(pageNumber, pageSize, condition, (error, page) => res.send({ error, page }));
    });

    app.post('/api/enroll-target', app.permission.check('enrollTarget:write'), (req, res) => {
        app.model.enrollTarget.create(req.body.data, (error, item) => res.send({ error, item }));
    });

    app.put('/api/enroll-target', app.permission.check('enrollTarget:write'), (req, res) => {
        app.model.enrollTarget.update(req.body._id, req.body.changes, (error, item) => res.send({ error, item }));
    });

    app.delete('/api/enroll-target', app.permission.check('enrollTarget:delete'), (req, res) => {
        app.model.enrollTarget.delete(req.body._id, error => res.send({ error }));
    });

    app.get('/api/enroll-target/export/:year', app.permission.check('enrollTarget:export'), (req, res) => {
        let years = req.params.year;
        years=years.split(',');
        app.model.enrollTarget.getAll({year:{$in:years}},(error,list)=>{
            if(error||!list.length)res.send({error:'Lỗi lấy chỉ tiêu'});
            else{
                const workbook = app.excel.create(), worksheet = workbook.addWorksheet('Chỉ tiêu');
                    const cells = [
                        { cell: 'A1', value: 'STT', bold: true, border: '1234' },
                        { cell: 'B1', value: 'Năm', bold: true, border: '1234' },
                        { cell: 'C1', value: 'Trình độ', bold: true, border: '1234' },
                        { cell: 'D1', value: 'Ngành nghề', bold: true, border: '1234' },
                        { cell: 'E1', value: 'CHỉ tiêu đăng ký', bold: true, border: '1234' },
                        { cell: 'F1', value: 'Chỉ tiêu xác định', bold: true, border: '1234' },
                    ];
                    worksheet.columns = [
                        { header: 'STT', key: '_id', width: 10 },
                        { header: 'Năm', key: 'year', width: 15 },
                        { header: 'Trình độ', key: 'trinhDo', width: 20 },
                        { header: 'Ngành nghề', key: 'nganhNghe', width: 25 },
                        { header: 'Chỉ tiêu đăng ký', key: 'chiTieuDangKy', width: 25 },
                        { header: 'Chỉ tiêu xác định', key: 'chiTieuXacDinh', width: 25 },
                    ];
                    list.forEach((chiTieu, index) => {
                        worksheet.addRow({
                            _id: index + 1,
                            year:chiTieu.year,
                            trinhDo:chiTieu.trinhDo,
                            nganhNghe:chiTieu.nganhNghe,
                            chiTieuDangKy: chiTieu.chiTieuDangKy,
                            chiTieuXacDinh: chiTieu.chiTieuXacDinh,

                        });
                    });
                    app.excel.write(worksheet, cells);
                    app.excel.attachment(workbook, res, 'CHI_TIEU_TUYEN_SINH.xlsx');
            }
        });
        // app.model.course.get(courseId, (error, course) => {
        //     if (error) {
        //         res.send({ error: 'Hệ thống bị lỗi!' });
        //     } else {
        //         app.model.student.getAll({course: course._id, diemThucHanh: { $exists: true, $gte: 5 }}, (error, list) => {
        //             if(error || !list.length){
        //                 res.send({error: 'Lỗi khi lấy học viên'});
        //             } else {
        //                 const workbook = app.excel.create(), worksheet = workbook.addWorksheet(convert(new Date(),'name'));
        //             const cells = [
        //                 { cell: 'A1', value: 'STT', bold: true, border: '1234' },
        //                 { cell: 'B1', value: 'Họ', bold: true, border: '1234' },
        //                 { cell: 'C1', value: 'Tên', bold: true, border: '1234' },
        //                 { cell: 'D1', value: 'Ngày sinh', bold: true, border: '1234' },
        //                 { cell: 'E1', value: 'Số CMND/HC', bold: true, border: '1234' },
        //                 { cell: 'F1', value: 'Địa chỉ thường trú', bold: true, border: '1234' },
        //                 { cell: 'G1', value: 'Ghi chú', bold: true, border: '1234' },
        //             ];
        //             worksheet.columns = [
        //                 { header: 'STT', key: '_id', width: 10 },
        //                 { header: 'Họ', key: 'lastname', width: 15 },
        //                 { header: 'Tên', key: 'firstname', width: 15 },
        //                 { header: 'Ngày sinh', key: 'birth', width: 15 },
        //                 { header: 'Số CMND/HC', key: 'identityCard', width: 15 },
        //                 { header: 'Địa chỉ thường trú', key: 'residence', width: 40 },
        //                 { header: 'Ghi chú', key: 'note', width: 15 },
        //             ];
        //             list.forEach((student, index) => {
        //                 worksheet.addRow({
        //                     _id: index + 1,
        //                     lastname: student.lastname,
        //                     firstname: student.firstname,
        //                     identityCard: student.identityCard,
        //                     birth: student.birthday ? convert(student.birthday) : '',
        //                     residence: student.residence ,
        //                     note: '',
        //                 });
        //             });
        //             app.excel.write(worksheet, cells);
        //             app.excel.attachment(workbook, res, 'DS HV DU THI TOT NGHIEP.xlsx');
        //             }
        //         });
        //     }
        // });
    });
};