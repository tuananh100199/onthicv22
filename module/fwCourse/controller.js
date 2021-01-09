module.exports = (app) => {
    const menu = {
        parentMenu: { index: 7000, title: 'Quản lý khóa học', icon: 'fa-file' },
        menus: {
            6001: { title: 'Danh mục', link: '/user/course/category' },
            6002: { title: 'Khóa học', link: '/user/course/list' },
        },
    };
    app.permission.add({ name: 'course:read', menu }, { name: 'course:write', menu } );
    app.get('/user/course/category', app.permission.check('category:read'), app.templates.admin);
    app.get('/user/course/list', app.permission.check('course:read'), app.templates.admin);
    app.get('/user/course/edit/:_id', app.permission.check('course:read'), app.templates.admin);

    app.get('/course/item/:_id', app.templates.home);
    app.get('/khoa-hoc/:link', app.templates.home);

    // APIs ------------------------------------------------------------------------------------------------------------
    app.get('/api/course/page/:pageNumber/:pageSize', app.permission.check('course:read'), (req, res) => {
        const pageNumber = parseInt(req.params.pageNumber),
            pageSize = parseInt(req.params.pageSize);
        app.model.course.getPage(pageNumber, pageSize, {}, (error, page) => {
            const response = {};
            if (error || page == null) {
                response.error = 'Danh sách khoá học không sẵn sàng!';
            } else {
                response.page = page;
            }
            res.send(response);
        });
    });
    
    app.get('/api/course/item/:courseId', app.permission.check('course:read'), (req, res) => {
        app.model.category.getAll({ type: 'course', active: true }, (error, categories) => {
            if (error || categories == null) {
                res.send({ error: 'Lỗi khi lấy danh mục!' });
            } else {
                app.model.course.get(req.params.courseId, (error, item) => {
                    res.send({
                        error,
                        categories: categories.map((item) => ({ id: item._id, text: item.title })),
                        item
                    });
                });
            }
        });
    });

    app.post('/api/course', app.permission.check('course:write'), (req, res) =>
        app.model.course.create(req.body.data || {}, (error, item) => res.send({ error, item })
    ));
    
    app.put('/api/course', app.permission.check('course:write'), (req, res) => {
        const changes = req.body.changes;
        if (changes.categories && changes.categories == 'empty') changes.categories = [];
        app.model.course.update(req.body._id, req.body.changes, (error, item) => res.send({ error, item }))
    });

    app.delete('/api/course', app.permission.check('course:write'), (req, res) =>
        app.model.course.delete(req.body._id, (error) => res.send({ error }))
    );

    // Home -----------------------------------------------------------------------------------------------------------------------------------------
    app.get('/course/page/:pageNumber/:pageSize', (req, res) => {
        const pageNumber = parseInt(req.params.pageNumber),
            pageSize = parseInt(req.params.pageSize);
        app.model.course.getPage(pageNumber, pageSize, { active: true }, (error, page) => {
            const response = {};
            if (error || page == null) {
                response.error = 'Danh sách tin tức không sẵn sàng!';
            } else {
                response.page = page;
            }
            res.send(response);
        });
    });

    app.get('/course/page/:pageNumber/:pageSize/:categoryType', (req, res) => {
        const pageNumber = parseInt(req.params.pageNumber), pageSize = parseInt(req.params.pageSize),
            condition = {
                categories: req.params.categoryType,
                active: true,
            };

        app.model.course.getPage(pageNumber, pageSize, condition, (error, page) => {
            const response = {};
            if (error || page == null) {
                response.error = 'Danh sách khoá học không sẵn sàng!';
            } else {
                response.page = page;
            }
            
            res.send(response);
        });
    });

    app.get('/course/item/id/:courseId', (req, res) => {
        app.model.course.get({ _id: req.params.courseId, active: true }, (error, item) => res.send({ error, item }))
    });

    app.get('/course/item/link/:courseLink', (req, res) => {
        app.model.course.get({ link: req.params.courseLink, active: true }, (error, item) =>
            res.send({ error, item })
        )
    });
    
    app.put('/course/item/check-link', (req, res) =>
        app.model.course.get({ link: req.body.link }, (error, item) => {
            res.send({ error: error ? 'Lỗi hệ thống' : item == null || item._id == req.body._id ? null : 'Link không hợp lệ' });
        })
    );

    // Hook upload images ---------------------------------------------------------------------------------------------------------------------------s
    app.createFolder(app.path.join(app.publicPath, '/img/course'));

    app.uploadHooks.add('uploadCourseCkEditor', (req, fields, files, params, done) => app.permission.has(req,
        () => app.uploadCkEditorImage('course', fields, files, params, done), done, 'course:write')
    );

    const uploadCourseAvatar = (req, fields, files, params, done) => {
        if (fields.userData && fields.userData[0].startsWith('course:') && files.CourseImage && files.CourseImage.length > 0) {
            console.log('Hook: uploadCourseAvatar => course image upload');
            app.uploadComponentImage(req, 'course', app.model.course.get, fields.userData[0].substring(7), files.CourseImage[0].path, done);
        }
    };

    app.uploadHooks.add('uploadCourseAvatar', (req, fields, files, params, done) =>
        app.permission.has(req, () => uploadCourseAvatar(req, fields, files, params, done), done, 'course:write')
    );
};