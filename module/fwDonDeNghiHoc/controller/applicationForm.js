module.exports = app => {
    const menu = {
        parentMenu: { index: 3000, title: 'Đơn đề nghị học - sát hạch', link: '/user/don-de-nghi-hoc/list', icon: 'fa-file-text-o' }
    };

    const menuDonDeNghiHoc = {
        parentMenu: app.parentMenu.user,
        menus: {
            1020: { title: 'Đơn đề nghị học, sát hạch', link: '/user/bieu-mau/don-de-nghi-hoc', icon: 'fa-id-card-o', backgroundColor: '#4DD0E1', groupIndex: 1 }
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
    app.get('/api/user-application-form/export', app.permission.check('user:login'), (req, res) => {
        const user = req.session.user;
        app.model.applicationForm.get({ user: user._id }, (error, formItem) => {
            formItem = app.clone(formItem, user);
            if (!error) {
                exportDonDeNghiHocToWord(formItem, res);
            } else {
                res.send({ error });
            }
        });
    });

    const exportDonDeNghiHocToWord = (formItem, res) => {
            let {
                firstname,
                lastname,
                sex,
                birthday,
                phoneNumber,
                regularResidence,
                residence,
                identityCard,
                identityDate,
                identityIssuedBy,
                nationality,
                licenseNumber,
                licenseDated,
                licenseIssuedBy,
                otherDocumentation,
                licenseClass,
                newLicenseClass,
                integration

            } = formItem;
            const { getName } = require('country-list');
            if (sex === 'male') {
                sex = 'Nam';
            } else {
                sex = 'Nữ';
            }
            const data = {
                firstname: firstname,
                lastname: lastname,
                sex: sex,
                birthday: app.date.viDateFormat(birthday),
                phoneNumber: phoneNumber,
                regularResidence: regularResidence,
                residence: residence,
                identityCard: identityCard,
                identityDate: app.date.viDateFormat(identityDate),
                identityIssuedBy: identityIssuedBy,
                nationality: getName(nationality),
                licenseNumber: licenseNumber,
                licenseDated: app.date.viDateFormat(licenseDated),
                licenseIssuedBy: licenseIssuedBy,
                otherDocumentation: otherDocumentation,
                licenseClass: licenseClass,
                newLicenseClass: newLicenseClass,
                i: integration,
            }
            const fileNameOutput = `Don_De_Nghi_Hoc_Sat_Hach_Lai_Xe`;
            app.docx.writeDocumentFile('/document/Don_De_Nghi_Hoc_Sat_Hach_Lai_Xe.docx', data, `/download/${fileNameOutput}.docx`, () => {
                res.send({
                    error: null,
                    data: data,
                    link: `/download/${fileNameOutput}.docx?t=${Date.now()}`,
                });
            });
        }
        //Bien Nhan Lan Dau
    app.get('/api/user-application-form-receipt/export', app.permission.check('user:login'), (req, res) => {
        const user = req.session.user;
        app.model.applicationForm.get({ user: user._id }, (error, formItem) => {
            formItem = app.clone(formItem, user);
            if (!error) {
                exportBienNhanToWord(formItem, res);
            } else {
                res.send({ error });
            }
        });
    });

    const exportBienNhanToWord = (formItem, res) => {
        let {
            firstname,
            lastname,
            sex,
            birthday,
            phoneNumber,
            regularResidence,
            newLicenseClass,
        } = formItem;
        let male = false,
            female = false;
        if (sex === 'male') {
            male = true;
        } else {
            female = true;
        }
        const data = {
            firstname: firstname,
            lastname: lastname,
            male: male,
            female: female,
            yearOfBirth: app.date.yearOfBirth(birthday),
            phoneNumber: phoneNumber,
            regularResidence: regularResidence,
            newLicenseClass: newLicenseClass,
        }
        const fileNameOutput = `Bien_Nhan_Ho_So_Hoc_Vien_Lan_Dau`;
        app.docx.writeDocumentFile('/document/Bien_Nhan_Ho_So_Hoc_Vien_Lan_Dau.docx', data, `/download/${fileNameOutput}.docx`, () => {
            res.send({
                error: null,
                data: data,
                link: `/download/${fileNameOutput}.docx?t=${Date.now()}`,
            });
        });
    }

};