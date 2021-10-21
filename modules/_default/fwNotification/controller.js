module.exports = (app) => {
    app.permission.add(
        { name: 'user:login', menu: { parentMenu: { index: 1100, title: 'Thông báo', icon: 'fa-comment', link: '/user/notification' } } },
        { name: 'notification:write' },
        { name: 'notification:delete' },
    );

    app.get('/user/notification', app.permission.check('user:login'), app.templates.admin);

    // APIs ------------------------------------------------------------------------------------------------------------
    app.get('/api/notification/page/:pageNumber/:pageSize', (req, res) => {
        const pageNumber = parseInt(req.params.pageNumber),
            pageSize = parseInt(req.params.pageSize);
        app.model.notification.getPage(pageNumber, pageSize, {}, (error, page) => {
            res.send({ page, error: error ? 'Danh sách thông báo không sẵn sàng!' : null });
        });
    });

    app.post('/api/notification', app.permission.check('user:login'), (req, res) => {
        const user = req.session.user,
            permissions = user && user.permissions && user.permissions.length ? user.permissions : [];
        if (user.isCourseAdmin || permissions.includes('notification:write')) {
            app.model.notification.create(req.body.data, (error, item) => res.send({ error, item }));
        } else {
            res.send({ error: 'Bạn không có quyền!' });
        }
    });

    app.put('/api/notification', app.permission.check('user:login'), (req, res) => {
        const user = req.session.user,
            permissions = user && user.permissions && user.permissions.length ? user.permissions : [];
        if (user.isCourseAdmin || permissions.includes('notification:write')) {
            const { _id, changes } = req.body;
            if (changes && changes.subjects && changes.subjects === 'empty') changes.subjects = [];
            app.model.notification.update(_id, changes, (error, item) => res.send({ error, item }));
        } else {
            res.send({ error: 'Bạn không có quyền!' });
        }
    });

    app.delete('/api/notification', app.permission.check('notification:delete'), (req, res) => {
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
};