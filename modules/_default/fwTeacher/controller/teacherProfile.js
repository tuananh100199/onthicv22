module.exports = (app) => {
    //APIs -----------------------------------------------------------------------------------------------

    app.get('/api/teacher-profile/all',app.permission.check('teacher:read'), (req, res) => {
        const condition = req.query.condition||{};
        app.model.teacherProfile.getAll(condition, (error, list) => res.send({ error, list }));
    });

    app.post('/api/teacher-profile', app.permission.check('teacher:write'), (req, res) => {
        app.model.teacherProfile.create(req.body.data, (error, item) => res.send({ error, item }));
    });

    app.put('/api/teacher-profile', app.permission.check('teacher:write'), (req, res) => {
        app.model.teacherProfile.update(req.body._id, req.body.changes, (error, item) => res.send({ error, item }));
    });

    app.delete('/api/teacher-profile', app.permission.check('teacher:delete'), (req, res) => {
        app.model.teacherProfile.delete(req.body._id, error => res.send({ error }));
    });
};