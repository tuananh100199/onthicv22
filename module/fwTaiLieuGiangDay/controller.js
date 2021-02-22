module.exports = (app) => {
    const menu = {
        parentMenu: { index: 8000, title: 'Quản lý tài liệu', icon: 'fa-book' },
        menus: {
            8001: { title: 'Danh mục', link: '/user/document/category' },
            8002: { title: 'Danh sách', link: '/user/document/list' },
        },
    };
    app.permission.add({ name: 'document:read', menu }, { name: 'document:write', menu });
    app.get('/user/document/category', app.permission.check('document:read'), app.templates.admin);
    app.get('/user/document/list', app.permission.check('document:read'), app.templates.admin);
    app.get('/user/document/edit/:_id', app.permission.check('document:read'), app.templates.admin);
    app.get('/document/item/:_id', app.templates.home);
    app.get('/khoa-hoc/:link', app.templates.home);

    // APIs ------------------------------------------------------------------------------------------------------------
    app.get('/api/document/page/:pageNumber/:pageSize', app.permission.check('document:read'), (req, res) => {
        const pageNumber = parseInt(req.params.pageNumber),
            pageSize = parseInt(req.params.pageSize);
        app.model.document.getPage(pageNumber, pageSize, {}, (error, page) => {
            const response = {};
            if (error || page == null) {
                response.error = 'Danh sách khoá học không sẵn sàng!';
            } else {
                response.page = page;
            }
            res.send(response);
        });
    });

    app.get('/api/document/item/:documentId', app.permission.check('document:read'), (req, res) => {
        app.model.category.getAll({ type: 'document', active: true }, (error, categories) => {
            if (error || categories == null) {
                res.send({ error: 'Lỗi khi lấy danh mục!' });
            } else {
                app.model.document.get(req.params.documentId, (error, item) => {
                    res.send({
                        error,
                        categories: categories.map((item) => ({ id: item._id, text: item.title })),
                        item
                    });
                });
            }
        });
    });

    app.post('/api/document', app.permission.check('document:write'), (req, res) =>
        app.model.document.create(req.body.data || {}, (error, item) => res.send({ error, item })
        ));

    app.put('/api/document', app.permission.check('document:write'), (req, res) => {
        const changes = req.body.changes;
        if (changes.categories && changes.categories == 'empty') changes.categories = [];
        app.model.document.update(req.body._id, req.body.changes, (error, item) => res.send({ error, item }))
    });

    app.delete('/api/document', app.permission.check('document:write'), (req, res) =>
        app.model.document.delete(req.body._id, (error) => res.send({ error }))
    );

    // Home -----------------------------------------------------------------------------------------------------------------------------------------
    app.get('/document/page/:pageNumber/:pageSize', (req, res) => {
        const pageNumber = parseInt(req.params.pageNumber),
            pageSize = parseInt(req.params.pageSize);
        app.model.document.getPage(pageNumber, pageSize, { active: true }, (error, page) => {
            const response = {};
            if (error || page == null) {
                response.error = 'Danh sách tin tức không sẵn sàng!';
            } else {
                response.page = page;
            }
            res.send(response);
        });
    });

    app.get('/document/page/:pageNumber/:pageSize/:categoryType', (req, res) => {
        const pageNumber = parseInt(req.params.pageNumber), pageSize = parseInt(req.params.pageSize),
            condition = {
                categories: req.params.categoryType,
                active: true,
            };

        app.model.document.getPage(pageNumber, pageSize, condition, (error, page) => {
            const response = {};
            if (error || page == null) {
                response.error = 'Danh sách khoá học không sẵn sàng!';
            } else {
                response.page = page;
            }

            res.send(response);
        });
    });

    app.get('/document/item/id/:documentId', (req, res) => {
        app.model.document.get({ _id: req.params.documentId, active: true }, (error, item) => res.send({ error, item }))
    });

    app.get('/document/item/link/:documentLink', (req, res) => {
        app.model.document.get({ link: req.params.documentLink, active: true }, (error, item) =>
            res.send({ error, item })
        )
    });

    app.put('/document/item/check-link', (req, res) =>
        app.model.document.get({ link: req.body.link }, (error, item) => {
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