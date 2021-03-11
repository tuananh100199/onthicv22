module.exports = (app) => {
    const menu = {
        parentMenu: { index: 8000, title: 'Đào tạo', icon: 'fa-graduation-cap' },
        menus: {
            8020: { title: 'Quản lý bài học', link: '/user/dao-tao/bai-hoc/list' },
        },
    };
    app.permission.add({ name: 'baihoc:read', menu }, { name: 'baihoc:write', menu });
    app.get('/user/dao-tao/bai-hoc/list', app.permission.check('baihoc:read'), app.templates.admin);
    app.get('/user/dao-tao/bai-hoc/edit/:baiHocId', app.templates.admin);
    app.get('/user/dao-tao/bai-hoc/view/:baiHocId', app.templates.admin);

    // APIs ------------------------------------------------------------------------------------------------------------
    app.get('/api/bai-hoc/page/:pageNumber/:pageSize', app.permission.check('baihoc:read'), (req, res) => {
        let pageNumber = parseInt(req.params.pageNumber),
            pageSize = parseInt(req.params.pageSize),
            condition = req.query.condition || '',
            pageCondition = {};
        try {
            if (condition) {
                const value = { $regex: `.*${condition}.*`, $options: 'i' };
                pageCondition['$or'] = [
                    { title: value },
                ];
            }
            app.model.lesson.getPage(pageNumber, pageSize, pageCondition, (error, page) => res.send({ error, page }));
        } catch (error) {
            res.send({ error });
        }
    });

    app.get('/api/bai-hoc/edit/:baiHocId', app.permission.check('baihoc:read'), (req, res) =>
        app.model.lesson.get(req.params.baiHocId, (error, item) => res.send({ error, item })));


    app.post('/api/bai-hoc', app.permission.check('baihoc:write'), (req, res) =>
        app.model.lesson.create(req.body.data || {}, (error, item) => res.send({ error, item })
        ));

    app.put('/api/bai-hoc', app.permission.check('baihoc:write'), (req, res) => {
        const changes = req.body.changes;
        if (changes.categories && changes.categories == 'empty') changes.categories = [];
        app.model.lesson.update(req.body._id, req.body.changes, (error, item) => res.send({ error, item }))
    });

    app.delete('/api/bai-hoc', app.permission.check('baihoc:write'), (req, res) =>
        app.model.lesson.delete(req.body._id, (error) => res.send({ error }))
    );
    //Lesson Video
    app.get('/api/lesson-video/:lessonId', (req, res) => {
        const lessonId = req.params.lessonId;
        app.model.lesson.get(lessonId, { select: '_id lessonVideo', populate: true }, (error, item) => {
            res.send({ error, item });
        });
    });
    app.post('/api/lesson-video/:_id', app.permission.check('baihoc:write'), (req, res) => {
        const _id = req.params._id, data = req.body.data;
        app.model.lessonVideo.create(data, (error, lessonVideo) => {
            if (error || !lessonVideo) {
                res.send({ error });
            } else {
                app.model.lesson.pushLessonVideo({ _id }, lessonVideo._id, lessonVideo.title, lessonVideo.link, (error, item) => {
                    res.send({ error, item });
                });
            }
        });
    });
};
