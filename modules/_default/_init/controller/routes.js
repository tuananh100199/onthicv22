module.exports = (app) => {
    const menuDashboard = {
        parentMenu: { index: 100, title: 'Dashboard', icon: 'fa-dashboard', link: '/user/dashboard' }
    };
    const menuProfile = {
        parentMenu: app.parentMenu.user,
    };
    const menuSettings = {
        parentMenu: app.parentMenu.setting,
        menus: {
            2010: { title: 'Thông tin chung', link: '/user/setting', icon: 'fa-gear', backgroundColor: '#0091EA' }
        },
    };

    app.permission.add({ name: 'dashboard:standard', menu: menuDashboard }, { name: 'user:login', menu: menuProfile }, { name: 'system:settings', menu: menuSettings }, { name: 'statistic' },);

    app.get('/user/dashboard', app.permission.check('dashboard:standard'), app.templates.admin);
    app.get('/user/setting', app.permission.check('system:settings'), app.templates.admin);
    ['/index.htm(l)?', '/404.htm(l)?', '/request-permissions(/:roleId?)', '/request-login'].forEach((route) => app.get(route, app.templates.home));

    // System data ----------------------------------------------------------------------------------------------------------------------------------
    app.state = {
        data: {
            todayViews: 0,
            allViews: 0,
            logo: '/img/favicon.png',
            map: '/img/map.png',
            footer: '/img/footer.jpg',
            contact: '/img/contact.jpg',
            subscribe: '/img/subcribe.jpg',
            facebook: 'https://www.facebook.com',
            youtube: '',
            twitter: '',
            instagram: '',
            email: app.email.from,
            emailPassword: app.email.password,
            mobile: '(08) 2214 6555',
            address: '',
        },

        refresh: (option, done) => {
            if (typeof option == 'function') {
                done = option;
                option = {};
            }
            const keys = Object.keys(app.state.data);
            app.model.setting.get(...keys, result => {
                if (result) {
                    keys.forEach(key => {
                        if (result[key] != undefined) {
                            if (key == 'todayViews' || key == 'allViews') {
                                app.state.data[key] = Number(result[key]);
                            } else {
                                app.state.data[key] = result[key];
                            }
                        }
                    });
                }
                if (option && option.menuUpdate) {
                    app.buildAppMenus(null, () => done && done());
                } else {
                    done && done()
                }
            });
        },
    };

    // Count views ----------------------------------------------------------------------------------------------------------------------------------
    app.schedule('*/1 * * * *', () => {
        app.redis.mget([`${app.appName}:todayViews`, `${app.appName}:allViews`], (error, result) => {
            if (error == null && result) {
                app.state.data.todayViews = Number(result[0]);
                app.state.data.allViews = Number(result[1]);
                app.model.setting.set({ todayViews: Number(result[0]), allViews: Number(result[1]) });
            }
        });
    });
    app.schedule('0 0 * * *', () => {
        app.redis.set(`${app.appName}:todayViews`, 0);
        app.model.setting.set({ todayViews: 0 });
    });

    // API ------------------------------------------------------------------------------------------------------------------------------------------
    app.put('/api/system', app.permission.check('system:settings'), (req, res) => {
        const changes = {};
        if (req.body.password) {
            changes.emailPassword = req.body.password;
            app.model.setting.set(changes, (error) => {
                if (error) {
                    res.send({ error: 'Update email password failed!' });
                } else {
                    app.model.setting.set({ emailPassword: req.body.password });
                    res.send(app.state.data);
                }
            });
        } else {
            if (req.body.address != null || req.body.address == '') {
                changes.address = req.body.address.trim();
            }
            if (req.body.email && req.body.email != '') {
                changes.email = req.body.email.trim();
            }
            if (req.body.mobile != null || req.body.mobile == '') {
                changes.mobile = req.body.mobile.trim();
            }
            if (req.body.fax != null || req.body.fax == '') {
                changes.fax = req.body.fax.trim();
            }
            if (req.body.facebook != null || req.body.facebook == '') {
                changes.facebook = req.body.facebook.trim();
            }
            if (req.body.youtube != null || req.body.youtube == '') {
                changes.youtube = req.body.youtube.trim();
            }
            if (req.body.twitter != null || req.body.twitter == '') {
                changes.twitter = req.body.twitter.trim();
            }
            if (req.body.instagram != null || req.body.instagram == '') {
                changes.instagram = req.body.instagram.trim();
            }
            app.model.setting.set(changes, (error) => {
                if (error) {
                    res.send({ error: 'Update failed!' });
                } else {
                    app.model.setting.set(changes, () => {
                        app.worker && app.worker.refreshState();
                        app.state.refresh(() => res.send(app.state.data));
                    });
                }
            });
        }
    });

    app.get('/api/state', (req, res) => {
        const data = app.clone(app.state.data);
        delete data.emailPassword;

        if (app.isDebug) data.isDebug = true;
        if (req.session.user) data.user = req.session.user;

        app.model.menu.getAll({ active: true }, (error, menus) => {
            if (menus) {
                data.menus = menus.slice();
                data.menus.forEach((menu) => {
                    menu.content = '';
                    if (menu.submenus) {
                        menu.submenus.forEach((submenu) => (submenu.content = ''));
                    }
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
    });

    app.get('/api/statistic', app.permission.check('statistic'), (req, res) => {
        app.model.user.count({}, (error1, numberOfUser) => {
            if (error1) {
                res.send({ error1 })
            } else {
                app.model.news.count({}, (error2, numberOfNews) => {
                    if (error2) {
                        res.send({ error2 })
                    } else {
                        app.model.course.count({}, (error3, numberOfCourse) => {
                            if (error3) {
                                res.send({ error3 })
                            } else {
                                res.send({ numberOfUser: numberOfUser || 0, numberOfCourse: numberOfCourse || 0, numberOfNews: numberOfNews || 0 });
                            }
                        });
                    }
                });
            }
        });
    });

    app.get('/api/menu/path', (req, res) => {
        new Promise((resolve, reject) => { // Get menus from Redis
            app.redis.get(app.redis.menusKey, (error, menus) => {
                if (error) {
                    reject('System has errors!');
                } else {
                    let pathname = req.query.pathname;
                    if (pathname) {
                        if (pathname.length > 1 && pathname.endsWith('/'))
                            pathname = pathname.substring(0, pathname.length - 1);
                        if (!pathname) pathname = '/';
                        const menu = (menus ? JSON.parse(menus) : app.state.menus)[pathname]; // TODO: const menu = JSON.parse(menus)[pathname];
                        menu ? resolve(menu) : reject('Invalid link!');
                    } else {
                        reject('Invalid link!')
                    }
                }
            });
        }).then(menu => {
            if (menu.component) {
                res.send(menu.component);
            } else if (menu.componentId) {
                const getComponent = (index, componentIds, components, done) => {
                    if (index < componentIds.length) {
                        app.model.component.get(componentIds[index], (error, component) => {
                            if (error || component == null) {
                                getComponent(index + 1, componentIds, components, done);
                            } else {
                                component = app.clone(component);
                                component.components = [];
                                components.push(component);

                                // Duyệt hết các components con rồi mới duyệt đến component kế tiếp
                                const getNextComponent = () => getComponent(index + 1, componentIds, components, done);
                                component.componentIds ?
                                    getComponent(0, component.componentIds, component.components, getNextComponent) :
                                    getNextComponent()
                            }
                        });
                    } else {
                        done();
                    }
                };

                const menuComponents = [];
                getComponent(0, [menu.componentId], menuComponents, () => {
                    menu.component = menuComponents[0];
                    res.send(menu.component);
                });
            } else {
                res.send({ error: 'Invalid menu!' });
            }
        }).catch(error => res.send({ error }));
    });


    // Hook readyHooks ------------------------------------------------------------------------------------------------------------------------------
    app.readyHooks.add('readyInit', {
        ready: () => app.model != null && app.model.setting != null && app.state,
        run: () => {
            const enableInit = process.env['enableInit'] == 'true';
            if (enableInit) {
                app.model.setting.init(app.state.data, () => app.state.refresh())
            } else {
                setTimeout(() => { app.state.refresh() }, 200);
            }
        },
    });

    // Hook upload images ---------------------------------------------------------------------------------------------------------------------------s
    const uploadSettingImage = (req, fields, files, params, done) => {
        if (files.SettingImage && files.SettingImage.length > 0) {
            console.log('Hook: uploadSettingImage => ' + fields.userData);
            const srcPath = files.SettingImage[0].path;

            if (fields.userData == 'logo') {
                app.deleteImage(app.state.data.logo);
                let destPath = '/img/favicon' + app.path.extname(srcPath);
                app.fs.rename(srcPath, app.path.join(app.publicPath, destPath), (error) => {
                    if (error == null) {
                        destPath += '?t=' + new Date().getTime().toString().slice(-8);
                        app.model.setting.set({ logo: destPath }, (error) => {
                            if (error == null) app.state.data.logo = destPath;
                            done({ image: app.state.data.logo, error });
                        });
                    } else {
                        done({ error });
                    }
                });
            } else if (fields.userData == 'footer' && files.SettingImage && files.SettingImage.length > 0) {
                app.deleteImage(app.state.data.footer);
                let destPath = '/img/footer' + app.path.extname(srcPath);
                app.fs.rename(srcPath, app.path.join(app.publicPath, destPath), (error) => {
                    if (error == null) {
                        destPath += '?t=' + new Date().getTime().toString().slice(-8);
                        app.model.setting.set({ footer: destPath }, (error) => {
                            if (error == null) app.state.data.footer = destPath;
                            done({ image: app.state.data.footer, error });
                        });
                    } else {
                        done({ error });
                    }
                });
            } else if (fields.userData == 'contact' && files.SettingImage && files.SettingImage.length > 0) {
                app.deleteImage(app.state.data.contact);
                let destPath = '/img/contact' + app.path.extname(srcPath);
                app.fs.rename(srcPath, app.path.join(app.publicPath, destPath), (error) => {
                    if (error == null) {
                        destPath += '?t=' + new Date().getTime().toString().slice(-8);
                        app.model.setting.set({ contact: destPath }, (error) => {
                            if (error == null) app.state.data.contact = destPath;
                            done({ image: app.state.data.contact, error });
                        });
                    } else {
                        done({ error });
                    }
                });
            } else if (fields.userData == 'subscribe' && files.SettingImage && files.SettingImage.length > 0) {
                app.deleteImage(app.state.data.subscribe);
                let destPath = '/img/subscribe' + app.path.extname(srcPath);
                app.fs.rename(srcPath, app.path.join(app.publicPath, destPath), (error) => {
                    if (error == null) {
                        destPath += '?t=' + new Date().getTime().toString().slice(-8);
                        app.model.setting.set({ subscribe: destPath }, (error) => {
                            if (error == null) app.state.data.subscribe = destPath;
                            done({ image: app.state.data.subscribe, error });
                        });
                    } else {
                        done({ error });
                    }
                });
            } else if (fields.userData == 'map' && files.SettingImage && files.SettingImage.length > 0) {
                app.deleteImage(app.state.data.map);
                let destPath = '/img/map' + app.path.extname(srcPath);
                app.fs.rename(srcPath, app.path.join(app.publicPath, destPath), (error) => {
                    if (error == null) {
                        destPath += '?t=' + new Date().getTime().toString().slice(-8);
                        app.model.setting.set({ map: destPath }, (error) => {
                            if (error == null) app.state.data.map = destPath;
                            done({ image: app.state.data.map, error });
                        });
                    } else {
                        done({ error });
                    }
                });
            }
        }
    };

    app.uploadHooks.add('uploadSettingImage', (req, fields, files, params, done) =>
        app.permission.has(req, () => uploadSettingImage(req, fields, files, params, done), done, 'system:settings')
    );
};