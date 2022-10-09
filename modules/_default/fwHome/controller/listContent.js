module.exports = app => {
    app.componentModel['list contents'] = app.model.listContent;

    app.get('/api/list-content/page/:pageNumber/:pageSize', app.permission.check('component:read'), (req, res) => {
        const pageNumber = parseInt(req.params.pageNumber),
            pageSize = parseInt(req.params.pageSize);
        app.model.listContent.getPage(pageNumber, pageSize, {}, (error, page) => {
            res.send({ error: error || page == null ? 'Content list are not ready!' : null, page });
        });
    });

    app.get('/api/list-content/all', app.permission.check('component:read'), (req, res) => {
        app.model.listContent.getAll((error, list) => { res.send({ error, list }); });
    });

    app.get('/api/list-content', app.permission.check('component:read'), (req, res) => {
        app.model.listContent.get(req.query._id, (error, item) => res.send({ error, item }));
    });

    app.post('/api/list-content', app.permission.check('component:write'), (req, res) => {
        app.model.listContent.create(req.body.data, (error, item) => res.send({ error, item }));
    });

    app.put('/api/list-content', app.permission.check('component:write'), (req, res) => {
        //remove content from items , req.body.changes in this case is index:number
        if (!isNaN(req.body.changes)) {
            app.model.listContent.get(req.body._id, (error, item) => {
                item.items.splice(req.body.changes, 1);
                item.save();
                res.send({ error, item });
            });
        } else if (req.body.changes.index) { //swap content in items
            const { index, isMoveUp } = req.body.changes;
            app.model.listContent.get(req.body._id, (error, item) => {
                const temp = item.items[index];
                const newIndex = parseInt(index) + (isMoveUp == 'true' ? -1 : +1);
                if (0 <= index && index < item.items.length && 0 <= newIndex && newIndex < item.items.length) {
                    item.items.splice(index, 1);
                    item.items.splice(newIndex, 0, temp);
                    item.save();
                }
                res.send({ error, item });
            });
        } else {
            app.model.listContent.update(req.body._id, req.body.changes, (error, item) => res.send({ error, item }));
        }
    });

    app.delete('/api/list-content', app.permission.check('component:delete'), (req, res) => {
        app.model.listContent.delete(req.body._id, error => res.send({ error }));
    });

    // Home -----------------------------------------------------------------------------------------------------------------------------------------
    app.get('/home/list-content', (req, res) => {
        app.model.listContent.get(req.query._id, (error, item) => res.send({ error, item }));
    });

    // Hook upload images ---------------------------------------------------------------------------------------------------------------------------
    app.createFolder(app.path.join(app.publicPath, '/img/listContent'));
    const uploadListContent = (fields, files, done) => {
        if (fields.userData && fields.userData[0].startsWith('listContent:') && files.ListContentImage && files.ListContentImage.length > 0) {
            console.log('Hook: uploadListContent image => content list image upload');
            const _id = fields.userData[0].substring('listContent:'.length);
            app.uploadImage('listContent', app.model.listContent.get, _id, files.ListContentImage[0].path, done);
        }
    };

    app.uploadHooks.add('uploadListContent', (req, fields, files, params, done) =>
        app.permission.has(req, () => uploadListContent(fields, files, done), done, 'component:write'));
};