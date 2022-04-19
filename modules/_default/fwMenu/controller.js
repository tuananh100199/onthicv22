module.exports = app => {
    const menuMenu = {
        parentMenu: app.parentMenu.setting,
        menus: {
            2090: { title: 'Menu', link: '/user/menu', icon: 'fa-bars', backgroundColor: '#00b0ff' }
        }
    };
    const menuComponent = {
        parentMenu: app.parentMenu.setting,
        menus: {
            2100: { title: 'Thành phần giao diện', link: '/user/component', icon: 'fa-object-group', backgroundColor: '#00897b' }
        }
    };
    app.permission.add(
        { name: 'menu:read', menu: menuMenu }, { name: 'menu:write' }, { name: 'menu:delete' },
        { name: 'component:read', menu: menuComponent }, { name: 'component:write' }, { name: 'component:delete' },
    );

    app.get('/user/menu/:_id', app.permission.check('menu:read'), app.templates.admin);
    app.get('/user/menu', app.permission.check('menu:read'), app.templates.admin);
    app.get('/user/component', app.permission.check('component:read'), app.templates.admin);
    app.get('/user/content/:_id', app.permission.check('component:read'), app.templates.admin);
    app.get('/user/login-form/:_id', app.permission.check('component:read'), app.templates.admin);
    app.get('/user/list-content/:_id', app.permission.check('component:read'), app.templates.admin);
    app.get('/user/carousel/:_id', app.permission.check('component:read'), app.templates.admin);
    app.get('/user/statistic/:_id', app.permission.check('component:read'), app.templates.admin);
    app.get('/user/staff-group/:_id', app.permission.check('component:read'), app.templates.admin);
    app.get('/user/list-video/:_id', app.permission.check('component:read'), app.templates.admin);
    app.get('/user/course/edit/:_id', app.permission.check('component:read'), app.templates.admin);

    // APIs -----------------------------------------------------------------------------------------------------------------------------------------
    const buildAppMenus = () => {
        const menus = {},
            getMenu = (index, items, done) => {
                if (index < items.length) {
                    const item = items[index];
                    menus[item.link] = item;

                    if (item.submenus && item.submenus.length > 0) {
                        getMenu(0, item.submenus, () => getMenu(index + 1, items, done));
                    } else {
                        getMenu(index + 1, items, done);
                    }
                } else {
                    done();
                }
            };

        app.model.menu.getAll({}, (error, menuTree) =>
            getMenu(0, menuTree, () => app.database.redis.set(app.database.redis.menusKey, JSON.stringify(menus))));
    };

    app.get('/api/menu/all', app.permission.check('menu:read'), (req, res) => {
        app.model.menu.getAll({}, (error, menuTree) => res.send({ error, items: menuTree }));
    });

    app.get('/api/menu', app.permission.check('menu:read'), (req, res) => {
        const { _id } = req.query;
        app.model.menu.get(_id, (error, menu) => {
            if (error || menu == null) {
                res.send({ error: 'Lỗi khi lấy menu!' });
            } else {
                const getComponent = (level, index, componentIds, components, done) => {
                    if (index < componentIds.length) {
                        app.model.component.get(componentIds[index], (error, component) => {
                            if (error || component == null) {
                                res.send({ error: 'Lỗi khi lấy component!' });
                            } else {
                                component = app.clone(component);
                                component.components = [];
                                components.push(component);

                                new Promise(resolve => {
                                    const componentModel = component.viewType && component.viewId ? app.componentModel[component.viewType] : null;
                                    if (componentModel == null) {
                                        resolve('<empty>');
                                    } else if (componentModel.get) {
                                        componentModel.get(component.viewId, (_, item) => resolve(item ? item.title : '<empty>'));
                                    } else {
                                        resolve(component.viewType);
                                    }
                                }).then((viewName) => {
                                    component.viewName = viewName;
                                    if (component.componentIds) {
                                        getComponent(level + 1, 0, component.componentIds, component.components, () => {
                                            getComponent(level, index + 1, componentIds, components, done);
                                        });
                                    } else {
                                        getComponent(level, index + 1, componentIds, components, done);
                                    }
                                });
                            }
                        });
                    } else {
                        done();
                    }
                };

                const menuComponentIds = [],
                    menuComponents = [];
                new Promise((resolve) => {
                    if (menu.componentId == null || menu.componentId == undefined) {
                        app.model.component.create({ className: 'container', viewType: '<empty>' }, (error, component) => {
                            if (component) {
                                menu.componentId = component._id;
                                menu.save(resolve);
                            } else {
                                res.send({ error: 'Tạo component bị lỗi!' });
                            }
                        });
                    } else {
                        resolve();
                    }
                }).then(() => {
                    menuComponentIds.push(menu.componentId);
                    getComponent(0, 0, menuComponentIds, menuComponents, () => {
                        menu = app.clone(menu);
                        menu.component = menuComponents[0];
                        res.send({ menu });
                    });
                });
            }
        });
    });

    app.post('/api/menu', app.permission.check('menu:write'), (req, res) => {
        const data = { title: 'Tên menu', link: '#', active: false };
        if (req.body._id) data.parentId = req.body._id;
        app.model.menu.create(data, (error, item) => res.send({ error, item }));
    });

    app.put('/api/menu', app.permission.check('menu:write'), (req, res) =>
        app.model.menu.update(req.body._id, req.body.changes, (error, item) => {
            !error && buildAppMenus();
            res.send({ error, item });
        })
    );

    app.put('/api/menu/priorities', app.permission.check('menu:write'), (req, res) => {
        let error = null;
        const changes = req.body.changes,
            solve = (index) => {
                if (index < changes.length) {
                    const item = changes[index];
                    if (item) {
                        app.model.menu.update(item._id, { priority: item.priority }, err => {
                            if (err) error = err;
                            solve(index + 1);
                        });
                    }
                } else {
                    !error && buildAppMenus();
                    res.send({ error });
                }
            };
        solve(0);
    });

    app.delete('/api/menu', app.permission.check('menu:write'), (req, res) => {
        app.model.menu.delete(req.body._id, error => {
            !error && buildAppMenus();
            res.send({ error });
        });
    });


    app.get('/api/menu/path', (req, res) => {
        new Promise((resolve, reject) => { // Get menus from Redis
            app.database.redis.get(app.database.redis.menusKey, (error, menus) => {
                if (error) {
                    reject('System has errors!');
                } else {
                    let pathname = req.query.pathname;
                    if (pathname) {
                        if (pathname.length > 1 && pathname.endsWith('/')) pathname = pathname.substring(0, pathname.length - 1);
                        if (!pathname) pathname = '/';
                        const menu = JSON.parse(menus)[pathname];
                        menu ? resolve(menu) : reject('Invalid link!');
                    } else {
                        reject('Invalid link!');
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
                                    getNextComponent();
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


    // Hook readyHooks ------------------------------------------------------------------------------------------------------------------------------
    app.readyHooks.add('MenuReady', {
        ready: () => app.database.redis,
        run: () => {
            app.database.redis.menusKey = app.appName + ':menus';
            app.primaryWorker && buildAppMenus();
        },
    });

    // Component ------------------------------------------------------------------------------------------------------------------------------------
    app.post('/api/menu/component', app.permission.check('component:write'), (req, res) => {
        app.model.component.get(req.body.parentId, (error, parent) => {
            if (error || parent == null) {
                res.send({ error: 'Id không chính xác!' });
            } else {
                const data = app.clone(req.body.component);
                data.componentIds = [];
                app.model.component.create(data, (error, component) => {
                    if (error || component == null) {
                        error && console.error(error);
                        res.send({ error: 'Tạo component bị lỗi!' });
                    } else {
                        parent.componentIds.push(component._id);
                        parent.save(error => res.send({ error, component }));
                    }
                });
            }
        });
    });

    app.put('/api/menu/component', app.permission.check('component:write'), (req, res) => {
        app.model.component.update(req.body._id, req.body.changes, error => res.send({ error }));
    });

    app.put('/api/menu/component/swap', app.permission.check('component:write'), (req, res) => {
        const isMoveUp = req.body.isMoveUp.toString() == 'true';
        app.model.component.swapPriority(req.body._id, isMoveUp, error => res.send({ error }));
    });

    app.delete('/api/menu/component', app.permission.check('component:write'), (req, res) => {
        app.model.component.delete(req.body._id, (error) => res.send({ error }));
    });

    app.get('/api/menu/component/type/:pageType', app.permission.check('component:read'), (req, res) => {
        const componentModel = app.componentModel[req.params.pageType];
        if (componentModel && componentModel.getAll) {
            componentModel.getAll((error, items) => res.send({
                error,
                items: items.map(item => ({ _id: item._id, text: item.title }))
            }));
        } else {
            res.send({ error: 'Lỗi!' });
        }
    });
};
