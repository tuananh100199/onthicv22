module.exports = app => {
    app.get('/content/item/:contentId', app.templates.home);
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

    app.delete('/api/list-content', app.permission.check('component:write'), (req, res) => app.model.contentList.delete(req.body._id, error => res.send({ error })));

    // item...
    app.post('/api/list-content/item', app.permission.check('component:write'), (req, res) => app.model.contentList.create(req.body.data, (error, item) => {
        if (item && req.session.contentListItemImage) {
            app.adminUploadImage('contentListItem', app.model.contentListItem.get, item._id, req.session.contentListItemImage, req, res);
        } else {
            res.send({ error, item });
        }
    }));

    app.put('/api/list-content', app.permission.check('component:write'), (req, res) => {
        const $set = req.body.changes, $unset = {};
        if ($set && $set.items && $set.items === 'empty') $set.items = [];
        app.model.contentList.update(req.body._id, $set, $unset, (error, item) => res.send({ error, item }))
    })
        ;

    app.put('/api/list-content/item/swap', app.permission.check('component:write'), (req, res) => {
        const isMoveUp = req.body.isMoveUp.toString() == 'true';
        app.model.contentList.swapPriority(req.body._id, isMoveUp, (error, item1, item2) => res.send({ error, item1, item2 }));
    });

    app.delete('/api/list-content/item', app.permission.check('component:write'), (req, res) =>
        app.model.contentList.delete(req.body._id, (error, item) => res.send({ error, contentListId: item.contentListId })));

    // Home -----------------------------------------------------------------------------------------------------------------------------------------
    app.get('/home/list-content/:_id', (req, res) =>
        app.model.contentList.get(req.params._id, (error, item) => res.send({ error, item })));


    // Hook upload images ---------------------------------------------------------------------------------------------------------------------------s
    app.createFolder(app.path.join(app.publicPath, '/img/list-content'));

    const uploadcontentList = (req, fields, files, params, done) => {
        if (fields.userData && fields.userData[0].startsWith('list-content:') && files.StatisticImage && files.StatisticImage.length > 0) {
            console.log('Hook: uploadcontentList => list-content image upload');
            app.uploadComponentImage(req, 'list-content', app.model.contentList.get, fields.userData[0].substring(10), files.StatisticImage[0].path, done);
        }
    };
    app.uploadHooks.add('uploadcontentList', (req, fields, files, params, done) =>
        app.permission.has(req, () => uploadcontentList(req, fields, files, params, done), done, 'component:write'));
};