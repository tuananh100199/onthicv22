const applicationForm = require("../model/applicationForm");

module.exports = app => {

    const menu = {
        parentMenu: {
            index: 3000, title: 'Đơn đề nghị học - sát hạch', link: '/user/don-de-nghi-hoc', icon: 'fa-file-text-o',
            subMenusRender: false, groups: ['Danh sách đơn đề nghị', 'Cấu hình'],
        },
        menus: {
            3010: { title: 'Danh sách đơn đề nghị học, sát hạch', link: '/user/don-de-nghi-hoc/list', icon: 'fa-list', backgroundColor: '#032b91', groupIndex: 0 },
            3020: { title: 'Email', link: '/user/don-de-nghi-hoc/send-mail', icon: 'fa-envelope-o', backgroundColor: '#00FFFF', groupIndex: 1 }

        }
    };
    app.get('/user/don-de-nghi-hoc/send-mail', app.permission.check('system:email'), app.templates.admin);
    const menuDonDeNghiHoc = {
        parentMenu: app.parentMenu.user,
        menus: {
            1020: { title: 'Đơn đề nghị học, sát hạch', link: '/user/bieu-mau/don-de-nghi-hoc', icon: 'fa-id-card-o', backgroundColor: '#4DD0E1', groupIndex: 1 }
        }
    }

    app.permission.add({ name: 'applicationForm:read', menu }, { name: 'applicationForm:write', menu }, { name: 'user:login', menu: menuDonDeNghiHoc });

    app.get('/user/don-de-nghi-hoc', app.permission.check('applicationForm:read'), app.templates.admin);
    app.get('/user/don-de-nghi-hoc/list', app.permission.check('applicationForm:read'), app.templates.admin);
    app.get('/user/don-de-nghi-hoc/edit/:_id', app.permission.check('applicationForm:read'), app.templates.admin);
    app.get('/user/don-de-nghi-hoc-chi-tiet/item/:_id', app.permission.check('applicationForm:read'), app.templates.admin);

    app.get('/user/bieu-mau/don-de-nghi-hoc', app.permission.check(), app.templates.admin);

    // Init ------------------------------------------------------------------------------------------------------------
    const init = () => {
        if (app.model && app.model.setting) {
            app.model.setting.init({
                emailAdminNotifyTitle: 'Hiệp Phát: Từ chối đơn đề nghị học!',
                emailAdminNotifyText: 'Dear {name}, Hiệp Phát đã từ chối đơn đề nghị học của bạn với lý do: {reason} Best regard, Tutorial, Website: ' + app.rootUrl + '',
                emailAdminNotifyHtml: 'Dear <b>{name}</b>,<br/><br/>' +
                    'Hiệp Phát đã từ chối đơn đề nghị học của bạn với lý do:<br/><br/>' +
                    '{reason}<br/><br/>' +
                    'Best regard,<br/>' +
                    'Hiệp Phát<br/>' +
                    'Website1: <a href="' + app.rootUrl + '">' + app.rootUrl + '</a>',
            });
        } else {
            setTimeout(init, 1000);
        }
    };
    init();


    //APIs -------------------------------------------------------------------------------------------------------------
    const EmailParams = [
        'emailAdminNotifyTitle', 'emailAdminNotifyText', 'emailAdminNotifyHtml'
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
        const $set = req.body.changes,
            $unset = {};
        app.model.applicationForm.update(req.body._id, $set, $unset, (error, item) => res.send({ error, item }));
    });

    app.delete('/api/application-form', app.permission.check('applicationForm:write'), (req, res) => app.model.applicationForm.delete(req.body._id, error => res.send({ error })));

    app.post('/api/application-form/send-mail', (req, res) => {
        app.model.applicationForm.get(req.body.formID, (error, item) => {
            if (error || item == null) {
                res.send({ error: `System has errors!` })
            } else {
                const reason = item.reason;
                app.model.user.get(item.user._id, (error, user) => {
                    if (error || user == null) {
                        res.send({ error: `System has errors!` });
                    } else {
                        app.model.setting.get(['emailAdminNotifyTitle', 'emailAdminNotifyText', 'emailAdminNotifyHtml'], result => {
                            const mailTitle = result.emailAdminNotifyTitle,
                                mailText = result.emailAdminNotifyText.replaceAll('{name}', user.firstname + ' ' + user.lastname).replaceAll('{reason}', reason),
                                mailHtml = result.emailAdminNotifyHtml.replaceAll('{name}', user.firstname + ' ' + user.lastname).replaceAll('{reason}', reason);
                            app.email.sendEmail(app.data.email, app.data.emailPassword, user.email, [], mailTitle, mailText, mailHtml, null, () => {
                                res.end()
                            }, (error) => {
                                res.send({ error })
                            });
                        });
                    }
                })
            }
        });
    });

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
        const user = req.session.user,
            { changes, userChanges } = req.body;
        delete userChanges.roles;
        delete userChanges.email;
        delete userChanges.password;
        delete userChanges.token;
        delete userChanges.tokenDate;

        app.model.user.update(user._id, userChanges, (error, user) => {
            if (error || !user) {
                res.send({ error })
            } else {
                app.updateSessionUser(req, user, sessionUser => {
                    app.model.applicationForm.update(req.body._id, changes, (error, item) => res.send({ error, item }));
                })
            }
        })
    });



    //Don De Nghi Hoc
    app.get('/api/user-application-form/export/:_id', app.permission.check('user:login'), (req, res) => {
        app.model.applicationForm.get(req.params._id, (error, formItem) => {
            if (!error) {
                exportDonDeNghiHocToWord(formItem, res);
            } else {
                res.send({ error });
            }
        });
    });

    const exportDonDeNghiHocToWord = (formItem, res) => {
        let {
            licenseNumber,
            licenseDated,
            licenseIssuedBy,
            otherDocumentation,
            licenseClass,
            newLicenseClass,
            integration,
            user

        } = formItem;
        const { getName } = require('country-list');
        if (user.sex === 'male') {
            user.sex = 'Nam';
        } else {
            user.sex = 'Nữ';
        }
        const data = {
            firstname: user.firstname,
            lastname: user.lastname,
            sex: user.sex,
            birthday: app.date.viDateFormat(user.birthday),
            phoneNumber: user.phoneNumber,
            regularResidence: user.regularResidence,
            residence: user.residence,
            identityCard: user.identityCard,
            identityDate: app.date.viDateFormat(user.identityDate),
            identityIssuedBy: user.identityIssuedBy,
            nationality: getName(user.nationality),
            licenseNumber: licenseNumber,
            licenseDated: app.date.viDateFormat(licenseDated),
            licenseIssuedBy: licenseIssuedBy,
            otherDocumentation: otherDocumentation,
            licenseClass: licenseClass,
            newLicenseClass: newLicenseClass,
            i: integration,
        }
        app.docx.generateFile(`/document/Don_De_Nghi_Hoc_Sat_Hach_Lai_Xe.docx`, data, (error, buf) => {
            res.send({
                error: null,
                buf: buf,
            });
        });
    }
    //Bien Nhan Lan Dau
    app.get('/api/user-application-form-receipt/export/:_id', app.permission.check('user:login'), (req, res) => {
        app.model.applicationForm.get(req.params._id, (error, formItem) => {
            if (!error) {
                exportBienNhanToWord(formItem, res);
            } else {
                res.send({ error });
            }
        });
    });

    const exportBienNhanToWord = (formItem, res) => {
        let {
            user,
            newLicenseClass
        } = formItem;
        let male = false,
            female = false;
        if (user.sex === 'male') {
            male = true;
        } else {
            female = true;
        }
        const data = {
            firstname: user.firstname,
            lastname: user.lastname,
            male: male,
            female: female,
            yearOfBirth: user.birthday.getFullYear(),
            phoneNumber: user.phoneNumber,
            regularResidence: user.regularResidence,
            newLicenseClass: newLicenseClass,
        }

        app.docx.generateFile(`/document/Bien_Nhan_Ho_So_Hoc_Vien_Lan_Dau.docx`, data, (error, buf) => {
            res.send({
                error: null,
                buf: buf,
            });
        });
    }

};