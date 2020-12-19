module.exports = app => {
    const menu = {
        parentMenu: { index: 3000, title: 'Đơn đề nghị học - sát hạch', link: '/user/don-de-nghi-hoc/list', icon: 'fa-file-text-o' }
    };
    
    const menuDonDeNghiHoc = {
        parentMenu: app.parentMenu.user,
        menus: {
            1020: { title: 'Đơn đề nghị học, sát hạch', link: '/user/bieu-mau/don-de-nghi-hoc', icon: 'fa-id-card-o', backgroundColor: '#032b91', groupIndex: 1 }
        }
    }
    
    app.permission.add(
        { name: 'applicationForm:read', menu },
        { name: 'applicationForm:write', menu },
        { name: 'user:login', menu: menuDonDeNghiHoc }
    );

    app.get('/user/don-de-nghi-hoc/list', app.permission.check('applicationForm:read'), app.templates.admin);
    app.get('/user/don-de-nghi-hoc/edit/:_id', app.permission.check('applicationForm:read'), app.templates.admin);
    app.get('/user/don-de-nghi-hoc-chi-tiet/item/:_id', app.permission.check('applicationForm:read'), app.templates.admin);
    app.get('/user/bieu-mau/don-de-nghi-hoc', app.permission.check(), app.templates.admin);
    
    //APIs -------------------------------------------------------------------------------------------------------------
    // Admin
    app.get('/api/application-form/page/:pageNumber/:pageSize', app.permission.check('applicationForm:read'), (req, res) => {
        const pageNumber = parseInt(req.params.pageNumber), pageSize = parseInt(req.params.pageSize),
        condition = req.query.condition || { searchText: '' },
        pageCondition = {};
        if (condition) {
            const value = { $regex: `.*${condition.searchText}.*`, $options: 'i' };
        pageCondition['$or'] = [
            { firstname: value },
            { lastname: value },
        ];
        }
        app.model.user.getAll(pageCondition, (error, users) => {
            if (error) {
                res.send({ error })
            } else {
                const userIds = users.map(user => user._id);
                app.model.applicationForm.getPage(pageNumber, pageSize, { user: { $in: userIds } }, (error, page) => {
                    if (error || page == null) {
                        res.send({ error: 'Danh sách đơn đề nghị sát hạch không sẵn sàng!' });
                    } else {
                        res.send({ page });
                    }
                });     
            }
        })
    });

    app.get('/api/application-form/item/:_id', app.permission.check('applicationForm:read'), (req, res) => {
        app.model.applicationForm.get(req.params._id, (error, item) => res.send({ error, item }));
    });

    app.get('/api/application-form/info-user/:_id', app.permission.check('applicationForm:read'), (req, res) => {
        app.model.applicationForm.get(req.params._id, (error, item) => res.send({ error, item }));
    });

    app.post('/api/application-form', app.permission.check('applicationForm:write'), (req, res) => {
        app.model.applicationForm.create(req.body.data, (error, item) => {
            res.send({ error, item })
        })
    });

    app.put('/api/application-form', app.permission.check('applicationForm:write'), (req, res) => {
        const $set = req.body.changes, $unset = {};
        app.model.applicationForm.update(req.body._id, $set, $unset, (error, item) => res.send({ error, item }));
    });

    app.delete('/api/application-form', app.permission.check('applicationForm:write'), (req, res) => app.model.applicationForm.delete(req.body._id, error => res.send({ error })));
    
    // User
    app.get('/api/user-application-form', app.permission.check('user:login'), (req, res) => {
        const user = req.session.user;
        app.model.applicationForm.get({ user: user._id }, (error, item) => {
            if (error) {
                 res.send({ error })
            } else if (item) {
                res.send({ item })
            } else {
                app.model.applicationForm.create({ user: user._id }, (error, item) => res.send({ error, item }));
            }
        })
    });
};