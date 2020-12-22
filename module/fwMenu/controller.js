module.exports = app => {
    const menuMenu = {
        parentMenu: { index: 2000, title: 'Cấu hình', icon: 'fa-cog' },
        menus: { 2090: { title: 'Menu', link: '/user/menu' } }
    };
    const menuComponent = {
        parentMenu: { index: 2000, title: 'Cấu hình', icon: 'fa-cog' },
        menus: { 2100: { title: 'Thành phần giao diện', link: '/user/component' } }
    };
    app.permission.add({ name: 'menu:read', menu: menuMenu }, { name: 'menu:write', menu: menuMenu }, { name: 'menu:delete', menu: menuMenu }, { name: 'component:read', menu: menuComponent }, { name: 'component:write', menu: menuComponent },);
    app.get('/user/menu/edit/:_id', app.permission.check('menu:read'), app.templates.admin);
    app.get('/user/menu', app.permission.check('menu:read'), app.templates.admin);
    app.get('/user/component', app.permission.check('component:read'), app.templates.admin);
    app.get('/user/content/edit/:_id', app.permission.check('component:read'), app.templates.admin);
    app.get('/user/list-content/edit/:_id', app.permission.check('component:read'), app.templates.admin);
    app.get('/user/carousel/edit/:_id', app.permission.check('component:read'), app.templates.admin);
    app.get('/user/statistic/edit/:_id', app.permission.check('component:read'), app.templates.admin);
    app.get('/user/slogan/edit/:_id', app.permission.check('component:read'), app.templates.admin);
    app.get('/user/logo/edit/:_id', app.permission.check('component:read'), app.templates.admin);
    app.get('/user/testimony/edit/:_id', app.permission.check('component:read'), app.templates.admin);
    app.get('/user/staff-group/edit/:_id', app.permission.check('component:read'), app.templates.admin);
    app.get('/user/list-video/edit/:_id', app.permission.check('component:read'), app.templates.admin);
    app.get('/user/course/edit/:_id', app.permission.check('component:read'), app.templates.admin);


    // APIs -----------------------------------------------------------------------------------------------------------------------------------------
    app.buildAppMenus = menuTree => {
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
            getMenu(0, menuTree, () => app.menus = menus);
        } else {
            app.model.menu.getAll({}, (error, menuTree) => getMenu(0, menuTree, () => app.menus = menus));
        }
    }
    app.buildAppMenus();


    app.get('/api/menu/all', app.permission.check('menu:read'), (req, res) => app.model.menu.getAll({}, (error, menuTree) => {
        app.buildAppMenus(menuTree);
        res.send({ error, items: menuTree });
    }));

    app.get('/api/menu/:menuId', app.permission.check('menu:read'), (req, res) => app.model.menu.get(req.params.menuId, (error, menu) => {
        if (error || menu == null) {
            return res.send({ error: 'Lỗi khi lấy menu!' });
        }

        const menuComponentIds = [],
            menuComponents = [];
        const getComponent = (level, index, componentIds, components, done) => {
            if (index < componentIds.length) {
                app.model.component.get(componentIds[index], (error, component) => {
                    if (error || component == null) {
                        return res.send({ error: 'Lỗi khi lấy thành phần trang!' });
                    }

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
                        if (component.viewId && (['carousel', 'content', 'event', 'testimony', 'video', 'statistic', 'slogan', 'logo', 'listVideo', 'contentList'].indexOf(viewType) != -1)) {
                            app.model[viewType].get(component.viewId, (error, item) =>
                                getNextComponent(item ? item.title : '<empty>'));
                        } else if (component.viewId && viewType == 'staff group') {
                            app.model.staffGroup.get(component.viewId, (error, item) =>
                                getNextComponent(item ? item.title : '<empty>'));
                        } else if (['all news', 'last news', 'subscribe', 'all staffs', 'all courses', 'last course'].indexOf(viewType) != -1) {
                            getNextComponent(viewType);
                        } else {
                            getNextComponent('<empty>');
                        }
                    } else {
                        getNextComponent('<empty>');
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
    }));

    app.post('/api/menu', app.permission.check('menu:write'), (req, res) => {
        const data = { title: 'Tên menu', link: '#', active: false };
        if (req.body._id) data.parentId = req.body._id;
        app.model.menu.create(data, (error, item) => res.send({ error, item }));
    });

    app.post('/api/menu/build', app.permission.check('menu:write'), (req, res) => {
        app.buildAppMenus();
        res.send('OK');
    });

    app.put('/api/menu', app.permission.check('menu:write'), (req, res) =>
        app.model.menu.update(req.body._id, req.body.changes, (error, item) => res.send({ error, item })));

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

    app.delete('/api/menu', app.permission.check('menu:write'), (req, res) => app.model.menu.delete(req.body._id, error => res.send({ error })));


    // Component ------------------------------------------------------------------------------------------------------------------------------------
    app.post('/api/menu/component', app.permission.check('component:write'), (req, res) => {
        app.model.component.get(req.body.parentId, (error, parent) => {
            if (error || parent == null) {
                return res.send({ error: 'Id không chính xác!' });
            }

            const data = app.clone(req.body.component);
            data.componentIds = [];
            app.model.component.create(data, (error, component) => {
                if (error || component == null) {
                    if (error) console.log(error);
                    return res.send({ error: 'Tạo component bị lỗi!' });
                }

                parent.componentIds.push(component._id);
                parent.save(error => res.send({ error, component }));
            });
        });
    });

    app.put('/api/menu/component', app.permission.check('component:write'), (req, res) =>
        app.model.component.update(req.body._id, req.body.changes, error => res.send({ error })));

    app.put('/api/menu/component/swap', app.permission.check('component:write'), (req, res) => {
        const isMoveUp = req.body.isMoveUp.toString() == 'true';
        app.model.component.swapPriority(req.body._id, isMoveUp, error => res.send({ error }));
    });

    app.delete('/api/menu/component', app.permission.check('component:write'), (req, res) => {
        app.model.component.delete(req.body._id, (error) => res.send({ error }));
    });

    app.put('/api/menu/build', app.permission.check('component:write'), (req, res) => {
        app.buildAppMenus();
        res.send('OK')
    });


    app.get('/api/menu/component/type/:pageType', app.permission.check('component:read'), (req, res) => {
        const pageType = req.params.pageType;
        if (pageType == 'carousel') {
            app.model.carousel.getAll((error, items) => {
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
        } else if (pageType == 'testimony') {
            app.model.testimony.getAll((error, items) => {
                res.send({
                    error,
                    items: items.map(item => ({ _id: item._id, text: item.title }))
                })
            });
        } else if (pageType == 'logo') {
            app.model.logo.getAll((error, items) => {
                res.send({
                    error,
                    items: items.map(item => ({ _id: item._id, text: item.title }))
                })
            });
        } else if (pageType == 'slogan') {
            app.model.slogan.getAll((error, items) => {
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
        } else if (pageType == 'content') {
            app.model.content.getAll((error, items) => {
                res.send({
                    error,
                    items: items.map(item => ({ _id: item._id, text: item.title }))
                })
            });
        } else if (pageType == 'event') {
            app.model.event.getAll((error, items) => {
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
        } else if (pageType == 'listVideo') {
            app.model.listVideo.getAll((error, items) => {
                res.send({
                    error,
                    items: items.map(item => ({ _id: item._id, text: item.title }))
                })
            });
        } else if (pageType == 'contentList') {
            app.model.contentList.getAll((error, items) => {
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