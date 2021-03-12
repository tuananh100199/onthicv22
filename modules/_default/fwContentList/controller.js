module.exports = app => {

    app.get('/api/list-content/all', app.permission.check('component:read'), (req, res) => {
        app.model.contentList.getAll((error, items) => {
            res.send({ error, items })
        })
    });

    app.get('/api/list-content/item/:contentListId', app.permission.check('component:read'), (req, res) =>
        app.model.contentList.get(req.params.contentListId, (error, item) => res.send({ error, item })));

    app.post('/api/list-content', app.permission.check('component:write'), (req, res) => {
        app.model.contentList.create(req.body.newData, (error, item) => res.send({ error, item }))
    });

    app.put('/api/list-content', app.permission.check('component:write'), (req, res) => {
        const $set = req.body.changes;
        if ($set && $set.items && $set.items === 'empty') $set.items = [];
        app.model.contentList.update(req.body._id, $set, (error, item) => res.send({ error, item }))
    });

    app.delete('/api/list-content', app.permission.check('component:write'), (req, res) => app.model.contentList.delete(req.body._id, error => res.send({ error })));
    
    
    app.get('/list-content/item/:contentListId', (req, res) => app.model.contentList.get(req.params.contentListId, (error, item) => res.send({ error, item })));
    
    // Hook upload images ---------------------------------------------------------------------------------------------------------------------------s
    app.createFolder(app.path.join(app.publicPath, '/img/contentList'));
    const uploadContentList = (req, fields, files, params, done) => {
        if (fields.userData && fields.userData[0].startsWith('contentList:') && files.ContentListImage && files.ContentListImage.length > 0) {
            console.log('Hook: uploadContentList image => content list image upload');
            app.uploadComponentImage(req, 'contentList', app.model.contentList.get, fields.userData[0].substring(12), files.ContentListImage[0].path, done);
        }
    };
    
    app.uploadHooks.add('uploadContentList', (req, fields, files, params, done) =>
        app.permission.has(req, () => uploadContentList(req, fields, files, params, done), done, 'component:write'));
};