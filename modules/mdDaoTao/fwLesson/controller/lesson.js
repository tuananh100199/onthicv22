module.exports = (app) => {
    const menu = {
        parentMenu: app.parentMenu.trainning,
        menus: {
            4030: { title: 'Bài học', link: '/user/dao-tao/bai-hoc/list' },
        },
    };
    app.permission.add({ name: 'lesson:read', menu }, { name: 'lesson:write', menu });

    app.get('/user/dao-tao/bai-hoc/list', app.permission.check('lesson:read'), app.templates.admin);
    app.get('/user/dao-tao/bai-hoc/edit/:_id', app.templates.admin);
    app.get('/user/dao-tao/bai-hoc/view/:_id', app.templates.admin);

    // APIs ------------------------------------------------------------------------------------------------------------
    app.get('/api/lesson/page/:pageNumber/:pageSize', app.permission.check('lesson:read'), (req, res) => {
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

    app.get('/api/lesson/edit/:_id', app.permission.check('lesson:read'), (req, res) => {
        app.model.lesson.get(req.params._id, (error, item) => res.send({ error, item }));
    });


    app.post('/api/lesson', app.permission.check('lesson:write'), (req, res) => {
        app.model.lesson.create(req.body.data || {}, (error, item) => res.send({ error, item }));
    });

    app.put('/api/lesson', app.permission.check('lesson:write'), (req, res) => {
        const changes = req.body.changes;
        if (changes.categories && changes.categories == 'empty') changes.categories = [];
        app.model.lesson.update(req.body._id, req.body.changes, (error, item) => res.send({ error, item }));
    });

    app.delete('/api/lesson', app.permission.check('lesson:write'), (req, res) => {
        app.model.lesson.delete(req.body._id, (error) => res.send({ error }));
    });

    //Lesson Video
    app.get('/api/lesson-video/:lessonId', (req, res) => {
        app.model.lesson.get(req.params.lessonId, { select: '_id lessonVideo', populate: true }, (error, item) => res.send({ error, item }));
    });

    //Question ---------------------------------------------------------------------------------------------------------
    app.get('/api/lesson-question/:lessonId', (req, res) => {
        app.model.lesson.get(req.params.lessonId, { select: '_id lessonQuestion', populate: true }, (error, item) => res.send({ error, item }));
    });

    app.post('/api/lesson-question/:_id', app.permission.check('lesson:write'), (req, res) => {
        const _id = req.params._id, data = req.body.data;
        app.model.lessonQuestion.create(data, (error, question) => {
            if (error || !question) {
                res.send({ error });
            } else {
                app.model.lesson.pushLessonQuestion({ _id }, question._id, question.title, question.defaultAnswer, question.content, question.active, question.typeValue, (error, item) => {
                    res.send({ error, item });
                });
            }
        });
    });

    app.put('/api/lesson-question', app.permission.check('lesson:write'), (req, res) => {
        app.model.lessonQuestion.update(req.body._id, req.body._id, (error, question) => res.send({ error, question }));
    });

    app.put('/api/lesson-question/swap', app.permission.check('lesson:write'), (req, res) => {
        app.model.lesson.update(req.body.lessonId, req.body.data, (error, item) => res.send({ error, item }));
    });

    app.delete('/api/lesson-question', app.permission.check('lesson:write'), (req, res) => {
        const { data, lessonId, _id } = req.body;
        if (data.questions && data.questions == 'empty') data.questions = [];
        app.model.lesson.update(lessonId, data, (error, _) => {
            if (error) {
                res.send({ error });
            } else {
                app.model.lessonQuestion.delete(_id, error => res.send({ error }));
            }
        });
    });
};
