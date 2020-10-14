module.exports = app => {
    let systemPermission = {};
    let effectChangeUser = new Set();

    const checkPermissions = (req, res, next, permissions) => {
        if (req.session.user) {
            const user = req.session.user;
            if (effectChangeUser.has(user._id.toString())) {
                app.model.user.get(user._id, (error, newUser) => {
                    if (error || !newUser) {
                        responseError(req, res);
                    } else {
                        newUser = newUser.clone();
                        req.session.user = newUser;
                        if (newUser.permissions && newUser.permissions.contains(permissions, req)) {
                            next();
                        } else if (permissions.length == 0) {
                            next();
                        } else {
                            responseError(req, res);
                        }
                    }
                })
            } else {
                if (req.session.user.permissions && req.session.user.permissions.contains(permissions, req)) {
                    next();
                } else if (permissions.length == 0) {
                    next();
                } else {
                    responseError(req, res);
                }
            }
        } else {
            responseError(req, res);
        }
    };

    const checkOrPermissions = (req, res, next, permissions) => {
        if (req.session.user) {
            const user = req.session.user;
            if (effectChangeUser.has(user._id.toString())) {
                app.model.user.get(user._id, (error, newUser) => {
                    if (error || !newUser) {
                        responseError(req, res);
                    } else {
                        newUser = newUser.clone();
                        req.session.user = newUser;
                        if (newUser.permissions && newUser.permissions.exists(permissions, req)) {
                            next();
                        } else if (permissions.length == 0) {
                            next();
                        } else {
                            responseError(req, res);
                        }
                    }
                })
            } else {
                if (req.session.user.permissions && req.session.user.permissions.exists(permissions, req)) {
                    next();
                } else if (permissions.length == 0) {
                    next();
                } else {
                    responseError(req, res);
                }
            }
        } else {
            responseError(req, res);
        }
    };

    const getUserByRole = (req, role, done) => {
        app.model.user.get({ roles: role._id }, (error, user) => {
            if (error || user == null) {
                console.error('System has errors!', error);
                done('Error');
            } else {
                req.session.user = user.clone();
                done();
            }
        });
    };

    const responseError = (req, res) => {
        if (req.method.toLowerCase() === 'get') { // is get method
            if (req.originalUrl.startsWith('/api')) {
                res.send({ error: req.session.user ? 'request-permissions' : 'request-login' });
            } else {
                res.redirect(req.session.user ? '/request-permissions' : '/request-login');
            }
        } else {
            res.send({ error: `You don't have permission!` });
        }
    };

    const hasPermissions = (req, success, fail, permissions) => {
        if (req.session.user) {
            if (req.session.user.permissions && req.session.user.permissions.contains(permissions, req)) {
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

    const hashElement = (menus) => {
        return Object.keys(menus).map(key => {
            return { [key]: menus[key] }
        })
    }

    const menuTree = {};
    app.permission = {
        list: () => app.clone(systemPermission),

        pushEffect: (userId) => effectChangeUser.add(userId.toString()),

        popEffect: (userId) => effectChangeUser.delete(userId.toString()),

        add: (...permissions) => {
            permissions.forEach(permission => {
                if (permission.menu) {
                    if (permission.menu.parentMenu) {
                        if (menuTree[permission.menu.parentMenu.index] == null) {
                            menuTree[permission.menu.parentMenu.index] = { name: permission.menu.parentMenu.title, menus: [] }
                        }
                    }

                    const menuTreeItem = menuTree[permission.menu.parentMenu.index];
                    const submenus = permission.menu.menus;
                    if (submenus) {
                        Object.keys(submenus).forEach(menuIndex => {
                            const text = `${menuIndex} - ${submenus[menuIndex].title} (${submenus[menuIndex].link})`;
                            if (menuTreeItem.menus.indexOf(text) == -1) menuTreeItem.menus.push(text);
                        });
                    }
                }

                if (systemPermission[permission.name] == undefined) {
                    systemPermission[permission.name] = permission.menu || {};
                } else {
                    systemPermission[permission.name].menus = app.clone({}, systemPermission[permission.name].menus, permission.menu.menus);
                }
            });
        },

        check: (...permissions) => {
            return (req, res, next) => {
                if (app.isDebug && app.autoLogin && (req.session.user == null || req.session.user == undefined)) {
                    let cookieDebugRole = req.cookies.debugRole;
                    if (cookieDebugRole == null || cookieDebugRole == undefined) {
                        cookieDebugRole = 'admin';
                    }

                    app.model.role.get({ name: cookieDebugRole }, (error, role) => {
                        if (error || role == null) {
                            app.model.role.get({ name: 'admin' }, (error, role) => {
                                if (error || role == null) {
                                    console.error('System has errors!', error);
                                    res.send({ error: `System has errors!` });
                                } else {
                                    getUserByRole(req, role, error => error ? res.send({ error: `System has errors!` }) : checkPermissions(req, res, next, permissions));
                                }
                            });
                        } else {
                            getUserByRole(req, role, error => error ? res.send({ error: `System has errors!` }) : checkPermissions(req, res, next, permissions));
                        }
                    });
                } else {
                    checkPermissions(req, res, next, permissions);
                }
            };
        },

        orCheck: (...permissions) => {
            return (req, res, next) => {
                if (app.isDebug && app.autoLogin && (req.session.user == null || req.session.user == undefined)) {
                    let cookieDebugRole = req.cookies.debugRole;
                    if (cookieDebugRole == null || cookieDebugRole == undefined) {
                        cookieDebugRole = 'admin';
                    }

                    app.model.role.get({ name: cookieDebugRole }, (error, role) => {
                        if (error || role == null) {
                            app.model.role.get({ name: 'admin' }, (error, role) => {
                                if (error || role == null) {
                                    console.error('System has errors!', error);
                                    res.send({ error: `System has errors!` });
                                } else {
                                    getUserByRole(req, role, error => error ? res.send({ error: `System has errors!` }) : checkOrPermissions(req, res, next, permissions));
                                }
                            });
                        } else {
                            getUserByRole(req, role, error => error ? res.send({ error: `System has errors!` }) : checkOrPermissions(req, res, next, permissions));
                        }
                    });
                } else {
                    checkOrPermissions(req, res, next, permissions);
                }
            };
        },

        has: (req, success, fail, ...permissions) => {
            if (typeof fail == 'string') {
                permissions.unshift(fail);
                fail = null;
            }
            if (app.isDebug && app.autoLogin && (req.session.user == null || req.session.user == undefined)) {
                let cookieDebugRole = req.cookies.debugRole;
                if (cookieDebugRole == null || cookieDebugRole == undefined) {
                    cookieDebugRole = 'admin';
                }
                app.model.role.get({ name: cookieDebugRole }, (error, role) => {
                    if (error || role == null) {
                        app.model.role.get({ name: 'admin' }, (error, role) => {
                            if (error || role == null) {
                                console.error('System has errors!', error);
                                fail && fail();
                            } else {
                                getUserByRole(req, role, error => error ? (fail && fail()) : hasPermissions(req, success, fail, permissions));
                            }
                        });
                    } else {
                        getUserByRole(req, role, error => error ? (fail && fail()) : hasPermissions(req, success, fail, permissions));
                    }
                });
            } else {
                hasPermissions(req, success, fail, permissions);
            }
        },

        getTreeMenuText: () => {
            let result = '';
            Object.keys(menuTree).sort().forEach(parentIndex => {
                result += `${parentIndex}. ${menuTree[parentIndex].name}\n`;

                menuTree[parentIndex].menus.sort().forEach(submenu => {
                    result += `\t${submenu}\n`;
                });
            });
            app.fs.writeFileSync(app.path.join(app.assetPath, 'menu.txt'), result);
        }
    };
};
