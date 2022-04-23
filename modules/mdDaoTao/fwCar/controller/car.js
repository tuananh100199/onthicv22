module.exports = app => {
    const menu = {
        parentMenu: app.parentMenu.facility,
        menus: {
            40004: { title: 'Quản lý xe', link: '/user/car' }
        }
    };
    app.permission.add({ name: 'car:read', menu }, { name: 'car:write' }, { name: 'car:delete' }, { name: 'car:import' }, { name: 'car:export' }, { name: 'car:fuel' }, { name: 'car:repair' }, { name: 'car:practice' }, { name: 'car:registration' }, { name: 'car:insurance' });

    app.get('/user/car', app.permission.check('car:read'), app.templates.admin);
    app.get('/user/car/manager', app.permission.check('car:read'), app.templates.admin);
    app.get('/user/car/fuel', app.permission.check('car:read'), app.templates.admin);
    app.get('/user/car/category', app.permission.check('car:read'), app.templates.admin);
    app.get('/user/car/fuel/:_id', app.permission.check('car:read'), app.templates.admin);
    app.get('/user/car/registration', app.permission.check('car:read'), app.templates.admin);
    app.get('/user/car/registration/:_id', app.permission.check('car:read'), app.templates.admin);
    app.get('/user/car/insurance', app.permission.check('car:read'), app.templates.admin);
    app.get('/user/car/insurance/:_id', app.permission.check('car:read'), app.templates.admin);
    app.get('/user/car/quantity', app.permission.check('car:read'), app.templates.admin);
    app.get('/user/car/repair', app.permission.check('car:read'), app.templates.admin);
    app.get('/user/car/repair/:_id', app.permission.check('car:read'), app.templates.admin);
    app.get('/user/car/course/:_id', app.permission.check('car:read'), app.templates.admin);
    app.get('/user/car/practice', app.permission.check('car:read'), app.templates.admin);
    app.get('/user/car/practice/:_id', app.permission.check('car:read'), app.templates.admin);
    app.get('/user/car/import', app.permission.check('car:read'), app.templates.admin);
    // app.get('/user/car/lecturer/calendar', app.permission.check('car:read'), app.templates.admin);
    app.get('/user/car/calendar', app.permission.check('car:read'), app.templates.admin);
    app.get('/user/car/history-calendar', app.permission.check('car:read'), app.templates.admin);
    app.get('/user/car/history-calendar/:_id', app.permission.check('car:read'), app.templates.admin);

    // APIs -----------------------------------------------------------------------------------------------------------------------------------------
    app.get('/api/car/page/:pageNumber/:pageSize', app.permission.check('car:read'), (req, res) => {
        const pageNumber = parseInt(req.params.pageNumber),
            pageSize = parseInt(req.params.pageSize);
        let pageCondition = req.query.pageCondition,
            searchText = pageCondition && pageCondition.searchText,
            filter=req.query.filter||{},sort=req.query.sort||null;
        if (pageCondition && pageCondition.filterType) {
            pageCondition = pageCondition.filterType;
        }

        if (searchText) {
            pageCondition.licensePlates = new RegExp(searchText, 'i');
        }

        if (pageCondition && pageCondition.searchText == '') delete pageCondition.searchText;
        filter && app.handleFilter(filter,['courseType','brand','division','licensePlates','state'],defaultFilter=>{
            // console.log('-----------------defaultCondition:----------------------');
            pageCondition={...pageCondition,...defaultFilter};
        }); 
        app.model.car.getPage(pageNumber, pageSize, pageCondition, sort, (error, page) => {
            res.send({ page, error });
        });
    });

    app.get('/api/car', app.permission.check('car:read'), (req, res) => {
        app.model.car.get(req.query._id, (error, item) => res.send({ error, item }));
    });

    app.get('/api/car/avaiable-lecturer', (req, res) => {
        app.model.user.getAll({ isLecturer: true, daNghiDay: false }, (error, lecturers) => {
            if (error) {
                res.send({ error: 'Lấy thông tin giáo viên bị lỗi' });
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
                    res.send({ error, list: avaiableLecturers });
                });
            }
        });
    });

    app.get('/api/car/all', (req, res) => {
        const condition = req.query.condition;
        app.model.car.getAll(condition, (error, list) => res.send({ error, list }));
    });

    app.get('/api/car/lecturer', (req, res) => {
        const condition = req.query.condition;
        app.model.car.get(condition, (error, item) => res.send({ error, item }));
    });

    app.post('/api/car', app.permission.check('car:write'), (req, res) => {
        const data = req.body.data;
        if (data && data.user == 0) delete data.user;
        app.model.car.create(data, (error, item) => {
            if (item) {
                let calendarHistory = { thoiGianBatDau: new Date() };
                if (item.user) {
                    calendarHistory.user = item.user;
                }
                app.model.car.addCalendarHistory({ _id: item._id }, calendarHistory);
            }
            const year = (item && item.ngayDangKy ? item.ngayDangKy.getFullYear() : null);
            let data = {},
                currentYear = new Date().getFullYear();
            app.model.setting.get('car', result => {
                if (result && Object.keys(result).length != 0) {
                    let value = result.car && result.car.split(';');
                    value = value.sort((a, b) => parseInt(a.slice(0, 3)) - parseInt(b.slice(0, 3)));
                    const indexYear = value.findIndex(item => item.startsWith(year));
                    if (indexYear != -1 && (year == currentYear)) {
                        const newItem = value[indexYear].split(':');
                        newItem[2] = parseInt(newItem[2]);
                        newItem[2]++;
                        newItem[4] = parseInt(newItem[4]);
                        newItem[4]++;
                        value[indexYear] = newItem.join(':');
                        data.car = value.join(';');
                    } else if (indexYear != -1) {
                        for (let i = indexYear; i < value.length; i++) {
                            const newItem = value[i].split(':');
                            newItem[2] = parseInt(newItem[2]);
                            newItem[2]++;
                            if (i == indexYear) {
                                newItem[4] = parseInt(newItem[4]);
                                newItem[4]++;
                            }
                            value[indexYear] = newItem.join(':');
                        }
                    } else {
                        const indexPreviousYear = value.findIndex(item => item.startsWith(year - 1));
                        if (indexPreviousYear != -1) {
                            const newItem = value[indexPreviousYear].split(':');
                            newItem[2] = parseInt(newItem[2]);
                            newItem[2]++;
                            data.car = result.car + year + ':totalCar:' + newItem[2] + ':newCar:' + 1 + ':removeCar:0;';
                        } else {
                            data.car = result.car + year + ':totalCar:' + 1 + ':newCar:' + 1 + ':removeCar:0;';
                        }
                    }
                    app.model.setting.set(data, err => {
                        if (err) {
                            res.send({ error: 'Update số xe hàng năm bị lỗi' });
                        } else {
                            res.send({ error, item });
                        }
                    });
                } else {
                    data.car = year + ':totalCar:' + 1 + ':newCar:' + 1 + ':removeCar:0;';
                    app.model.setting.set(data, err => {
                        if (err) {
                            res.send({ error: 'Update số xe hàng năm bị lỗi' });
                        } else {
                            res.send({ error, item });
                        }
                    });
                }

            });
        });
    });

    app.put('/api/car', app.permission.check('car:write'), (req, res) => {
        const { _id, changes } = req.body,
            $unset = {};
        if (changes.user == '0') {
            $unset.user = '';
            delete changes.user;
        }
        const handleChangeLecturer = (teacher, carId, courseType, done) => {
            const condition = { courseType, teacher }, teacherCondition = {};
            condition.thoiGianKetThuc = {
                $gte: new Date()
            };
            app.model.course.getTeacherCourse(condition, (error, course) => {
                if (course) {
                    course = app.clone(course);
                    const listStudent = course.teacherGroups && course.teacherGroups.length ? course.teacherGroups.filter(teacherGroup => teacherGroup.teacher == teacher) : [],
                        studentIds = listStudent.length && listStudent[0].student;
                    if (listStudent.length) {
                        teacherCondition.student = { $in: studentIds };
                        teacherCondition.date = {
                            $gte: new Date()
                        };
                        app.model.timeTable.getAll(teacherCondition, (error, list) => {
                            if (list && list.length) {
                                const timeTables = list.map(item => app.clone(item));
                                const handleUpdateTimeTable = (index = 0) => {
                                    if (index == timeTables.length) {
                                        done && done();
                                    } else {
                                        const timeTable = timeTables[index];
                                        timeTable.car = carId ? carId : undefined;
                                        app.model.timeTable.update({ _id: timeTable._id }, timeTable, () => {
                                            handleUpdateTimeTable(index + 1);
                                        });
                                    }
                                };
                                handleUpdateTimeTable();
                            } else {
                                done && done();
                            }
                        });
                    } else {
                        done && done();
                    }
                } else {
                    done && done();
                }
            });
        };

        app.model.car.get(_id, (error, item) => {
            if (error || !item) {
                res.send({ error: 'Lỗi khi lấy thông tin xe!' });
            } else {
                const courseType = item.courseType && item.courseType._id;
                if (item.user != changes.user) {
                    const calendarHistory = {};
                    if (changes.user) {
                        calendarHistory.user = changes.user;
                    }
                    app.model.car.updateCalendarHistory(_id, (error, item) => {
                        if (item) {
                            app.model.car.addCalendarHistory({ _id }, calendarHistory);
                        }
                    });

                    if (item.user == undefined && changes.user) {
                        handleChangeLecturer(changes.user, _id, courseType, () => {
                            app.model.car.update(_id, changes, $unset, (error, item) => res.send({ error, item }));
                        });

                    } else if (item.user && changes.user == undefined) {
                        handleChangeLecturer(item.user, null, courseType, () => {
                            app.model.car.update(_id, changes, $unset, (error, item) => res.send({ error, item }));
                        });
                    } else {
                        handleChangeLecturer(item.user, null, courseType, () => {
                            handleChangeLecturer(changes.user, _id, courseType, () => {
                                app.model.car.update(_id, changes, $unset, (error, item) => res.send({ error, item }));
                            });
                        });
                    }
                } else {
                    app.model.car.update(_id, changes, $unset, (error, item) => res.send({ error, item }));
                }
            }
        });
    });

    app.delete('/api/car', app.permission.check('car:write'), (req, res) => {
        const car = req.body.item;
        app.model.car.delete(car._id, () => {
            let data = {};
            const d = new Date(car && car.ngayDangKy);
            const year = (d ? d.getFullYear() : null);
            app.model.setting.get('car', result => {
                if (result && Object.keys(result).length != 0) {
                    const value = result.car && result.car.split(';'),
                        indexYear = value.findIndex(item => item.startsWith(year));
                    if (indexYear != -1) {
                        const newItem = value[indexYear].split(':');
                        newItem[2] = parseInt(newItem[2]);
                        newItem[2]--;
                        newItem[6] = parseInt(newItem[6]);
                        newItem[6]++;
                        value[indexYear] = newItem.join(':');
                        data.car = value.join(';');
                    } else {
                        const indexPreviousYear = value.findIndex(item => item.startsWith(year - 1));
                        if (indexPreviousYear != -1) {
                            const newItem = value[indexPreviousYear].split(':');
                            newItem[2] = parseInt(newItem[2]);
                            newItem[2]--;
                            data.car = result.car + year + ':totalCar:' + newItem[2] + ':newCar:' + 1 + ':removeCar:1;';
                        } else {
                            data.car = result.car + year + ':totalCar:' + 1 + ':newCar:' + 1 + ':removeCar:0;';
                        }
                    }
                    app.model.setting.set(data, error => {
                        if (error) {
                            res.send({ error: 'Update số xe hàng năm bị lỗi' });
                        } else {
                            res.end();
                        }
                    });
                } else {
                    res.end();
                }
            });
        });
    });

    app.put('/api/car/liquidate', app.permission.check('car:write'), (req, res) => {
        const car = req.body.item;
        app.model.car.update(car._id, { status: 'daThanhLy', ngayThanhLy: new Date() }, {}, () => {
            let data = {};
            const year = new Date().getFullYear();
            app.model.setting.get('car', result => {
                if (result && Object.keys(result).length != 0) {
                    const value = result.car && result.car.split(';'),
                        indexYear = value.findIndex(item => item.startsWith(year));
                    if (indexYear != -1) {
                        const newItem = value[indexYear].split(':');
                        newItem[2] = parseInt(newItem[2]);
                        newItem[2]--;
                        newItem[6] = parseInt(newItem[6]);
                        newItem[6]++;
                        value[indexYear] = newItem.join(':');
                        data.car = value.join(';');
                    } else {
                        const newItem = value[value.length].split(':');
                        newItem[2] = parseInt(newItem[2]);
                        newItem[2]--;
                        data.car = result.car + year + ':totalCar:' + newItem[2] + ':newCar:0:removeCar:1;';
                    }
                    app.model.setting.set(data, error => {
                        if (error) {
                            res.send({ error: 'Update số xe hàng năm bị lỗi' });
                        } else {
                            res.end();
                        }
                    });
                } else {
                    res.end();
                }
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
                        item.fuel[indexFuel].quantity = data.quantity;
                        item.fuel[indexFuel].donGia = data.donGia;
                        item.fuel[indexFuel].diSaHinh = data.diSaHinh;
                        item.fuel[indexFuel].diDuong = data.diDuong;
                        item.fuel[indexFuel].diDangKiem = data.diDangKiem;
                        item.fuel[indexFuel].soKMDau = data.soKMDau;
                        item.fuel[indexFuel].soKMCuoi = data.soKMCuoi;
                        item.fuel[indexFuel].tongGioDay = data.tongGioDay;
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
                        item.repair[indexRepair].type = data.type;
                        item.repair[indexRepair].state = data.state;
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

    app.post('/api/car/insurance', app.permission.check('car:write'), (req, res) => {
        const carId = req.body._carId,
            data = req.body.data;
        if (data.insuranceId) {
            app.model.car.get({ _id: carId }, (error, item) => {
                if (!item || error) {
                    res.send({ error, item });
                } else {
                    const indexInsurance = item.lichSuDongBaoHiem && item.lichSuDongBaoHiem.findIndex(lichSuDongBaoHiem => lichSuDongBaoHiem._id == data.insuranceId);
                    delete data.insuranceId;
                    if (indexInsurance == -1) {
                        app.model.car.addLichSuDongBaoHiem({ _id: carId }, data, (error, item) => res.send({ error, item }));
                    } else {
                        item.lichSuDongBaoHiem[indexInsurance].ngayDongBaoHiem = data.ngayDongBaoHiem;
                        item.lichSuDongBaoHiem[indexInsurance].ngayHetHanBaoHiem = data.ngayHetHanBaoHiem;
                        item.lichSuDongBaoHiem[indexInsurance].fee = data.fee;
                        app.model.car.update(carId, item, (error, item) => {
                                res.send({ error, item });
                            }
                        );
                    }
                }
            });
        } else {
            app.model.car.addLichSuDongBaoHiem({ _id: carId }, data, (error, item) => res.send({ error, item }));
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
                            app.model.car.create(car, (error, newItem) => {
                                if (error) {
                                    err = error;
                                } else if (newItem) {
                                    let calendarHistory = { thoiGianBatDau: new Date() };
                                    if (newItem.user) {
                                        calendarHistory.user = newItem.user;
                                    }
                                    app.model.car.addCalendarHistory({ _id: newItem._id }, calendarHistory);
                                }
                                const d = new Date(car && car.ngayDangKy),
                                    year = d ? d.getFullYear() : null,
                                    currentYear = new Date().getFullYear();
                                let data = {};
                                app.model.setting.get('car', result => {
                                    if (result && Object.keys(result).length != 0) {
                                        let value = result.car && result.car.split(';');
                                        value = value.sort((a, b) => parseInt(a.slice(0, 3)) - parseInt(b.slice(0, 3)));
                                        const indexYear = value.findIndex(item => item.startsWith(year));
                                        if (indexYear != -1 && (year == currentYear)) {
                                            const newItem = value[indexYear].split(':');
                                            newItem[2] = parseInt(newItem[2]);
                                            newItem[2]++;
                                            newItem[4] = parseInt(newItem[4]);
                                            newItem[4]++;
                                            value[indexYear] = newItem.join(':');
                                            data.car = value.join(';');
                                        } else if (indexYear != -1) {
                                            for (let i = indexYear; i < value.length; i++) {
                                                const newItem = value[i].split(':');
                                                newItem[2] = parseInt(newItem[2]);
                                                newItem[2]++;
                                                if (i == indexYear) {
                                                    newItem[4] = parseInt(newItem[4]);
                                                    newItem[4]++;
                                                }
                                                value[indexYear] = newItem.join(':');
                                            }
                                        } else {
                                            const indexPreviousYear = value.findIndex(item => item.startsWith(year - 1));
                                            if (indexPreviousYear != -1) {
                                                const newItem = value[indexPreviousYear].split(':');
                                                newItem[2] = parseInt(newItem[2]);
                                                newItem[2]++;
                                                data.car = result.car + year + ':totalCar:' + newItem[2] + ':newCar:' + 1 + ':removeCar:0;';
                                            } else {
                                                data.car = result.car + year + ':totalCar:' + 1 + ':newCar:' + 1 + ':removeCar:0;';
                                            }
                                        }
                                    } else {
                                        data.car = year + ':totalCar:' + 1 + ':newCar:' + 1 + ':removeCar:0;';
                                    }
                                    app.model.setting.set(data, error => {
                                        if (error) {
                                            err = error;
                                            handleCreateCar(index + 1);
                                        } else {
                                            handleCreateCar(index + 1);
                                        }
                                    });
                                });
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
                                typeOfFuel: values[10] ? values[10].toLowerCase().trim() : 'xang',
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
