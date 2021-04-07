module.exports = app => {
    app.componentModel['staff group'] = app.model.staffGroup;

    /// API StaffGroup
    app.get('/api/staff-group/all', app.permission.check('component:read'), (req, res) =>
        app.model.staffGroup.getAll((error, list) => {
            if (error) {
                res.send({ error });
            } else {
                let isError = false;
                for (const item of list) {
                    if (isError) break;
                    app.model.staff.count({ staffGroupId: item._id }, (error, numberOfStaff) => {
                        if (error) {
                            res.send({ error });
                            isError = true;
                        } else {
                            item.numberOfStaff = numberOfStaff;
                            item.save();
                        }
                    });
                }
                if (!isError) res.send({ list });
            }
        }));

    app.get('/api/staff-group/', app.permission.check('component:read'), (req, res) =>
        app.model.staffGroup.get(req.query._id, (error, staffGroup) => {
            if (error || staffGroup == null) {
                res.send({ error: 'Get staffGroup failed!' });
            } else {
                app.model.staff.getAll({ staffGroupId: staffGroup._id }, (error, items) => {
                    if (error || items == null) {
                        res.send({ error: 'Get staffs failed!' });
                    } else {
                        res.send({ item: app.clone(staffGroup, { items }) });
                    }
                });
            }
        }));

    app.post('/api/staff-group', app.permission.check('component:write'), (req, res) =>
        app.model.staffGroup.create(req.body.data, (error, item) => res.send({ error, item })));

    app.put('/api/staff-group', app.permission.check('component:write'), (req, res) => {
        app.model.staffGroup.update(req.body._id, req.body.changes, (error, item) => res.send({ error, item }));
    });

    app.delete('/api/staff-group', app.permission.check('component:write'), (req, res) => app.model.staffGroup.delete(req.body._id, error => res.send({ error })));

    /// API Staff

    app.post('/api/staff', app.permission.check('component:write'), (req, res) => {
        app.model.staff.create(req.body.data, (error, item) => {
            if (error || (item && item.image == null)) {
                res.send({ error, item });
            } else {
                app.uploadImage('staff', app.model.staff.get, item._id, item.image, data => res.send(data));
            }
        });
    });

    app.put('/api/staff', app.permission.check('component:write'), (req, res) => {
        app.model.staff.update(req.body._id, req.body.changes, (error, item) => res.send({ error, item }));
    });

    app.put('/api/staff/swap', app.permission.check('component:write'), (req, res) => {
        const isMoveUp = req.body.isMoveUp.toString() == 'true';
        app.model.staff.swapPriority(req.body._id, isMoveUp, (error, item1, item2) => res.send({ error, item1, item2 }));
    });

    app.delete('/api/staff', app.permission.check('component:write'), (req, res) => {
        app.model.staff.delete(req.body._id, (error, item) => res.send({ error, staffGroupId: item.staffGroupId }));
    });

    // Home -----------------------------------------------------------------------------------------------------------------------------------------
    app.get('/home/staff-group', (req, res) => app.model.staffGroup.get(req.query._id, (error, staffGroup) => {
        if (error || staffGroup == null) {
            res.send({ error: 'Get staffGroup failed!' });
        } else {
            app.model.staff.getAll({ staffGroupId: staffGroup._id, active: true }, (error, items) => {
                if (error || items == null) {
                    res.send({ error: 'Get staffGroup failed!' });
                } else {
                    res.send({ item: app.clone(staffGroup, { items }) });
                }
            });
        }
    }));
    // Hook upload images ----------------------------------------------------------------------------------------------
    app.createFolder(app.path.join(app.publicPath, '/img/staff'));

    const uploadStaffImage = (fields, files, done) => {
        if (fields.userData && fields.userData[0].startsWith('staff:') && files.StaffImage && files.StaffImage.length > 0) {
            console.log('Hook: uploadStaffImage => staff image upload');
            const _id = fields.userData[0].substring('staff:'.length);
            app.uploadImage('staff', app.model.staff.get, _id, files.StaffImage[0].path, done);
        }
    };
    app.uploadHooks.add('uploadStaffImage', (req, fields, files, params, done) =>
        app.permission.has(req, () => uploadStaffImage(fields, files, done), done, 'component:write'));
};
