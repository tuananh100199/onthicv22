module.exports = (app) => {
    const menu = {
        parentMenu: { index: 7000, title: 'Quản lý khóa học', icon: 'fa-file' },
        menus: {
            6001: { title: 'Danh mục', link: '/user/course/category' },
            6002: { title: 'Khóa học', link: '/user/course/list' },
            // 6003: { title: 'Chờ duyệt', link: '/user/course/draft' },
        },
    };
    app.permission.add({ name: 'course:read', menu }, { name: 'course:write', menu }, );
    app.get('/user/course/category', app.permission.check('category:read'), app.templates.admin);
    app.get('/user/course/list', app.permission.check('course:read'), app.templates.admin);
    app.get('/user/course/edit/:_id', app.permission.check('course:read'), app.templates.admin);
    // app.get('/user/course/draft', app.permission.check('course:read'), app.templates.admin);
    // app.get('/user/course/draft/edit/:_id', app.permission.check('course:draft'), app.templates.admin);

    app.get('/course/item/:_id', app.templates.home);
    app.get('/tintuc/:link', app.templates.home);

    // APIs -----------------------------------------------------------------------------------------------------------------------------------------
    app.get('/api/course/page/:pageNumber/:pageSize', app.permission.check('course:read'), (req, res) => {
        const pageNumber = parseInt(req.params.pageNumber),
            pageSize = parseInt(req.params.pageSize);
        app.model.course.getPage(pageNumber, pageSize, {}, (error, page) => {
            const respone = {};
            if (error || page == null) {
                respone.error = 'Danh sách tin tức không sẵn sàng!';
            } else {
                let list = page.list.map((item) =>
                    app.clone(item, { content: null })
                );
                respone.page = app.clone(page, { list });
            }
            res.send(respone);
        });
    });
    // app.get('/api/draft/course/:userId', app.permission.check('course:read'), (req, res) => {
    //     userId = req.params.userId;
    //     app.model.draft.userGet('course', userId, (error, page) => {
    //         if (error) respone.error = 'Danh sách mẫu tin tức không sẵn sàng!';
    //         res.send(page);
    //     });
    // });

    // app.get('/api/draft-course/page/:pageNumber/:pageSize', app.permission.check('course:draft'), (req, res) => {
    //     const user = req.session.user,
    //         condition = user.permissions.includes('course:write') ? { documentType: 'course' } : { documentType: 'course', editorId: user._id };
    //     const pageNumber = parseInt(req.params.pageNumber),
    //         pageSize = parseInt(req.params.pageSize);
    //     app.model.draft.getPage(pageNumber, pageSize, condition, (error, page) => {
    //         res.send({ error, page });
    //     });
    // });

    app.post('/api/course/default', app.permission.check('course:write'), (req, res) =>
        app.model.course.create({ title: 'Bài viết', active: false },
            (error, item) => res.send({ error, item })
        ));

    app.delete('/api/course', app.permission.check('course:write'), (req, res) =>
        app.model.course.delete(req.body._id, (error) => res.send({ error }))
    );

    // app.post('/api/course/draft', app.permission.check('course:draft'), (req, res) =>
    //     app.model.draft.create(req.body, (error, item) => res.send({ error, item }))
    // );

    // app.delete('/api/draft-course', app.permission.check('course:draft'), (req, res) =>
    //     app.model.draft.delete(req.body._id, (error) => res.send({ error }))
    // );

    app.put('/api/course/swap', app.permission.check('course:write'), (req, res) => {
        const isMoveUp = req.body.isMoveUp.toString() == 'true';
        app.model.course.swapPriority(req.body._id, isMoveUp, (error) =>
            res.send({ error })
        );
    });

    app.put('/api/course', app.permission.check('course:write'), (req, res) =>
        app.model.course.update(req.body._id, req.body.changes, (error, item) =>
            res.send({ error, item })
        )
    );

    app.get(
        '/api/course/item/:courseId',
        app.permission.check('course:read'),
        (req, res) => {
            app.model.category.getAll({ type: 'course', active: true },
                (error, categories) => {
                    if (error || categories == null) {
                        res.send({ error: 'Lỗi khi lấy danh mục!' });
                    } else {
                        app.model.course.get(req.params.courseId, (error, item) => {
                            res.send({
                                error,
                                categories: categories.map((item) => ({
                                    id: item._id,
                                    text: item.title,
                                })),
                                item,
                            });
                        });
                    }
                }
            );
        }
    );
    // app.get(
    //     '/api/draft-course/toCourse/:draftId',
    //     app.permission.check('course:write'),
    //     (req, res) => {
    //         app.model.draft.toCourse(req.params.draftId, (error, item) =>
    //             res.send({ error, item })
    //         );
    //     }
    // );
    // app.get(
    //     '/api/draft-course/item/:courseId',
    //     app.permission.check('course:draft'),
    //     (req, res) => {
    //         app.model.category.getAll({ type: 'course', active: true },
    //             (error, categories) => {
    //                 if (error || categories == null) {
    //                     res.send({ error: 'Lỗi khi lấy danh mục!' });
    //                 } else {
    //                     app.model.draft.get(req.params.courseId, (error, item) => {
    //                         res.send({
    //                             error,
    //                             categories: categories.map((item) => ({
    //                                 id: item._id,
    //                                 text: item.title,
    //                             })),
    //                             item,
    //                         });
    //                     });
    //                 }
    //             }
    //         );
    //     }
    // );

    // app.put('/api/draft-course', app.permission.check('course:draft'), (req, res) =>
    //     app.model.draft.update(req.body._id, req.body.changes, (error, item) =>
    //         res.send({ error, item })
    //     )
    // );

    // Home -----------------------------------------------------------------------------------------------------------------------------------------
    app.get('/course/page/:pageNumber/:pageSize', (req, res) => {
        const pageNumber = parseInt(req.params.pageNumber),
            pageSize = parseInt(req.params.pageSize),
            today = new Date(),
            user = req.session.user;
        const condition = {
            $or: [
                { startPost: null },
                { startPost: { $exists: false } },
                { startPost: { $lte: today } },
            ],
            $or: [
                { stopPost: null },
                { stopPost: { $exists: false } },
                { stopPost: { $gte: today } },
            ],
            active: true,
        };

        if (!user) condition.isInternal = false;

        app.model.course.getPage(pageNumber, pageSize, condition, (error, page) => {
            const respone = {};
            if (error || page == null) {
                respone.error = 'Danh sách tin tức không sẵn sàng!';
            } else {
                let list = page.list.map((item) => app.clone(item, { content: null }));
                respone.page = app.clone(page, { list });
            }
            res.send(respone);
        });
    });

    app.get('/course/page/:pageNumber/:pageSize/:categoryType', (req, res) => {
        const pageNumber = parseInt(req.params.pageNumber),
            pageSize = parseInt(req.params.pageSize),
            today = new Date(),
            user = req.session.user;
        const condition = {
            categories: req.params.categoryType,
            $or: [
                { startPost: null },
                { startPost: { $exists: false } },
                { startPost: { $lte: today } },
            ],
            $or: [
                { stopPost: null },
                { stopPost: { $exists: false } },
                { stopPost: { $gte: today } },
            ],
            active: true,
        };
        if (!user) condition.isInternal = false;

        app.model.course.getPage(pageNumber, pageSize, condition, (error, page) => {
            const respone = {};
            if (error || page == null) {
                respone.error = 'Danh sách tin tức không sẵn sàng!';
            } else {
                let list = page.list.map((item) => app.clone(item, { content: null }));
                respone.page = app.clone(page, { list });
            }
            res.send(respone);
        });
    });

    const readCourse = (req, res, error, item) => {
        // if (item) {
        //     item.content = app.language.parse(req, item.content);
        // }
        res.send({ error, item });
    };
    app.get('/course/item/id/:courseId', (req, res) =>
        app.model.course.readById(req.params.courseId, (error, item) =>
            readCourse(req, res, error, item)
        )
    );
    app.get('/course/item/link/:courseLink', (req, res) =>
        app.model.course.readByLink(req.params.courseLink, (error, item) =>
            readCourse(req, res, error, item)
        )
    );
    app.put('/course/item/check-link', (req, res) =>
        app.model.course.getByLink(req.body.link, (error, item) => {
            res.send({
                error: error ?
                    'Lỗi hệ thống' : item == null || item._id == req.body._id ?
                    null : 'Link không hợp lệ',
            });
        })
    );

    // Hook upload images ---------------------------------------------------------------------------------------------------------------------------s
    app.createFolder(
        // app.path.join(app.publicPath, '/img/draft'),
        // app.path.join(app.publicPath, '/img/draft/course'),
        app.path.join(app.publicPath, '/img/course')
        // app.path.join(app.publicPath, '/img/draftCourse')
    );

    app.uploadHooks.add(
        'uploadCourseCkEditor',
        (req, fields, files, params, done) =>
        app.permission.has(
            req,
            () => app.uploadCkEditorImage('course', fields, files, params, done),
            done,
            'course:write'
        )
    );

    const uploadcourseAvatar = (req, fields, files, params, done) => {
        if (
            fields.userData &&
            fields.userData[0].startsWith('course:') &&
            files.CourseImage &&
            files.CourseImage.length > 0
        ) {
            console.log('Hook: uploadCourseAvatar => course image upload');
            app.uploadComponentImage(
                req,
                'course',
                app.model.course.get,
                fields.userData[0].substring(5),
                files.CourseImage[0].path,
                done
            );
        }
    };
    app.uploadHooks.add('uploadCourseAvatar', (req, fields, files, params, done) =>
        app.permission.has(
            req,
            () => uploadCourseAvatar(req, fields, files, params, done),
            done,
            'course:write'
        )
    );

    // const uploadCourseDraftAvatar = (req, fields, files, params, done) => {
    //     if (
    //         fields.userData &&
    //         fields.userData[0].startsWith('draftCourse:') &&
    //         files.CourseDraftImage &&
    //         files.CourseDraftImage.length > 0
    //     ) {
    //         console.log('Hook: uploadCourseDraftAvatar => course draft image upload');
    //         app.uploadComponentImage(
    //             req,
    //             'draftCourse',
    //             app.model.draft.get,
    //             fields.userData[0].substring(10),
    //             files.CourseDraftImage[0].path,
    //             done
    //         );
    //     }
    // };
    // app.uploadHooks.add(
    //     'uploadCourseDraftAvatar',
    //     (req, fields, files, params, done) =>
    //     app.permission.has(
    //         req,
    //         () => uploadCourseDraftAvatar(req, fields, files, params, done),
    //         done,
    //         'course:draft'
    //     )
    // );
};