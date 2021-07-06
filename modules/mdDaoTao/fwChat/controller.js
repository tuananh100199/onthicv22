module.exports = app => {

    app.get('/user/chat/:id', app.templates.admin);

    app.get('/api/chat/all', (req, res) => {
        const { roomId, create_at, num_message } = req.query;
        app.model.chat.getAll({ room: roomId, sent: { $lt: create_at } }, parseInt(num_message), (error, item) => {
            const new_item = item.reverse();
            res.send({ error, item: new_item });
        });
    });

    app.post('/api/chat', (req, res) => {
        app.model.chat.create(req.body.data || {}, (error, item) => res.send({ error, item }));
    });

    app.get('/api/chat/student', (req, res) => {
        const sessionUser = req.session.user;
        app.model.course.get(req.query.courseId, (error, item) => {
            if (error || !item) {
                res.send({ error });
            } else {
                const listAdmin = item.admins;
                const lecturer = item.teacherGroups.filter(teacherGroup => teacherGroup.student && teacherGroup.student.findIndex(student =>
                    student.user._id == sessionUser._id
                ) != -1);
                if (listAdmin.findIndex(admin => admin._id == lecturer[0].teacher._id) != -1) {
                    listAdmin.push(lecturer[0].teacher);
                }
                res.send({ error, item: listAdmin.length ? listAdmin : null });
            }
        });
    });
};