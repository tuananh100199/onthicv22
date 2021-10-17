
module.exports = app => {
    app.get('/user/chat/:id', app.templates.admin);

    app.put('/api/chat/read-all', app.permission.check('user:login'), (req, res) => {
        const sessionUser = req.session.user,
            { _selectedUserId } = req.body;
        // Đọc những chat mà người gửi là targetUser, người đọc là sessionUser
        const condition = { sender: _selectedUserId, receiver: sessionUser._id };
        app.model.chat.update(condition, { $set: { read: true } }, (error) => res.send({ error }));
    });

    app.get('/api/chat/all', app.permission.check('user:login'), (req, res) => {
        const { _courseId, sent } = req.query;
        app.model.course.get(_courseId, (error, course) => {
            if (error || !course) {
                res.send({ error: 'Invalid parameter!' });
            } else {
                // Đọc những chat mà người gửi là targetUser, người đọc là sessionUser
                let condition = {
                    receiver: _courseId
                };
                if (sent) condition.sent = { $lt: new Date(sent) };
                app.model.chat.getUserPage(1, 20, condition, (error, chats) => {
                    res.send({ error, chats });
                });
            }
        });
    });

    app.get('/api/chat/user', app.permission.check('user:login'), (req, res) => {
        const sessionUser = req.session.user,
            { _selectedUserId, sent } = req.query;
        app.model.user.get(_selectedUserId, (error, user) => {
            if (error || !user) {
                res.send({ error: 'Invalid parameter!' });
            } else {
                // Đọc những chat mà người gửi là targetUser, người đọc là sessionUser
                let condition = {
                    $or: [
                        { sender: sessionUser._id, receiver: _selectedUserId },
                        { sender: _selectedUserId, receiver: sessionUser._id },
                    ],
                };
                if (sent) condition.sent = { $lt: new Date(sent) };
                app.model.chat.getUserPage(1, 20, condition, (error, chats) => {
                    if (!error) {
                        condition = { sender: _selectedUserId, receiver: sessionUser._id };
                        if (sent) condition.sent = { $lt: new Date(sent) };
                        app.model.chat.update(condition, { $set: { read: true } });
                    }
                    const { _id, firstname, lastname, image } = user;
                    res.send({ error, chats, selectedUser: { _id, firstname, lastname, image } });
                });
            }
        });
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
                if (lecturer.length && listAdmin.findIndex(admin => admin._id == lecturer[0].teacher._id) != -1) {
                    listAdmin.push(lecturer[0].teacher);
                }
                res.send({ error, item: listAdmin.length ? listAdmin : null });
            }
        });
    });

    // Socket IO listeners --------------------------------------------------------------------------------------------------------------------------
    app.io.addSocketListener('chat:join', (socket, data) => {
        const sessionUser = app.io.getSessionUser(socket);
        new Promise(resolve => {
            if (data && data._courseId) {
                app.model.course.get(data._courseId, (error, course) => resolve({ error, _roomId: course ? course._id : null }));
            } else {
                resolve({ _newUserId: data && data._userId });
            }
        }).then(({ error, _newUserId }) => new Promise((resolve) => {
            if (error) {
                resolve({ error });
            } else if (!sessionUser) {
                resolve({ error: 'You must login!' });
            } else {
                app.model.chat.getFriends(sessionUser._id, (error, _userIds) => {
                    if (error) {
                        resolve({ error });
                    } else {
                        if (!_userIds) _userIds = [];
                        if (_newUserId) _userIds.unshift(_newUserId);
                        app.model.user.getAll({ _id: { $in: _userIds } }, (error, users) => resolve({ error, users }));
                    }
                });
            }
        })).then(data => {
            socket.emit('chat:join', data);
        });
    });

    app.io.addSocketListener('chat:joinCourseRoom', (socket, data) => {
        data && socket.join(data.courseId);
    });


    app.io.addSocketListener('chat:send', (socket, data) => {
        const sessionUser = app.io.getSessionUser(socket);
        sessionUser && app.model.user.get(data.receiver, (error, receiver) => {
            if (!error && receiver) {
                app.model.chat.create({
                    sender: sessionUser._id,
                    receiver: receiver._id,
                    message: data.message,
                }, (error, item) => !error && item && app.model.chat.get(item._id, (error, chat) => {
                    if (!error && chat) {
                        socket.emit('chat:send', { chat });
                        app.model.chat.getSocketIds(receiver._id, (error, socketIds) => {
                            let listSocketIds = [];
                            !error && socketIds && socketIds.map(socketId => {
                                listSocketIds.push(socketId);
                            });
                            socket.to(listSocketIds).emit('chat:send', { chat });
                        });
                        app.model.chat.getSocketIds(sessionUser._id, (error, socketIds) => {
                            let listSocketIds = [];
                            !error && socketIds && socketIds.map(socketId => {
                                listSocketIds.push(socketId);
                            });
                            socket.to(listSocketIds).emit('chat:send', { chat });
                        });
                    }
                }));
            } else {
                app.model.course.get(data.receiver, (error, receiver) => {
                    if (!error && receiver) {
                        app.model.chat.create({
                            sender: sessionUser._id,
                            receiver: receiver._id,
                            message: data.message,
                        }, (error, item) => !error && item && app.model.chat.get(item._id, (error, chat) => {
                            if (!error && chat) {
                                chat.receiver = receiver._id;
                                app.io.in(receiver._id.toString()).emit('chat:send', { chat });
                            }
                        }));
                    }
                });
            }
        });
    });
};