module.exports = app => {
    const menu = {
        parentMenu: app.parentMenu.trainning,
        menus: {
            4050: { title: 'Danh mục câu hỏi thi', link: '/user/drive-question/category' },
            4060: { title: 'Câu hỏi thi', link: '/user/drive-question' },
        },
    };
    app.permission.add(
        // { name: 'category:read', menu },
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
        app.model.driveQuestion.getAll(condition, (error, list) => res.send({ error, list }));
    });

    app.get('/api/drive-question/page/:pageNumber/:pageSize', (req, res) => {
        const pageNumber = parseInt(req.params.pageNumber),
            pageSize = parseInt(req.params.pageSize),
            { searchText, categories } = req.query,
            pageCondition = {};
        if (categories) {
            pageCondition.categories = [categories];
        }
        if (searchText) {
            pageCondition.title = new RegExp(searchText, 'i');
        }
        app.model.driveQuestion.getPage(pageNumber, pageSize, pageCondition, (error, page) => {
            res.send({ error, page });
        });
    });

    app.get('/api/drive-question/item/:_id', app.permission.check('driveQuestion:read'), (req, res) => {
        app.model.driveQuestion.get(req.params._id, (error, item) => res.send({ error, item }));
    });

    app.post('/api/drive-question', app.permission.check('driveQuestion:write'), (req, res) => {
        app.model.driveQuestion.create(req.body.data, (error, item) => res.send({ error, item }));
    });

    app.put('/api/drive-question', app.permission.check('driveQuestion:write'), (req, res) => {
        app.model.driveQuestion.update(req.body._id, req.body.changes, (error, item) => res.send({ error, item }));
    });

    app.put('/api/drive-question/swap', app.permission.check('driveQuestion:write'), (req, res) => {
        const isMoveUp = req.body.isMoveUp.toString() == 'true';
        app.model.driveQuestion.swapPriority(req.body._id, isMoveUp, (error) => res.send({ error }));
    });

    app.delete('/api/drive-question', app.permission.check('driveQuestion:delete'), (req, res) => {
        app.model.driveQuestion.delete(req.body._id, error => res.send({ error }));
    });

    app.delete('/api/drive-question/image', app.permission.check('driveQuestion:write'), (req, res) => {
        app.model.driveQuestion.get(req.body._id, (error, item) => {
            if (item) {
                app.deleteImage(item.image);
                item.image = null;
                item.save(error => res.send({ error }));
            } else {
                res.send({ error: error || 'Id không hợp lệ!' });
            }
        });
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
