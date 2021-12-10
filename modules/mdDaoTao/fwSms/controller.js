module.exports = app => {
    app.permission.add(
        { name: 'sms:read', menu: { parentMenu: app.parentMenu.trainning, menus: {5100: { title: 'SMS Banking', link: '/user/sms' }} } },
        { name: 'sms:write' },
        { name: 'sms:delete' },
    );

    app.get('/user/sms', app.permission.check('sms:read'), app.templates.admin);

    app.post('/api/sms', app.permission.check('sms:write'), (req, res) => {
        app.model.sms.create(req.body.data, (error, item) => res.send({ error, item }));
    });

    app.get('/api/sms/page/:pageNumber/:pageSize', app.permission.check('sms:read'), (req, res) => {
        let pageNumber = parseInt(req.params.pageNumber),
            pageSize = parseInt(req.params.pageSize),
            condition = req.query.pageCondition || {};
        try {
            condition.isHandled = false;
            app.model.sms.getPage(pageNumber, pageSize, condition, (error, page) => res.send({ error, page }));
        } catch (error) {
            res.send({ error });
        }
    });

    app.delete('/api/sms', app.permission.check('sms:delete'), (req, res) => {
        const user = req.session.user;
        if (user.roles.some(role => role.name == 'admin')) {
            app.model.sms.delete(req.body._id, error => res.send({ error }));
        } else res.send({ error: 'Bạn không có quyền xóa SMS' });
    });
};