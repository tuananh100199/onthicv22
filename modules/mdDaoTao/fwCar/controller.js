module.exports = app => {
    const menu = {
        parentMenu: app.parentMenu.trainning,
        menus: {
            4035: { title: 'Quản lý xe', link: '/user/car' },
        },
    };
    app.permission.add({ name: 'car:read', menu }, { name: 'car:write' }, { name: 'car:delete' }, { name: 'car:import' }, { name: 'car:export' }, { name: 'car:fuel' }, { name: 'car:repair' }, { name: 'car:practice' }, { name: 'car:registration' });

    app.get('/user/car', app.permission.check('car:read'), app.templates.admin);
    app.get('/user/car/manager', app.permission.check('car:read'), app.templates.admin);
    app.get('/user/car/fuel', app.permission.check('car:read'), app.templates.admin);
    app.get('/user/car/category', app.permission.check('car:read'), app.templates.admin);
    app.get('/user/car/fuel/:_id', app.permission.check('car:read'), app.templates.admin);
    app.get('/user/car/registration', app.permission.check('car:read'), app.templates.admin);
    app.get('/user/car/registration/:_id', app.permission.check('car:read'), app.templates.admin);
    app.get('/user/car/quantity', app.permission.check('car:read'), app.templates.admin);
    app.get('/user/car/repair', app.permission.check('car:read'), app.templates.admin);
    app.get('/user/car/repair/:_id', app.permission.check('car:read'), app.templates.admin);
    app.get('/user/car/course/:_id', app.permission.check('car:read'), app.templates.admin);
    app.get('/user/car/practice', app.permission.check('car:read'), app.templates.admin);
    app.get('/user/car/practice/:_id', app.permission.check('car:read'), app.templates.admin);
    app.get('/user/car/import', app.permission.check('car:read'), app.templates.admin);

    // APIs -----------------------------------------------------------------------------------------------------------------------------------------
    app.get('/api/car/page/:pageNumber/:pageSize', app.permission.check('car:read'), (req, res) => {
        const pageNumber = parseInt(req.params.pageNumber),
            pageSize = parseInt(req.params.pageSize);
        let pageCondition = req.query.pageCondition,
            searchText = pageCondition && pageCondition.searchText;
        console.log(pageCondition);
        if (pageCondition && pageCondition.filterType) {
            pageCondition = pageCondition.filterType;
        }

        if (searchText) {
            pageCondition.licensePlates = new RegExp(searchText, 'i');
        }

        if (pageCondition && pageCondition.searchText == '') delete pageCondition.searchText;
        app.model.car.getPage(pageNumber, pageSize, pageCondition, (error, page) => {
            res.send({ page, error });
        });
    });

    app.get('/api/car', app.permission.check('car:read'), (req, res) => {
        app.model.car.get(req.query._id, (error, item) => res.send({ error, item }));
    });

    app.post('/api/car', app.permission.check('car:write'), (req, res) => {
        const data = req.body.data;
        if (data && data.user == 0) delete data.user;
        app.model.car.create(data, (error, item) => {
            const year = 'newCar' + (item && item.ngayDangKy ? item.ngayDangKy.getFullYear() : null);
            let numOfCar = 0;
            app.model.setting.get(year, result => {
                if (result[year]) numOfCar = parseInt(result[year]) + 1;
                else numOfCar = 1;
                const condition = {};
                condition[year] = numOfCar;
                app.model.setting.set(condition, err => {
                    if (err) {
                        res.send({ error: 'Update số xe hàng năm bị lỗi' });
                    } else {
                        res.send({ error, item });
                    }
                });
            });
        });
    });

    app.put('/api/car', app.permission.check('car:write'), (req, res) => {
        const changes = req.body.changes,
            $unset = {};
        if (changes.user == '0') {
            $unset.user = '';
            delete changes.user;
        }
        app.model.car.update(req.body._id, changes, $unset, (error, item) => res.send({ error, item }));
    });


    app.delete('/api/car', app.permission.check('car:write'), (req, res) => {
        const car = req.body.item;
        app.model.car.delete(car._id, () => {
            const d = new Date(car && car.ngayDangKy);
            const year = 'newCar' + (d ? d.getFullYear() : null);
            let numOfCar = 0;
            app.model.setting.get(year, result => {
                if (result[year] && result[year] > 0) numOfCar = parseInt(result[year]) - 1;
                else numOfCar = 0;
                const condition = {};
                condition[year] = numOfCar;
                app.model.setting.set(condition, error => {
                    res.send(error);
                });
            });
        });
    });

    app.post('/api/car/fuel', app.permission.check('car:fuel'), (req, res) => {
        const carId = req.body._carId,
            data = req.body.data;
        if (data.fuelId) {
            app.model.car.get({ _id: carId }, (error, item) => {
                if (!item || error) {
                    res.send({ error, item });
                } else {
                    const indexFuel = item.fuel && item.fuel.findIndex(fuel => fuel._id == data.fuelId);
                    delete data.fuelId;
                    if (indexFuel == -1) {
                        app.model.car.addFuel({ _id: carId }, data, (error, item) => res.send({ error, item }));
                    } else {
                        item.fuel[indexFuel].date = data.date;
                        item.fuel[indexFuel].fee = data.fee;
                        app.model.car.update(carId, item, (error, item) => {
                            res.send({ error, item });
                        }
                        );
                    }
                }
            });
        } else {
            app.model.car.addFuel({ _id: carId }, data, (error, item) => res.send({ error, item }));
        }

    });

    app.post('/api/car/repair', app.permission.check('car:write'), (req, res) => {
        const carId = req.body._carId,
            data = req.body.data;
        if (data.repairId) {
            app.model.car.get({ _id: carId }, (error, item) => {
                if (!item || error) {
                    res.send({ error, item });
                } else {
                    const indexRepair = item.repair && item.repair.findIndex(repair => repair._id == data.repairId);
                    delete data.repairId;
                    if (indexRepair == -1) {
                        app.model.car.addRepair({ _id: carId }, data, (error, item) => res.send({ error, item }));
                    } else {
                        item.repair[indexRepair].dateStart = data.dateStart;
                        item.repair[indexRepair].dateEnd = data.dateEnd;
                        item.repair[indexRepair].fee = data.fee;
                        item.repair[indexRepair].content = data.content;
                        console.log(item.repair);
                        app.model.car.update(carId, item, (error, item) => {
                            res.send({ error, item });
                        }
                        );
                    }
                }
            });
        } else {
            app.model.car.addRepair({ _id: carId }, data, (error, item) => res.send({ error, item }));
        }

    });

    app.post('/api/car/course', app.permission.check('car:delete'), (req, res) => {
        const carId = req.body._carId,
            data = req.body.data;
        if (data.courseHistoryId) {
            app.model.car.get({ _id: carId }, (error, item) => {
                if (!item || error) {
                    res.send({ error, item });
                } else {
                    const indexCourseHistory = item.courseHistory && item.courseHistory.findIndex(courseHistory => courseHistory._id == data.courseHistoryId);
                    delete data.fuelId;
                    if (indexCourseHistory == -1) {
                        app.model.car.addCourseHistory({ _id: carId }, data, (error, item) => res.send({ error, item }));
                    } else {
                        item.courseHistory[indexCourseHistory].user = data.user;
                        app.model.car.update(carId, item, (error) => {
                            if (error) res.send({ error });
                            else app.model.car.get(carId, (error, item) => res.send({ error, item }));
                        }
                        );
                    }
                }
            });
        } else {
            app.model.car.addCourseHistory({ _id: carId }, data, (error, item) => res.send({ error, item }));
        }

    });

    app.post('/api/car/registration', app.permission.check('car:write'), (req, res) => {
        const carId = req.body._carId,
            data = req.body.data;
        if (data.registrationId) {
            app.model.car.get({ _id: carId }, (error, item) => {
                if (!item || error) {
                    res.send({ error, item });
                } else {
                    const indexRegistration = item.lichSuDangKiem && item.lichSuDangKiem.findIndex(lichSuDangKiem => lichSuDangKiem._id == data.registrationId);
                    delete data.registrationId;
                    if (indexRegistration == -1) {
                        app.model.car.addLichSuDangKiem({ _id: carId }, data, (error, item) => res.send({ error, item }));
                    } else {
                        item.lichSuDangKiem[indexRegistration].ngayDangKiem = data.ngayDangKiem;
                        item.lichSuDangKiem[indexRegistration].ngayHetHanDangKiem = data.ngayHetHanDangKiem;
                        item.lichSuDangKiem[indexRegistration].fee = data.fee;
                        app.model.car.update(carId, item, (error, item) => {
                            res.send({ error, item });
                        }
                        );
                    }
                }
            });
        } else {
            app.model.car.addLichSuDangKiem({ _id: carId }, data, (error, item) => res.send({ error, item }));
        }

    });

    app.post('/api/car/practice', app.permission.check('car:write'), (req, res) => {
        const carId = req.body._carId,
            data = req.body.data;
        if (data.practiceId) {
            app.model.car.get({ _id: carId }, (error, item) => {
                if (!item || error) {
                    res.send({ error, item });
                } else {
                    const indexPractice = item.lichSuDangKy && item.lichSuDangKy.findIndex(lichSuDangKy => lichSuDangKy._id == data.practiceId);
                    delete data.practiceId;
                    if (indexPractice == -1) {
                        app.model.car.addLichSuDangKy({ _id: carId }, data, (error, item) => res.send({ error, item }));
                    } else {
                        item.lichSuDangKy[indexPractice].ngayDangKy = data.ngayDangKy;
                        item.lichSuDangKy[indexPractice].ngayHetHanDangKy = data.ngayHetHanDangKy;
                        item.lichSuDangKy[indexPractice].fee = data.fee;
                        app.model.car.update(carId, item, (error, item) => {
                            res.send({ error, item });
                        }
                        );
                    }
                }
            });
        } else {
            app.model.car.addLichSuDangKy({ _id: carId }, data, (error, item) => res.send({ error, item }));
        }

    });

    app.delete('/api/car/element', app.permission.check('car:fuel'), (req, res) => {
        const { _carId, data } = req.body;
        app.model.car.deleteCar(_carId, data, (error) => {
            if (error) {
                res.send({ error });
            } else {
                app.model.car.get(_carId, (error, item) => res.send({ error, item }));
            }
        });
    });

    app.post('/api/car/import', app.permission.check('car:write'), (req, res) => {
        let cars = req.body.cars;
        let err = null;
        if (cars && cars.length) {
            const handleCreateCar = (index = 0) => {
                if (index == cars.length) {
                    res.send({ error: err });
                } else {
                    const car = cars[index];
                    car.division = req.body.division;
                    car.courseType = req.body.courseType;
                    car.brand = car.brand && car.brand.id;
                    if (car.user && car.user.id && car.user.id != 0) {
                        car.user = car.user.id;
                    } else delete car.user;
                    app.model.car.get({ licensePlates: car.licensePlates }, (error, item) => {
                        if (error) {
                            err = error;
                            handleCreateCar(index + 1);
                        } else if (!item) {
                            app.model.car.create(car, () => {
                                const d = new Date(car && car.ngayDangKy);
                                const year = 'newCar' + (d ? d.getFullYear() : null);
                                let numOfCar = 0;
                                app.model.setting.get(year, result => {
                                    if (result[year]) numOfCar = parseInt(result[year]) + 1;
                                    else numOfCar = 1;
                                    const condition = {};
                                    condition[year] = numOfCar;
                                    app.model.setting.set(condition, error => {
                                        err = error;
                                        handleCreateCar(index + 1);
                                    });
                                });
                            });
                        } else {
                            app.model.car.update({ _id: item._id }, car, () => {
                                handleCreateCar(index + 1);
                            });
                        }
                    });
                }
            };
            handleCreateCar();
        } else {
            res.send({ error: 'Danh sách ứng viên trống!' });
        }
    });

    // Hook upload car excel---------------------------------------------------------------------------------------
    app.uploadHooks.add('uploadCarFile', (req, fields, files, params, done) => {
        if (files.CarFile && files.CarFile.length > 0) {
            console.log('Hook: uploadCarFile => your car file upload');
            const srcPath = files.CarFile[0].path;
            app.excel.readFile(srcPath, workbook => {
                app.deleteFile(srcPath);
                if (workbook) {
                    const worksheet = workbook.getWorksheet(1), data = [], totalRow = worksheet.lastRow.number;
                    const handleUpload = (index = 2) => {
                        const values = worksheet.getRow(index).values;
                        if (values.length == 0 || index == totalRow + 1) {
                            done({ data });
                        } else {
                            const stringToDate = (values) => {
                                values = values ? values.trim() : '';
                                return values.length >= 10 ? new Date(values.slice(6, 10), values.slice(3, 5) - 1, values.slice(0, 2)) : null;
                            };
                            data.push({
                                id: index - 1,
                                licensePlates: values[2],
                                brand: values[3] && values[3].toLowerCase().trim(),
                                isPersonalCar: values[4] && values[4].toLowerCase().trim() == 'x' ? true : false,
                                ngayHetHanDangKiem: stringToDate(values[5]),
                                ngayHetHanTapLai: stringToDate(values[6]),
                                ngayDangKy: stringToDate(values[7]),
                                ngayThanhLy: values[8] ? stringToDate(values[8]) : null,
                                user: values[9],
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
    // Export to Excel ----------------------------------------------------------------------------------------------------
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
                            date: car.date,
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
    );


    // Hook permissionHooks -------------------------------------------------------------------------------------------
    app.permissionHooks.add('courseAdmin', 'car', (user) => new Promise(resolve => {
        app.permissionHooks.pushUserPermission(user, 'car:read', 'car:fuel');
        resolve();
    }));
    app.permissionHooks.add('lecturer', 'car', (user) => new Promise(resolve => {
        app.permissionHooks.pushUserPermission(user, 'car:read', 'car:fuel');
        resolve();
    }));

};
