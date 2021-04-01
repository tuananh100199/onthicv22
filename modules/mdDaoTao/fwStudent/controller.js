module.exports = (app) => {
    const menu = {
        parentMenu: app.parentMenu.trainning,
        menus: {
            4015: { title: 'Ứng viên', link: '/user/pre-student' },
        }
    };
    // const menu = {
    //     parentMenu: app.parentMenu.trainning,
    //     menus: {
    //         4045: { title: 'Học viên', link: '/user/student' },
    //     }
    // };

    app.permission.add(
        { name: 'student:read', menu },
        { name: 'student:write' },
        { name: 'student:delete' },
    );

    // app.get('/user/pre-student', app.permission.check('student:candidate'), app.templates.admin);
    app.get('/user/pre-student', app.permission.check('student:write'), app.templates.admin);
    app.get('/user/pre-student/import', app.permission.check('student:write'), app.templates.admin);

    // app.get('/user/student/', app.permission.check('student:read'), app.templates.admin);
    // app.get('/student/:_id', app.templates.home);

    // APIs ------------------------------------------------------------------------------------------------------------
    app.get('/api/student/page/:pageNumber/:pageSize', (req, res) => {
        let pageNumber = parseInt(req.params.pageNumber),
            pageSize = parseInt(req.params.pageSize),
            condition = req.query.condition || {},
            pageCondition = {};
        try {
            if (condition) {
                if (condition.searchText) {
                    const value = { $regex: `.*${condition.searchText}.*`, $options: 'i' };
                    pageCondition['$or'] = [
                        { phoneNumber: value },
                        { email: value },
                        { firstname: value },
                        { lastname: value },
                    ];
                }
            }
            app.model.student.getPage(pageNumber, pageSize, pageCondition, (error, page) => res.send({ error, page }));
        } catch (error) {
            res.send({ error });
        }
    });

    app.get('/api/student/all', (req, res) => {
        app.model.student.getAll((error, list) => res.send({ error, list }));
    });

    app.get('/api/student', app.permission.check('student:read'), (req, res) => {
        app.model.student.get(req.query._id, (error, item) => res.send({ error, item }));
    });

    app.post('/api/student', app.permission.check('student:write'), (req, res) => {
        app.model.student.create(req.body.data, (error, item) => {
            if (error || (item && item.image == null)) {
                res.send({ error, item });
            } else {
                app.uploadImage('student', app.model.student.get, item._id, item.image, data => res.send(data));
            }
        })
    });

    app.put('/api/student', app.permission.check('student:write'), (req, res) => {
        app.model.student.update(req.body._id, req.body.changes, (error, item) => res.send({ error, item }))
    });

    app.delete('/api/student', app.permission.check('student:delete'), (req, res) => {
        app.model.student.delete(req.body._id, (error) => res.send({ error }))
    });
    // Hook upload images ---------------------------------------------------------------------------------------------------------------------------s
    app.createFolder(app.path.join(app.publicPath, '/img/student'));

    const uploadSudent = (req, fields, files, params, done) => {
        if (fields.userData && fields.userData[0].startsWith('student:') && files.StudentImage && files.StudentImage.length > 0) {
            console.log('Hook: uploadStudent => student image upload');
            const _id = fields.userData[0].substring('student:'.length);
            app.uploadImage('student', app.model.student.get, _id, files.StudentImage[0].path, done);
        }
    };
    app.uploadHooks.add('uploadStudent', (req, fields, files, params, done) =>
        app.permission.has(req, () => uploadStudent(req, fields, files, params, done), done, 'student:write'));
};