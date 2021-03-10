module.exports = (app) => {
    const menu = {
        parentMenu: { index: 8000, title: 'Đào tạo', link: '/user/dao-tao', icon: 'fa-graduation-cap', subMenusRender: false },
        menus: {
            8020: { title: 'Quản lý môn học', link: '/user/dao-tao/mon-hoc/list', icon: 'fa-list', backgroundColor: '#032b91', groupIndex: 0 },
            // 8021: { title: 'Quản lý bài học', link: '/user/dao-tao/bai-hoc/list', icon: 'fa-list', backgroundColor: '#032b91', groupIndex: 0 },
        }
    };
    app.permission.add({ name: 'lesson:read', menu }, { name: 'lesson:write', menu });
    app.get('/user/dao-tao', app.permission.check('lesson:read'), app.templates.admin);
    app.get('/user/dao-tao/mon-hoc/list', app.permission.check('lesson:read'), app.templates.admin);
    app.get('/user/dao-tao/mon-hoc/edit/:monHocId', app.templates.admin);
    app.get('/user/dao-tao/mon-hoc/list-bai-hoc/:monHocId', app.templates.admin);
    // APIs ------------------------------------------------------------------------------------------------------------
    app.get('/api/mon-hoc/page/:pageNumber/:pageSize', app.permission.check('lesson:read'), (req, res) => {
        const pageNumber = parseInt(req.params.pageNumber),
            pageSize = parseInt(req.params.pageSize);
        app.model.subject.getPage(pageNumber, pageSize, {}, (error, page) => {
            const response = {};
            if (error || page == null) {
                response.error = 'Danh sách môn học không sẵn sàng!';
            } else {
                response.page = page;
            }
            res.send(response);
        });
    });

    app.get('/api/mon-hoc/edit/:monHocId', app.permission.check('lesson:read'), (req, res) =>
        app.model.subject.get(req.params.monHocId, (error, item) => res.send({ error, item })));


    app.post('/api/mon-hoc', app.permission.check('lesson:write'), (req, res) =>
        app.model.subject.create(req.body.data || {}, (error, item) => res.send({ error, item })
        ));

    app.put('/api/mon-hoc', app.permission.check('lesson:write'), (req, res) => {
        const changes = req.body.changes;
        if (changes.categories && changes.categories == 'empty') changes.categories = [];
        app.model.subject.update(req.body._id, req.body.changes, (error, item) => res.send({ error, item }))
    });

    app.delete('/api/mon-hoc', app.permission.check('lesson:write'), (req, res) =>
        app.model.subject.delete(req.body._id, (error) => res.send({ error }))
    );
    app.get('/api/baihoc/:subjectId', (req, res) => {
        const subjectId = req.params.subjectId;
        app.model.subject.get(subjectId, { select: '_id lesson', populate: true }, (error, item) => {
            res.send({ error, item });
        });
    });
    app.post('/api/baihoc/add/:subjectId', app.permission.check('lesson:write'), (req, res) => {
        const subjectId = req.params.subjectId, lessonId = req.body.lessonId;
        app.model.subject.get({ _id: subjectId, lesson: { _id: lessonId } }, (error, item) => {
            if (error) {
                res.send({ error, item });
            } else if (item) {
                res.send({ check: `Môn học đã có bài học này!` });
            } else {
                app.model.subject.pushLesson({ _id: subjectId }, lessonId, (error, item) => {
                    res.send({ error, item });
                });
            }
        });
    });
    app.post('/api/baihoc/delete/:subjectId', app.permission.check('lesson:write'), (req, res) => {
        const subjectId = req.params.subjectId, lessonId = req.body.lessonId;
        app.model.subject.pullLesson({ _id: subjectId }, lessonId, (error, item) => {
            res.send({ error, item });
        });
    });
    app.put('/api/bai-hoc/swap', app.permission.check('form:write'), (req, res) => {
        const data = req.body.data, _id = req.body._id;
        app.model.subject.update(_id, data, (error, item) => {
            res.send({ error, item });
        });
    });
    // app.delete('/api/lesson', app.permission.check('lesson:write'), (req, res) => {
    //     const { data, monhocId, _id } = req.body;
    //     if (data.questions && data.questions == 'empty') data.questions = [];
    //     app.model.subject.update(monhocId, data, (error, _) => {
    //         if (error) {
    //             res.send({ error });
    //         } else {
    //             app.model.lesson.delete(_id, error => res.send({ error }));
    //         }
    //     });
    // });
};
