module.exports = (app) => {
    const menu = {
        parentMenu: app.parentMenu.trainning,
        menus: {
            4010: { title: 'Loại khóa học', link: '/user/course-type' },
        }
    };

    app.permission.add(
        { name: 'course-type:read', menu },
        { name: 'course-type:write' },
        { name: 'course-type:delete' },
    );

    app.get('/user/course-type', app.permission.check('course-type:read'), app.templates.admin);
    app.get('/user/course-type/:_id', app.permission.check('course-type:write'), app.templates.admin);
    app.get('/course-type/:_id', app.templates.home);

    // APIs ------------------------------------------------------------------------------------------------------------
    app.get('/api/course-type/page/:pageNumber/:pageSize', (req, res) => {
        const pageNumber = parseInt(req.params.pageNumber),
            pageSize = parseInt(req.params.pageSize);
        app.model.courseType.getPage(pageNumber, pageSize, {}, (error, page) => {
            res.send({ page, error: error ? 'Danh sách loại khóa học không sẵn sàng!' : null });
        });
    });

    app.get('/api/course-type/all', (req, res) => {
        app.model.courseType.getAll((error, list) => res.send({ error, list }));
    });

    app.get('/api/course-type', (req, res) => {
        app.model.courseType.get(req.query._id, (error, item) => res.send({ error, item }));
    });

    app.post('/api/course-type', app.permission.check('course-type:write'), (req, res) => {
        app.model.courseType.create(req.body.data, (error, item) => res.send({ error, item }));
    });

    app.put('/api/course-type', app.permission.check('course-type:write'), (req, res) => {
        const { _id, changes } = req.body;
        if (changes && changes.subjects && changes.subjects === 'empty') changes.subjects = [];
        app.model.courseType.update(_id, changes, (error, item) => res.send({ error, item }))
    });

    app.delete('/api/course-type', app.permission.check('course-type:delete'), (req, res) => {
        app.model.courseType.delete(req.body._id, (error) => res.send({ error }))
    });

    // Home -----------------------------------------------------------------------------------------------------------
    app.get('/home/course-type/all', (req, res) => {
        app.model.courseType.getAll((error, list) => res.send({ error, list }));
    });

    // Hook upload images ---------------------------------------------------------------------------------------------
    app.createFolder(app.path.join(app.publicPath, '/img/course-type'));

    const uploadCourseType = (req, fields, files, params, done) => {
        if (fields.userData && fields.userData[0].startsWith('course-type:') && files.CourseTypeImage && files.CourseTypeImage.length > 0) {
            console.log('Hook: uploadCourseType => course type image upload');
            const _id = fields.userData[0].substring('course-type:'.length);
            app.uploadImage('course-type', app.model.courseType.get, _id, files.CourseTypeImage[0].path, done);
        }
    };
    app.uploadHooks.add('uploadCourseType', (req, fields, files, params, done) =>
        app.permission.has(req, () => uploadCourseType(req, fields, files, params, done), done, 'course-type:write'));
};