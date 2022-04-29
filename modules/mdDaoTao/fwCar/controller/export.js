// Export to Excel ----------------------------------------------------------------------------------------------------
module.exports = (app) => {
    function convert(str,type) {
        let date = new Date(str),
            mnth = ('0' + (date.getMonth() + 1)).slice(-2),
            day = ('0' + date.getDate()).slice(-2);
        return type=='name' ? [day, mnth, date.getFullYear()].join('-') : [day, mnth, date.getFullYear()].join('/');
    }
app.get('/api/car/info/export/:filterKey', app.permission.check('car:export'), (req, res) => {
    let { filterKey } = req.params,
        condition = {};
    const dataFilterType = [
        { id: 0, text: 'Tất cả xe', condition: {} },
        { id: 1, text: 'Xe đang sử dụng', condition: { status: 'dangSuDung' } },
        { id: 2, text: 'Xe đang sửa chữa', condition: { status: 'dangSuaChua' } },
        { id: 3, text: 'Xe chờ thanh lý', condition: { status: 'choThanhLy' } },
        { id: 4, text: 'Xe đã thanh lý', condition: { status: 'thanhLy' } },
        { id: 5, text: 'Xe đã có giáo viên', condition: { user: { $exists: true } } },
        { id: 6, text: 'Xe đang trống giáo viên', condition: { user: { $exists: false } } },
    ],
        filter = filterKey && parseInt(filterKey);
    const sessionUser = req.session.user,
        division = sessionUser.division;
    if (filter) {
        condition = dataFilterType[filter] && dataFilterType[filter].condition;
    }
    if (sessionUser && sessionUser.isCourseAdmin && division && division.isOutside) {
        res.send({ error: 'Bạn không có quyền xuất file excel này!' });
    } else {
        app.model.car.getPage(undefined, undefined, condition, (error, page) => {
            if (error || !page.list) {
                res.send({ error: 'Hệ thống bị lỗi!' });
            } else {
                const workbook = app.excel.create(), worksheet = workbook.addWorksheet(dataFilterType[filter] && dataFilterType[filter].text);
                const cells = [
                    { cell: 'A1', value: 'STT', bold: true, border: '1234' },
                    { cell: 'B1', value: 'Biển số', bold: true, border: '1234' },
                    { cell: 'C1', value: 'Nhãn hiệu', bold: true, border: '1234' },
                    { cell: 'D1', value: 'Tình trạng', bold: true, border: '1234' },
                ];
                worksheet.columns = [
                    { header: 'STT', key: '_id', width: 15 },
                    { header: 'Biển số', key: 'licensePlates', width: 15 },
                    { header: 'Nhãn hiệu', key: 'brand', width: 15 },
                    // { header: 'Tình trạng', key: 'status', width: 15 },
                ];
                page.list.forEach((car, index) => {
                    worksheet.addRow({
                        _id: index + 1,
                        licensePlates: car.licensePlates,
                        brand: car.brand && car.brand.title,
                        // status: car.status,
                    });
                });
                app.excel.write(worksheet, cells);
                app.excel.attachment(workbook, res, 'Danh sách xe.xlsx');
            }
        });
    }
});

app.get('/api/car/expired/export/:fileType/:filterType', app.permission.check('car:export'), (req, res) => {
    let { filterType, fileType } = req.params;
    const sessionUser = req.session.user,
        division = sessionUser.division,
        filter = parseInt(fileType),
        name = fileType == 0 ? 'TapLai' : 'DangKiem';
    const headerArr = [{ header: 'Ngày hết hạn đăng ký xe tập lái', key: 'ngayHetHanTapLai', width: 30 }, { header: 'Ngày hết hạn đăng kiểm xe', key: 'ngayHetHanDangKiem', width: 30 }];
    let dateCondition = {}, condition = {};
    if (filterType == 1 || filterType == 3) {
        const d = new Date();
        d.setMonth(d.getMonth() + parseInt(filterType)); //1 month ago
        dateCondition = {
            $lt: d,
            $gte: new Date()
        };
    } else if (filterType == -1) {
        dateCondition = {
            $lt: new Date(),
        };
    }
    condition = (filterType == 0 ? {} : (filter == 0 ? { ngayHetHanTapLai: dateCondition } : { ngayHetHanDangKiem: dateCondition }));
    if (sessionUser && sessionUser.isCourseAdmin && division && division.isOutside) {
        res.send({ error: 'Bạn không có quyền xuất file excel này!' });
    } else {
        app.model.car.getPage(undefined, undefined, condition,undefined, (error, page) => {
            if (error || !page.list) {
                res.send({ error: 'Hệ thống bị lỗi!' });
            } else {
                const workbook = app.excel.create(), worksheet = workbook.addWorksheet(name);
                const cells = [
                    { cell: 'A1', value: 'STT', bold: true, border: '1234' },
                    { cell: 'B1', value: 'Biển số', bold: true, border: '1234' },
                    { cell: 'C1', value: 'Nhãn hiệu', bold: true, border: '1234' },
                ];
                const cols = [
                    { header: 'STT', key: '_id', width: 15 },
                    { header: 'Biển số', key: 'licensePlates', width: 15 },
                    { header: 'Nhãn hiệu', key: 'brand', width: 15 },
                ];
                cols.push(headerArr[filter]);
                worksheet.columns = cols;
                page.list.forEach((car, index) => {
                    const obj = {
                        _id: index + 1,
                        licensePlates: car.licensePlates,
                        brand: car.brand && car.brand.title,
                    };
                    obj[(filter == 0) ? 'ngayHetHanTapLai' : 'ngayHetHanDangKiem'] = (filter == 0) ? (car.ngayHetHanTapLai ? convert(car.ngayHetHanTapLai) : '') : (car.ngayHetHanDangKiem ? convert(car.ngayHetHanDangKiem) : '');
                    worksheet.addRow(obj);
                });
                app.excel.write(worksheet, cells);
                app.excel.attachment(workbook, res, 'Danh sách xe hết hạn.xlsx');
            }
        });
    }
});

app.get('/api/car/fuel/export/:_carId', app.permission.check('car:export'), (req, res) => {
    let { _carId } = req.params;
    const sessionUser = req.session.user,
        division = sessionUser.division;
    if (sessionUser && sessionUser.isCourseAdmin && division && division.isOutside) {
        res.send({ error: 'Bạn không có quyền xuất file excel này!' });
    } else {
        app.model.car.get(_carId, (error, car) => {
            if (error || !car) {
                res.send({ error: 'Hệ thống bị lỗi!' });
            } else {
                const workbook = app.excel.create(), worksheet = workbook.addWorksheet(car.licensePlates);
                const cells = [
                    { cell: 'A1', value: 'STT', bold: true, border: '1234' },
                    { cell: 'B1', value: 'Ngày cấp phát nhiên liệu', bold: true, border: '1234' },
                    { cell: 'C1', value: 'Chi phí', bold: true, border: '1234' },
                ];
                worksheet.columns = [
                    { header: 'STT', key: '_id', width: 15 },
                    { header: 'Ngày cấp phát nhiên liệu', key: 'date', width: 20 },
                    { header: 'Chi phí', key: 'fee', width: 20 },
                ];
                car && car.fuel.forEach((car, index) => {
                    worksheet.addRow({
                        _id: index + 1,
                        date: car.date ? convert(car.date) : '',
                        fee: car.fee
                    });
                });
                app.excel.write(worksheet, cells);
                    app.excel.attachment(workbook, res, 'Danh sách cấp phát nhiên liệu.xlsx');
            }
        });
    }
}
);

app.get('/api/car/repair/export/:_carId', app.permission.check('car:export'), (req, res) => {
    let { _carId } = req.params;
    const sessionUser = req.session.user,
        division = sessionUser.division;
    if (sessionUser && sessionUser.isCourseAdmin && division && division.isOutside) {
        res.send({ error: 'Bạn không có quyền xuất file excel này!' });
    } else {
        app.model.car.get(_carId, (error, car) => {
            if (error || !car) {
                res.send({ error: 'Hệ thống bị lỗi!' });
            } else {
                const workbook = app.excel.create(), worksheet = workbook.addWorksheet(car.licensePlates);
                const cells = [
                    { cell: 'A1', value: 'STT', bold: true, border: '1234' },
                    { cell: 'B1', value: 'Ngày sửa chữa', bold: true, border: '1234' },
                    { cell: 'C1', value: 'Chi phí', bold: true, border: '1234' },
                    { cell: 'D1', value: 'Nội dung sửa chữa', bold: true, border: '1234' },
                ];
                worksheet.columns = [
                    { header: 'STT', key: '_id', width: 15 },
                    { header: 'Ngày sửa chữa', key: 'date', width: 20 },
                    { header: 'Chi phí', key: 'fee', width: 20 },
                    { header: 'Nội dung sửa chữa', key: 'content', width: 100 },
                ];
                car && car.repair.forEach((car, index) => {
                    worksheet.addRow({
                        _id: index + 1,
                        date: car.dateStart ? convert(car.dateStart) : '',
                        fee: car.fee,
                        content: car.content
                    });
                });
                app.excel.write(worksheet, cells);
                app.excel.attachment(workbook, res, 'Danh sách sửa chữa xe.xlsx');
            }
        });
    }
}
);

app.get('/api/car/practice/export/:_carId', app.permission.check('car:export'), (req, res) => {
    let { _carId } = req.params;
    const sessionUser = req.session.user,
        division = sessionUser.division;
    if (sessionUser && sessionUser.isCourseAdmin && division && division.isOutside) {
        res.send({ error: 'Bạn không có quyền xuất file excel này!' });
    } else {
        app.model.car.get(_carId, (error, car) => {
            if (error || !car) {
                res.send({ error: 'Hệ thống bị lỗi!' });
            } else {
                const data = car && car.lichSuDangKy && car.lichSuDangKy.sort((a, b) => new Date(b.ngayDangKy) - new Date(a.ngayDangKy));
                const workbook = app.excel.create(), worksheet = workbook.addWorksheet(car.licensePlates);
                const cells = [
                    { cell: 'A1', value: 'STT', bold: true, border: '1234' },
                    { cell: 'B1', value: 'Ngày đăng ký xe tập lái', bold: true, border: '1234' },
                    { cell: 'C1', value: 'Chi phí', bold: true, border: '1234' },
                    { cell: 'D1', value: 'Ngày hết hạn đăng ký xe tập lái tiếp theo', bold: true, border: '1234' },
                ];
                worksheet.columns = [
                    { header: 'STT', key: '_id', width: 15 },
                    { header: 'Ngày đăng ký xe tập lái', key: 'ngayDangKy', width: 20 },
                    { header: 'Chi phí', key: 'fee', width: 20 },
                    { header: 'Ngày hết hạn đăng ký xe tập lái tiếp theo', key: 'ngayHetHanDangKy', width: 35 },
                ];
                data.forEach((car, index) => {
                    worksheet.addRow({
                        _id: index + 1,
                        ngayDangKy: car.ngayDangKy ? convert(car.ngayDangKy) : '',
                        fee: car.fee,
                        ngayHetHanDangKy: car.ngayHetHanDangKy ? convert(car.ngayHetHanDangKy) : '',
                    });
                });
                app.excel.write(worksheet, cells);
                app.excel.attachment(workbook, res, 'Lịch sử đăng ký xe tập lái.xlsx');
            }
        });
    }
}
);

app.get('/api/car/registration/export/:_carId', app.permission.check('car:export'), (req, res) => {
    let { _carId } = req.params;
    const sessionUser = req.session.user,
        division = sessionUser.division;
    if (sessionUser && sessionUser.isCourseAdmin && division && division.isOutside) {
        res.send({ error: 'Bạn không có quyền xuất file excel này!' });
    } else {
        app.model.car.get(_carId, (error, car) => {
            if (error || !car) {
                res.send({ error: 'Hệ thống bị lỗi!' });
            } else {
                const data = car && car.lichSuDangKiem && car.lichSuDangKiem.sort((a, b) => new Date(b.ngayDangKiem) - new Date(a.ngayDangKiem));
                const workbook = app.excel.create(), worksheet = workbook.addWorksheet(car.licensePlates);
                const cells = [
                    { cell: 'A1', value: 'STT', bold: true, border: '1234' },
                    { cell: 'B1', value: 'Ngày đăng kiểm', bold: true, border: '1234' },
                    { cell: 'C1', value: 'Chi phí', bold: true, border: '1234' },
                    { cell: 'D1', value: 'Ngày hết hạn đăng kiểm tiếp theo', bold: true, border: '1234' },
                ];
                worksheet.columns = [
                    { header: 'STT', key: '_id', width: 15 },
                    { header: 'Ngày điểm kiểm', key: 'ngayDangKiem', width: 20 },
                    { header: 'Chi phí', key: 'fee', width: 20 },
                    { header: 'Ngày hết hạn đăng kiểm tiếp theo', key: 'ngayHetHanDangKiem', width: 35 },
                ];
                data.forEach((car, index) => {
                    worksheet.addRow({
                        _id: index + 1,
                        ngayDangKiem: car.ngayDangKiem ? convert(car.ngayDangKiem) : '',
                        fee: car.fee,
                        ngayHetHanDangKiem: car.ngayHetHanDangKiem ? convert(car.ngayHetHanDangKiem) : '',
                    });
                });
                app.excel.write(worksheet, cells);
                app.excel.attachment(workbook, res, 'Lịch sử đăng kiểm xe.xlsx');
            }
        });
    }
}
);

app.get('/api/car/insurance/export/:_carId', app.permission.check('car:export'), (req, res) => {
    let { _carId } = req.params;
    const sessionUser = req.session.user,
        division = sessionUser.division;
    if (sessionUser && sessionUser.isCourseAdmin && division && division.isOutside) {
        res.send({ error: 'Bạn không có quyền xuất file excel này!' });
    } else {
        app.model.car.get(_carId, (error, car) => {
            if (error || !car) {
                res.send({ error: 'Hệ thống bị lỗi!' });
            } else {
                const data = car && car.lichSuDongBaoHiem && car.lichSuDongBaoHiem.sort((a, b) => new Date(b.ngayDongBaoHiem) - new Date(a.ngayDongBaoHiem));
                const workbook = app.excel.create(), worksheet = workbook.addWorksheet(car.licensePlates);
                const cells = [
                    { cell: 'A1', value: 'STT', bold: true, border: '1234' },
                    { cell: 'B1', value: 'Ngày đóng bảo hiểm', bold: true, border: '1234' },
                    { cell: 'C1', value: 'Chi phí', bold: true, border: '1234' },
                    { cell: 'D1', value: 'Ngày hết hạn đóng bảo hiểm tiếp theo', bold: true, border: '1234' },
                ];
                worksheet.columns = [
                    { header: 'STT', key: '_id', width: 15 },
                    { header: 'Ngày đóng bảo hiểm', key: 'ngayDongBaoHiem', width: 20 },
                    { header: 'Chi phí', key: 'fee', width: 20 },
                    { header: 'Ngày hết hạn bảo hiểm tiếp theo', key: 'ngayHetHanBaoHiem', width: 35 },
                ];
                data.forEach((car, index) => {
                    worksheet.addRow({
                        _id: index + 1,
                        ngayDongBaoHiem: car.ngayDongBaoHiem ? convert(car.ngayDongBaoHiem) : '',
                        fee: car.fee,
                        ngayHetHanBaoHiem: car.ngayHetHanBaoHiem ? convert(car.ngayHetHanBaoHiem) : '',
                    });
                });
                app.excel.write(worksheet, cells);
                app.excel.attachment(workbook, res, 'Lịch sử đóng bảo hiểm xe.xlsx');
            }
        });
    }
}
);

app.get('/api/car/course/export/:_carId', app.permission.check('car:export'), (req, res) => {
    let { _carId } = req.params;
    const sessionUser = req.session.user,
        division = sessionUser.division;
    if (sessionUser && sessionUser.isCourseAdmin && division && division.isOutside) {
        res.send({ error: 'Bạn không có quyền xuất file excel này!' });
    } else {
        app.model.car.get(_carId, (error, car) => {
            if (error || !car) {
                res.send({ error: 'Hệ thống bị lỗi!' });
            } else {
                const data = car && car.courseHistory ;
                const workbook = app.excel.create(), worksheet = workbook.addWorksheet(car.licensePlates);
                const cells = [
                    { cell: 'A1', value: 'STT', bold: true, border: '1234' },
                    { cell: 'B1', value: 'Khoá', bold: true, border: '1234' },
                    { cell: 'C1', value: 'Giáo viên', bold: true, border: '1234' },
                    { cell: 'D1', value: 'Ngày kết thúc', bold: true, border: '1234' },
                ];
                worksheet.columns = [
                    { header: 'STT', key: '_id', width: 15 },
                    { header: 'Khoá', key: 'courseName', width: 20 },
                    { header: 'Giáo viên', key: 'teacher', width: 20 },
                    { header: 'Ngày kết thúc', key: 'endDay', width: 35 },
                ];
                data.forEach((car, index) => {
                    worksheet.addRow({
                        _id: index + 1,
                        courseName: car.course ? car.course.name : '',
                        teacher: car.user ? (car.user.firstname + ' ' + car.user.lastname) : '',
                        endDay: car && car.thoiGianKetThuc ? convert(car.thoiGianKetThuc) : '',
                    });
                });
                app.excel.write(worksheet, cells);
                app.excel.attachment(workbook, res, 'Lịch sử đi khoá của xe.xlsx');
            }
        });
    }
}
);

app.get('/api/car/calendar/export/:_carId', app.permission.check('car:export'), (req, res) => {
    let { _carId } = req.params;
    const sessionUser = req.session.user,
        division = sessionUser.division;
    if (sessionUser && sessionUser.isCourseAdmin && division && division.isOutside) {
        res.send({ error: 'Bạn không có quyền xuất file excel này!' });
    } else {
        app.model.car.get(_carId, (error, car) => {
            if (error || !car) {
                res.send({ error: 'Hệ thống bị lỗi!' });
            } else {
                const workbook = app.excel.create(), worksheet = workbook.addWorksheet(car.licensePlates);
                const cells = [
                    { cell: 'A1', value: 'STT', bold: true, border: '1234' },
                    { cell: 'B1', value: 'Giáo viên', bold: true, border: '1234' },
                    { cell: 'C1', value: 'Ngày bắt đầu', bold: true, border: '1234' },
                    { cell: 'D1', value: 'Ngày kết thúc', bold: true, border: '1234' },
                ];
                worksheet.columns = [
                    { header: 'STT', key: '_id', width: 15 },
                    { header: 'Giáo viên', key: 'user', width: 15 },
                    { header: 'Ngày bắt đầu', key: 'thoiGianBatDau', width: 20 },
                    { header: 'Ngày kết thúc', key: 'thoiGianKetThuc', width: 20 },
                ];
                car && car.calendarHistory.forEach((item, index) => {
                    worksheet.addRow({
                        _id: index + 1,
                        user: item.user ? item.user.lastname + ' ' + item.user.firstname : '',
                        thoiGianBatDau: item.thoiGianBatDau,
                        thoiGianKetThuc: item.thoiGianKetThuc
                    });
                });
                app.excel.write(worksheet, cells);
                app.excel.attachment(workbook, res, 'Giáo viên phụ trách xe.xlsx');
            }
        });
    }
}
);

    app.get('/api/car/fuel/export/page/:pageNumber/:pageSize/:filter/:sort', app.permission.check('car:read'), (req, res) => {
    let pageNumber = parseInt(req.params.pageNumber),
    pageSize = parseInt(req.params.pageSize),
    pageCondition = {},filter=req.params.filter ? JSON.parse(req.params.filter) : {},sort=req.params.sort ? JSON.parse(req.params.sort) : null; 
    filter && app.handleFilter(filter,['courseType','brand','division','licensePlates'],defaultFilter=>{
        // console.log('-----------------defaultCondition:----------------------');
        pageCondition={...pageCondition,...defaultFilter};
    }); 
    const sessionUser = req.session.user;
    const sourcePromise =  app.excel.readFile(app.publicPath+'/document/TONG DANH SACH CAP NHIEN LIEU XE.xlsx');
    const getCarPage = new Promise((resolve,reject)=>{ 
        app.model.car.getPage(pageNumber, pageSize, pageCondition, sort, (error, page) => {
            error?reject(error):resolve(page);
        });
    });
    Promise.all([sourcePromise,getCarPage]).then(([sourceWorkbook,page])=>{
        if(page && page.list){
            let list = page && page.list ? page.list : [];
            let data = [];
            list && list.length && list.forEach(car => {
                const sortArr = car && car.fuel && car.fuel.sort((a, b) => new Date(b.date) - new Date(a.date));
                    sortArr.forEach((fuel) => {
                        data.push({ car, fuel });
                    });
            });
            list = data;
            let worksheet = sourceWorkbook.getWorksheet(1);
            for(let i = 0;i<list.length;i++){
                const fuel = list[i];
                let item = [];
                item.push(i+1);
                item.push('');
                item.push(fuel && fuel.car ? fuel.car.carId : '');
                item.push(fuel && fuel.car ? fuel.car.licensePlates : '');
                item.push(fuel && fuel.car && fuel.car.user ? (fuel.car.user.lastname + ' ' + fuel.car.user.firstname) : '');
                item.push(fuel && fuel.car && fuel.car.courseType ? fuel.car.courseType.title : '');
                item.push('');
                item.push(fuel && fuel.car && (fuel.car.typeOfFuel != 'dau' && fuel.car.typeOfFuel != 'nhot') ? (fuel.fuel && fuel.fuel.quantity ? fuel.fuel.quantity : '') : '');
                item.push(fuel && fuel.car && (fuel.car.typeOfFuel == 'dau') ? (fuel.fuel && fuel.fuel.quantity ? fuel.fuel.quantity : '') : '');
                item.push(fuel && fuel.car && (fuel.car.typeOfFuel == 'nhot') ? (fuel.fuel && fuel.fuel.quantity ? fuel.fuel.quantity : '') : '');
                item.push(fuel && fuel.fuel && fuel.fuel.date ? new Date(fuel.fuel.date).getDate() : '');
                item.push(fuel && fuel.fuel && fuel.fuel.date ? (new Date(fuel.fuel.date).getMonth() + 1) : '');
                item.push(fuel && fuel.fuel && fuel.fuel.date ? new Date(fuel.fuel.date).getFullYear() : '');
                item.push(fuel && fuel.fuel ? fuel.fuel.diSaHinh  : '');
                item.push(fuel && fuel.fuel ? fuel.fuel.diDuong  : '');
                item.push(fuel && fuel.fuel ? fuel.fuel.diDangKiem  : '');
                item.push(fuel && fuel.fuel ? fuel.fuel.soKMDau  : '');
                item.push(fuel && fuel.fuel ? fuel.fuel.soKMCuoi  : '');
                item.push(fuel && fuel.fuel ? (parseInt(fuel.fuel.soKMCuoi) - parseInt(fuel.fuel.soKMDau))  : '');
                item.push(fuel && fuel.fuel ? fuel.fuel.tongGioDay  : '');
                item.push(fuel && fuel.fuel && fuel.fuel.donGia ? fuel.fuel.donGia  : '');
                item.push(fuel && fuel.fuel ? fuel.fuel.fee  : '');
                const insertRow =worksheet.insertRow(7+i,item);
                let j=1;
                while(j<=23){// báo cáo của sở chỉ có 14 cột.
                    insertRow.getCell(j).border = {
                        top: {style:'thin'},
                        left: {style:'thin'},
                        bottom: {style:'thin'},
                        right: {style:'thin'}
                      };
                    j+=1;
                }
            }
            const dataEncryption ={
                author: sessionUser._id,
                type: 'export',
                filename: 'TONG DANH SACH CAP NHIEN LIEU XE.xlsx',
            };
            app.model.encryption.create(dataEncryption, () => {
                app.excel.attachment(sourceWorkbook, res, 'TONG DANH SACH CAP NHIEN LIEU XE.xlsx');
            });
            
        
        }
        });
    });

    app.get('/api/car/repair/export/page/:pageNumber/:pageSize/:filter/:sort', app.permission.check('car:read'), (req, res) => {
        let pageNumber = parseInt(req.params.pageNumber),
        pageSize = parseInt(req.params.pageSize),
        pageCondition = {},filter=req.params.filter ? JSON.parse(req.params.filter) : {},sort=req.params.sort ? JSON.parse(req.params.sort) : null; 
        filter && app.handleFilter(filter,['courseType','brand','division','licensePlates'],defaultFilter=>{
            // console.log('-----------------defaultCondition:----------------------');
            pageCondition={...pageCondition,...defaultFilter};
        }); 
        const sourcePromise =  app.excel.readFile(app.publicPath+'/document/TONG DANH SACH XE SUA CHUA.xlsx');
        const getCarPage = new Promise((resolve,reject)=>{ 
            app.model.car.getPage(pageNumber, pageSize, pageCondition, sort, (error, page) => {
                error?reject(error):resolve(page);
            });
        });
        Promise.all([sourcePromise,getCarPage]).then(([sourceWorkbook,page])=>{
            if(page && page.list){
                let list = page && page.list ? page.list : [];
                let data = [];
                let fees = 0;
                let indexRow = 0;
                let worksheet = sourceWorkbook.getWorksheet(1);
                list && list.length && list.forEach((car,i) => {
                    const sortArr = car && car.repair && car.repair.sort((a, b) => new Date(b.date) - new Date(a.date));
                        const totalFee = sortArr.reduce((result,item) => result + parseInt(item.fee) , 0);
                        fees = fees + totalFee;
                        sortArr.forEach((repair,index) => {
                            data.push({ car, repair });
                            let item = [];
                            item.push(index == 0 ? i+1 : '');
                            item.push(index == 0 ? i+1 : '');
                            item.push(index == 0 ? (car ? car.carId : '') : '');
                            item.push(index == 0 ? (car ? car.licensePlates : '') : '');
                            item.push(index == 0 ? (car && car.type ? car.type.title : '') : '');
                            item.push(index == 0 ? (car && car.state && car.state != '' ? car.state : 'S') : '');
                            item.push(index == 0 ? (car && car.courseType ? car.courseType.title : '') : '');
                            item.push(index+1);
                            item.push(repair && repair.dateStart ? new Date(repair.dateStart).getDate() : '');
                            item.push(repair && repair.dateStart ? new Date(repair.dateStart).getMonth() + 1 : '');
                            item.push(repair && repair.dateStart ? new Date(repair.dateStart).getFullYear() : '');
                            item.push(repair ? repair.content  : '');
                            item.push(repair ? repair.fee : '');
                            item.push(index == 0 ? totalFee : '');
                            item.push('');
                        const insertRow =worksheet.insertRow(7+ indexRow,item);
                        indexRow ++;
                        let j=1;
                        while(j<=15){// báo cáo của sở chỉ có 14 cột.
                            insertRow.getCell(j).border = {
                                    top: {style:'thin'},
                                    left: {style:'thin'},
                                    bottom: {style:'thin'},
                                    right: {style:'thin'}
                                    };
                                j+=1;
                            }
                        });
                        if(car.repair.length){
                            worksheet.mergeCells(7 + indexRow - car.repair.length, 1, 7 + indexRow -1, 1);
                            worksheet.mergeCells(7 + indexRow - car.repair.length, 2, 7 + indexRow -1, 2);
                            worksheet.mergeCells(7 + indexRow - car.repair.length, 3, 7 + indexRow -1, 3);
                            worksheet.mergeCells(7 + indexRow - car.repair.length, 4, 7 + indexRow -1, 4);
                            worksheet.mergeCells(7 + indexRow - car.repair.length, 5, 7 + indexRow -1, 5);
                            worksheet.mergeCells(7 + indexRow - car.repair.length, 6, 7 + indexRow -1, 6);
                            worksheet.mergeCells(7 + indexRow - car.repair.length, 7, 7 + indexRow -1, 7);
                            worksheet.mergeCells(7 + indexRow - car.repair.length, 14, 7 + indexRow -1, 14);
                        }
                });
            app.excel.attachment(sourceWorkbook, res, 'TONG DANH SACH SUA CHUA XE.xlsx');
            }
            });
    });

    app.get('/api/car/registration/export/page/:pageNumber/:pageSize/:filter/:sort/:dateStart/:dateEnd', app.permission.check('car:read'), (req, res) => {
        let pageNumber = parseInt(req.params.pageNumber),
        pageSize = parseInt(req.params.pageSize),
        pageCondition = {},filter=req.params.filter ? JSON.parse(req.params.filter) : {},sort=req.params.sort ? JSON.parse(req.params.sort) : null,
        dateStart = req.params.dateStart, dateEnd = req.params.dateEnd;
        console.log(dateStart); 
        filter && app.handleFilter(filter,['courseType','brand','division','licensePlates'],defaultFilter=>{
            // console.log('-----------------defaultCondition:----------------------');
            pageCondition={...pageCondition,...defaultFilter};
        }); 
        const sourcePromise =  app.excel.readFile(app.publicPath+'/document/TONG DANH SACH DANG KIEM XE.xlsx');
        const getCarPage = new Promise((resolve,reject)=>{ 
            app.model.car.getPage(pageNumber, pageSize, pageCondition, sort, (error, page) => {
                error?reject(error):resolve(page);
            });
        });
        Promise.all([sourcePromise,getCarPage]).then(([sourceWorkbook,page])=>{
            if(page && page.list){
                let list = page && page.list ? page.list : [];
                let fees = 0;
                let indexRow = 0;
                let worksheet = sourceWorkbook.getWorksheet(1);
                list && list.length && list.forEach((car,i) => {
                    let sortArr = car && car.lichSuDangKiem && car.lichSuDangKiem.sort((a, b) => new Date(b.date) - new Date(a.date));
                        const totalFee = sortArr.reduce((result,item) => result + parseInt(item.fee) , 0);
                        if(dateStart != 'undefined'){
                            sortArr = sortArr.filter(lichSuDangKiem => dateStart < new Date(lichSuDangKiem.ngayDangKiem).getTime() && dateEnd > new Date(lichSuDangKiem.ngayDangKiem).getTime());
                        }
                        fees = fees + totalFee;
                        sortArr.forEach((lichSuDangKiem,index) => {
                            let item = [];
                            item.push(index == 0 ? i+1 : '');
                            item.push(index == 0 ? i+1 : '');
                            item.push(index == 0 ? (car ? car.carId : '') : '');
                            item.push(index == 0 ? (car ? car.licensePlates : '') : '');
                            item.push(index == 0 ? (car && car.type ? car.type.title : '') : '');
                            item.push(index == 0 ? (car && car.state && car.state != '' ? car.state : 'S') : '');
                            item.push(index == 0 ? (car && car.courseType ? car.courseType.title : '') : '');
                            item.push(index+1);
                            item.push(lichSuDangKiem && lichSuDangKiem.ngayDangKiem ? new Date(lichSuDangKiem.ngayDangKiem).getDate() : '');
                            item.push(lichSuDangKiem && lichSuDangKiem.ngayDangKiem ? new Date(lichSuDangKiem.ngayDangKiem).getMonth() + 1 : '');
                            item.push(lichSuDangKiem && lichSuDangKiem.ngayDangKiem ? new Date(lichSuDangKiem.ngayDangKiem).getFullYear() : '');
                            item.push(index != 0 ? convert(sortArr[index-1].ngayHetHanDangKiem) : ''  );
                            item.push(lichSuDangKiem && lichSuDangKiem.ngayHetHanDangKiem ? convert(lichSuDangKiem.ngayHetHanDangKiem) : '');
                            item.push(index == 0 ? ((new Date() - new Date(car.ngayHetHanDangKiem) > 0) ? 'Hết hạn' : 0) : '');
                            item.push(lichSuDangKiem ?  lichSuDangKiem.fee : '');
                            item.push(index == 0 ? totalFee  : '');
                            item.push('');
                        const insertRow =worksheet.insertRow(8+ indexRow,item);
                        indexRow ++;
                        let j=1;
                        while(j<=17){// báo cáo của sở chỉ có 14 cột.
                            insertRow.getCell(j).border = {
                                    top: {style:'thin'},
                                    left: {style:'thin'},
                                    bottom: {style:'thin'},
                                    right: {style:'thin'}
                                    };
                                j+=1;
                            }
                        });
                        if(car.repair.length){
                            worksheet.mergeCells(7 + indexRow - car.repair.length, 1, 7 + indexRow -1, 1);
                            worksheet.mergeCells(7 + indexRow - car.repair.length, 2, 7 + indexRow -1, 2);
                            worksheet.mergeCells(7 + indexRow - car.repair.length, 3, 7 + indexRow -1, 3);
                            worksheet.mergeCells(7 + indexRow - car.repair.length, 4, 7 + indexRow -1, 4);
                            worksheet.mergeCells(7 + indexRow - car.repair.length, 5, 7 + indexRow -1, 5);
                            worksheet.mergeCells(7 + indexRow - car.repair.length, 6, 7 + indexRow -1, 6);
                            worksheet.mergeCells(7 + indexRow - car.repair.length, 7, 7 + indexRow -1, 7);
                            worksheet.mergeCells(7 + indexRow - car.repair.length, 12, 7 + indexRow -1, 12);
                            worksheet.mergeCells(7 + indexRow - car.repair.length, 14, 7 + indexRow -1, 14);
                            worksheet.mergeCells(7 + indexRow - car.repair.length, 16, 7 + indexRow -1, 16);
                        }
                });
            app.excel.attachment(sourceWorkbook, res, 'TONG DANH SACH DANG KIEM XE.xlsx');
            }
            });
    });
};
