module.exports = app => {
    app.get('/api/carousel/page/:pageNumber/:pageSize', app.permission.check('component:read'), (req, res) => {
        const pageNumber = parseInt(req.params.pageNumber),
            pageSize = parseInt(req.params.pageSize);
        app.model.carousel.getPage(pageNumber, pageSize, {}, (error, page) => {
            if (error || page == null) {
                res.send({ error: 'Carousel list are not ready!' })
            } else {
                res.send({ page });
            }
        });
    });

    app.get('/api/carousel/all', app.permission.check('component:read'), (req, res) => app.model.carousel.getAll((error, items) => res.send({ error, items })));

    app.get('/api/carousel/:_id', app.permission.check('component:read'), (req, res) => app.model.carousel.get(req.params._id, (error, carousel) => {
        if (error || carousel == null) {
            res.send({ error: 'Get carousel failed!' });
        } else {
            app.model.carouselItem.getByCarouselId(carousel._id, (error, items) => {
                if (error || items == null) {
                    res.send({ error: 'Get carousel items failed!' });
                } else {
                    res.send({ item: app.clone(carousel, { items }) });
                }
            });
        }
    }));

    app.post('/api/carousel', app.permission.check('component:write'), (req, res) =>
        app.model.carousel.create(req.body.data, (error, carousel) => res.send({ error, carousel })));

    app.put('/api/carousel', app.permission.check('component:write'), (req, res) =>
        app.model.carousel.update(req.body._id, req.body.changes, (error, item) => res.send({ error, item })));

    app.delete('/api/carousel', app.permission.check('component:write'), (req, res) =>
        app.model.carousel.delete(req.body.id, error => res.send({ error })));


    app.post('/api/carousel/item', app.permission.check('component:write'), (req, res) => app.model.carouselItem.create(req.body.data, (error, item) => {
        if (item && req.session.carouselItemImage) {
            app.adminUploadImage('carouselItem', app.model.carouselItem.get, item._id, req.session.carouselItemImage, req, res);
        } else {
            res.send({ error, item });
        }
    }));

    app.put('/api/carousel/item', app.permission.check('component:write'), (req, res) =>
        app.model.carouselItem.update(req.body._id, req.body.changes, (error, item) => res.send({ error, item })));

    app.put('/api/carousel/item/swap', app.permission.check('component:write'), (req, res) => {
        const isMoveUp = req.body.isMoveUp.toString() == 'true';
        app.model.carouselItem.swapPriority(req.body._id, isMoveUp, (error, item1, item2) => res.send({ error, item1, item2 }));
    });

    app.delete('/api/carousel/item', app.permission.check('component:write'), (req, res) =>
        app.model.carouselItem.delete(req.body._id, (error, item) => res.send({ error, carouselId: item.carouselId })));

    // Home -----------------------------------------------------------------------------------------------------------------------------------------
    app.get('/home/carousel/:_id', (req, res) => app.model.carousel.get(req.params._id, (error, carousel) => {
        if (error || carousel == null) {
            res.send({ error: 'Get carousel failed!' });
        } else {
            app.model.carouselItem.getByActiveCarouselId(carousel._id, (error, items) => {
                if (error || items == null) {
                    res.send({ error: 'Get carousel failed!'  });
                } else {
                    res.send({ item: app.clone(carousel, { items }) });
                }
            });
        }
    }));


    // Hook upload images ---------------------------------------------------------------------------------------------------------------------------s
    app.createFolder(app.path.join(app.publicPath, '/img/carouselItem'));

    const uploadCarouselItemImage = (req, fields, files, params, done) => {
        if (fields.userData && fields.userData[0].startsWith('CarouselItem:') && files.CarouselItemImage && files.CarouselItemImage.length > 0) {
            console.log('Hook: uploadCarouselItemImage => carousel image upload');
            app.uploadComponentImage(req, 'carouselItem', app.model.carouselItem.get, fields.userData[0].substring(13), files.CarouselItemImage[0].path, done);
        }
    };
    app.uploadHooks.add('uploadCarouselItemImage', (req, fields, files, params, done) =>
        app.permission.has(req, () => uploadCarouselItemImage(req, fields, files, params, done), done, 'component:write'));
};