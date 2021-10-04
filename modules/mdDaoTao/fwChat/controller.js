
module.exports = app => {

    app.get('/user/chat/:id', app.templates.admin);

    app.get('/api/chat', app.permission.check('user:login'), (req, res) => {
        const { roomId, createAt, numMessage } = req.query;
        app.model.chat.getAll({ room: roomId, sent: { $lt: createAt } }, parseInt(numMessage), (error, item) => {
            const new_item = item.reverse();
            app.model.chat.count({ room: roomId }, (error, count) => {
                res.send({ error, item: new_item, count });
            });
        });
    });

    app.post('/api/chat', app.permission.check('user:login'), (req, res) => {
        app.model.chat.create(req.body.data || {}, (error, item) => res.send({ error, item }));
    });

    app.get('/api/chat/student', app.permission.check('user:login'), (req, res) => {
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

    app.get('/api/chat/room', app.permission.check('user:login'), (req, res) => {
        const sessionUser = req.session.user,
            listRoom = [];
        listRoom.push(req.query.courseId);
        app.model.chat.getAll({ room: { $regex: sessionUser._id, $options: '$i' } }, (error, items) => {
            items.map(item => listRoom.indexOf(item.room) < 0 && listRoom.push(item.room));
            res.send({ error, listRoom });
        });
    });
};