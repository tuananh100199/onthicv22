module.exports = app => {
    const schema = app.db.Schema({
        message: String,
        receiver: { type: app.db.Schema.ObjectId, ref: 'User' },
        sent: { type: Date, default: Date.now },
        sender: { type: app.db.Schema.ObjectId, ref: 'User' },
    });
    const model = app.db.model('Chat', schema);

    const populates = [
        { path: 'sender', select: 'firstname lastname image isLecturer isCourseAdmin' },
        { path: 'receiver', select: 'firstname lastname image isLecturer isCourseAdmin' },
    ];

    const getSocketIdsKey = (_userId) => `${app.appName}:chat:socketIds:${_userId}`;
    const getFriendsKey = (_userId) => `${app.appName}:chat:friends${_userId}`;
    const updateChatUsers = (_userId1, _userId2) => {
        const key = getFriendsKey(_userId1);
        app.redis.get(key, (error, users) => {
            if (!error) {
                users = users ? users.replace(_userId2, '').replace(',,', ',') : '';
                app.redis.set(key, _userId2 + (users.length ? ',' : '') + users);
            }
        });
    };


    app.model.chat = {
        create: (data, done) => {
            model.create(data, (error, item) => {
                if (item) {
                    updateChatUsers(data.sender, data.receiver);
                    updateChatUsers(data.receiver, data.sender);
                }
                done(error, item);
            });
        },

        getAll: (condition, done) => {
            if (done == undefined) {
                done = condition;
                condition = {};
            }
            model.find(condition).sort({ sent: -1 }).populate(populates).exec(done);
        },

        get: (condition, done) => (typeof condition == 'string' ? model.findById(condition) : model.findOne(condition))
            .populate(populates).exec(done),

        // changes = { $set, $unset, $push, $pull }
        update: (condition, changes, done) => {
            if (typeof condition == 'string') condition = { _id: condition };
            model.updateMany(condition, changes, done);
        },

        delete: (_id, done) => model.findById(_id, (error, item) => {
            if (error) {
                done(error);
            } else if (item == null) {
                done('Invalid Id!');
            } else {
                app.deleteImage(item.image);
                item.remove(done);
            }
        }),

        getUserPage: (pageNumber, pageSize, condition, done) => {
            const skipNumber = (pageNumber > 0 ? pageNumber - 1 : 0) * pageSize;
            model.find(condition).sort({ sent: -1 }).skip(skipNumber).limit(pageSize).populate(populates).exec((error, list) => {
                done(error, list);
            });
        },

        count: (condition, done) => done ? model.countDocuments(condition, done) : model.countDocuments({}, condition),

        // Redis ------------------------------------------------------------------------------------------------------------------------------------
        getFriends: (_userId, done) => app.redis.get(getFriendsKey(_userId), (error, items) =>
            done(error, items ? items.split(',') : [])),

        getSocketIds: (_userId, done) => app.redis.get(getSocketIdsKey(_userId), (error, items) =>
            done(error, items ? items.split(',') : [])),

        join: (_userId, _socketId, done) => {
            const key = getSocketIdsKey(_userId);
            app.redis.get(key, (error, socketIds) => {
                if (error) {
                    done && done(error);
                } else {
                    if (!socketIds) {
                        app.redis.set(key, _socketId);
                    } else if (socketIds.indexOf(_socketId) == -1) {
                        app.redis.set(key, _socketId + ',' + socketIds);
                    }
                    done && done();
                }
            });
        },
        leave: (_userId, _socketId, done) => {
            const key = getSocketIdsKey(_userId);
            app.redis.get(key, (error, socketIds) => {
                if (error) {
                    done && done(error);
                } else {
                    if (socketIds && socketIds.indexOf(_socketId) != -1) {
                        app.redis.set(key, socketIds.replace(_socketId, '').replace(',,', ','));
                    }
                    done && done();
                }
            });
        },

        clearSocketIds: () => app.redis.keys(getSocketIdsKey('*'), (error, keys) =>
            !error && keys && keys.forEach(key => app.redis.set(key, ''))),
    };
};
