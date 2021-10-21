module.exports = app => {
    app.permission.add({ name: 'comment:write' }, { name: 'comment:delete' });

    // APIs -----------------------------------------------------------------------------------------------------------------------------------------
    app.get('/api/comment/page/:pageNumber/:pageSize', (req, res) => {
        const user = req.session.user, permissions = user && user.permissions && user.permissions.length ? user.permissions : [];
        const pageNumber = parseInt(req.params.pageNumber),
            pageSize = parseInt(req.params.pageSize),
            { refParentId, refId } = req.query,
            condition = {};
        if (refParentId) condition.refParentId = refParentId;
        if (refId) condition.refId = refId;
        if (!user || (!user.isCourseAdmin && !user.isLecturer && !permissions.includes('comment:write'))) {
            condition.state = 'approved';
        }
        app.model.comment.getPage(pageNumber, pageSize, condition, (error, page) => res.send({ error, page }));
    });

    app.get('/api/comment/scope/:parentId/:from/:limit', (req, res) => {
        const user = req.session.user, permissions = user && user.permissions && user.permissions.length ? user.permissions : [];
        const parentId = req.params.parentId,
            from = parseInt(req.params.from),
            limit = parseInt(req.params.limit);
        const condition = { parentId };
        if (!user || (!user.isCourseAdmin && !user.isLecturer && !permissions.includes('comment:write'))) {
            condition.state = 'approved';
        }

        app.model.comment.getRepliesInScope(condition , from, limit, (error, replies) => {
            if (error || !replies) {
                res.send({ error: error || 'Invalid comment id' });
            } else {
                res.send({ replies });
            }
        });
    });

    app.post('/api/comment', app.permission.check(), (req, res) => {
        let { _parentId, data } = req.body, user = req.session.user;
        const permissions = user.permissions && user.permissions.length ? user.permissions : [];
        if (user && (data.refId || _parentId)) {
            data.author = user._id;
            if (_parentId) {
                delete data.refParentId;
                delete data.refId;
                data.parentId = _parentId;
            }

            if (user.isCourseAdmin || user.isLecturer || permissions.includes('comment:write')) {
                data.state = 'approved';
            }
            app.model.comment.create(data, (error, item) => res.send({ error, item }));
        } else {
            res.send({ error: 'Permission denied!' });
        }
    });

    app.put('/api/comment', app.permission.check(), (req, res) => {
        const changes = req.body.changes, { _id } = req.body;
        const user = req.session.user, permissions = user ? user.permissions : [];
        const hasPermission = (permissions && permissions.includes('comment:write')) || (user && user._id == changes.author);
        if (_id && hasPermission) {
            delete changes.parentId;
            changes.updatedDate = new Date();
            if (user.isCourseAdmin || user.isLecturer || permissions.includes('comment:write')) {
                changes.state = 'approved';
            } else {
                changes.state = 'waiting';
            }
            app.model.comment.update(_id, { $set: changes }, (error, item) => res.send({ error, item }));
        } else {
            res.send({ error: 'Permission denied!' });
        }
    });

    app.put('/api/comment-approval', app.permission.check(), (req, res) => {
        const state = req.body.state, { _id } = req.body;
        const user = req.session.user, permissions = user.permissions || [];
        const hasPermission = permissions.includes('comment:write') || user.isCourseAdmin || user.isLecturer;
        if (_id && hasPermission) {
            app.model.comment.update(_id, { $set: { state } }, (error, item) => res.send({ error, item }));
        } else {
            res.send({ error: 'Permission denied!' });
        }
    });

    app.delete('/api/comment', app.permission.check(), (req, res) => {
        const { data } = req.body;
        const user = req.session.user || {}, permissions = user.permissions || [];
        const hasPermission = permissions.includes('comment:delete') || (user && user._id === data.author._id);
        if (hasPermission) {
            app.model.comment.delete(data._id, (error) => {
                if (error) {
                    res.send({ error });
                } else {
                    // Delete item in replies
                    app.model.comment.delete({ parentId: data._id }, (error, item) => {
                        res.send({ error, item });
                    });
                }
            });
        } else {
            res.send({ error: 'Permission denied!' });
        }
    });
};