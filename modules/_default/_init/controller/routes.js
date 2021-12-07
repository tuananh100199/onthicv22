module.exports = (app) => {
    const menuSettings = {
        parentMenu: app.parentMenu.setting,
        menus: {
            2010: { title: 'Thông tin chung', link: '/user/setting', icon: 'fa-gear', backgroundColor: '#0091EA' }
        },
    };

    const menuStatistic = {
        parentMenu: app.parentMenu.setting,
        menus: {
            2110: { title: 'Thống kê', link: '/user/statistic', icon: 'fa-bar-chart', backgroundColor: '#0091EA' }
        },
    };

    app.permission.add(
        { name: 'dashboard:standard', menu: { parentMenu: { index: 100, title: 'Dashboard', icon: 'fa-dashboard', link: '/user/dashboard' } } },
        { name: 'user:login', menu: { parentMenu: app.parentMenu.user } },
        { name: 'system:settings', menu: menuSettings },
        { name: 'statistic:read', menu: menuStatistic },
    );

    app.get('/user/dashboard', app.permission.check('dashboard:standard'), app.templates.admin);
    app.get('/user/statistic', app.permission.check('statistic:read'), app.templates.admin);
    app.get('/user/setting', app.permission.check('system:settings'), app.templates.admin);
    ['/index.htm(l)?', '/404.htm(l)?', '/request-permissions(/:roleId?)', '/request-login'].forEach((route) => app.get(route, app.templates.home));

    // API ------------------------------------------------------------------------------------------------------------------------------------------
    app.put('/api/system', app.permission.check('system:settings'), (req, res) => {
        let { emailPassword, email, address, mobile, fax, facebook, youtube, twitter, instagram, moneyLine, moneyStr,contentLine,contentStr, banks } = req.body;
        if (emailPassword) {
            app.model.setting.set({ emailPassword }, error => {
                if (error) {
                    res.send({ error: 'Update email password failed!' });
                } else {
                    app.state.get((error, data) => error ? res.send({ error }) : res.send(data));
                }
            });
        } else {
            console.log(banks, typeof banks,'controler');
            const changes = [];
            email = email ? email.trim() : '';

            if (email) changes.push('email', email.trim());
            if (address || address == '') changes.push('address', address.trim() || '');
            if (mobile || mobile == '') changes.push('mobile', mobile.trim() || '');
            if (fax || fax == '') changes.push('fax', fax.trim() || '');
            if (facebook || facebook == '') changes.push('facebook', facebook.trim() || '');
            if (youtube || youtube == '') changes.push('youtube', youtube.trim() || '');
            if (twitter || twitter == '') changes.push('twitter', twitter.trim() || '');
            if (instagram || instagram == '') changes.push('instagram', instagram.trim() || '');
            if (moneyLine) changes.push('moneyLine', moneyLine || 2);
            if (moneyStr) changes.push('moneyStr', moneyStr|| '(+)/:money/VND');
            if (contentLine) changes.push('contentLine', contentLine || 3);
            if (contentStr) changes.push('contentStr', contentStr || 'N/dung:/:content/');
            if (banks) changes.push('banks', JSON.stringify(banks == 'empty' ? [] : banks));
            app.state.set(...changes, error => {
                error && console.log('Error when save system state!', error);
                app.state.get((error, data) => {
                    error ? res.send({ error }) : res.send(data);
                });
            });
            // Save email into Settings
            if (email) app.model.setting.set({ email }, (error) => error && console.error(error));
        }
    });

    app.get('/api/state', (req, res) => {//mobile
        app.state.get((error, data) => {
            if (error || data == null) {
                res.send({ error: error || 'Hệ thống bị lỗi!' });
            } else {
                delete data.emailPassword;
                if (app.isDebug) data.isDebug = true;
                if (req.session.user) data.user = req.session.user;
                if (data.user) {
                    app.model.student.getAll({ user: data.user._id }, (error, students) => {
                        if (error == null && students) {
                            if (!data.user.menu['5000']) {
                                data.user.menu['5000'] = {
                                    parentMenu: {
                                        index: 5000,
                                        title: 'Khóa học của bạn',
                                        icon: 'fa-graduation-cap',
                                        subMenusRender: true
                                    },
                                    menus: {}
                                };
                                data.user.menu['3020'] = {
                                    parentMenu: {
                                        index: 3020,
                                        title: 'Phản hồi',
                                        link: '/user/feedback',
                                        permissions: ['user:login'],
                                        icon: 'fa-cog',
                                    },
                                };
                            }
                            let index = 0;
                            students.forEach(student => {
                                if (student.course && student.course.active) {
                                    index++;
                                    data.user.menu['5000'].menus[5000 + index] = {
                                        title: 'Khóa học ' + student.course.name,
                                        link: '/user/hoc-vien/khoa-hoc/' + student.course._id,
                                        permissions: ['course:learn']
                                    };
                                }
                            });
                            if (index == 0) {
                                delete data.user.menu['5000'];
                                delete data.user.menu['3020'];
                            }
                        }
                    });
                }
                app.model.menu.getAll({ active: true }, (error, menus) => {
                    if (error == null && menus) {
                        data.menus = menus.slice();
                        data.menus.forEach((menu) => {
                            menu.content = '';
                            menu.submenus && menu.submenus.forEach(submenu => submenu.content = '');
                        });
                    }
                    if (app.isDebug) {
                        app.model.role.getAll((error, roles) => {
                            data.roles = roles || [];
                            res.send(data);
                        });
                    } else {
                        res.send(data);
                    }
                });
            }
        });
    });

    app.get('/api/statistic/dashboard', app.permission.check('statistic:read'), (req, res) => {
        app.model.user.count({}, (error, numberOfUser) => {
            if (error) {
                res.send({ error });
            } else {
                app.model.news.count({}, (error, numberOfNews) => {
                    if (error) {
                        res.send({ error });
                    } else {
                        app.model.course.count({}, (error, numberOfCourse) => {
                            if (error) {
                                res.send({ error });
                            } else {
                                app.model.car.count({ status: { $ne: 'daThanhLy' } }, (error, numberOfCar) => {
                                    if (error) {
                                        res.send({ error });
                                    } else {
                                        app.model.car.count({ status: 'dangSuaChua'}, (error, numberOfRepairCar) => {
                                            if (error) {
                                                res.send({ error });
                                            } else {
                                                app.model.car.count({ ngayHetHanTapLai: {$gte: new Date()}, status: { $ne: 'daThanhLy' }}, (error, numberOfPracticeCar) => {
                                                    if (error) {
                                                        res.send({ error });
                                                    } else {
                                                        app.model.user.count({ isLecturer: true}, (error, numberOfLecturer) => {
                                                            if (error) {
                                                                res.send({ error });
                                                            } else {
                                                                app.model.car.count({ currentCourseClose: false}, (error, numberOfCourseCar) => {
                                                                    if (error) {
                                                                        res.send({ error });
                                                                    } else {
                                                                        app.model.setting.get('car', data => res.send({ numberOfUser: numberOfUser || 0, numberOfCourse: numberOfCourse || 0, numberOfNews: numberOfNews || 0, numberOfCar: numberOfCar || 0,numberOfRepairCar: numberOfRepairCar || 0,numberOfPracticeCar: numberOfPracticeCar || 0,numberOfLecturer: numberOfLecturer || 0,numberOfCourseCar: numberOfCourseCar || 0, carData: data || null }));
                                                                    }
                                                                });
                                                            }
                                                        });
                                                    }
                                                });
                                            }
                                        });
                                    }
                                });
                            }
                        });
                    }
                });
            }
        });
    });

    app.get('/api/statistic/dashboard/student', app.permission.check('statistic:read'), (req, res) => {
        const {dateStart, dateEnd} = req.query,
        monthStart = new Date(dateStart).getMonth(),
        yearStart = new Date(dateStart).getFullYear(),
        monthEnd = new Date(dateEnd).getMonth(),
        yearEnd = new Date(dateEnd).getFullYear(),
        promiseList=[];
        for(let year = yearStart; year <= yearEnd; year++){
            for(let month = (year == yearStart ? monthStart : 0); ((year < yearEnd) ? (month < 12) : (month <= monthEnd)) ; month++){
                promiseList.push(
                new Promise((resolve, reject) => {
                    app.model.student.count({createdDate : { $gte: new Date().setFullYear(year, month, 1), $lt : new Date().setFullYear(year, month + 1, 0) }}, (error, numOfStudent) =>{
                        if (error) {
                            reject(error);
                        } else {
                            const obj={};
                            obj[month+'/' + year] = numOfStudent;
                            resolve(obj);
                        } 
                    });
                }));
            }
        }
        promiseList && Promise.all(promiseList).then(item => {
            res.send({ item });
        }).catch(error => console.error(error) || res.send({ error }));
    });

    app.get('/api/statistic/dashboard/car', app.permission.check('statistic:read'), (req, res) => {
      app.model.car.getOld((error,data) => {
          if(error) res.send({error});
          else {
              const yearStart = data && data[0] && data[0].ngayDangKy && data[0].ngayDangKy.getFullYear();
              const yearEnd = new Date().getFullYear();
              const promiseList=[];
              let totalCar = 0;
              for(let year = yearStart; year <= yearEnd; year++){
                    promiseList.push(
                    new Promise((resolve, reject) => {
                        app.model.car.count({ngayDangKy : { $gte: new Date().setFullYear(year, 0, 1), $lt : new Date().setFullYear(year+1,0,-1) }}, (error, numberOfNewCar) =>{
                            if (error) {
                                reject(error);
                            } else {
                                app.model.car.count({ngayThanhLy : { $gte: new Date().setFullYear(year, 0, 1), $lt : new Date().setFullYear(year+1,0,-1) }}, (error, numberOfRemoveCar) =>{
                                    if (error) {
                                        reject(error);
                                    } else {
                                        const obj={};
                                        totalCar = totalCar+numberOfNewCar - numberOfRemoveCar;
                                        obj[year] ='totalCar:' + totalCar + ':newCar:' + numberOfNewCar + ':removeCar:' + numberOfRemoveCar;
        
                                        resolve(obj);
                                    } 
                                });
                            } 
                        });
                    }));
                }
                promiseList && Promise.all(promiseList).then(item => {
                    const data = {};
                    let value = '';
                    if(item && item.length){
                        item.forEach(car => {
                            value = value + Object.keys(car)[0] + ':' + Object.values(car)[0] + ';';
                        });
                    }
                    data.car = value;
                    app.model.setting.set(data, error => {
                        if (error) {
                            res.send({ error: 'Update số xe hàng năm bị lỗi' });
                        } else {
                            res.send({carData: data || null });
                        }
                    });
                }).catch(error => console.error(error) || res.send({ error }));
          }
      });
    });


    // Hook upload images ---------------------------------------------------------------------------------------------------------------------------
    const uploadSettingImage = (fields, files, done) => {
        if (files.SettingImage && files.SettingImage.length > 0) {
            console.log('Hook: uploadSettingImage => ' + fields.userData);
            const srcPath = files.SettingImage[0].path;

            if (['logo', 'contact', 'subscribe'].includes(fields.userData.toString())) {
                app.state.get(fields.userData, (_, oldImage) => {
                    oldImage && app.deleteImage(oldImage);
                    let destPath = `/img/${fields.userData}${app.path.extname(srcPath)}`;
                    app.fs.rename(srcPath, app.path.join(app.publicPath, destPath), (error) => {
                        if (error == null) {
                            destPath += '?t=' + new Date().getTime().toString().slice(-8);
                            app.state.set(fields.userData, destPath, (error) => done({ image: destPath, error }));
                        } else {
                            done({ error });
                        }
                    });
                });
            } else {
                app.deleteImage(srcPath);
            }
        }
    };

    app.uploadHooks.add('uploadSettingImage', (req, fields, files, params, done) =>
        app.permission.has(req, () => uploadSettingImage(fields, files, done), done, 'system:settings'));
};