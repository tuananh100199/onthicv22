module.exports = (app) => {
    const menu = {
        parentMenu: app.parentMenu.trainning,
        menus: {
            4070: { title: 'Lớp ôn tập', link: '/user/review-class', icon: 'fa-bars', backgroundColor: '#00b0ff' },
        },
    };

    app.permission.add(
        { name: 'reviewClass:read', menu }, { name: 'reviewClass:write' }, { name: 'reviewClass:delete' },
    );

    app.get('/user/review-class', app.permission.check('reviewClass:read'), app.templates.admin);
    app.get('/user/review-class/:_id', app.permission.check('reviewClass:read'), app.templates.admin);
    app.get('/user/hoc-vien/khoa-hoc/:courseId/mon-hoc/lop-on-tap/:_id', app.permission.check('user:login'), app.templates.admin);
    

    // APIs ------------------------------------------------------------------------------------------------------------
    app.get('/api/review-class/page/:pageNumber/:pageSize', (req, res) => {
        const pageNumber = parseInt(req.params.pageNumber),
            pageSize = parseInt(req.params.pageSize);
        app.model.reviewClass.getPage(pageNumber, pageSize, {}, (error, page) => {
            res.send({ page, error: error ? 'Danh sách lớp ôn tập không sẵn sàng!' : null });
        });
    });

    app.get('/api/review-class/all', (req, res) => {//mobile
        const condition = req.query.condition || {};
        app.model.reviewClass.getAll(condition,(error, list) => res.send({ error, list }));
    });

    app.get('/api/review-class', (req, res) => {
        app.model.reviewClass.get(req.query._id, (error, item) => res.send({ error, item }));
    });

    app.post('/api/review-class', app.permission.check('reviewClass:write'), (req, res) => {
        app.model.reviewClass.create(req.body.data, (error, item) => res.send({ error, item }));
    });

    app.put('/api/review-class', app.permission.check('reviewClass:write'), (req, res) => {
        const { _id, changes } = req.body;
        app.model.reviewClass.update(_id, changes, (error, item) => res.send({ error, item }));

    });

    app.put('/api/review-class/student', app.permission.check('user:login'), (req, res) => {
        const { _id, student } = req.body;
        app.model.reviewClass.get(_id, (error, item) => {
            if(error) res.send({error});
            else{
                const remainStudent = item.remainStudent;
                app.model.reviewClass.update(_id, {remainStudent: remainStudent - 1}, () => {
                    app.model.reviewClass.addStudent(_id, student, (error, item) => res.send({ error, item }));
                });
            }
        });
    });

    app.delete('/api/review-class/student', app.permission.check('reviewClass:write'), (req, res) => {
        const { _id, _studentId } = req.body;
        app.model.reviewClass.get(_id, (error, item) => {
            if(error) res.send({error});
            else{
                const remainStudent = item.remainStudent;
                app.model.reviewClass.update(_id, {remainStudent: remainStudent + 1}, () => {
                    app.model.reviewClass.deleteLesson(_id, _studentId, (error) => {
                        if (error) {
                            res.send({ error });
                        } else {
                            app.model.reviewClass.get(_id, (error, item) => res.send({ error, item }));
                        }
                    });
                });
            }
        });
        
    });

    app.delete('/api/review-class', app.permission.check('reviewClass:delete'), (req, res) => {
        const { _id } = req.body;
        app.model.reviewClass.delete(_id, (error) => res.send({ error }));
    });

};