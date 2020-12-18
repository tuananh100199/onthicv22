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

    app.permission.add({ name: 'applicationForm:read', menu }, { name: 'applicationForm:write', menu }, { name: 'user:login', menu: menuDonDeNghiHoc });

    app.get('/user/don-de-nghi-hoc/list', app.permission.check('applicationForm:read'), app.templates.admin);
    app.get('/user/don-de-nghi-hoc/edit/:_id', app.permission.check('applicationForm:read'), app.templates.admin);

    app.get('/user/bieu-mau/don-de-nghi-hoc', app.permission.check(), app.templates.admin);

    //APIs -------------------------------------------------------------------------------------------------------------
    // Admin
    app.get('/api/application-form/page/:pageNumber/:pageSize', app.permission.check('applicationForm:read'), (req, res) => {
        const pageNumber = parseInt(req.params.pageNumber),
            pageSize = parseInt(req.params.pageSize),
            pageCondition = req.query.pageCondition ? req.query.pageCondition : {};
        app.model.applicationForm.getPage(pageNumber, pageSize, pageCondition, (error, page) => {
            if (error || page == null) {
                res.send({ error: 'Danh sách đơn đề nghị sát hạch không sẵn sàng!' });
            } else {
                res.send({ page });
            }
        });
    });

    app.get('/api/application-form/item/:_id', app.permission.check('applicationForm:read'), (req, res) => {
        app.model.applicationForm.get(req.params._id, (error, item) => res.send({ error, item }));
    });

    app.post('/api/application-form', app.permission.check('applicationForm:write'), (req, res) => {
        app.model.applicationForm.create(req.body.data, (error, item) => {
            res.send({ error, item })
        })
    });

    app.put('/api/application-form', app.permission.check('applicationForm:write'), (req, res) => {
        const $set = req.body.changes,
            $unset = {};
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
    app.put('/api/user-application-form', app.permission.check('user:login'), (req, res) => {
        // changes1: changes of form
        // changes2: changes of user
        const user = req.session.user,
            $setOfForm = req.body.changes1,
            $setOfUser = req.body.changes2,
            $unset = {};

        app.model.applicationForm.update(req.body._id, $setOfForm, $unset, (error, item) => res.send({ error, item }));

        app.model.user.update(req.session.user._id, $setOfUser, $unset, (error, user) => {
            if (user) {
                app.updateSessionUser(req, user, sessionUser => res.send({ error, user: sessionUser }))
            } else {
                res.send({ error, user: req.session.user });
            }
        })
    });
};