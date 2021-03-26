module.exports = app => {
    app.get('/api/statistic/page/:pageNumber/:pageSize', app.permission.check('component:read'), (req, res) => {
        const pageNumber = parseInt(req.params.pageNumber),
            pageSize = parseInt(req.params.pageSize);
        app.model.statistic.getPage(pageNumber, pageSize, {}, (error, page) => {
            res.send({ error: error || page == null ? 'Danh sách thống kê chưa sẵn sàng' : null, page });
        });
    });

    app.get('/api/statistic/all', app.permission.check('component:read'), (req, res) =>
        app.model.statistic.getAll((error, list) => res.send({ error, list })));

    app.get('/api/statistic', app.permission.check('component:read'), (req, res) => {
        app.model.statistic.get(req.query._id, (error, statistic) => {
            if (error || statistic == null) {
                res.send({ error: 'Lấy thống kê bị lỗi!' });
            } else {
                app.model.statisticItem.getAll({ statisticId: statistic._id }, (error, items) => {
                    if (error || items == null) {
                        res.send({ error: 'Lấy thống kê bị lỗi!' });
                    } else {
                        res.send({ item: app.clone(statistic, { items }) });
                    }
                });
            }
        });
    });

    app.post('/api/statistic', app.permission.check('component:write'), (req, res) => {
        app.model.statistic.create(req.body.data, (error, statistic) => res.send({ error, statistic }))
    }
    );

    app.put('/api/statistic', app.permission.check('component:write'), (req, res) => {
        app.model.statistic.update(req.body._id, req.body.changes, (error, item) => res.send({ error, item }));
    });

    app.delete('/api/statistic', app.permission.check('component:write'), (req, res) => app.model.statistic.delete(req.body._id, error => res.send({ error })));

    app.post('/api/statistic/item', app.permission.check('component:write'), (req, res) => {
        console.log(req.session)
        app.model.statisticItem.create(req.body.data, (error, item) => {
            if (item && req.session.statisticItemImage) {
                app.adminUploadImage('statisticItem', app.model.statisticItem.get, item._id, req.session.statisticItemImage, req, res);
            } else {
                console.log(error)
                res.send({ error, item });
            }
        });
    });

    app.put('/api/statistic/item', app.permission.check('component:write'), (req, res) => {
        app.model.statisticItem.update(req.body._id, req.body.changes, (error, item) => res.send({ error, item }));
    });

    app.put('/api/statistic/item/swap', app.permission.check('component:write'), (req, res) => {
        const isMoveUp = req.body.isMoveUp.toString() == 'true';
        app.model.statisticItem.swapPriority(req.body._id, isMoveUp, (error, item1, item2) => res.send({ error, item1, item2 }));
    });

    app.delete('/api/statistic/item', app.permission.check('component:write'), (req, res) => {
        app.model.statisticItem.delete(req.body._id, (error, item) => res.send({ error, statisticId: item.statisticId }));
    });



    // Home -----------------------------------------------------------------------------------------------------------------------------------------
    app.get('/home/statistic', (req, res) => app.model.statistic.get(req.query._id, (error, statistic) => {
        if (error || statistic == null) {
            res.send({ error: 'Get statistic failed!' });
        } else {
            app.model.statisticItem.getAll({ statisticId: statistic._id, active: true }, (error, items) => {
                if (error || items == null) {
                    res.send({ error: 'Get statistic failed!' });
                } else {
                    res.send({ item: app.clone(statistic, { items }) });
                }
            });
        }
    }));

    // Hook upload images ---------------------------------------------------------------------------------------------------------------------------s
    app.createFolder(app.path.join(app.publicPath, '/img/statisticItem'));

    const uploadStatisticItemImage = (req, fields, files, params, done) => {
        if (fields.userData && fields.userData[0].startsWith('statisticItem:') && files.StatisticItemImage && files.StatisticItemImage.length > 0) {
            console.log('Hook: uploadStatisticItemImage => statistic image upload');
            app.uploadComponentImage(req, 'statisticItem', app.model.statisticItem.get, fields.userData[0].substring(14), files.StatisticItemImage[0].path, done);
        }
    };
    app.uploadHooks.add('uploadStatisticItemImage', (req, fields, files, params, done) =>
        app.permission.has(req, () => uploadStatisticItemImage(req, fields, files, params, done), done, 'component:write'));
};
