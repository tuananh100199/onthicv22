module.exports = (app) => {
    const menu = {
        parentMenu: app.parentMenu.accountant,
        menus: {
            7001: { title: 'Gói học phí', link: '/user/course-fee', icon: 'fa-money', backgroundColor: '#00897b' },
        },
    };

    app.permission.add(
        { name: 'courseFee:read', menu }, { name: 'courseFee:write' }, { name: 'courseFee:delete' },
    );

    app.get('/user/course-fee', app.permission.check('courseFee:read'), app.templates.admin);
    app.get('/user/hoc-vien/cong-no/:_id/chinh-thuc', app.permission.check('user:login'), app.templates.admin);
    app.get('/user/hoc-vien/cong-no/:_id/tang-them', app.permission.check('user:login'), app.templates.admin);
    app.get('/user/hoc-vien/cong-no/:_id/lich-su', app.permission.check('user:login'), app.templates.admin);
    app.get('/user/hoc-vien/cong-no/:_id', app.permission.check('user:login'), app.templates.admin);

    // APIs ------------------------------------------------------------------------------------------------------------
    app.get('/api/course-fee/page/:pageNumber/:pageSize', (req, res) => {
        const pageNumber = parseInt(req.params.pageNumber),
            pageSize = parseInt(req.params.pageSize),
            condition = req.query.condition || {};
        app.model.courseFee.getPage(pageNumber, pageSize, condition, (error, page) => {
            res.send({ page, error: error ? 'Danh sách gói học phí không sẵn sàng!' : null });
        });
    });

    app.get('/api/course-fee/all', (req, res) => {//mobile
        const condition = req.query.condition || {};
        if (req.query.courseType) {
            condition.courseType = req.query.courseType;
        }
        app.model.courseFee.getAll(condition, (error, list) => res.send({ error, list }));
    });

    app.get('/api/course-fee/student', (req, res) => {
        app.model.courseFee.getAll(req.query.condition, (error, list) => res.send({ error, list }));
    });

    app.get('/api/course-fee', (req, res) => {
        app.model.courseFee.get(req.query._id, (error, item) => res.send({ error, item }));
    });

    app.post('/api/course-fee', app.permission.check('courseFee:write'), (req, res) => {
        app.model.courseFee.create(req.body.data, (error, item) => res.send({ error, item }));
    });

    app.put('/api/course-fee', app.permission.check('courseFee:write'), (req, res) => {
        const { _id, changes } = req.body;
        app.model.courseFee.update(_id, changes, (error, item) => res.send({ error, item }));

    });

    app.put('/api/course-fee/default', app.permission.check('courseFee:write'), (req, res) => {
        const { courseFee } = req.body;
        app.model.feeType.get({ official: true }, (error, feeType) => {
            if (error || feeType == null) res.send({ error });
            else {
                app.model.courseFee.update({ courseType: courseFee.courseType, feeType: feeType._id }, { isDefault: false }, (error) => {
                    if (error) res.send({ error });
                    else app.model.courseFee.update(courseFee._id, { isDefault: true }, (error, item) => {
                        res.send({ error, item });
                    });
                });
            }
        });

    });

    app.delete('/api/course-fee', app.permission.check('courseFee:delete'), (req, res) => {
        const { _id } = req.body;
        app.model.courseFee.delete(_id, (error) => res.send({ error }));
    });

};