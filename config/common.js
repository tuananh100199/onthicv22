module.exports = (app, appName) => {
    app.clone = function () {
        const length = arguments.length;
        let result = null;
        if (length && Array.isArray(arguments[0])) {
            result = [];
            for (let i = 0; i < length; i++) {
                result = result.concat(arguments[i]);
            }
        } else if (length && typeof arguments[0] == 'object') {
            result = {};
            for (let i = 0; i < length; i++) {
                const obj = JSON.parse(JSON.stringify(arguments[i]));
                Object.keys(obj).forEach(key => result[key] = obj[key]);
            }
        }
        return result;
    };

    // Response template - html file ---------------------------------------------------------------------------------------------------------------------------
    app.templates = {};
    app.createTemplate = function () {
        for (let i = 0; i < arguments.length; i++) {
            const templateName = arguments[i],
                path = `/${templateName}.template`;
            app.templates[templateName] = (req, res) => {
                const today = new Date().yyyymmdd();
                if (req.session.today != today) {
                    app.redis.incr(`${appName}:todayViews`);
                    app.redis.incr(`${appName}:allViews`);
                    req.session.today = today;
                }

                if (app.isDebug) {
                    const http = require('http');
                    http.get(`http://localhost:${app.port + 1}${path}`, response => {
                        let data = '';
                        response.on('data', chunk => data += chunk);
                        response.on('end', () => res.send(data));
                    });
                } else {
                    app.fs.readFile(app.publicPath + path, 'utf8', (error, data) => res.send(data));
                }
            };
        }
    };

    // Parent menu -----------------------------------------------------------------------------------------------------
    app.parentMenu = {
        user: { index: 1000, title: 'Trang cá nhân', link: '/user', icon: 'fa-user' },
        // setting: {
        //     index: 2000, title: 'Cấu hình', link: '/user/settings', icon: 'fa-cog', // subMenusRender: false,
        // },
        setting: { index: 2000, title: 'Cấu hình', icon: 'fa-cog' },
        communication: { index: 3000, title: 'Truyền thông', icon: 'fa fa-bullhorn' },
        trainning: { index: 4000, title: 'Đào tạo', icon: 'fa-graduation-cap' },
    };

    // Upload Hook -----------------------------------------------------------------------------------------------------
    const uploadHooksList = {};
    app.uploadHooks = {
        add: (name, hook) => uploadHooksList[name] = hook,
        remove: name => uploadHooksList[name] = null,

        run: (req, fields, files, params, sendResponse) =>
            Object.keys(uploadHooksList).forEach(name => uploadHooksList[name] && uploadHooksList[name](req, fields, files, params, data => data && sendResponse(data))),
    };

    // Ready hook ------------------------------------------------------------------------------------------------------
    const readyHookContainer = {};
    let readyHooksId = null;
    app.readyHooks = {
        add: (name, hook) => {
            readyHookContainer[name] = hook;
            app.readyHooks.waiting();
        },
        remove: name => {
            readyHookContainer[name] = null;
            app.readyHooks.waiting();
        },

        waiting: () => {
            if (readyHooksId) clearTimeout(readyHooksId);
            readyHooksId = setTimeout(app.readyHooks.run, 2000);
        },

        run: () => {
            let hookKeys = Object.keys(readyHookContainer),
                ready = true;

            // Check all hooks
            for (let i = 0; i < hookKeys.length; i++) {
                const hook = readyHookContainer[hookKeys[i]];
                if (!hook.ready()) {
                    ready = false;
                    console.log(hookKeys[i]);
                    break;
                }
            }

            if (ready) {
                hookKeys.forEach(hookKey => readyHookContainer[hookKey].run());
                console.log(` - #${process.pid}: The system is ready!`);
            } else {
                app.readyHooks.waiting();
            }
        }
    };
    app.readyHooks.waiting();

    // Load modules ----------------------------------------------------------------------------------------------------
    app.loadModules = (loadController = true) => {
        const modulePaths = app.fs.readdirSync(app.modulesPath, { withFileTypes: true }).filter(item => item.isDirectory()).map(item => app.modulesPath + '/' + item.name),
            modelPaths = [],
            controllerPaths = [],
            requireFolder = (loadPath) => app.fs.readdirSync(loadPath).forEach((filename) => {
                const filepath = app.path.join(loadPath, filename);
                if (app.fs.existsSync(filepath) && app.fs.statSync(filepath).isFile() && filepath.endsWith('.js')) {
                    require(filepath)(app);
                }
            });

        modulePaths.forEach(modulePath => {
            app.fs.readdirSync(modulePath).forEach(dirName => {
                const modelFilePath = app.path.join(modulePath, dirName, 'model.js'),
                    controllerFilePath = app.path.join(modulePath, dirName, 'controller.js'),
                    modelFolderPath = app.path.join(modulePath, dirName, 'model'),
                    controllerFolderPath = app.path.join(modulePath, dirName, 'controller');

                if (app.fs.existsSync(modelFilePath) && app.fs.statSync(modelFilePath).isFile())
                    modelPaths.push(modelFilePath);
                if (loadController && app.fs.existsSync(controllerFilePath) && app.fs.statSync(controllerFilePath).isFile())
                    controllerPaths.push(controllerFilePath);

                if (app.fs.existsSync(modelFolderPath) && app.fs.statSync(modelFolderPath).isDirectory())
                    requireFolder(modelFolderPath);
                if (loadController && controllerFolderPath && app.fs.existsSync(controllerFolderPath) && app.fs.statSync(controllerFolderPath).isDirectory())
                    requireFolder(controllerFolderPath);
            });
        });
        modelPaths.forEach(path => require(path)(app));
        if (loadController) controllerPaths.forEach(path => require(path)(app));
    }

    // Setup admin account (default account) ---------------------------------------------------------------------------
    app.setupAdmin = () => {
        const permission = app.permission.all();
        let adminRole = {};
        const setAdmin = () => {
            app.model.user.get({ email: app.defaultAdminEmail }, (error, user) => {
                if (error) {
                    console.log(' - Error: Cannot generate default Admin User!');
                } else if (!user) {
                    const newData = {
                        firstname: 'TÙNG',
                        lastname: 'NGUYỄN THANH',
                        email: app.defaultAdminEmail,
                        password: app.defaultAdminPassword,
                        active: true,
                        roles: [adminRole._id]
                    };
                    app.model.user.create(newData, (error, newUser) => {
                        if (error || !newUser) {
                            console.log(' - Error: Cannot generate default Admin User!', error)
                        } else {
                            console.log(' - Generate default Admin User successfully!')
                        }
                    })
                } else {
                    const roleIdList = (user.roles ? user.roles : []).map(role => role._id);
                    if (roleIdList.indexOf(adminRole._id) == -1) {
                        user.roles.push(adminRole._id);
                    }
                    user.firstname = 'TÙNG';
                    user.lastname = 'NGUYỄN THANH';
                    user.save(() => {
                        console.log(' - Generate default Admin User successfully!')
                    });
                }
            })
        };

        app.model.role.get({ name: 'admin' }, (error, role) => {
            if (error) {
                console.log(' - Error: Cannot create admin role!');
            } else if (!role) {
                app.model.role.create({ name: 'admin', permission: permission, active: true, default: true }, (error, newRole) => {
                    if (error || !newRole) {
                        console.log(' - Error: Cannot create admin role!');
                    } else {
                        adminRole = newRole;
                        console.log(' - Create admin role successfully!');
                        setAdmin();
                    }
                });
            } else {
                role.permission = permission;
                role.save((error, role) => {
                    if (error) {
                        console.log(' - Error: Cannot create admin role!');
                    } else {
                        adminRole = role;
                        console.log(' - Create admin role successfully!');
                        setAdmin();
                    }
                });
            }
        });
    };
};