module.exports = (app) => {
    const menu = {
        parentMenu: app.parentMenu.trainning,
        menus: {
            4010: { title: 'Loại khoá học', link: '/user/course-type/list' },
        }
    };

    app.permission.add(
        { name: 'course-type:read', menu },
        { name: 'course-type:write' },
        { name: 'course-type:delete' },
    );

    app.get('/user/course-type/list', app.permission.check('course-type:read'), app.templates.admin);
    app.get('/user/course-type/edit/:_id', app.permission.check('course-type:write'), app.templates.admin);
    app.get('/course-type/:_id', app.templates.home);

    // APIs ------------------------------------------------------------------------------------------------------------
    app.get('/api/course-type/page/:pageNumber/:pageSize', (req, res) => {
        const pageNumber = parseInt(req.params.pageNumber),
            pageSize = parseInt(req.params.pageSize);
        app.model.courseType.getPage(pageNumber, pageSize, {}, (error, page) => {
            res.send({ page, error: error ? 'Danh sách loại khoá học không sẵn sàng!' : null });
        });
    });

    app.get('/api/course-type/all', app.permission.check('course-type:read'), (req, res) => {
        app.model.courseType.getAll((error, items) => res.send({ error, items }));
    });

    app.get('/api/course-type/edit/:id', app.permission.check('course-type:read'), (req, res) => {
        app.model.courseType.get(req.params.id, (error, item) => res.send({ error, item }));
    });

    app.post('/api/course-type', app.permission.check('course-type:write'), (req, res) => {
        app.model.courseType.create(req.body.data || {}, (error, item) => res.send({ error, item }));
    });

    app.put('/api/course-type', app.permission.check('course-type:write'), (req, res) => {
        const $set = req.body.changes;
        if ($set && $set.subjectList && $set.subjectList === 'empty') $set.subjectList = [];
        app.model.courseType.update(req.body._id, $set, (error, item) => res.send({ error, item }))
    });

    app.delete('/api/course-type', app.permission.check('course-type:delete'), (req, res) => {
        app.model.courseType.delete(req.body._id, (error) => res.send({ error }))
    });

    // Home -----------------------------------------------------------------------------------------------------------
    app.get('/home/course-type/all', (req, res) => {
        app.model.courseType.getAll((error, items) => res.send({ error, items }));
    });
    // Hook upload images ---------------------------------------------------------------------------------------------
    app.createFolder(app.path.join(app.publicPath, '/img/course-type'));

    const uploadCourseType = (req, fields, files, params, done) => {
        if (fields.userData && fields.userData[0].startsWith('course-type:') && files.CourseTypeImage && files.CourseTypeImage.length > 0) {
            console.log('Hook: uploadCourseType => course type image upload');
            app.uploadComponentImage(req, 'course-type', app.model.courseType.get, fields.userData[0].substring(12), files.CourseTypeImage[0].path, done);
        }
    };
    app.uploadHooks.add('uploadCourseType', (req, fields, files, params, done) =>
        app.permission.has(req, () => uploadCourseType(req, fields, files, params, done), done, 'course-type:write'));
};

