module.exports = app => {
    const menu = {
        parentMenu: { index: 9000, title: 'Truyền thông', icon: 'fa fa-bullhorn' },
        menus: {
            9030: { title: 'Đăng ký nhận tin', link: '/user/subscribe', icon: 'fa-envelope-o', backgroundColor: '#00897b' },
        },
    };
    app.permission.add({ name: 'subscribe:read', menu }, { name: 'subscribe:delete' });

    app.get('/user/subscribe', app.permission.check('subscribe:read'), app.templates.admin);

    // APIs -----------------------------------------------------------------------------------------------------------------------------------------
    app.get('/api/subscribe/page/:pageNumber/:pageSize', app.permission.check('subscribe:read'), (req, res) => {
        const pageNumber = parseInt(req.params.pageNumber),
            pageSize = parseInt(req.params.pageSize);
        app.model.subscribe.getPage(pageNumber, pageSize, {}, (error, page) => {
            page.list = page.list.map(item => app.clone(item, { message: '' }));
            res.send({ error, page });
        });
    });

    app.get('/api/subscribe/all', app.permission.check('subscribe:read'), (req, res) => app.model.subscribe.getAll((error, items) => res.send({ error, items })));

    app.get('/api/subscribe/unread', app.permission.check('subscribe:read'), (req, res) => app.model.subscribe.getUnread((error, items) => res.send({ error, items })));

    app.get('/api/subscribe/item/:_id', app.permission.check('subscribe:read'), (req, res) => app.model.subscribe.read(req.params._id, (error, item) => {
        if (item) app.io.emit('subscribe-changed', item);
        res.send({ error, item });
    }));

    app.delete('/api/subscribe', app.permission.check('subscribe:delete'), (req, res) => app.model.subscribe.delete(req.body._id, error => res.send({ error })));


    // Home -----------------------------------------------------------------------------------------------------------------------------------------
    app.post('/api/subscribe', (req, res) => app.model.subscribe.create(req.body.subscribe, (error, item) => {
        if (item) {
            app.io.emit('subscribe-added', item);

            app.model.setting.get('email', 'emailPassword', 'emailContactTitle', 'emailContactText', 'emailContactHtml', result => {
                let mailSubject = result.emailContactTitle.replaceAll('{name}', item.name).replaceAll('{subject}', item.subject).replaceAll('{message}', item.message),
                    mailText = result.emailContactText.replaceAll('{name}', item.name).replaceAll('{subject}', item.subject).replaceAll('{message}', item.message),
                    mailHtml = result.emailContactHtml.replaceAll('{name}', item.name).replaceAll('{subject}', item.subject).replaceAll('{message}', item.message);
                app.email.sendEmail(result.email, result.emailPassword, item.email, [], mailSubject, mailText, mailHtml, null)
            });
        }
        res.send({ error, item });
    }));
};