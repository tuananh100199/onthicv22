module.exports = (app) => {
    //APIs -----------------------------------------------------------------------------------------------

    app.get('/api/teacher-certification/all',app.permission.check('teacher:read'), (req, res) => {
        const condition = req.query.condition||{};
        app.model.teacherCertification.getAll(condition, (error, list) => res.send({ error, list }));
    });

    app.post('/api/teacher-certification', app.permission.check('teacher:write'), (req, res) => {
        app.model.teacherCertification.create(req.body.data, (error, item) => res.send({ error, item }));
    });

    app.put('/api/teacher-certification', app.permission.check('teacher:write'), (req, res) => {
        app.model.teacherCertification.update(req.body._id, req.body.changes, (error, item) => res.send({ error, item }));
    });

    app.delete('/api/teacher-certification', app.permission.check('teacher:delete'), (req, res) => {
        app.model.teacherCertification.delete(req.body._id, error => res.send({ error }));
    });
};