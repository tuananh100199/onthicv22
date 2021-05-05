module.exports = app => {
    const checkPermissions = (req, res, next, permissions) => {
        if (req.session.user) {
            const user = req.session.user;
            if (user.permissions && user.permissions.contains(permissions)) {
                next();
            } else if (permissions.length == 0) {
                next();
            } else {
                responseError(req, res);
            }
        } else {
            responseError(req, res);
        }
    };

    const checkOrPermissions = (req, res, next, permissions) => {
        if (req.session.user) {
            const user = req.session.user;
            if (user.permissions && user.permissions.exists(permissions, req)) {
                next();
            } else if (permissions.length == 0) {
                next();
            } else {
                responseError(req, res);
            }
        } else {
            responseError(req, res);
        }
    };

    const responseError = (req, res) => {
        if (req.method.toLowerCase() === 'get') { // is get method
            if (req.originalUrl.startsWith('/api')) {
                res.send({ error: req.session.user ? 'request-permissions' : 'request-login' });
            } else {
                res.redirect(req.session.user ? '/request-permissions' : '/request-login');
            }
        } else {
            res.send({ error: 'You don\'t have permission!' });
        }
    };
    const responseWithPermissions = (req, success, fail, permissions) => {
        if (req.session.user) {
            if (req.session.user.permissions && req.session.user.permissions.contains(permissions)) {
                success();
            } else {
                fail && fail();
            }
        } else if (permissions.length == 0) {
            success();
        } else {
            fail && fail();
        }
    };

    const systemPermission = [];
    const menuTree = {};
    app.permission = {
        all: () => [...systemPermission],

        tree: () => app.clone(menuTree),

        add: (...permissions) => {
            permissions.forEach(permission => {
                if (typeof permission == 'string') {
                    permission = { name: permission };
                } else if (permission.menu) {
                    if (permission.menu.parentMenu) {
                        const { index, subMenusRender } = permission.menu.parentMenu;
                        if (menuTree[index] == null) {
                            menuTree[index] = {
                                parentMenu: app.clone(permission.menu.parentMenu),
                                menus: {},
                            };
                        }
                        if (permission.menu.menus == null) {
                            menuTree[index].parentMenu.permissions = [permission.name];
                        }
                        menuTree[index].parentMenu.subMenusRender = menuTree[index].parentMenu.subMenusRender || (subMenusRender != null ? subMenusRender : true);
                    }

                    const menuTreeItem = menuTree[permission.menu.parentMenu.index],
                        submenus = permission.menu.menus;
                    if (submenus) {
                        Object.keys(submenus).forEach(menuIndex => {
                            if (menuTreeItem.menus[menuIndex]) {
                                const menuTreItemMenus = menuTreeItem.menus[menuIndex];
                                if (menuTreItemMenus.title == submenus[menuIndex].title && menuTreItemMenus.link == submenus[menuIndex].link) {
                                    menuTreItemMenus.permissions.push(permission.name);
                                } else {
                                    console.error(`Menu index #${menuIndex} is not available!`);
                                }
                            } else {
                                menuTreeItem.menus[menuIndex] = app.clone(submenus[menuIndex], { permissions: [permission.name] });
                            }
                        });
                    }
                }

                systemPermission.includes(permission.name) || systemPermission.push(permission.name);
            });
        },

        check: (...permissions) => (req, res, next) => {
            if (app.isDebug && !req.session.user) {
                const userId = req.cookies.userId;
                app.model.user.get(userId ? { _id: userId } : { email: app.defaultAdminEmail }, (error, user) => {
                    if (error || user == null) {
                        res.send({ error: 'System has errors!' });
                    } else {
                        app.updateSessionUser(req, user, () => checkPermissions(req, res, next, permissions));
                    }
                });
            } else if (req.headers.authorization) { // is token
                app.redis.get(req.headers.authorization, (error, value) => {
                    if (error) {
                        res.send({ error: 'System has errors!' });
                    } else if (value) {
                        if (req.session == null) req.session = {};
                        req.session.sessionUser = JSON.parse(value);
                        checkPermissions(req, res, next, permissions);
                    } else {
                        res.send({ error: 'Invalid token!' });
                    }
                });
            } else {
                checkPermissions(req, res, next, permissions);
            }
        },

        orCheck: (...permissions) => (req, res, next) => {
            if (app.isDebug && !req.session.user) {
                const userId = req.cookies.userId;
                app.model.user.get(userId ? { _id: userId } : { email: app.defaultAdminEmail }, (error, user) => {
                    if (error || user == null) {
                        res.send({ error: 'System has errors!' });
                    } else {
                        app.updateSessionUser(req, user, () => checkOrPermissions(req, res, next, permissions));
                    }
                });
            } else if (req.headers.authorization) { // is token
                app.redis.get(req.headers.authorization, (error, value) => {
                    if (error) {
                        res.send({ error: 'System has errors!' });
                    } else if (value) {
                        if (req.session == null) req.session = {};
                        req.session.sessionUser = JSON.parse(value);
                        checkPermissions(req, res, next, permissions);
                    } else {
                        res.send({ error: 'Invalid token!' });
                    }
                });
            } else {
                checkOrPermissions(req, res, next, permissions);
            }
        },

        has: (req, success, fail, ...permissions) => {
            if (typeof fail == 'string') {
                permissions.unshift(fail);
                fail = null;
            }
            if (app.isDebug && !req.session.user) {
                const userId = req.cookies.userId;
                app.model.user.get(userId ? { _id: userId } : { email: app.defaultAdminEmail }, (error, user) => {
                    if (error || !user) {
                        fail && fail({ error: 'System has errors!' });
                    } else {
                        app.updateSessionUser(req, user, () => responseWithPermissions(req, success, fail, permissions));
                    }
                });
            } else {
                responseWithPermissions(req, success, fail, permissions);
            }
        },

        getTreeMenuText: () => {
            let result = '';
            Object.keys(menuTree).sort().forEach(parentIndex => {
                result += `${parentIndex}. ${menuTree[parentIndex].parentMenu.title} (${menuTree[parentIndex].parentMenu.link})\n`;

                Object.keys(menuTree[parentIndex].menus).sort().forEach(menuIndex => {
                    const submenu = menuTree[parentIndex].menus[menuIndex];
                    result += `\t${menuIndex} - ${submenu.title} (${submenu.link})\n`;
                });
            });
            app.fs.writeFileSync(app.path.join(app.assetPath, 'menu.txt'), result);
        }
    };

    const hasPermission = (userPermissions, menuPermissions) => {
        for (let i = 0; i < menuPermissions.length; i++) {
            if (userPermissions.includes(menuPermissions[i])) return true;
        }
        return false;
    };

    app.updateSessionUser = (req, user, done) => {
        user = app.clone(user, { permissions: [], menu: {} });
        delete user.password;
        app.model.user.get({ _id: user._id }, (error, result) => {
            if (error || !result) {
                console.error('app.updateSessionUser', error);
            } else {
                for (let i = 0; i < (user.roles || []).length; i++) {
                    let role = user.roles[i];
                    if (role.name == 'admin') {
                        user.permissions = app.permission.all();
                        break;
                    }
                    (role.permission || []).forEach(permission => app.permissionHooks.pushUserPermission(user, permission.trim()));
                }
                // Add login permission => user.active == true => user:login
                if (user.active) app.permissionHooks.pushUserPermission(user, 'user:login');

                new Promise(resolve => { // User is CourseAdmin
                    if (user.isCourseAdmin) {
                        app.permissionHooks.pushUserPermission(user, 'courseAdmin:login');
                        app.permissionHooks.run('courseAdmin', user, null).then(resolve);
                    } else {
                        resolve();
                    }
                }).then(() => new Promise(resolve => { // Check user is Staff
                    if (user.isStaff) {
                        app.permissionHooks.pushUserPermission(user, 'staff:login');
                        app.permissionHooks.run('staff', user, null).then(resolve);
                    } else {
                        resolve();
                    }
                })).then(() => new Promise(resolve => { // Check user is Lecturer
                    if (user.isLecturer) {
                        app.permissionHooks.pushUserPermission(user, 'lecturer:login');
                        app.permissionHooks.run('lecturer', user, null).then(resolve);
                    } else {
                        resolve();
                    }
                }))
                    // .then(() => new Promise(resolve => { // Check và add course vào session user
                    //     app.model.student.getAll({ user: user._id }, (error, students) => {
                    //         if (error || students.length == 0) {
                    //             reject(error);
                    //         } else {
                    //             if (req.session.user) {
                    //                 req.session.user.courses = students.map(student => ({ courseId: student.course && student.course._id, name: student.course && student.course.name }));
                    //             }
                    //             resolve();
                    //         }
                    //     });
                    // }))
                    .then(() => {  // Build menu tree
                        user.menu = app.permission.tree();
                        Object.keys(user.menu).forEach(parentMenuIndex => {
                            let flag = true;
                            const menuItem = user.menu[parentMenuIndex];
                            if (menuItem.parentMenu && menuItem.parentMenu.permissions) {
                                if (hasPermission(user.permissions, menuItem.parentMenu.permissions)) {
                                    delete menuItem.parentMenu.permissions;
                                } else {
                                    delete user.menu[parentMenuIndex];
                                    flag = false;
                                }
                            }

                            flag && Object.keys(menuItem.menus).forEach(menuIndex => {
                                const menu = menuItem.menus[menuIndex];
                                if (hasPermission(user.permissions, menu.permissions)) {
                                    delete menu.permissions;
                                } else {
                                    delete menuItem.menus[menuIndex];
                                    if (Object.keys(menuItem.menus).length == 0) delete user.menu[parentMenuIndex];
                                }
                                // if (req.session.user && req.session.user.courses) {
                                //     const courses = req.session.user.courses;
                                //     courses.map((course, index) => {
                                //         const menuName = 5000 + index + 1;
                                //         user.menu['5000'].menus[menuName] = {
                                //             title: 'Khóa học ' + course.name,
                                //             link: '/user/hoc-vien/khoa-hoc/' + course.courseId,
                                //             permissions: ['studentCourse:read']
                                //         };
                                //     });
                                // }
                            });
                        });

                        if (req.session) {
                            req.session.user = user;
                            req.session.save();
                        } else {
                            req.session = { user };
                        }
                        done && done(user);
                    });
            }
        });
    };

    // Permission Hook -------------------------------------------------------------------------------------------------
    const permissionHookContainer = { courseAdmin: {}, staff: {}, lecturer: {} };
    app.permissionHooks = {
        add: (type, name, hook) => {
            if (permissionHookContainer[type]) {
                permissionHookContainer[type][name] = hook;
            } else {
                console.log(`Invalid hook type (${type})!`);
            }
        },
        remove: (type, name) => {
            if (permissionHookContainer[type] && permissionHookContainer[type][name]) {
                delete permissionHookContainer[type][name];
            }
        },

        run: (type, user, role) => new Promise((resolve) => {
            const hookContainer = permissionHookContainer[type],
                hookKeys = hookContainer ? Object.keys(hookContainer) : [];
            const runHook = (index = 0) => {
                if (index < hookKeys.length) {
                    const hookKey = hookKeys[index];
                    hookContainer[hookKey](user, role).then(() => runHook(index + 1));
                } else {
                    resolve();
                }
            };
            runHook();
        }),

        pushUserPermission: function () {
            if (arguments.length >= 1) {
                const user = arguments[0];
                for (let i = 1; i < arguments.length; i++) {
                    const permission = arguments[i];
                    if (!user.permissions.includes(permission)) user.permissions.push(permission);
                }
            }
        },
    };

    // Hook readyHooks ------------------------------------------------------------------------------------------------------------------------------
    app.readyHooks.add('permissionInit', {
        ready: () => app.model && app.model.role,
        run: () => app.isDebug && app.permission.getTreeMenuText(),
    });
};
