module.exports = app => {
    const menu = {
        parentMenu: app.parentMenu.trainning,
        menus: {
            4050: { title: 'Danh mục câu hỏi thi', link: '/user/drive-question-category', icon: 'fa-envelope-o', backgroundColor: '#00897b' },
        },
    };
    app.permission.add(
        { name: 'driveQuestionCategory:read', menu },
        { name: 'driveQuestionCategory:write' },
        { name: 'driveQuestionCategory:delete' }
    );

    app.get('/user/drive-question-category', app.permission.check('driveQuestionCategory:read'), app.templates.admin);

    // APIs -----------------------------------------------------------------------------------------------------------
    app.get('/api/drive-question-category/all', app.permission.check('driveQuestionCategory:read'), (req, res) => {
        const condition = {}, searchText = req.query.searchText;
        if (searchText) {
            condition.title = new RegExp(searchText, 'i');
        }
        app.model.driveQuestionCategory.getAll(condition, (error, items) => res.send({ error, items }));
    });

    app.get('/api/drive-question-category/item/:_id', app.permission.check('driveQuestionCategory:read'), (req, res) => {
        app.model.driveQuestionCategory.get(req.params._id, (error, item) =>  res.send({ error, item }));  
    });

    app.post('/api/drive-question-category', app.permission.check('driveQuestionCategory:write'), (req, res) => {
        app.model.driveQuestionCategory.create(req.body.newData, (error, item) => res.send({ error, item }));
    });

    app.put('/api/drive-question-category', app.permission.check('driveQuestionCategory:write'), (req, res) => {
        app.model.driveQuestionCategory.update(req.body._id, req.body.changes, (error, item) => res.send({ error, item }));
    });

    app.delete('/api/drive-question-category', app.permission.check('driveQuestionCategory:write'), (req, res) => {
        app.model.driveQuestionCategory.delete(req.body._id, error => res.send({ error }));
    });

    app.get('/home/drive-question-category/all', (req, res) => {
        app.model.driveQuestionCategory.getAll((error, items) => res.send({ error, items }));
    });
};