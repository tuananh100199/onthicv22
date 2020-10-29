module.exports = (app) => {
    app.permission.add(
        {
            name: 'dashboard:standard',
            menu: { parentMenu: { index: 100, title: 'Dashboard', icon: 'fa-dashboard', link: '/user/dashboard', }, },
        },
        {
            name: 'user:login',
            menu: {
                parentMenu: { index: 1000, title: 'Personal information', icon: 'fa-user', },
                menus: { 1010: { title: 'Profile', link: '/user' } },
            },
        },
        {
            name: 'system:settings',
            menu: {
                parentMenu: { index: 2000, title: 'Configure', icon: 'fa-cog' },
                menus: { 2010: { title: 'General', link: '/user/settings' } },
            },
        }
    );

    app.get('/user/dashboard', app.permission.check('dashboard:standard'), app.templates.admin);
    app.get('/user/settings', app.permission.check('system:settings'), app.templates.admin);
    // Home -----------------------------------------------------------------------------------------------------------------------------------------
    [
        '/index.htm(l)?',
        '/contact(.htm(l)?)?',
        '/registered(.htm(l)?)?',
        '/404.htm(l)?',
        '/request-permissions(/:roleId?)',
        '/request-login',
        '/active-user/:userId',
        '/forgot-password/:userId/:userToken',
    ].forEach((route) => app.get(route, app.templates.home));

    // API ------------------------------------------------------------------------------------------------------------------------------------------
    app.put('/api/system', app.permission.check('system:settings'), (req, res) => {
        const changes = {};
        if (req.body.password) {
            changes.emailPassword = req.body.password;
            app.model.setting.set(changes, (error) => {
                if (error) {
                    res.send({ error: 'Update email password failed!' });
                } else {
                    app.data.emailPassword = req.body.password;
                    res.send(app.data);
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
                    if (changes.email) {
                        app.data.email = changes.email;
                    }
                    app.data = app.clone(app.data, changes);
                    res.send(app.data);
                }
            });
        }
    });

    app.get('/api/state', (req, res) => {
        const data = app.clone(app.data);
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
            res.send(data);
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
        const sessionName = req.body.sessionName;
        req.session[sessionName] = null;
        res.end();
    });

    // Hook upload images ---------------------------------------------------------------------------------------------------------------------------s
    const uploadSettingImage = (req, fields, files, params, done) => {
        if (files.SettingImage && files.SettingImage.length > 0) {
            console.log('Hook: uploadSettingImage => ' + fields.userData);
            const srcPath = files.SettingImage[0].path;

            if (fields.userData == 'logo') {
                app.deleteImage(app.data.logo);
                let destPath = '/img/favicon' + app.path.extname(srcPath);
                app.fs.rename(srcPath, app.path.join(app.publicPath, destPath), (error) => {
                    if (error == null) {
                        destPath += '?t=' + new Date().getTime().toString().slice(-8);
                        app.model.setting.set({ logo: destPath }, (error) => {
                            if (error == null) app.data.logo = destPath;
                            done({ image: app.data.logo, error });
                        });
                    } else {
                        done({ error });
                    }
                });
            } else if (fields.userData == 'footer' && files.SettingImage && files.SettingImage.length > 0) {
                app.deleteImage(app.data.footer);
                let destPath = '/img/footer' + app.path.extname(srcPath);
                app.fs.rename(srcPath, app.path.join(app.publicPath, destPath), (error) => {
                    if (error == null) {
                        destPath += '?t=' + new Date().getTime().toString().slice(-8);
                        app.model.setting.set({ footer: destPath }, (error) => {
                            if (error == null) app.data.footer = destPath;
                            done({ image: app.data.footer, error });
                        });
                    } else {
                        done({ error });
                    }
                });
            } else if (fields.userData == 'map' && files.SettingImage && files.SettingImage.length > 0) {
                app.deleteImage(app.data.map);
                let destPath = '/img/map' + app.path.extname(srcPath);
                app.fs.rename(srcPath, app.path.join(app.publicPath, destPath), (error) => {
                    if (error == null) {
                        destPath += '?t=' + new Date().getTime().toString().slice(-8);
                        app.model.setting.set({ map: destPath }, (error) => {
                            if (error == null) app.data.map = destPath;
                            done({ image: app.data.map, error });
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
    app.redirectToWebpackServer();
};
