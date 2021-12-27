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
        if (!user || (!user.isCourseAdmin && !(user.isLecturer && user.isTrustLecturer) && !permissions.includes('comment:write'))) {
            condition.state = 'approved';
        }
        app.model.comment.getPage(pageNumber, pageSize, condition, (error, page) => res.send({ error, page }));
    });

    app.get('/api/comment/waiting/page/:pageNumber/:pageSize', (req, res) => {
        const pageNumber = parseInt(req.params.pageNumber),
            pageSize = parseInt(req.params.pageSize),
            { courseId, filter } = req.query.pageCondition;
        app.model.comment.getAll({ refParentId: courseId }, (error, item) => {
            if (error) res.send({ error });
            else {
                const parentIdList = [];
                let err = null,
                    newItem = {};
                const handleGetComment = (_id, list, index, done) => {
                    app.model.comment.get(_id, (error, item) => {
                        if (error || !item) err = error || 'Không tìm thấy comment!';
                        else {
                            if (item.refId) {
                                app.model.lesson.get(item.refId, (error, lesson) => {
                                    if (error) err = error;
                                    else if (!lesson) err = 'Không tìm thấy bình luận';
                                    else {
                                        newItem = list[index];
                                        newItem.lessonId = lesson._id;
                                        newItem.lessonName = lesson.title;
                                        done(newItem);
                                    }
                                });
                            } else {
                                handleGetComment(item.parentId, list, index, done);
                            }

                        }
                    });
                };
                item && item.length && item.map(comment => parentIdList.push(comment._id && comment._id.toString()));
                const condition = { $or: [{ 'refParentId': courseId }, { 'parentId': { $in: parentIdList } }], state: 'waiting' };
                app.model.comment.getPage(pageNumber, pageSize, condition, (error, page) => {
                    page.listLesson = [{ id: 'all', text: 'Tất cả bài học' }];
                    if (page && page.list && page.list.length) {
                        const list = page.list;
                        const handleGetLesson = (index = 0) => {
                            if (index == list.length) {
                                if (filter != 'all') page.list = page.list.filter(comment => comment.lessonId == filter);
                                res.send({ error: err, page });
                            } else {
                                const comment = list[index];
                                handleGetComment(comment._id, list, index, (newItem) => {
                                    page.list[index] = newItem;
                                    if (page.listLesson.findIndex(lesson => lesson.id == newItem.lessonId) == -1)
                                        page.listLesson.push({ id: newItem.lessonId, text: newItem.lessonName });
                                    handleGetLesson(index + 1);
                                });
                            }
                        };
                        handleGetLesson();
                    } else {
                        res.send({ error, page });
                    }
                }
                );
            }
        });
    });

    app.get('/api/comment/lessonId', (req, res) => {
        const _id = req.query._id;
        const handleGetComment = (_id) => {
            app.model.comment.get(_id, (error, item) => {
                if (error || !item) res.send({ error });
                else {
                    if (item.refId) {
                        app.model.lesson.get(item.refId, (error, lesson) => {
                            if (error) res.send({ error });
                            else if (!lesson) res.send({ error: 'Không tìm thấy bình luận' });
                            else res.send({ error, lessonId: lesson._id, lessonName: lesson.title });
                        });
                    } else {
                        handleGetComment(item.parentId);
                    }

                }
            });
        };
        handleGetComment(_id);
    });


    app.get('/api/comment/scope/:parentId/:from/:limit', (req, res) => {
        const user = req.session.user, permissions = user && user.permissions && user.permissions.length ? user.permissions : [];
        const parentId = req.params.parentId,
            from = parseInt(req.params.from),
            limit = parseInt(req.params.limit);
        const condition = { parentId };
        if (!user || (!user.isCourseAdmin && !(user.isLecturer && user.isTrustLecturer) && !permissions.includes('comment:write'))) {
            condition.state = 'approved';
        }

        app.model.comment.getRepliesInScope(condition, from, limit, (error, replies) => {
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

            if (user.isCourseAdmin || (user.isLecturer && user.isTrustLecturer) || permissions.includes('comment:write')) {
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
        const hasPermission = (permissions && permissions.includes('comment:write')) || user.isCourseAdmin || (user.isLecturer && user.isTrustLecturer) || (user && user._id == changes.author);
        if (_id && hasPermission) {
            delete changes.parentId;
            changes.updatedDate = new Date();
            if (user.isCourseAdmin || (user.isLecturer && user.isTrustLecturer) || permissions.includes('comment:write')) {
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
        const hasPermission = permissions.includes('comment:write') || user.isCourseAdmin;
        if (_id && hasPermission) {
            app.model.comment.update(_id, { $set: { state } }, (error, item) => res.send({ error, item }));
        } else {
            res.send({ error: 'Permission denied!' });
        }
    });

    app.delete('/api/comment', app.permission.check(), (req, res) => {
        const { data } = req.body;
        const user = req.session.user || {}, permissions = user.permissions || [];
        const hasPermission = permissions.includes('comment:delete') || user.isCourseAdmin || (user && user._id === data.author._id);
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

    app.permissionHooks.add('courseAdmin', 'comment', (user) => new Promise(resolve => {
        app.permissionHooks.pushUserPermission(user, 'comment:write');
        resolve();
    }));
};