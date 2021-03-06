module.exports = app => {
    const emailMenu = {
        parentMenu: { index: 3000, title: 'Đơn đề nghị học - sát hạch', link: '/user/don-de-nghi-hoc', icon: 'fa-file-text-o', subMenusRender: false },
        menus: {
            3010: { title: 'Email', link: '/user/don-de-nghi-hoc/email', icon: 'fa-envelope-o', backgroundColor: '#ffcc80', groupIndex: 0 },
        }
    };

    const menu = {
        parentMenu: { index: 3000, title: 'Đơn đề nghị học - sát hạch', link: '/user/don-de-nghi-hoc', icon: 'fa-file-text-o', subMenusRender: false },
        menus: {
            3020: { title: 'Danh sách', link: '/user/don-de-nghi-hoc/list', icon: 'fa-list', backgroundColor: '#032b91', groupIndex: 0 }
        }
    };

    // const menuDonDeNghiHoc = {
    //     parentMenu: app.parentMenu.user,
    //     menus: {
    //         1020: { title: 'Đơn đề nghị học, sát hạch', link: '/user/bieu-mau/don-de-nghi-hoc', icon: 'fa-id-card-o', backgroundColor: '#4DD0E1', groupIndex: 1 }
    //     }
    // }
    app.permission.add({ name: 'applicationForm:read', menu }, { name: 'applicationForm:write', menu }, { name: 'applicationForm:email', menu: emailMenu });

    app.get('/user/don-de-nghi-hoc', app.permission.check('applicationForm:read'), app.templates.admin);
    app.get('/user/don-de-nghi-hoc/list', app.permission.check('applicationForm:read'), app.templates.admin);
    app.get('/user/don-de-nghi-hoc/edit/:_id', app.permission.check('applicationForm:read'), app.templates.admin);
    app.get('/user/don-de-nghi-hoc/email', app.permission.check('applicationForm:email'), app.templates.admin);
    app.get('/user/bieu-mau/don-de-nghi-hoc/:id', app.permission.check(), app.templates.admin);
    app.get('/user/bieu-mau/don-de-nghi-hoc/view/:id', app.permission.check(), app.templates.admin);

    // Init ------------------------------------------------------------------------------------------------------------
    app.readyHooks.add('emailApplicationFormInit', {
        ready: () => app.model != null && app.model.setting != null && app.state,
        run: () => {
            const enableInit = process.env['enableInit'] == 'true';
            if (enableInit) {
                app.model.setting.init({
                    rejectDonDeNghiHocTitle: 'Hiệp Phát: Từ chối đơn đề nghị học!',
                    rejectDonDeNghiHocText: 'Dear {name}, Hiệp Phát đã từ chối đơn đề nghị học của bạn với lý do: {reason} Best regard, Tutorial, Website: ' + app.rootUrl + '',
                    rejectDonDeNghiHocHtml: 'Dear <b>{name}</b>,<br/><br/>' +
                        'Hiệp Phát đã từ chối đơn đề nghị học của bạn với lý do:<br/><br/>' +
                        '<b>{reason}</b><br/><br/>' +
                        'Best regard,<br/>' +
                        'Hiệp Phát<br/>' +
                        'Website: <a href="' + app.rootUrl + '">' + app.rootUrl + '</a>'
                })
            }
        },
    });
    //APIs -------------------------------------------------------------------------------------------------------------
    const emailParams = ['rejectDonDeNghiHocTitle', 'rejectDonDeNghiHocText', 'rejectDonDeNghiHocHtml'];
    app.get('/api/application-form/email/all', app.permission.check('applicationForm:email'), (req, res) => app.model.setting.get(...emailParams, result => res.send(result)));

    app.put('/api/application-form/email', app.permission.check('applicationForm:email'), (req, res) => {
        const emailType = req.body.type;
        const title = emailType + 'Title',
            text = emailType + 'Text',
            html = emailType + 'Html',
            changes = {};

        if (emailParams.indexOf(title) != -1) changes[title] = req.body.email.title;
        if (emailParams.indexOf(text) != -1) changes[text] = req.body.email.text;
        if (emailParams.indexOf(html) != -1) changes[html] = req.body.email.html;

        app.model.setting.set(changes, error => res.send({ error }));
    });

    // Admin -----------------------------------------------------------------------------------------------------------
    app.get('/api/application-form/page/:pageNumber/:pageSize', app.permission.check('applicationForm:read'), (req, res) => {
        const pageNumber = parseInt(req.params.pageNumber),
            pageSize = parseInt(req.params.pageSize),
            condition = req.query.condition || { searchText: '' },
            pageCondition = {};
        if (condition) {
            const value = { $regex: `.*${condition.searchText}.*`, $options: 'i' };
            pageCondition['$or'] = [
                { firstname: value },
                { lastname: value },
            ];
        }

        if (condition.searchText == '') {
            app.model.applicationForm.getPage(pageNumber, pageSize, {}, (error, page) => {
                if (error || page == null) {
                    res.send({ error: 'Danh sách đơn đề nghị sát hạch không sẵn sàng!' });
                } else {
                    res.send({ page });
                }
            });
        } else {
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
        }
    });

    app.get('/api/application-form/item/:_id', app.permission.check('applicationForm:read'), (req, res) => {
        app.model.applicationForm.get(req.params._id, (error, item) => res.send({ error, item }));
    });

    app.post('/api/application-form', app.permission.check('applicationForm:write'), (req, res) => {
        app.model.applicationForm.create(req.body.data, (error, item) => {
            res.send({ error, item })
        })
    });

    app.post('/api/application-form/reject', app.permission.check('applicationForm:write'), (req, res) => {
        const { _id, reason } = req.body;
        app.model.applicationForm.get(_id, (error, item) => {
            if (error || item == null) {
                res.send({ error: `System has errors!` })
            } else {
                app.model.user.get(item.user._id, (error, user) => {
                    if (error || user == null) {
                        res.send({ error: `Id người dùng không hợp lệ!` });
                    } else {
                        app.model.setting.get('rejectDonDeNghiHocTitle', 'rejectDonDeNghiHocText', 'rejectDonDeNghiHocHtml', result => {
                            const mailTitle = result.rejectDonDeNghiHocTitle,
                                mailText = result.rejectDonDeNghiHocText.replaceAll('{name}', user.firstname + ' ' + user.lastname).replaceAll('{reason}', reason),
                                mailHtml = result.rejectDonDeNghiHocHtml.replaceAll('{name}', user.firstname + ' ' + user.lastname).replaceAll('{reason}', reason);
                            app.email.sendEmail(app.state.data.email, app.state.data.emailPassword, user.email, [], mailTitle, mailText, mailHtml, null, () => {
                                item.reason = reason;
                                item.status = 'reject';
                                item.save(error => res.send({ error }))
                            }, (error) => {
                                res.send({ error })
                            });
                        });
                    }
                })
            }
        });
    });

    app.put('/api/application-form', app.permission.check('applicationForm:write'), (req, res) => {
        const $set = req.body.changes;
        app.model.applicationForm.update(req.body._id, $set, (error, item) => res.send({ error, item }));
    });

    app.delete('/api/application-form', app.permission.check('applicationForm:write'), (req, res) => app.model.applicationForm.delete(req.body._id, error => res.send({ error })));

    // User ------------------------------------------------------------------------------------------------------------
    app.get('/api/user-application-form/get/:_id', app.permission.check('user:login'), (req, res) => {
        const user = req.session.user;
        app.model.applicationForm.get(req.params._id, (error, item) => {
            if (error) {
                res.send({ error })
            } else if (item) {
                res.send({ item })
            } else {
                app.model.applicationForm.create({
                    user: user._id,
                }, (error, item) => res.send({ error, item }));
            }
        })
    });
    app.post('/api/user-application-form/create', app.permission.check('user:login'), (req, res) => {
        const user = req.session.user;
        app.model.applicationForm.create({
            user: user._id,
            integration: false,
            licenseDated: null,
            licenseIssuedBy: '',
            licenseNumber: '',
            otherDocumentation: ''
        }, (error, item) => res.send({ error, item }));
    }
    );
    app.get('/api/user-application-form/finished', app.permission.check('user:login'), (req, res) => {
        const user = req.session.user;
        app.model.applicationForm.getAll({ user: user._id, status: 'finish' }, (error, finish) => {
            if (error) {
                res.send({ error })
            } else if (finish) {
                res.send({ finish })
            } else {
                res.send({ error });
            }
        })
    });
    app.get('/api/user-application-form/unfinished', app.permission.check('user:login'), (req, res) => {
        const user = req.session.user;
        app.model.applicationForm.getAll({ $or: [{ user: user._id, status: 'reject' }, { user: user._id, status: 'waiting' }, { user: user._id, status: 'approved' }, { user: user._id, status: 'progressing' }] }, (error, unfinished) => {
            if (error) {
                res.send({ error })
            } else if (unfinished) {
                res.send({ unfinished })
            } else {
                res.send({ error });
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

    // Export Don de nghi hoc
    app.get('/api/user-application-form/export/:_id', app.permission.check('user:login'), (req, res) => {
        app.model.applicationForm.get(req.params._id, (error, formItem) => {
            if (!error) {
                let { licenseNumber, licenseDated, licenseIssuedBy, otherDocumentation, licenseClass, newLicenseClass, integration, user } = formItem;
                const { getName } = require('country-list');
                if (user.sex === 'male') {
                    user.sex = 'Nam';
                } else {
                    user.sex = 'Nữ';
                }
                const data = {
                    firstname: user.firstname || '',
                    lastname: user.lastname || '',
                    sex: user.sex || '',
                    birthday: user.birthday != null ? app.date.viDateFormat(user.birthday) : '',
                    phoneNumber: user.phoneNumber || '',
                    regularResidence: user.regularResidence || '',
                    residence: user.residence || '',
                    identityCard: user.identityCard || '',
                    identityDate: user.identityDate != null ? app.date.viDateFormat(user.identityDate) : '',
                    identityIssuedBy: user.identityIssuedBy || '',
                    nationality: getName(user.nationality) || '',
                    licenseNumber: licenseNumber || '',
                    licenseDated: licenseDated != null ? app.date.viDateFormat(licenseDated) : '',
                    licenseIssuedBy: licenseIssuedBy || '',
                    otherDocumentation: otherDocumentation || '',
                    licenseClass: licenseClass || '',
                    newLicenseClass: newLicenseClass || '',
                    i: integration,
                }
                app.docx.generateFile(`/document/Don_De_Nghi_Hoc_Sat_Hach_Lai_Xe.docx`, data, (error, buf) => {
                    res.send({ error: null, buf: buf });
                });
            } else {
                res.send({ error });
            }
        });
    });

    // Export bien nhan lan dau
    app.get('/api/user-application-form-receipt/export/:_id', app.permission.check('user:login'), (req, res) => {
        app.model.applicationForm.get(req.params._id, (error, formItem) => {
            if (!error) {
                let { user, newLicenseClass } = formItem;
                const data = {
                    firstname: user.firstname || '',
                    lastname: user.lastname || '',
                    male: user.sex == 'male',
                    female: user.sex == 'female',
                    yearOfBirth: user.birthday != null ? user.birthday.getFullYear() : '',
                    phoneNumber: user.phoneNumber || '',
                    regularResidence: user.regularResidence || '',
                    newLicenseClass: newLicenseClass || '',
                }

                app.docx.generateFile(`/document/Bien_Nhan_Ho_So_Hoc_Vien_Lan_Dau.docx`, data, (error, buf) => {
                    res.send({ error: null, buf: buf });
                });
            } else {
                res.send({ error });
            }
        });
    });

    //Ban Cam Ket
    app.get('/api/user-application-form-commitment/export/:_id', app.permission.check('user:login'), (req, res) => {
        app.model.applicationForm.get(req.params._id, (error, formItem) => {
            if (!error) {
                let { user, licenseNumber, licenseDated, licenseIssuedBy, otherDocumentation, licenseClass, } = formItem;
                user.sex = user.sex === 'male' ? 'Nam' : 'Nữ';

                const data = {
                    firstname: user.firstname || '',
                    lastname: user.lastname || '',
                    sex: user.sex || '',
                    birthday: user.birthday != null ? app.date.viDateFormat(user.birthday) : '',
                    residence: user.residence || '',
                    identityCard: user.identityCard || '',
                    identityDate: user.identityDate != null ? app.date.viDateFormat(user.identityDate) : '',
                    identityIssuedBy: user.identityIssuedBy || '',
                    licenseNumber: licenseNumber || '',
                    licenseDated: licenseDated != null ? app.date.viDateFormat(licenseDated) : '',
                    licenseIssuedBy: licenseIssuedBy || '',
                    otherDocumentation: otherDocumentation || '',
                    licenseClass: licenseClass || '',
                }
                app.docx.generateFile(`/document/Ban_Cam_Ket.docx`, data, (error, buf) => {
                    res.send({ error: null, buf: buf });
                });
            } else {
                res.send({ error });
            }
        });
    });
};
