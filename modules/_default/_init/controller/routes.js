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
    const prefixKey = `${app.appName}:state:`;
    const getStateData = (done) => {
        app.redis.keys(prefixKey + '*', (error, keys) => {
            if (error) {
                done('Errors occur when read Redis keys!');
            } else {
                app.redis.mget(keys, (error, values) => {
                    if (error) {
                        done('Errors occur when read Redis values!');
                    } else {
                        const state = {};
                        keys.forEach((key, index) => {
                            if (index < values.length) state[key.substring(prefixKey.length)] = values[index];
                        });
                        done(null, state);
                    }
                });
            }
        });
    }

    app.put('/api/system', app.permission.check('system:settings'), (req, res) => {
        let { emailPassword, email, address, mobile, fax, facebook, youtube, twitter, instagram, dangKyTuVanLink } = req.body;
        if (emailPassword) {
            app.model.setting.set({ emailPassword }, error => {
                if (error) {
                    res.send({ error: 'Update email password failed!' });
                } else {
                    getStateData((error, data) => error ? res.send({ error }) : res.send(data));
                }
            });
        } else {
            const changes = [];
            email = email ? email.trim() : '';
            if (email) changes.push(prefixKey + 'email', email.trim());
            if (address || address == '') changes.push(prefixKey + 'address', address.trim() || '');
            if (mobile || mobile == '') changes.push(prefixKey + 'mobile', mobile.trim() || '');
            if (fax || fax == '') changes.push(prefixKey + 'fax', fax.trim() || '');
            if (facebook || facebook == '') changes.push(prefixKey + 'facebook', facebook.trim() || '');
            if (youtube || youtube == '') changes.push(prefixKey + 'youtube', youtube.trim() || '');
            if (twitter || twitter == '') changes.push(prefixKey + 'twitter', twitter.trim() || '');
            if (instagram || instagram == '') changes.push(prefixKey + 'instagram', instagram.trim() || '');
            if (dangKyTuVanLink || dangKyTuVanLink == '') changes.push(prefixKey + 'dangKyTuVanLink', dangKyTuVanLink.trim() || '');

            app.redis.mset(...changes, error => console.log('error', error) || getStateData((error, data) => error ? res.send({ error }) : res.send(data)));
        }

        //TODO: email
    });

    app.get('/api/state', (req, res) => {
        getStateData((error, data) => {
            if (error) {
                res.send({ error });
            } else {
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
            }
        });

    });

    app.get('/api/statistic/dashboard', app.permission.check('statistic:read'), (req, res) => {
        app.model.user.count({}, (error, numberOfUser) => {
            if (error) {
                res.send({ error })
            } else {
                app.model.news.count({}, (error, numberOfNews) => {
                    if (error) {
                        res.send({ error })
                    } else {
                        app.model.course.count({}, (error, numberOfCourse) => {
                            if (error) {
                                res.send({ error })
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
                        const menu = JSON.parse(menus)[pathname];
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
                getComponent(0, [menu.componentId], menuComponents, () => res.send(menuComponents[0]));
            } else {
                res.send({ error: 'Invalid menu!' });
            }
        }).catch(error => res.send({ error }));
    });


    // Hook upload images ---------------------------------------------------------------------------------------------------------------------------
    const uploadSettingImage = (fields, files, done) => {
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
        app.permission.has(req, () => uploadSettingImage(fields, files, done), done, 'system:settings')
    );
};