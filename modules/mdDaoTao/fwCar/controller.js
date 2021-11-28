
module.exports = app => {
    const menu = {
        parentMenu: app.parentMenu.trainning,
        menus: {
            4035: { title: 'Quản lý xe', link: '/user/car' },
        },
    };
    app.permission.add({ name: 'car:read', menu }, { name: 'car:write' }, { name: 'car:delete' }, { name: 'car:import' }, { name: 'car:export' }, { name: 'car:fuel' });

    app.get('/user/car', app.permission.check('car:read'), app.templates.admin);
    app.get('/user/car/manager', app.permission.check('car:read'), app.templates.admin);
    app.get('/user/car/fuel', app.permission.check('car:read'), app.templates.admin);
    app.get('/user/car/category', app.permission.check('car:read'), app.templates.admin);
    app.get('/user/car/fuel/:_id', app.permission.check('car:read'), app.templates.admin);
    app.get('/user/car/registration', app.permission.check('car:read'), app.templates.admin);
    app.get('/user/car/quantity', app.permission.check('car:read'), app.templates.admin);
    app.get('/user/car/repair', app.permission.check('car:read'), app.templates.admin);
    app.get('/user/car/course', app.permission.check('car:read'), app.templates.admin);
    app.get('/user/car/course/:_id', app.permission.check('car:read'), app.templates.admin);
    app.get('/user/car/practice', app.permission.check('car:read'), app.templates.admin);
    app.get('/user/car/import', app.permission.check('car:read'), app.templates.admin);
    app.get('/user/car/lecturer/calendar', app.permission.check('car:read'), app.templates.admin);
    app.get('/user/car/calendar', app.permission.check('car:read'), app.templates.admin);
    app.get('/user/car/history-calendar', app.permission.check('car:read'), app.templates.admin);
    app.get('/user/car/history-calendar/:_id', app.permission.check('car:read'), app.templates.admin);
    
    // APIs -----------------------------------------------------------------------------------------------------------------------------------------
    app.get('/api/car/page/:pageNumber/:pageSize', app.permission.check('car:read'), (req, res) => {
        const pageNumber = parseInt(req.params.pageNumber),
            pageSize = parseInt(req.params.pageSize);
        let pageCondition = req.query.pageCondition,
            searchText = pageCondition && pageCondition.searchText;

        if (searchText) {
            pageCondition.licensePlates = new RegExp(searchText, 'i');
        }

        if (pageCondition && pageCondition.filterType && pageCondition.dateStart && pageCondition.dateEnd) {
            if (pageCondition.filterType == 'thanhLy') {
                pageCondition.ngayThanhLy = {
                    $gte: new Date(pageCondition.dateStart),
                    $lt: new Date(pageCondition.dateEnd)
                };
            } else if (pageCondition.filterType == 'dangKy') {
                pageCondition.ngayDangKy = {
                    $gte: new Date(pageCondition.dateStart),
                    $lt: new Date(pageCondition.dateEnd)
                };
            }
        }

        if (pageCondition) {
            delete pageCondition.searchText;
            if (pageCondition.filterType == 'thanhLy' && !pageCondition.ngayThanhLy) {
                pageCondition.status = 'daThanhLy';
            }
            if (!pageCondition.status && !pageCondition.filterType) pageCondition.status = { $ne: 'daThanhLy' };
            delete pageCondition.filterType;
            delete pageCondition.dateStart;
            delete pageCondition.dateEnd;
        } else {
            pageCondition = {};
            pageCondition.status = { $ne: 'daThanhLy' };
        }
        app.model.car.getPage(pageNumber, pageSize, pageCondition, (error, page) => {
            res.send({ page, error });
        });
    });

    app.get('/api/car', app.permission.check('car:read'), (req, res) => {
        app.model.car.get(req.query._id, (error, item) => res.send({ error, item }));
    });

    app.get('/api/car/all', (req, res) => {
        const condition = req.query.condition;
        app.model.car.getAll(condition, (error, list) => res.send({ error, list }));
    });

    app.get('/api/car/avaiable-lecturer', (req, res) => {
        app.model.user.getAll({ isLecturer: true }, (error, lecturers) => {
            if (error) {
                res.send({ error: 'Lấy thông tin giáo viên bị lỗi'});
            } else {
                app.model.car.getAll({}, (error, cars) => {
                    let avaiableLecturers = [];
                    lecturers.forEach(lecturer => {
                        let isExisted = false;
                        cars.forEach(car => {
                            if (car.user && lecturer._id.toString() == car.user._id.toString()) {
                                isExisted = true;
                            }
                        });
                        if (!isExisted) {
                            avaiableLecturers.push(lecturer);
                        }
                    });
                    res.send({ error, list : avaiableLecturers });
                });
            }
        });
    });

    app.get('/api/car/lecturer', (req, res) => {
        const condition = req.query.condition;
        app.model.car.get(condition, (error, item) => res.send({ error, item }));
    });
    
    app.post('/api/car', app.permission.check('car:write'), (req, res) => {
        const data = req.body.data;
        if (data && data.user == 0) delete data.user;
        app.model.car.create(data, (error, item) => {
            if (item && item.user) {
                const calendarHistory = {
                    user: item.user,
                    thoiGianBatDau: new Date(), 
                };
                app.model.car.addCalendarHistory({ _id: item._id }, calendarHistory, (error, item) => res.send({ error, item }));
            } else {
                res.send({ error, item });
            }
        });
    });

    app.put('/api/car', app.permission.check('car:write'), (req, res) => {
        const { _id, changes } = req.body,
            $unset = {};
        if (changes.user == '0') {
            $unset.user = '';
            delete changes.user;
        } 
        app.model.car.get( _id, (error, item) => {
            if (error || !item) {
                res.send({ error: 'Lỗi khi lấy thông tin xe!' });
            } else {
                if (item.user != changes.user) {
                    const data = {};
                    if (changes.user) {
                        data.user = changes.user;
                        const condition = {}, lecturerCondition= {};
                        condition.thoiGianKetThuc = {
                            $gte: new Date(),
                        };
                        app.model.course.get(condition, (error, item) => {
                          if (item) {
                                item = app.clone(item);
                                const listStudent = item.teacherGroups.filter(teacherGroup => teacherGroup.teacher && teacherGroup.teacher._id == changes.user),
                                studentIds = listStudent.length && listStudent[0].student.map(student => student._id);
                                lecturerCondition.student = { $in:  studentIds };
                                lecturerCondition.date = {
                                    $gte: new Date(),
                                };
                                app.model.timeTable.getAll(lecturerCondition, (error, list) => {
                                    if (list && list.length) {
                                        const timeTables = list.map(item => app.clone(item));
                                        const handleUpdateTimeTable = (index = 0) => {
                                            if (index == timeTables.length) {
                                                app.model.car.update(_id, changes, $unset, (error, item) => res.send({ error, item }));
                                            } else {
                                                const timeTable = timeTables[index];
                                                timeTable.car = _id;
                                                app.model.timeTable.update({ _id: timeTable._id }, timeTable, () => {
                                                    handleUpdateTimeTable(index + 1);
                                                });
                                            }
                                        };
                                        handleUpdateTimeTable();
                                    }
                                });
                            }
                        });
                    }
                    app.model.car.updateCalendarHistory({ _id: _id }, (error, item) => {
                        if (item) {
                            app.model.car.addCalendarHistory({ _id: _id }, data);
                        }
                    });
                    // Nếu đổi giáo viên chủ xe => update lại xe trong timeTable những học viên của giáo viên phụ trách
                    const condition = {};
                    condition.date = {
                        $gte: new Date(),
                    };
                    condition.car = _id;
                    app.model.timeTable.getAll(condition, (error, list) => {
                        if (list && list.length) {
                            const timeTables = list.map(item => app.clone(item));
                            const handleUpdateTimeTable = (index = 0) => {
                                if (index == timeTables.length) {
                                    app.model.car.update(_id, changes, $unset, (error, item) => res.send({ error, item }));
                                } else {
                                    const timeTable = timeTables[index];
                                    timeTable.car = undefined;
                                    app.model.timeTable.update({ _id: timeTable._id }, timeTable, () => {
                                        handleUpdateTimeTable(index + 1);
                                    });
                                }
                            };
                            handleUpdateTimeTable();
                        } else {
                            app.model.car.update(_id, changes, $unset, (error, item) => res.send({ error, item }));
                        }
                    });
                } else {
                    app.model.car.update(_id, changes, $unset, (error, item) => res.send({ error, item }));
                }
            }   
        });
    });


    app.delete('/api/car', app.permission.check('car:write'), (req, res) => {
        app.model.car.delete(req.body._id, error => res.send({ error }));
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
            app.model.car.addFuel({ _id: carId }, data, (error, item) => res.send({ error, item }));
        }

    });

    app.delete('/api/car/fuel', app.permission.check('car:fuel'), (req, res) => {
        const { _carId, _fuelId } = req.body;
        app.model.car.deleteFuel(_carId, _fuelId, (error) => {
            if (error) {
                res.send({ error });
            } else {
                app.model.car.get(_carId, (error, item) => res.send({ error, item }));
            }
        });
    });

    app.delete('/api/car/course', app.permission.check('car:write'), (req, res) => {
        const { _carId, _courseHistoryId } = req.body;
        app.model.car.deleteCourseHistory(_carId, _courseHistoryId, (error) => {
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
                            app.model.car.create(car, (error, newItem) => {
                                if (error) {
                                    err = error;
                                } else if (newItem) {
                                    let calendarHistory = { thoiGianBatDau: new Date() };
                                    if (newItem.user) {
                                        calendarHistory.user = newItem.user;
                                    }  
                                    app.model.car.addCalendarHistory({ _id : newItem._id }, calendarHistory);
                                }
                                handleCreateCar(index + 1);
                            });
                        } else {
                            if (item.user != car.user) {
                                const data = {};
                                if (car.user) {
                                    data.user = car.user;
                                }
                                app.model.car.updateCalendarHistory({ _id: item._id }, (error, ite) => {
                                    if (ite) {
                                        app.model.car.addCalendarHistory({ _id: item._id }, data);
                                    }
                                });
                            }
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

    app.get('/api/car/repair/export/:filterType', app.permission.check('car:export'), (req, res) => {
        let { filterType } = req.params,
            condition = {};
        const sessionUser = req.session.user,
            division = sessionUser.division,
            carType = [{ id: 'tatCa', text: 'Tất cả xe' }, { id: 'dangSuDung', text: 'Xe đang sử dụng' }, { id: 'dangSuaChua', text: 'Xe đang sửa chữa' }, { id: 'dangThanhLy', text: 'Xe chờ thanh lý' }, { id: 'daThanhLy', text: 'Xe thanh lý' }];
        if (!(filterType == 'tatCa' || filterType == undefined))
            condition = { status: filterType };
        if (sessionUser && sessionUser.isCourseAdmin && division && division.isOutside) {
            res.send({ error: 'Bạn không có quyền xuất file excel này!' });
        } else {
            app.model.car.getPage(undefined, undefined, condition, (error, page) => {
                if (error || !page.list) {
                    res.send({ error: 'Hệ thống bị lỗi!' });
                } else {
                    const workbook = app.excel.create(), worksheet = workbook.addWorksheet(filterType);
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
                        { header: 'Tình trạng', key: 'status', width: 20 },
                    ];
                    page.list.forEach((car, index) => {
                        worksheet.addRow({
                            _id: index + 1,
                            licensePlates: car.licensePlates,
                            brand: car.brand && car.brand.title,
                            status: carType.find(status => status.id == car.status) ? carType.find(status => status.id == car.status).text : ''
                        });
                    });
                    app.excel.write(worksheet, cells);
                    app.excel.attachment(workbook, res, 'Danh sách xe sửa chữa, thanh lý.xlsx');
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
