module.exports = app => {
    const menu = {
        parentMenu: app.parentMenu.facility,
        menus: {
            40003: { title: 'Quản lý cơ sở vật chất', link: '/user/facility' }
        }
    };
    app.permission.add({ name: 'facility:read', menu }, { name: 'facility:write' }, { name: 'facility:delete' }, { name: 'facility:import' }, { name: 'facility:export' });

    app.get('/user/facility', app.permission.check('facility:read'), app.templates.admin);
    app.get('/user/facility/manager', app.permission.check('facility:read'), app.templates.admin);
    app.get('/user/facility/category', app.permission.check('facility:read'), app.templates.admin);
    app.get('/user/facility/manager/import', app.permission.check('facility:read'), app.templates.admin);

    // APIs -----------------------------------------------------------------------------------------------------------------------------------------
    app.get('/api/facility/page/:pageNumber/:pageSize', app.permission.check('facility:read'), (req, res) => {
        const pageNumber = parseInt(req.params.pageNumber),
            pageSize = parseInt(req.params.pageSize);
        let pageCondition = req.query.pageCondition,
            searchText = pageCondition && pageCondition.searchText;

        if (searchText) {
            pageCondition.name = new RegExp(searchText, 'i');
        }
        delete pageCondition.searchText;
        app.model.facility.getPage(pageNumber, pageSize, pageCondition, (error, page) => {
            res.send({ page, error });
        });
    });

    app.get('/api/facility', app.permission.check('facility:read'), (req, res) => {
        app.model.facility.get(req.query._id, (error, item) => res.send({ error, item }));
    });

    app.post('/api/facility', app.permission.check('facility:write'), (req, res) => {
        const data = req.body.data;
        app.model.facility.create(data, (error, item) => {
            res.send({ error, item });
        });
    });

    app.put('/api/facility', app.permission.check('facility:write'), (req, res) => {
        const { _id, changes } = req.body,
            $unset = {};
        app.model.facility.update(_id, changes, $unset, (error, item) => res.send({ error, item }));
    });

    app.delete('/api/facility', app.permission.check('facility:write'), (req, res) => {
        const facility = req.body.item;
        app.model.facility.delete(facility._id, (error, item) => res.send({ error, item }));
    });

    // app.post('/api/car/import', app.permission.check('car:write'), (req, res) => {
    //     let cars = req.body.cars;
    //     let err = null;
    //     if (cars && cars.length) {
    //         const handleCreateCar = (index = 0) => {
    //             if (index == cars.length) {
    //                 res.send({ error: err });
    //             } else {
    //                 const car = cars[index];
    //                 car.division = req.body.division;
    //                 car.courseType = req.body.courseType;
    //                 car.brand = car.brand && car.brand.id;
    //                 if (car.user && car.user.id && car.user.id != 0) {
    //                     car.user = car.user.id;
    //                 } else delete car.user;
    //                 app.model.car.get({ licensePlates: car.licensePlates }, (error, item) => {
    //                     if (error) {
    //                         err = error;
    //                         handleCreateCar(index + 1);
    //                     } else if (!item) {
    //                         app.model.car.create(car, (error, newItem) => {
    //                             if (error) {
    //                                 err = error;
    //                             } else if (newItem) {
    //                                 let calendarHistory = { thoiGianBatDau: new Date() };
    //                                 if (newItem.user) {
    //                                     calendarHistory.user = newItem.user;
    //                                 }
    //                                 app.model.car.addCalendarHistory({ _id: newItem._id }, calendarHistory);
    //                             }
    //                             const d = new Date(car && car.ngayDangKy),
    //                                 year = d ? d.getFullYear() : null,
    //                                 currentYear = new Date().getFullYear();
    //                             let data = {};
    //                             app.model.setting.get('car', result => {
    //                                 if (result && Object.keys(result).length != 0) {
    //                                     let value = result.car && result.car.split(';');
    //                                     value = value.sort((a, b) => parseInt(a.slice(0, 3)) - parseInt(b.slice(0, 3)));
    //                                     const indexYear = value.findIndex(item => item.startsWith(year));
    //                                     if (indexYear != -1 && (year == currentYear)) {
    //                                         const newItem = value[indexYear].split(':');
    //                                         newItem[2] = parseInt(newItem[2]);
    //                                         newItem[2]++;
    //                                         newItem[4] = parseInt(newItem[4]);
    //                                         newItem[4]++;
    //                                         value[indexYear] = newItem.join(':');
    //                                         data.car = value.join(';');
    //                                     } else if (indexYear != -1) {
    //                                         for (let i = indexYear; i < value.length; i++) {
    //                                             const newItem = value[i].split(':');
    //                                             newItem[2] = parseInt(newItem[2]);
    //                                             newItem[2]++;
    //                                             if (i == indexYear) {
    //                                                 newItem[4] = parseInt(newItem[4]);
    //                                                 newItem[4]++;
    //                                             }
    //                                             value[indexYear] = newItem.join(':');
    //                                         }
    //                                     } else {
    //                                         const indexPreviousYear = value.findIndex(item => item.startsWith(year - 1));
    //                                         if (indexPreviousYear != -1) {
    //                                             const newItem = value[indexPreviousYear].split(':');
    //                                             newItem[2] = parseInt(newItem[2]);
    //                                             newItem[2]++;
    //                                             data.car = result.car + year + ':totalCar:' + newItem[2] + ':newCar:' + 1 + ':removeCar:0;';
    //                                         } else {
    //                                             data.car = result.car + year + ':totalCar:' + 1 + ':newCar:' + 1 + ':removeCar:0;';
    //                                         }
    //                                     }
    //                                 } else {
    //                                     data.car = year + ':totalCar:' + 1 + ':newCar:' + 1 + ':removeCar:0;';
    //                                 }
    //                                 app.model.setting.set(data, error => {
    //                                     if (error) {
    //                                         err = error;
    //                                         handleCreateCar(index + 1);
    //                                     } else {
    //                                         handleCreateCar(index + 1);
    //                                     }
    //                                 });
    //                             });
    //                         });
    //                     } else {
    //                         if (item.user != car.user) {
    //                             const data = {};
    //                             if (car.user) {
    //                                 data.user = car.user;
    //                             }
    //                             app.model.car.updateCalendarHistory({ _id: item._id }, (error, ite) => {
    //                                 if (ite) {
    //                                     app.model.car.addCalendarHistory({ _id: item._id }, data);
    //                                 }
    //                             });
    //                         }
    //                         app.model.car.update({ _id: item._id }, car, () => {
    //                             handleCreateCar(index + 1);
    //                         });
    //                     }
    //                 });
    //             }
    //         };
    //         handleCreateCar();
    //     } else {
    //         res.send({ error: 'Danh sách ứng viên trống!' });
    //     }
    // });

    // // Hook upload car excel---------------------------------------------------------------------------------------
    // app.uploadHooks.add('uploadCarFile', (req, fields, files, params, done) => {
    //     if (files.CarFile && files.CarFile.length > 0) {
    //         console.log('Hook: uploadCarFile => your car file upload');
    //         const srcPath = files.CarFile[0].path;
    //         app.excel.readFile(srcPath, workbook => {
    //             app.deleteFile(srcPath);
    //             if (workbook) {
    //                 const worksheet = workbook.getWorksheet(1), data = [], totalRow = worksheet.lastRow.number;
    //                 const handleUpload = (index = 2) => {
    //                     const values = worksheet.getRow(index).values;
    //                     if (values.length == 0 || index == totalRow + 1) {
    //                         done({ data });
    //                     } else {
    //                         const stringToDate = (values) => {
    //                             values = values ? values.trim() : '';
    //                             return values.length >= 10 ? new Date(values.slice(6, 10), values.slice(3, 5) - 1, values.slice(0, 2)) : null;
    //                         };
    //                         data.push({
    //                             id: index - 1,
    //                             licensePlates: values[2],
    //                             brand: values[3] && values[3].toLowerCase().trim(),
    //                             isPersonalCar: values[4] && values[4].toLowerCase().trim() == 'x' ? true : false,
    //                             ngayHetHanDangKiem: stringToDate(values[5]),
    //                             ngayHetHanTapLai: stringToDate(values[6]),
    //                             ngayDangKy: stringToDate(values[7]),
    //                             ngayThanhLy: values[8] ? stringToDate(values[8]) : null,
    //                             user: values[9]
    //                         });
    //                         handleUpload(index + 1);
    //                     }
    //                 };
    //                 handleUpload();
    //             } else {
    //                 done({ error: 'Error' });
    //             }
    //         });
    //     }
    // });

};
