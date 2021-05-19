module.exports = (app) => {
    const menuSettings = {
        parentMenu: app.parentMenu.setting,
        menus: {
            2010: { title: 'Thông tin chung', link: '/user/setting', icon: 'fa-gear', backgroundColor: '#0091EA' }
        },
    };

    app.permission.add(
        { name: 'dashboard:standard', menu: { parentMenu: { index: 100, title: 'Dashboard', icon: 'fa-dashboard', link: '/user/dashboard' } } },
        { name: 'user:login', menu: { parentMenu: app.parentMenu.user } },
        { name: 'system:settings', menu: menuSettings },
        { name: 'statistic:read' },
    );

    app.get('/user/dashboard', app.permission.check('dashboard:standard'), app.templates.admin);
    app.get('/user/setting', app.permission.check('system:settings'), app.templates.admin);
    ['/index.htm(l)?', '/404.htm(l)?', '/request-permissions(/:roleId?)', '/request-login'].forEach((route) => app.get(route, app.templates.home));

    // API ------------------------------------------------------------------------------------------------------------------------------------------
    app.put('/api/system', app.permission.check('system:settings'), (req, res) => {
        let { emailPassword, email, address, mobile, fax, facebook, youtube, twitter, instagram } = req.body;
        if (emailPassword) {
            app.model.setting.set({ emailPassword }, error => {
                if (error) {
                    res.send({ error: 'Update email password failed!' });
                } else {
                    app.state.get((error, data) => error ? res.send({ error }) : res.send(data));
                }
            });
        } else {
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

    app.get('/api/state', (req, res) => {
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
                            }
                            let index = 0;
                            students.forEach(student => {
                                if (student.course) {
                                    index++;
                                    data.user.menu['5000'].menus[5000 + index] = {
                                        title: 'Khóa học ' + student.course.name,
                                        link: '/user/hoc-vien/khoa-hoc/' + student.course._id,
                                        permissions: ['studentCourse:read']
                                    };
                                }
                            });
                            if (index == 0) delete data.user.menu['5000'];
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
                                res.send({ numberOfUser: numberOfUser || 0, numberOfCourse: numberOfCourse || 0, numberOfNews: numberOfNews || 0 });
                            }
                        });
                    }
                });
            }
        });
    });


    // Hook upload images ---------------------------------------------------------------------------------------------------------------------------
    const uploadSettingImage = (fields, files, done) => {
        if (files.SettingImage && files.SettingImage.length > 0) {
            console.log('Hook: uploadSettingImage => ' + fields.userData);
            const srcPath = files.SettingImage[0].path;

            if (['logo', 'footer', 'contact', 'subscribe'].includes(fields.userData.toString())) {
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