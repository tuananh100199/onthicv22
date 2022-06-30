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
    const getSenderUnreadChat = (receiver,sender)=> new Promise((resolve,reject)=>{
        app.model.chat.count({receiver,sender:sender.user?sender.user._id:sender._id,read:false},(error,numOfUnreadChat)=>{
            error ? reject(error) : resolve(numOfUnreadChat);
        });
    });

    const getSenderLastMessage = (receiver,sender)=> new Promise((resolve,reject)=>{
        app.model.chat.getUserPage(1,1,{receiver,sender:sender.user?sender.user._id:sender._id},(error,list)=>{
            if(error) reject(error);
            else{
                const lastMessage = list && list.length? list[0]:undefined;
                resolve(lastMessage);
            }
        });
    });

    const getListSenderSorted = (receiver,listSender)=> new Promise((resolve,reject)=>{
        const promiseList=[];
        listSender.forEach(sender=>promiseList.push(new Promise((res,rej)=>{
            Promise.all([getSenderUnreadChat(receiver,sender),getSenderLastMessage(receiver,sender)]).then(([numOfUnreadChat,lastMessage])=>{
                sender = {...sender._doc,numOfUnreadChat,lastMessage};
                res(sender);
            }).catch(error=>rej(error));
        })));

        promiseList && promiseList.length && Promise.all(promiseList).then(senders=>{
            // TODO: Sort list sender by last message chat.
            const list = senders.sort((a,b)=>{
                if(!a.lastMessage || !a.lastMessage.sent) return 1;
                if(!b.lastMessage || !b.lastMessage.sent) return -1;
                return b.lastMessage.sent - a.lastMessage.sent;
            });
            resolve(list);
        }).catch(error=>reject(error));
    });
    // Chat API
    app.get('/api/chat/admin', app.permission.check('course:read'), (req, res) => {
        const sessionUser = req.session.user;
        if (sessionUser.isCourseAdmin) {
            app.model.course.get(req.query._id, (error, item) => {
                if (error || !item) {
                    res.send({ error });
                } else {
                    let listTeacher = [];
                    item.teacherGroups && item.teacherGroups.length && item.teacherGroups.forEach(teacherGroup => teacherGroup.teacher && listTeacher.push(teacherGroup.teacher));
                    getListSenderSorted(sessionUser._id,listTeacher)
                    .then(list=>{
                        res.send({item:list});  
                    })
                    .catch(error=>console.error(error)||res.end({error}));
                }
            });
        } else {
            app.model.course.get(req.query._id, (error, item) => {
                if (error || !item) {
                    res.send({ error });
                } else {
                    const listStudent = item.teacherGroups.filter(teacherGroup => teacherGroup.teacher && teacherGroup.teacher._id == sessionUser._id);
                    let listUser = [];
                    item.admins && item.admins.length && item.admins.forEach(admin => listUser.push(admin));
                    listUser = listUser.concat(listStudent[0] ? listStudent[0].student : []);
                    getListSenderSorted(sessionUser._id,listUser)
                    .then(item=>res.send({item}))
                    .catch(error=>console.error(error)||res.send({error}));
                }
            });
        }
    });

    app.get('/api/chat/student', app.permission.check('user:login'), (req, res) => {
        const sessionUser = req.session.user;
        app.model.course.get(req.query.courseId, (error, item) => {
            if (error || !item) {
                res.send({ error });
            } else {
                const lecturer = item.teacherGroups.filter(teacherGroup => teacherGroup.student && teacherGroup.student.findIndex(student =>
                    student.user._id == sessionUser._id
                ) != -1);
                res.send({ error, item: lecturer.length ? lecturer[0].teacher : null });
            }
        });
    });

    // Mobile Chat API --------------------------------------------------------------------------------------------------------------------------

    app.get('/api/chat/token', app.permission.check('user:login'), (req, res) => {
        const { _id } = req.query;
        app.model.user.get(_id, (error, user) => {
            if (error || !user) {
                res.send({ error: 'Không tìm thấy người dùng' });
            } else {
                res.send({ error, token: user.fcmToken });
            }
        });
    });

    app.get('/api/chat/token/all', app.permission.check('user:login'), (req, res) => {
        const { _id } = req.query;
        app.model.student.getAll({ course: _id }, (error, students) => {
            if (error || !students) {
                res.send({ error: 'Không tìm thấy người dùng' });
            } else {
                const listTokenStudent = [];
                students.forEach(student => student.user && student.user.fcmToken && listTokenStudent.push(student.user.fcmToken));
                res.send({ error, list: listTokenStudent });
            }
        });
    });

    app.post('/api/chat', app.permission.check('user:login'), (req, res) => {
        const sessionUser = req.session.user;
        const dataChat = req.body.dataChat;
        sessionUser && app.model.user.get(dataChat.receiver, (error, receiver) => {
            if (!error && receiver) {
                app.model.chat.create({
                    sender: sessionUser._id,
                    receiver: receiver._id,
                    message: dataChat.message,
                }, (error, item) => {
                    if (!error && item) {
                        app.model.chat.get(item._id.toString(), (error, chat) => {
                            if (!error && chat) {
                                app.io.emit('chat:send', { chat });
                                app.model.chat.getSocketIds(receiver._id, (error, socketIds) => {
                                    let listSocketIds = [];
                                    !error && socketIds && socketIds.map(socketId => {
                                        listSocketIds.push(socketId);
                                    });
                                    app.io.to(listSocketIds).emit('chat:send', { chat });
                                });
                                app.model.chat.getSocketIds(sessionUser._id, (error, socketIds) => {
                                    let listSocketIds = [];
                                    !error && socketIds && socketIds.map(socketId => {
                                        listSocketIds.push(socketId);
                                    });
                                    app.io.to(listSocketIds).emit('chat:send', { chat });
                                });
                            }
                        });
                    }
                    res.send({ error, item });
                });
            } else {
                app.model.course.get(dataChat.receiver, (error, receiver) => {
                    if (!error && receiver) {
                        app.model.chat.create({
                            sender: sessionUser._id,
                            receiver: receiver._id,
                            message: dataChat.message,
                        }, (error, item) => {
                            if (!error && item) {
                                app.model.chat.get(item._id.toString(), (error, chat) => {
                                    if (!error && chat) {
                                        chat.receiver = receiver._id;
                                        app.io.in(receiver._id.toString()).emit('chat:send', { chat });
                                    }
                                });
                            }
                            res.send({ error, item });
                        });
                    } else {
                        res.send({ error });
                    }
                });
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