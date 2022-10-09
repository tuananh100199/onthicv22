module.exports = app => {
    const menu = {
        parentMenu: app.parentMenu.trainning,
        menus: {
            4016: { title: 'Chương trình học', link: '/user/study-program', icon: 'fa fa-tasks', backgroundColor: 'rgb(106, 90, 205)' },
            4008: { title: 'Hướng dẫn', link: '/user/course-tutorial' }
        }
    };
    app.permission.add({ name: 'studyProgram:read', menu }, { name: 'studyProgram:write' }, { name: 'studyProgram:delete' });

    app.get('/user/study-program', app.permission.check('studyProgram:read'), app.templates.admin);
    app.get('/user/study-program/:id', app.permission.check('studyProgram:write'), app.templates.admin);

    // APIs -----------------------------------------------------------------------------------------------------------
    app.get('/api/study-program/all', (req, res) => {
        app.model.studyProgram.getAll(req.query.condition, (error, list) => res.send({ error, list }));
    });

    app.get('/api/study-program', app.permission.check('user:login'), (req, res) =>
        app.model.studyProgram.get(req.query._id, (error, item) => res.send({ error, item })));

    app.post('/api/study-program', app.permission.check('studyProgram:write'), (req, res) => {
        app.model.studyProgram.create(req.body.data, (error, item) => res.send({ error, item }));
    });

    app.put('/api/study-program', app.permission.check('studyProgram:write'), (req, res) => {
        app.model.studyProgram.update(req.body._id, req.body.changes, (error, item) => res.send({ error, item }));
    });

    app.put('/api/study-program/default', app.permission.check('studyProgram:write'), (req, res) => {
        const { studyProgram } = req.body;
        app.model.studyProgram.update({courseType: studyProgram.courseType._id}, { active: false }, (error) => {
            if (error) res.send({ error });
            else app.model.studyProgram.update(studyProgram._id, { active: true }, (error, item) => {
                res.send({ error, item });
            });
        });

    });

    app.delete('/api/study-program', app.permission.check('studyProgram:write'), (req, res) => {
        app.model.studyProgram.delete(req.body._id, error => res.send({ error }));
    });

    app.permissionHooks.add('courseAdmin', 'studyProgram', (user) => new Promise(resolve => {
        app.permissionHooks.pushUserPermission(user, 'studyProgram:read', 'studyProgram:write', 'studyProgram:delete');
        resolve();
    }));

};