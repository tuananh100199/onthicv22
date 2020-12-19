module.exports = app => {
    app.permission.add(
        {
            name: 'system:email',
            menu: {
                parentMenu: { index: 2000, title: 'Cấu hình', icon: 'fa-cog' },
                menus: { 2020: { title: 'Email', link: '/user/email' } }
            },
        }
    );
    app.get('/user/email', app.permission.check('system:email'), app.templates.admin);

    // Init ------------------------------------------------------------------------------------------------------------
    const init = () => {
        if (app.model && app.model.setting) {
            app.model.setting.init({
                emailRegisterMemberTitle: 'Hiệp Phát: Welcome to new member!',
                emailRegisterMemberText: 'Dear {name}, Hiệp Phát welcome you as a new member. Before you can login, please click this {url} to active your account. Best regard, Tutorial, Website: ' + app.rootUrl + '',
                emailRegisterMemberHtml: 'Dear <b>{name}</b>,<br/><br/>' +
                    'Hiệp Phát welcome you as a new member. Before you can login, please click this <a href="{url}">{url}</a> to active your account.<br/><br/>' +
                    'Best regard,<br/>' +
                    'Hiệp Phát<br/>' +
                    'Website: <a href="' + app.rootUrl + '">' + app.rootUrl + '</a>',
                emailCreateMemberByAdminTitle: 'Hiệp Phát: Welcome to new member!',
                emailCreateMemberByAdminText: 'Dear {name}, Your account has been created. Your login information is: email: {email}. Password: "{password}". Activation link: {url}. Best regard, Hiệp Phát Admin.',
                emailCreateMemberByAdminHtml: 'Dear {name},<br/><br/>Your account has been created. Your login information is: <br> - Email: {email}.<br> - Password: "{password}".<br/> - Activation link: <a href="{url}">{url}</a>.<br/><br/>Best regard,<br/>Hiệp Phát Admin.',
                emailNewPasswordTitle: 'Hiệp Phát: New password!',
                emailNewPasswordText: 'Dear {name}, Your new password is "{password}". Best regard, Hiệp Phát Admin.',
                emailNewPasswordHtml: 'Dear {name},<br/><br/>Your new password is "<b>{password}</b>".<br/><br/>Best regard,<br/>Hiệp Phát Admin.',
                emailForgotPasswordTitle: 'Hiệp Phát: Forgot password!',
                emailForgotPasswordText: 'Dear {name}, you have asked to change your password at ' + app.rootUrl + '. ' +
                    'You use this link below to change the password. ' +
                    'This link only has effect for the next 24 hours' +
                    'Link: {url}' +
                    'Best regard, ' +
                    'Hiệp Phát' +
                    'Website: ' + app.rootUrl + '',
                emailForgotPasswordHtml: '<p><b>Dear {name}, </b><br/><br/>You have asked to change your password at <a href="' + app.rootUrl + '" target="_blank">' + app.rootUrl + '</a>. ' +
                    'You use this link below to change the password. <b>This link only has effect for the next 24 hours</b><br/>' +
                    'Link: <a href="{url}">{url}</a><br/>' +
                    'Best regard, <br/>' +
                    'Hiệp Phát<br/>' +
                    'Website: <a href="' + app.rootUrl + '" target="_blank">' + app.rootUrl + '</a></p>',
                emailContactTitle: 'Hiệp Phát: Contact',
                emailContactText: 'Dear you, Hiệp Phát have been received your message. Thank you for contacting us. Your subject: "{title}". Your message is: "{message}". Tutorial will reply you soon. Best regard, Tutorial.',
                emailContactHtml: 'Dear you,<br/><br/>Hiệp Phát have been received your message. Thank you for contacting us.<br/>Your subject: "{title}".<br/>Your message is: "{message}".<br/>Tutorial will reply you soon.<br/><br/>Best regard,<br/>Tutorial.',
                emailAdminNotifyTitle: 'Hiệp Phát: Từ chối đơn đề nghị học!',
                emailAdminNotifyText: 'Dear {name}, Hiệp Phát welcome you as a new member. Before you can login, please click this {url} to active your account. Best regard, Tutorial, Website: ' + app.rootUrl + '',
                emailAdminNotifyHtml: 'Dear <b>{name}</b>,<br/><br/>' +
                    'Hiệp Phát welcome you as a new member. Before you can login, please click this <a href="{url}">{url}</a> to active your account.<br/><br/>' +
                    'Best regard,<br/>' +
                    'Hiệp Phát<br/>' +
                    'Website1: <a href="' + app.rootUrl + '">' + app.rootUrl + '</a>',
            });
        } else {
            setTimeout(init, 1000);
        }
    };
    init();

    // APIs -----------------------------------------------------------------------------------------------------------------------------------------
    const EmailParams = [
        'emailRegisterMemberTitle', 'emailRegisterMemberText', 'emailRegisterMemberHtml',
        'emailCreateMemberByAdminTitle', 'emailCreateMemberByAdminText', 'emailCreateMemberByAdminHtml',
        'emailNewPasswordTitle', 'emailNewPasswordText', 'emailNewPasswordHtml',
        'emailForgotPasswordTitle', 'emailForgotPasswordText', 'emailForgotPasswordHtml',
        'emailContactTitle', 'emailContactText', 'emailContactHtml', 'emailAdminNotifyTitle', 'emailAdminNotifyText', 'emailAdminNotifyHtml'
    ];

    app.get('/api/email/all', app.permission.check('system:email'), (req, res) => app.model.setting.get(EmailParams, result => res.send(result)));

    app.put('/api/email', app.permission.check('system:email'), (req, res) => {
        const title = req.body.type + 'Title',
            text = req.body.type + 'Text',
            html = req.body.type + 'Html',
            changes = {};

        if (EmailParams.indexOf(title) != -1) changes[title] = req.body.email.title;
        if (EmailParams.indexOf(text) != -1) changes[text] = req.body.email.text;
        if (EmailParams.indexOf(html) != -1) changes[html] = req.body.email.html;

        app.model.setting.set(changes, error => res.send({ error }));
    });
};
