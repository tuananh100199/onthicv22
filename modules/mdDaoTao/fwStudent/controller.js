module.exports = (app) => {
    const menuCandidate = {
        parentMenu: app.parentMenu.trainning,
        menus: {
            4015: { title: 'Ứng viên', link: '/user/pre-student' },
        }
    };
    const menu = {
        parentMenu: app.parentMenu.trainning,
        menus: {
            4045: { title: 'Học viên', link: '/user/student' },
        }
    };

    app.permission.add(
        { name: 'student:read', menu },
        { name: 'student:write' },
        { name: 'student:delete' },
        { name: 'student:candidate', menuCandidate },
    );

    // app.get('/user/pre-student', app.permission.check('student:candidate'), app.templates.admin);
    app.get('/user/pre-student', app.permission.check('student:write'), app.templates.admin);
    app.get('/user/student/', app.permission.check('student:read'), app.templates.admin);
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
        app.model.student.create(req.body.data || {}, (error, item) => res.send({ error, item }));
    });

    app.put('/api/student', app.permission.check('student:write'), (req, res) => {
        const $set = req.body.changes;
        if ($set && $set.subjects && $set.subjects === 'empty') $set.subjects = [];
        app.model.student.update(req.body._id, $set, (error, item) => res.send({ error, item }))
    });

    app.delete('/api/student', app.permission.check('student:delete'), (req, res) => {
        app.model.student.delete(req.body._id, (error) => res.send({ error }))
    });
    // Hook upload images ---------------------------------------------------------------------------------------------
    app.createFolder(app.path.join(app.publicPath, '/img/student'));

    const uploadstudent = (req, fields, files, params, done) => {
        if (fields.userData && fields.userData[0].startsWith('student:') && files.studentImage && files.studentImage.length > 0) {
            console.log('Hook: uploadstudent => course type image upload');
            app.uploadComponentImage(req, 'student', app.model.student.get, fields.userData[0].substring('student:'.length), files.studentImage[0].path, done);
        }
    };
    app.uploadHooks.add('uploadstudent', (req, fields, files, params, done) =>
        app.permission.has(req, () => uploadstudent(req, fields, files, params, done), done, 'student:write'));
};