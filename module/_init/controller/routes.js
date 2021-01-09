module.exports = (app) => {
    const menuDashboard = {
        parentMenu: { index: 100, title: 'Dashboard', icon: 'fa-dashboard', link: '/user/dashboard' }
    };
    const menuProfile = {
        parentMenu: app.parentMenu.user,
        menus: {
            1010: { title: 'Hồ sơ cá nhân', link: '/user/profile', icon: 'fa-id-card', backgroundColor: '#032b91', groupIndex: 0 }
        }
    };
    const menuSettings = {
        parentMenu: app.parentMenu.setting,
        menus: {
            2010: { title: 'Thông tin chung', link: '/user/multimedia', icon: 'fa-gear', backgroundColor: '#0091EA' }
        },
    };

    app.permission.add(
        { name: 'dashboard:standard', menu: menuDashboard },
        { name: 'user:login', menu: menuProfile },
        { name: 'system:settings', menu: menuSettings },
        { name: 'statistic' },
    );

    app.get('/user/dashboard', app.permission.check('dashboard:standard'), app.templates.admin);
    app.get('/user/settings', app.permission.check('system:settings'), app.templates.admin);
    app.get('/user/multimedia', app.permission.check('system:settings'), app.templates.admin);
    ['/index.htm(l)?', '/404.htm(l)?', '/request-permissions(/:roleId?)', '/request-login'].forEach((route) => app.get(route, app.templates.home));

    // System data ----------------------------------------------------------------------------------------------------------------------------------
    app.state = {
        data: {
            todayViews: 0,
            allViews: 0,
            logo: '/img/favicon.jpg',
            map: '/img/map.jpg',
            footer: '/img/footer.jpg',
            facebook: 'https://www.facebook.com/bachkhoa.oisp',
            youtube: '',
            twitter: '',
            instagram: '',
            latitude: 10.7744962,
            longitude: 106.6606518,
            email: app.email.from,
            emailPassword: app.email.password,
            mobile: '(08) 2214 6555',
            address: 'Block B4 - Ho Chi Minh City University of Technology | 268 Ly Thuong Kiet Street, District 10, Hochiminh City, Vietnam',
            addressList: JSON.stringify([]),
        },

        refresh: (done) => {
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
                done && done();
            });
        },
    };

    // Count views ----------------------------------------------------------------------------------------------------------------------------------
    app.schedule('*/1 * * * *', () => {
        app.redis.mget([`${app.appName}:todayViews`, `${app.appName}:allViews`], (error, result) => {
            if (error == null && result) {
                app.io.emit('count', result);

                app.state.data.todayViews = result.todayViews;
                app.state.data.allViews = result.allViews;
                app.model.setting.set(result);
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
            if (req.body.latitude != null || req.body.latitude == '') {
                changes.latitude = req.body.latitude.trim();
            }
            if (req.body.longitude != null || req.body.longitude == '') {
                changes.longitude = req.body.longitude.trim();
            }
            if (req.body.addressList != null || req.body.addressList == '') {
                changes.addressList = req.body.addressList.trim();
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
        if (req.session.user) {
            data.user = req.session.user;
        }

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
                })
            } else {
                res.send(data)
            }
        });
    });

    app.get('/api/statistic', app.permission.check('statistic'), (req, res) => {
        app.model.user.count({}, (error, numberOfUser) => {
            res.send({ numberOfUser: numberOfUser || 0 });
        });
    });

    app.get('/api/menu/path', (req, res) => {
        let pathname = req.query.pathname;
        if (pathname) {
            // let pathname = app.url.parse(req.headers.referer).pathname;
            if (pathname.length > 1 && pathname.endsWith('/'))
                pathname = pathname.substring(0, pathname.length - 1);
            if (!pathname) pathname = '/';
            const menu = app.menus[pathname];
            if (menu) {
                const menuComponents = [];
                const getComponent = (index, componentIds, components, done) => {
                    if (index < componentIds.length) {
                        app.model.component.get(componentIds[index], (error, component) => {
                            if (error || component == null) {
                                getComponent(index + 1, componentIds, components, done);
                            } else {
                                component = app.clone(component);
                                component.components = [];
                                components.push(component);

                                const getNextComponent = (view) => {
                                    if (view) component.view = view;
                                    if (component.componentIds) {
                                        getComponent(0, component.componentIds, component.components, () => {
                                            getComponent(index + 1, componentIds, components, done)
                                        });
                                    } else {
                                        getComponent(index + 1, componentIds, components, done);
                                    }
                                };

                                if (component.viewType && component.viewId) {
                                    const viewType = component.viewType;
                                    if (component.viewId && (viewType == 'carousel' || viewType == 'content' || viewType == 'event')) {
                                        app.model[viewType].get(component.viewId, (error, item) => getNextComponent(item));
                                    } else {
                                        getNextComponent();
                                    }
                                } else {
                                    getNextComponent();
                                }
                            }
                        });
                    } else {
                        done();
                    }
                };

                if (menu.component) {
                    res.send(menu.component);
                } else if (menu.componentId) {
                    getComponent(0, [menu.componentId], menuComponents, () => {
                        menu.component = menuComponents[0];
                        res.send(menu.component);
                    });
                } else {
                    res.send({ error: 'Invalid menu!' });
                }
            } else {
                res.send({ error: 'Invalid link!' });
            }
        } else {
            res.send({ error: 'Invalid link!' });
        }
    });

    app.delete('/api/clear-session', app.permission.check(), (req, res) => {
        req.session[req.body.sessionName] = null; //TODO: delete Redis session
        res.end();
    });


    // Hook readyHooks ------------------------------------------------------------------------------------------------------------------------------
    app.readyHooks.add('readyInit', {
        ready: () => app.model != null && app.model.setting != null && app.state,
        run: () => app.model.setting.init(app.state.data, () => app.state.refresh()),
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