// Export to Excel ----------------------------------------------------------------------------------------------------
module.exports = (app) => {
app.get('/api/device/info/export/:filterKey/:type', app.permission.check('device:export'), (req, res) => {
    let { filterKey, type } = req.params,
        condition = {};
    const sessionUser = req.session.user,
        division = sessionUser.division;
    if(type && type != '0') condition.type = type;
    if(filterKey && filterKey != '0') condition.status = filterKey;
    if (sessionUser && sessionUser.isCourseAdmin && division && division.isOutside) {
        res.send({ error: 'Bạn không có quyền xuất file excel này!' });
    } else {
        app.model.device.getPage(undefined, undefined, condition, (error, page) => {
            if (error || !page.list) {
                res.send({ error: 'Hệ thống bị lỗi!' });
            } else {
                const workbook = app.excel.create(), worksheet = workbook.addWorksheet('Danh sách thiết bị');
                const cells = [
                    { cell: 'A1', value: 'STT', bold: true, border: '1234' },
                    { cell: 'B1', value: 'Tên', bold: true, border: '1234' },
                    { cell: 'C1', value: 'Loại thiết bị', bold: true, border: '1234' },
                    { cell: 'D1', value: 'Số lượng', bold: true, border: '1234' },
                    { cell: 'E1', value: 'Tình trạng', bold: true, border: '1234' },
                ];
                worksheet.columns = [
                    { header: 'STT', key: '_id', width: 15 },
                    { header: 'Tên', key: 'name', width: 15 },
                    { header: 'Loại thiết bị', key: 'type', width: 15 },
                    { header: 'Số lượng', key: 'quantity', width: 15 },
                    { header: 'Tình trạng', key: 'status', width: 15 },
                ];
                page.list.forEach((device, index) => {
                    worksheet.addRow({
                        _id: index + 1,
                        name: device.name,
                        type: device.type && device.type.title,
                        quantity: device.quantity,
                        status: '',
                    });
                });
                app.excel.write(worksheet, cells);
                app.excel.attachment(workbook, res, 'Danh sách thiết bị.xlsx');
            }
        });
    }
});

app.post('/api/device/import', app.permission.check('device:write'), (req, res) => {
    let devices = req.body.devices;
    let err = null;
    if (devices && devices.length) {
        const handleCreateDevice = (index = 0) => {
            if (index == devices.length) {
                res.send({ error: err });
            } else {
                const device = devices[index];
                device.division = req.body.division;
                device.type = req.body.type;
                app.model.device.get({ name: device.name }, (error, item) => {
                    if (error) {
                        err = error;
                        handleCreateDevice(index + 1);
                    } else if (!item) {
                        device.status = 'dangSuDung';
                        app.model.device.create(device, (error) => {
                            if (error) {
                                err = error;
                            }
                            handleCreateDevice(index + 1);
                        });
                    } else {
                        app.model.device.update({ _id: item._id }, device, () => {
                            handleCreateDevice(index + 1);
                        });
                    }
                });
            }
        };
        handleCreateDevice();
    } else {
        res.send({ error: 'Danh sách thiết bị trống!' });
    }
});

// Hook upload car excel---------------------------------------------------------------------------------------
app.uploadHooks.add('uploadDeviceFile', (req, fields, files, params, done) => {
    console.log(files & files.DeviceFile && files.DeviceFile.length);
    if (files.DeviceFile && files.DeviceFile.length > 0) {
        console.log('Hook: uploadDeviceFile => your device file upload');
        const srcPath = files.DeviceFile[0].path;
        app.excel.readFile(srcPath, workbook => {
            app.deleteFile(srcPath);
            if (workbook) {
                const worksheet = workbook.getWorksheet(1), data = [], totalRow = worksheet.lastRow.number;
                const handleUpload = (index = 2) => {
                    const values = worksheet.getRow(index).values;
                    if (values.length == 0 || index == totalRow + 1) {
                        done({ data });
                    } else {
                        data.push({
                            id: index - 1,
                            name: values[2],
                            quantity: values[3],
                        });
                        handleUpload(index + 1);
                    }
                };
                handleUpload();
            } else {
                done({ error: 'Error' });
            }
        });
    }
});

};
