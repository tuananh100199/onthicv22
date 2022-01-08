module.exports = (app) => {
    const menu = {
        parentMenu: app.parentMenu.setting,
        menus: {
            2140: { title: 'Thông tin nhân viên', link: '/user/staff-info' },
        }
    };

    app.permission.add(
        { name: 'staff-info:read', menu }, { name: 'staff-info:write' }, { name: 'staff-info:delete' },
    );

    app.get('/user/staff-info', app.permission.check('staff-info:read'), app.templates.admin);


    //APIs -----------------------------------------------------------------------------------------------
    app.get('/api/staff-info/page/:pageNumber/:pageSize', app.permission.check('staff-info:read'), (req, res) => {
        let pageNumber = parseInt(req.params.pageNumber),
            pageSize = parseInt(req.params.pageSize),
            condition=req.query.condition||{},
            pageCondition = { };
            if (condition.searchText) {
                const value = { $regex: `.*${condition.searchText}.*`, $options: 'i' };
                pageCondition['$or'] = [
                    { firstname: value },
                    { lastname: value },
                    { identityCard: value },
                    { msnv: value },
                ];
            }
            // filter theo cơ sở
            if (req.session.user.division && req.session.user.division.isOutside){
                pageCondition.division = req.session.user.division._id;
            } 
            else if(condition.filterDivision && condition.filterDivision!='all'){
                pageCondition.division=condition.filterDivision;
            }
            app.model.staffInfo.getPage(pageNumber, pageSize, pageCondition, (error, page) => {
                res.send({ error, page});
            });
    });

    app.post('/api/staff-info', app.permission.check('staff-info:write'), (req, res) => {
        let data = req.body.data;
        function convert(str) {
            let date = new Date(str),
                mnth = ('0' + (date.getMonth() + 1)).slice(-2),
                day = ('0' + date.getDate()).slice(-2);
            return [day, mnth, date.getFullYear()].join('');
        }
        new Promise((resolve, reject) => { // Tạo user cho staff
            app.model.user.get({ identityCard: data.identityCard }, (error, user) => {
                if (error) {
                    reject('Lỗi khi đọc thông tin người dùng!');
                } else if (user) {
                    resolve(user._id);
                } else { // staff chưa là user
                    const dataPassword = convert(data.birthday),
                        newUser = {
                            identityCard: data.identityCard,
                            email: data.email,
                            firstname: data.firstname,
                            lastname: data.lastname,
                            phoneNumber: data.phoneNumber,
                            division: data.division,
                            password: dataPassword,
                            birthday: data.birthday,
                            isStaff:true
                        };
                    app.model.user.create(newUser, (error, user) => {
                        if (error) {
                            reject('Lỗi khi tạo người dùng!');
                        } else { // Tạo user thành công. 
                            resolve(user._id);
                        }
                    });
                }
            });
        }).then(_userId => { // Tạo info 
            data.user = _userId;
            app.model.staffInfo.create(data, (error, item) => {
                if (error || item == null || item.image == null||item.image=='') {
                    res.send({ error, item });
                } else {
                    app.uploadImage('staffInfo', app.model.staffInfo.get, item._id, item.image, data => {
                        res.send(data);
                    });
                }
            });
        }).catch(error => res.send({ error }));
    });

    app.put('/api/staff-info', app.permission.check('staff-info:write'), (req, res) => {
        let { _id, changes } = req.body;
        app.model.staffInfo.update(_id, changes, (error, item) => res.send({ error, item }));
    });

    app.delete('/api/staff-info', app.permission.check('staff-info:write'), (req, res) => {
        app.model.staffInfo.delete(req.body._id, error => res.send({ error }));
    });

        // Hook upload images staff ---------------------------------------------------------------------------------------------
        app.createFolder(app.path.join(app.publicPath, '/img/staffInfo'));

        const uploadStaffInfoImage = (fields, files, done) => {
            if (fields.userData && fields.userData[0].startsWith('staffInfo:') && files.StaffInfoImage && files.StaffInfoImage.length > 0) {
                const _id = fields.userData[0].substring('staffInfo:'.length);
                app.uploadImage('staffInfo', app.model.staffInfo.get, _id, files.StaffInfoImage[0].path, done);
            }
        };
        app.uploadHooks.add('uploadStaffInfo', (req, fields, files, params, done) =>
            app.permission.has(req, () => uploadStaffInfoImage(fields, files, done), done, 'staff-info:write'));

};