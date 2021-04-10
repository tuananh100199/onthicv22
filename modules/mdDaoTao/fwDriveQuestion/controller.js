module.exports = app => {
    const menu = {
        parentMenu: app.parentMenu.trainning,
        menus: {
            4001: { title: 'Danh mục câu hỏi thi', link: '/user/drive-question/category' },
            4002: { title: 'Câu hỏi thi', link: '/user/drive-question' },
        },
    };
    app.permission.add(
        { name: 'driveQuestion:read', menu },
        { name: 'driveQuestion:write' },
        { name: 'driveQuestion:delete' }
    );

    app.get('/user/drive-question/category', app.permission.check('category:read'), app.templates.admin);
    app.get('/user/drive-question', app.permission.check('driveQuestion:read'), app.templates.admin);

    // APIs -----------------------------------------------------------------------------------------------------------
    app.get('/api/drive-question/all', app.permission.check('driveQuestion:read'), (req, res) => {
        const condition = {},
            searchText =  req.query.condition && req.query.condition.searchText ? req.query.condition.searchText : {};
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

    app.get('/api/drive-question', app.permission.check('driveQuestion:read'), (req, res) => {
        app.model.driveQuestion.get(req.query._id, (error, item) => res.send({ error, item }));
    });

    app.post('/api/drive-question', app.permission.check('driveQuestion:write'), (req, res) => {
        app.model.driveQuestion.create(req.body.data, (error, item) => {
            if (error || item == null || item.image == null) {
                res.send({ error, item });
            } else {
                app.uploadImage('drive-question', app.model.driveQuestion.get, item._id, item.image, data => res.send(data));
            }
        });
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

    const uploadDriveQuestion = (fields, files, done) => {
        if (fields.userData && fields.userData[0].startsWith('driveQuestion:') && files.DriveQuestionImage && files.DriveQuestionImage.length > 0) {
            console.log('Hook: uploadDriveQuestion => drive question image upload');
            const _id = fields.userData[0].substring('driveQuestion:'.length);
            app.uploadImage('drive-question', app.model.driveQuestion.get, _id, files.DriveQuestionImage[0].path, done);
        }
    };
    app.uploadHooks.add('uploadDriveQuestion', (req, fields, files, params, done) =>
        app.permission.has(req, () => uploadDriveQuestion(fields, files, done), done, 'driveQuestion:write'));
};
