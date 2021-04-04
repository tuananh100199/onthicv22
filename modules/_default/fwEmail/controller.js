module.exports = app => {
    app.permission.add({
        name: 'system:email',
        menu: {
            parentMenu: app.parentMenu.setting,
            menus: {
                2020: { title: 'Email', link: '/user/email', icon: 'fa-envelope-o', backgroundColor: '#ffcc80' }
            }
        },
    });
    app.get('/user/email', app.permission.check('system:email'), app.templates.admin);

    // APIs -----------------------------------------------------------------------------------------------------------------------------------------
    const EmailParams = [
        'emailRegisterMemberTitle', 'emailRegisterMemberText', 'emailRegisterMemberHtml',
        'emailCreateMemberByAdminTitle', 'emailCreateMemberByAdminText', 'emailCreateMemberByAdminHtml',
        'emailNewPasswordTitle', 'emailNewPasswordText', 'emailNewPasswordHtml',
        'emailForgotPasswordTitle', 'emailForgotPasswordText', 'emailForgotPasswordHtml',
        'emailContactTitle', 'emailContactText', 'emailContactHtml',
        'emailTuChoiDonDeNghiHocTitle', 'emailTuChoiDonDeNghiHocText', 'emailTuChoiDonDeNghiHocHtml',
        'emailCandidateTitle', 'emailCandidateText', 'emailCandidateHtml',
    ];

    app.get('/api/email/all', app.permission.check('system:email'), (req, res) => app.model.setting.get(...EmailParams, result => res.send(result)));

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

    // Hook readyHooks ------------------------------------------------------------------------------------------------------------------------------
    app.readyHooks.add('emailInit', {
        ready: () => app.model != null && app.model.setting != null && app.state,
        run: () => app.model.setting.init({
            emailRegisterMemberTitle: 'Hiệp Phát: Chào mừng thành viên mới!',
            emailRegisterMemberText: 'Chào {name}, Trung tâm hiệp phát xin hân hạnh chào mừng bạn. Trước khi bạn có thể đăng nhập, Hãy nhấn vào {url} để kích hoạt tài khoản của bạn. Trân trọng, Mọi thông tin tham khảo vui lòng truy cập trang web: ' + app.rootUrl + '',
            emailRegisterMemberHtml: `Chào <b>{name}</b>,<br/><br/>
                Trung tâm hiệp phát xin hân hạnh chào mừng bạn. Trước khi có thể đăng nhập, hãy nhấn vào <a href='{url}'>{url}</a> để kích hoạt tài khoản của bạn.<br/><br/>
                Trân trọng,<br/>
                Hiệp Phát<br/>
                Website: <a href='${app.rootUrl}'>${app.rootUrl}</a>`,
            emailCreateMemberByAdminTitle: 'Hiệp Phát: Chào mừng thành viên mới!',
            emailCreateMemberByAdminText: `Chào {name}, Tài khoản của bạn đã được tạo. Thông tin đăng nhập của bạn là: email: {email}. mật khẩu: {password}. Đường dẫn kích hoạt: {url}. Trân trọng, Hiệp Phát Admin.`,
            emailCreateMemberByAdminHtml: `Chào {name},<br/><br/>Tài khoản của bạn đã được tạo. Thông tin đăng nhập của bạn là: <br> - Email: {email}.<br> - mật khẩu: <b>{password}</b>.<br/> - Đường dẫn kích hoạt: <a href='{url}'>{url}</a>.<br/><br/>Trân trọng,<br/>Hiệp Phát Admin.`,
            emailNewPasswordTitle: 'Hiệp Phát: Mật khẩu mới!',
            emailNewPasswordText: `Chào {name}, Mật khẩu mới của bạn là {password}. Trân trọng, Hiệp Phát Admin.`,
            emailNewPasswordHtml: `Chào {name},<br/><br/> Mật khẩu mới của bạn là <b>{password}</b>.<br/><br/>Trân trọng,<br/>Hiệp Phát Admin.`,
            emailForgotPasswordTitle: 'Hiệp Phát: Quên mật khẩu!',
            emailForgotPasswordText: 'Chào {name}, bạn đã yêu cầu tay đổi mật khẩu tại ' + app.rootUrl + '. ' +
                'Bạn sử dụng đường dẫn sau để thay đổi mật khẩu ' +
                'Đường dẫn chỉ có hiệu lực trong vòng 24 giờ' +
                'Đường dẫn: {url}' +
                'Trân trọng, ' +
                'Hiệp Phát' +
                'Website: ' + app.rootUrl + '',
            emailForgotPasswordHtml: `<p><b>Chào {name}, </b><br/><br/> bạn đã yêu cầu tay đổi mật khẩu tại <a href='${app.rootUrl}' target='_blank'>${app.rootUrl}</a>.
                Bạn sử dụng đường dẫn sau để thay đổi mật khẩu. <b>Đường dẫn chỉ có hiệu lực trong vòng 24 giờ</b><br/>
                Đường dẫn: <a href='{url}'>{url}</a><br/>
                Trân trọng, <br/>
                Hiệp Phát<br/>
                Website: <a href='${app.rootUrl}' target='_blank'>${app.rootUrl}</a></p>`,
            emailContactTitle: 'Hiệp Phát: Liên hệ',
            emailContactText: `Chào bạn, Hiệp Phát đã nhận được thông tin của bạn. Cám ơn bạn vì đã liên hệ chúng tôi. Chủ đề của bạn: {title}. Tin nhắn của bạn là: {message}. Giảng viên hướng dẫn sẽ phản hồi cho bạn sớm nhất. Trân trọng, Giảng viên hướng dẫn.`,
            emailContactHtml: 'Chào bạn,<br/><br/>Hiệp Phát đã nhận được thông tin của bạn. Cám ơn bạn vì đã liên hệ chúng tôi.<br/>Chủ đề của bạn: {title}.<br/>Tin nhắn của bạn là:<br/>{message}.<br/>Giảng viên hướng dẫn sẽ phản hồi cho bạn sớm nhất.<br/><br/>Trân trọng,<br/>Giảng viên hướng dẫn.',
            emailTuChoiDonDeNghiHocTitle: 'Hiệp Phát: Từ chối đơn đề nghị học!',
            emailTuChoiDonDeNghiHocText: 'Chào {name}, Hiệp Phát đã từ chối đơn đề nghị học của bạn với lý do: {reason} Best regard, Tutorial, Website: ' + app.rootUrl + '',
            emailTuChoiDonDeNghiHocHtml: `Chào<b>{ name }</b>,<br/><br/>
                Hiệp Phát đã từ chối đơn đề nghị học của bạn với lý do:<br/><br/>
                <b>{reason}</b><br/><br/>
                Best regard,< br />
        Hiệp Phát < br />
    Website: <a href='${app.rootUrl}'>${app.rootUrl}</a>`,
            emailCandidateTitle: 'Hiệp Phát: Đăng ký tư vấn!',
            emailCandidateText: 'Chào {name}, Cám ơn bạn đã gửi đăng ký tư vấn cho chúng tôi, chúng tôi sẽ liên hệ cho bạn sớm nhất. Trân trọng, Giảng viên hướng dẫn, Website: ' + app.rootUrl + '',
            emailCandidateHtml: `Chào <b>{name}</b>,<br/><br/>
                Cám ơn bạn đã gửi đăng ký tư vấn cho chúng tôi, chúng tôi sẽ liên hệ cho bạn sớm nhất:<br/><br/>
                Trân trọng,<br/>
                Hiệp Phát<br/>
                Website: <a href='${app.rootUrl}'>${app.rootUrl}</a>`
        }),
    });
};
