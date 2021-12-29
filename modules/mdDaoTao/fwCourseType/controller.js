module.exports = (app) => {
    const menu = {
        parentMenu: app.parentMenu.trainning,
        menus: {
            4010: { title: 'Loại khóa học', link: '/user/course-type' },
        }
    };

    app.permission.add(
        { name: 'course-type:read'},
        { name: 'course-type:write',menu },
        { name: 'course-type:delete' },
    );

    app.get('/user/course-type', app.permission.check('course-type:read'), app.templates.admin);
    app.get('/user/course-type/:_id', app.permission.check('course-type:read'), app.templates.admin);
    app.get('/course-type/:_id', app.templates.home);

    // APIs ------------------------------------------------------------------------------------------------------------
    app.get('/api/course-type/page/:pageNumber/:pageSize', (req, res) => {
        const pageNumber = parseInt(req.params.pageNumber),
            pageSize = parseInt(req.params.pageSize);
        app.model.courseType.getPage(pageNumber, pageSize, {}, (error, page) => {
            res.send({ page, error: error ? 'Danh sách loại khóa học không sẵn sàng!' : null });
        });
    });

    app.get('/api/course-type/all', (req, res) => {//mobile
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
        if (changes && changes.monThiTotNghiep && changes.monThiTotNghiep === 'empty') changes.monThiTotNghiep = [];
        app.model.courseType.update(_id, changes, (error, item) => res.send({ error, item }));

    });

    app.delete('/api/course-type/mon-thi-tot-nghiep', app.permission.check('course-type:write'), (req, res) => {
        const { _courseTypeId, _id } = req.body;
        app.model.courseType.deleteMonThiTotNghiep(_courseTypeId, _id, (error, item) => res.send({ error, item }));
    });

    app.delete('/api/course-type', app.permission.check('course-type:delete'), (req, res) => {
        const { _id } = req.body;
        app.model.courseType.delete(_id, (error) => res.send({ error }));
    });

    // Subject APIs ---------------------------------------------------------------------------------------------------
    app.post('/api/course-type/subject', app.permission.check('course-type:write'), (req, res) => {
        const { _courseTypeId, _subjectId } = req.body;
        app.model.subject.get(_subjectId, (error, subject) => {
            if (error || subject == null) {
                res.send({ error: error || 'Invalid Id!' });
            } else {
                app.model.courseType.addSubject(_courseTypeId, subject, (error, item) => res.send({ error, item }));
            }
        });
    });

    app.delete('/api/course-type/subject', app.permission.check('course-type:write'), (req, res) => {
        const { _courseTypeId, _subjectId } = req.body;
        app.model.courseType.deleteSubject(_courseTypeId, _subjectId, (error, item) => res.send({ error, item }));
    });

    // Home -----------------------------------------------------------------------------------------------------------
    app.get('/home/course-type/all', (req, res) => {
        app.model.courseType.getAll((error, list) => res.send({ error, list }));
    });

    // Hook permissionHooks -------------------------------------------------------------------------------------------
    app.permissionHooks.add('courseAdmin', 'courseType', (user) => new Promise(resolve => {
        app.permissionHooks.pushUserPermission(user, 'course-type:read');
        resolve();
    }));

    // Hook upload images ---------------------------------------------------------------------------------------------
    app.createFolder(app.path.join(app.publicPath, '/img/course-type'));

    app.uploadHooks.add('uploadCourseTypeCkEditor', (req, fields, files, params, done) =>
        app.permission.has(req, () => app.uploadCkEditorImage('courseType', fields, files, params, done), done, 'courseType:write'));

    const uploadCourseType = (fields, files, done) => {
        if (fields.userData && fields.userData[0].startsWith('course-type:') && files.CourseTypeImage && files.CourseTypeImage.length > 0) {
            console.log('Hook: uploadCourseType => course type image upload');
            const _id = fields.userData[0].substring('course-type:'.length);
            app.uploadImage('course-type', app.model.courseType.get, _id, files.CourseTypeImage[0].path, done);
        }
    };
    app.uploadHooks.add('uploadCourseType', (req, fields, files, params, done) =>
        app.permission.has(req, () => uploadCourseType(fields, files, done), done, 'course-type:write'));
};