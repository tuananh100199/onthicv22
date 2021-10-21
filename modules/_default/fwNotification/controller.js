module.exports = (app) => {
    const menu = {
        parentMenu: app.parentMenu.trainning,
        menus: {
            2200: { title: 'Thông báo', link: '/user/notification' },
        }
    };

    app.permission.add(
        { name: 'notification:read', menu },
        { name: 'notification:write' },
        { name: 'notification:delete' },
    );

    app.get('/user/notification', app.permission.check('notification:read'), app.templates.admin);

    // APIs ------------------------------------------------------------------------------------------------------------
    app.get('/api/notification/page/:pageNumber/:pageSize', (req, res) => {
        const pageNumber = parseInt(req.params.pageNumber),
            pageSize = parseInt(req.params.pageSize);
        app.model.courseType.getPage(pageNumber, pageSize, {}, (error, page) => {
            res.send({ page, error: error ? 'Danh sách thông báo không sẵn sàng!' : null });
        });
    });

    app.get('/api/notification', (req, res) => {
        app.model.courseType.get(req.query._id, (error, item) => res.send({ error, item }));
    });

    app.post('/api/notification', app.permission.check('notification:write'), (req, res) => {
        app.model.courseType.create(req.body.data, (error, item) => res.send({ error, item }));
    });

    app.put('/api/notification', app.permission.check('notification:write'), (req, res) => {
        const { _id, changes } = req.body;
        if (changes && changes.subjects && changes.subjects === 'empty') changes.subjects = [];
        app.model.courseType.update(_id, changes, (error, item) => res.send({ error, item }));
    });

    app.delete('/api/notification', app.permission.check('notification:delete'), (req, res) => {
        const { _id } = req.body;
        app.model.courseType.delete(_id, (error) => res.send({ error }));
    });

    // Hook upload images ---------------------------------------------------------------------------------------------
    app.createFolder(app.path.join(app.publicPath, '/img/notification'));

    const uploadCourseType = (fields, files, done) => {
        if (fields.userData && fields.userData[0].startsWith('notification:') && files.CourseTypeImage && files.CourseTypeImage.length > 0) {
            console.log('Hook: uploadCourseType => course type image upload');
            const _id = fields.userData[0].substring('notification:'.length);
            app.uploadImage('notification', app.model.courseType.get, _id, files.CourseTypeImage[0].path, done);
        }
    };
    app.uploadHooks.add('uploadCourseType', (req, fields, files, params, done) =>
        app.permission.has(req, () => uploadCourseType(fields, files, done), done, 'notification:write'));
};