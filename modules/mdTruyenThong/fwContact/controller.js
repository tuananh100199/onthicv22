module.exports = app => {
    const menu = {
        parentMenu: { index: 9000, title: 'Truyền thông', icon: 'fa fa-bullhorn' },
        menus: {
            9020: { title: 'Liên hệ', link: '/user/contact', icon: 'fa-envelope-o', backgroundColor: '#00897b' },
        },
    };
    app.permission.add(
        { name: 'contact:read', menu },
        { name: 'contact:write', menu },
    );

    app.get('/contact(.htm(l)?)?', app.templates.home);
    app.get('/user/contact', app.permission.check('contact:read'), app.templates.admin);

    // APIs -----------------------------------------------------------------------------------------------------------------------------------------
    app.get('/api/contact/page/:pageNumber/:pageSize', app.permission.check('contact:read'), (req, res) => {
        const pageNumber = parseInt(req.params.pageNumber),
            pageSize = parseInt(req.params.pageSize);
        app.model.contact.getPage(pageNumber, pageSize, {}, (error, page) => {
            page.list = page.list.map(item => app.clone(item, { message: '' }));
            res.send({ error, page });
        });
    });

    app.get('/api/contact/all', app.permission.check('contact:read'), (req, res) => app.model.contact.getAll((error, items) => res.send({ error, items })));

    app.get('/api/contact/unread', app.permission.check('contact:read'), (req, res) => app.model.contact.getUnread((error, items) => res.send({ error, items })));

    app.get('/api/contact/item/:_id', app.permission.check('contact:write'), (req, res) => app.model.contact.read(req.params._id, (error, item) => {
        if (item) app.io.emit('contact-changed', item);
        res.send({ error, item });
    }));

    app.delete('/api/contact', app.permission.check('contact:write'), (req, res) => app.model.contact.delete(req.body._id, error => res.send({ error })));


    // Home -----------------------------------------------------------------------------------------------------------------------------------------
    app.post('/api/contact', (req, res) => app.model.contact.create(req.body.contact, (error, item) => {
        if (item) {
            app.io.emit('contact-added', item);

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