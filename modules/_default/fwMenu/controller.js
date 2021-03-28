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
    app.get('/user/list-content/:_id', app.permission.check('component:read'), app.templates.admin);
    app.get('/user/carousel/:_id', app.permission.check('component:read'), app.templates.admin);
    app.get('/user/statistic/:_id', app.permission.check('component:read'), app.templates.admin);
    app.get('/user/staff-group/:_id', app.permission.check('component:read'), app.templates.admin);
    app.get('/user/list-video/:_id', app.permission.check('component:read'), app.templates.admin);
    app.get('/user/course/edit/:_id', app.permission.check('component:read'), app.templates.admin);

    // APIs -----------------------------------------------------------------------------------------------------------------------------------------
    app.buildAppMenus = (menuTree, callback) => {
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

        if (menuTree) {
            getMenu(0, menuTree, () => {
                app.redis.set(app.redis.menusKey, JSON.stringify(menus));
                callback && callback();
            });
        } else {
            app.model.menu.getAll({}, (error, menuTree) => getMenu(0, menuTree, () => {
                app.redis.set(app.redis.menusKey, JSON.stringify(menus));
                callback && callback();
            }));
        }
    }

    app.get('/api/menu/all', app.permission.check('menu:read'), (req, res) => {
        app.model.menu.getAll({}, (error, menuTree) => res.send({ error, items: menuTree }));
    });

    app.get('/api/menu', app.permission.check('menu:read'), (req, res) => { //TODO: hàm này coi lại nha Tùng
        app.model.menu.get(req.query._id, (error, menu) => {
            if (error || menu == null) {
                res.send({ error: 'Lỗi khi lấy menu!' });
            } else {
                const menuComponentIds = [],
                    menuComponents = [];
                const getComponent = (level, index, componentIds, components, done) => {
                    if (index < componentIds.length) {
                        app.model.component.get(componentIds[index], (error, component) => {
                            if (error || component == null) {
                                res.send({ error: 'Lỗi khi lấy thành phần trang!' });
                            } else {
                                component = app.clone(component);
                                component.components = [];
                                components.push(component);

                                const getNextComponent = (viewName) => {
                                    component.viewName = viewName;
                                    if (component.componentIds) {
                                        getComponent(level + 1, 0, component.componentIds, component.components, () => {
                                            getComponent(level, index + 1, componentIds, components, done);
                                        });
                                    } else {
                                        getComponent(level, index + 1, componentIds, components, done);
                                    }
                                };
                                if (component.viewType && component.viewId) {
                                    const viewType = component.viewType;
                                    if (component.viewId && (['carousel', 'content', 'video', 'statistic', 'list contents'].indexOf(viewType) != -1)) {
                                        app.model[viewType].get(component.viewId, (error, item) =>
                                            getNextComponent(item ? item.title : '<empty>'));
                                    } else if (component.viewId && viewType == 'list videos') {
                                        app.model.listVideo.get(component.viewId, (error, item) =>
                                            getNextComponent(item ? item.title : '<empty>'));
                                    } else if (component.viewId && viewType == 'staff group') {
                                        app.model.staffGroup.get(component.viewId, (error, item) =>
                                            getNextComponent(item ? item.title : '<empty>'));
                                    } else if (['all news', 'last news', 'subscribe', 'all staffs', 'all courses', 'last course', 'all course types'].indexOf(viewType) != -1) {
                                        getNextComponent(viewType);
                                    } else {
                                        getNextComponent('<empty>');
                                    }
                                } else {
                                    getNextComponent('<empty>');
                                }
                            }
                        });
                    } else {
                        done();
                    }
                }

                const getAllComponents = () => {
                    menuComponentIds.push(menu.componentId);
                    getComponent(0, 0, menuComponentIds, menuComponents, () => {
                        menu = app.clone(menu);
                        menu.component = menuComponents[0];
                        res.send({ menu });
                    });
                }

                if (menu.componentId == null || menu.componentId == undefined) {
                    app.model.component.create({ className: 'container', viewType: '<empty>' }, (error, component) => {
                        menu.componentId = component._id;
                        menu.save(getAllComponents);
                    });
                } else {
                    getAllComponents();
                }
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
            if (error == null) {
                app.buildAppMenus(null, () => app.worker.refreshState({ menuUpdate: true }));
            }
            res.send({ error, item })
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
                    res.send({ error });
                }
            };
        solve(0);
    });

    app.delete('/api/menu', app.permission.check('menu:write'), (req, res) => {
        app.model.menu.delete(req.body._id, error => res.send({ error }));
    });

    // Hook readyHooks ------------------------------------------------------------------------------------------------------------------------------
    app.readyHooks.add('MenuReady', {
        ready: () => app.redis,
        run: () => {
            app.redis.menusKey = app.appName + ':menus';
            process.env['enableInit'] == 'true' && app.buildAppMenus();
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
                        if (error) console.log(error);
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

    app.get('/api/menu/component/type/:pageType', app.permission.check('component:read'), (req, res) => { //TODO: hàm này coi lại nha Tùng
        const pageType = req.params.pageType;
        if (pageType == 'carousel') {
            app.model.carousel.getByActive(true, (error, items) => {
                res.send({
                    error,
                    items: items.map(item => ({ _id: item._id, text: item.title }))
                })
            });
        } else if (pageType == 'staff group') {
            app.model.staffGroup.getAll((error, items) => {
                res.send({
                    error,
                    items: items.map(item => ({ _id: item._id, text: item.title }))
                })
            });
        } else if (pageType == 'video') {
            app.model.video.getAll((error, items) => {
                res.send({
                    error,
                    items: items.map(item => ({ _id: item._id, text: item.title }))
                })
            });
        }
        else if (pageType == 'content') {
            app.model.content.getAll((error, items) => {
                res.send({
                    error,
                    items: items.map(item => ({ _id: item._id, text: item.title }))
                })
            });
        } else if (pageType == 'statistic') {
            app.model.statistic.getAll((error, items) => {
                res.send({
                    error,
                    items: items.map(item => ({ _id: item._id, text: item.title }))
                })
            });
        } else if (pageType == 'list videos') {
            app.model.listVideo.getAll((error, items) => {
                res.send({
                    error,
                    items: items.map(item => ({ _id: item._id, text: item.title }))
                })
            });
        } else if (pageType == 'list contents') {
            app.model.listContent.getAll((error, items) => {
                res.send({
                    error,
                    items: items.map(item => ({ _id: item._id, text: item.title }))
                })
            });
        } else if (pageType == 'course') {
            app.model.course.getAll((error, items) => {
                res.send({
                    error,
                    items: items.map(item => ({ _id: item._id, text: item.title }))
                })
            });
        } else {
            res.send({ error: 'Lỗi!' });
        }
    });
};
