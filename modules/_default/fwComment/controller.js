module.exports = app => {
    app.permission.add({ name: 'comment:write' }, { name: 'comment:delete' });

    // APIs -----------------------------------------------------------------------------------------------------------------------------------------
    app.get('/api/comment/page/:pageNumber/:pageSize', (req, res) => {
        const pageNumber = parseInt(req.params.pageNumber),
            pageSize = parseInt(req.params.pageSize);
        let { refParentId, refId } = req.query;
        refParentId = app.db.Types.ObjectId(refParentId);
        refId = app.db.Types.ObjectId(refId);
        app.model.comment.getPage(pageNumber, pageSize, { refParentId, refId }, (error, page) => res.send({ error, page }));
    });

    app.get('/api/comment/scope/:commentId/:from/:limit', (req, res) => {
        const commentId = req.params.commentId, from = parseInt(req.params.from), limit = parseInt(req.params.limit);
        app.model.comment.getRepliesInScope({ _id: app.db.Types.ObjectId(commentId) }, from, limit, (error, comment) => {
            if (error || !comment) {
                res.send({ error: error || 'Invalid comment id' });
            } else {
                res.send({ replies: comment.replies || [] });
            }
        });
    });

    app.post('/api/comment', app.permission.check(), (req, res) => {
        let { _parentId, data } = req.body, user = req.session.user;
        if (user && (data.refId || _parentId)) {
            data.author = user._id;
            app.model.comment.create(data, (error, item) => {
                if (item && _parentId) {
                    delete data.refParentId;
                    delete data.refId;
                    app.model.comment.get(_parentId, (error, parentItem) => {
                        if (parentItem) {
                            if (parentItem.replies) {
                                parentItem.replies.push(item._id);
                            } else {
                                parentItem.replies = [item._id];
                            }
                            parentItem.save();
                        }
                        res.send({ error, item });
                    });
                } else {
                    res.send({ error, item });
                }
            });
        } else {
            res.send({ error: 'Permission denied!' });
        }
    });

    app.put('/api/comment', app.permission.check(), (req, res) => {
        const changes = req.body.changes, { _id } = req.body;
        const user = req.session.user, permissions = user ? user.permissions : [];
        const hasPermission = (permissions && permissions.includes('comment:write')) || (user && user._id == changes.author);
        if (_id && hasPermission) {
            delete changes.replies;
            app.model.comment.update(_id, { $set: changes }, (error, item) => res.send({ error, item }));
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
                    app.model.comment.deleteReply({ replies: data._id }, data._id, (error, item) => {
                        res.send({ error, item });
                    });
                }
            });
        } else {
            res.send({ error: 'Permission denied!' });
        }
    });
};