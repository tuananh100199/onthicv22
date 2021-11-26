// Export to Excel ----------------------------------------------------------------------------------------------------
module.exports = (app) => {
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
        app.model.car.getPage(undefined, undefined, condition, (error, page) => {
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
                    obj[(filter == 0) ? 'ngayHetHanTapLai' : 'ngayHetHanDangKiem'] = (filter == 0) ? car.ngayHetHanTapLai : car.ngayHetHanDangKiem;
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
                        date: car.date,
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
                        date: car.dateStart,
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
                        ngayDangKy: car.ngayDangKy,
                        fee: car.fee,
                        ngayHetHanDangKy: car.ngayHetHanDangKy,
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
                        ngayDangKiem: car.ngayDangKiem,
                        fee: car.fee,
                        ngayHetHanDangKiem: car.ngayHetHanDangKiem,
                    });
                });
                app.excel.write(worksheet, cells);
                app.excel.attachment(workbook, res, 'Lịch sử đăng kiểm xe.xlsx');
            }
        });
    }
}
);};