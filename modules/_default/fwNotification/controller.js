module.exports = (app) => {
    app.permission.add(
        { name: 'user:login', menu: { parentMenu: { index: 1100, title: 'Thông báo', icon: 'fa-comment', link: '/user/notification' } } },
        { name: 'notification:write' },
        { name: 'notification:delete' },
    );

    app.get('/user/notification', app.permission.check('user:login'), app.templates.admin);

    // APIs ------------------------------------------------------------------------------------------------------------
    app.get('/api/notification/page/:pageNumber/:pageSize', app.permission.check('user:login'), (req, res) => {
        const user = req.session.user,
            permissions = user && user.permissions && user.permissions.length ? user.permissions : [];
        const pageNumber = parseInt(req.params.pageNumber),
            pageSize = parseInt(req.params.pageSize);
        if (user.isCourseAdmin || permissions.includes('notification:write')) {
            app.model.notification.getPage(pageNumber, pageSize, {}, (error, page) => {
                res.send({ page, error: error ? 'Danh sách thông báo không sẵn sàng!' : null });
            });
            // } else if (user.isCourseAdmin) {
            //TODO
        } else {
            app.model.student.getAll({ user: user._id }, (error, students) => {
                const _courseIds = [];
                (students || []).forEach(student => student.course && _courseIds.push(student.course._id));
                app.model.notification.getPage(pageNumber, pageSize, { $or: [{ course: { $in: _courseIds } }, { user: user._id }], sentDate: { $ne: null } }, (error, page) => {
                    res.send({ page, error: error ? 'Danh sách thông báo không sẵn sàng!' : null });
                });
            });
        }
    });

    app.post('/api/notification', app.permission.check('user:login'), (req, res) => { //TODO: Hùng
        const user = req.session.user,
            permissions = user && user.permissions && user.permissions.length ? user.permissions : [];
        if (user.isCourseAdmin || permissions.includes('notification:write')) {
            app.model.notification.create(req.body.data, (error, item) => res.send({ error, item }));
        } else {
            res.send({ error: 'Bạn không có quyền!' });
        }
    });

    app.put('/api/notification', app.permission.check('user:login'), (req, res) => { //TODO
        const user = req.session.user,
            permissions = user && user.permissions && user.permissions.length ? user.permissions : [];
        if (user.isCourseAdmin || permissions.includes('notification:write')) {
            const { _id, changes } = req.body;
            if (changes && changes.subjects && changes.subjects === 'empty') changes.subjects = [];
            app.model.notification.update(_id, changes, (error, item) => {
                if (!error && item && item.sentDate) {
                    //TODO
                }
                res.send({ error, item });
            });
        } else {
            res.send({ error: 'Bạn không có quyền!' });
        }
    });

    app.delete('/api/notification', app.permission.check('notification:delete'), (req, res) => { //TODO
        const { _id } = req.body;
        app.model.notification.delete(_id, (error) => res.send({ error }));
    });

    // Hook upload images ---------------------------------------------------------------------------------------------
    app.createFolder(app.path.join(app.publicPath, '/img/notification'));

    const uploadNotification = (fields, files, done) => {
        if (fields.userData && fields.userData[0].startsWith('notification:') && files.NotificationImage && files.NotificationImage.length > 0) {
            console.log('Hook: uploadNotification => course type image upload');
            const _id = fields.userData[0].substring('notification:'.length);
            app.uploadImage('notification', app.model.notification.get, _id, files.NotificationImage[0].path, done);
        }
    };
    app.uploadHooks.add('uploadNotification', (req, fields, files, params, done) =>
        app.permission.has(req, () => uploadNotification(fields, files, done), done, 'notification:write'));

    // Hook permissionHooks -------------------------------------------------------------------------------------------
    app.permissionHooks.add('courseAdmin', 'notification', (user) => new Promise(resolve => {
        app.permissionHooks.pushUserPermission(user, 'notification:read', 'notification:write', 'notification:delete');
        resolve();
    }));

};