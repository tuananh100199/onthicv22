module.exports = app => {
    const menu = {
        parentMenu: app.parentMenu.trainning,
        menus: {
            4050: { title: 'Danh mục câu hỏi thi', link: '/user/drive-question/category' },
            4060: { title: 'Câu hỏi thi', link: '/user/drive-question' },
        },
    };
    app.permission.add(
        { name: 'category:read', menu },
        { name: 'driveQuestion:read', menu },
        { name: 'driveQuestion:write' },
        { name: 'driveQuestion:delete' }
    );

    app.get('/user/drive-question/category', app.permission.check('category:read'), app.templates.admin);
    app.get('/user/drive-question', app.permission.check('driveQuestion:read'), app.templates.admin);

    // APIs -----------------------------------------------------------------------------------------------------------
    app.get('/api/drive-question/all', app.permission.check('driveQuestion:read'), (req, res) => {
        const condition = {},
            searchText = req.query.searchText;
        if (searchText) {
            condition.title = new RegExp(searchText, 'i');
        }
        app.model.driveQuestion.getAll(condition, (error, items) => res.send({ error, items }));
    });

    app.get('/api/drive-question/item/:_id', app.permission.check('driveQuestion:read'), (req, res) =>
        app.model.driveQuestion.get(req.params._id, (error, item) => res.send({ error, item })));

    app.post('/api/drive-question', app.permission.check('driveQuestion:write'), (req, res) => {
        app.model.driveQuestion.create(req.body.newData, (error, item) => res.send({ error, item }));
    });

    app.put('/api/drive-question', app.permission.check('driveQuestion:write'), (req, res) => {
        app.model.driveQuestion.update(req.body._id, req.body.changes, (error, item) => res.send({ error, item }));
    });

    app.delete('/api/drive-question', app.permission.check('driveQuestion:write'), (req, res) => {
        app.model.driveQuestion.delete(req.body._id, error => res.send({ error }));
    });

    // Hook upload images ---------------------------------------------------------------------------------------------
    app.createFolder(app.path.join(app.publicPath, '/img/drive-question'));

    const uploadDriveQuestion = (req, fields, files, params, done) => {
        if (fields.userData && fields.userData[0].startsWith('driveQuestion:') && files.DriveQuestionImage && files.DriveQuestionImage.length > 0) {
            console.log('Hook: uploadDriveQuestion => drive question image upload');
            app.uploadComponentImage(req, 'drive-question', app.model.driveQuestion.get, fields.userData[0].substring(14), files.DriveQuestionImage[0].path, done);
        }
    };
    app.uploadHooks.add('uploadDriveQuestion', (req, fields, files, params, done) =>
        app.permission.has(req, () => uploadDriveQuestion(req, fields, files, params, done), done, 'driveQuestion:write'));
};
