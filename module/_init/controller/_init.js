module.exports = (app) => {
    app.data = {
        addressList: JSON.stringify([]),
        todayViews: 0,
        allViews: 0,
        logo: '/img/favicon.jpg',
        map: '/img/map.jpg',
        facebook: 'https://www.facebook.com/bachkhoa.oisp',
        youtube: '',
        twitter: '',
        instagram: '',
        latitude: 10.7744962,
        longitude: 106.6606518,
        email: app.email.from,
        emailPassword: app.email.password,
        mobile: '(08) 2214 6555',
        address: 'Block B4 - Ho Chi Minh City University of Technology | 268 Ly Thuong Kiet Street, District 10, Hochiminh City, Vietnam',
    };

    app.createFolder(app.assetPath, app.path.join(app.assetPath, '/upload'));

    // Count views ----------------------------------------------------------------------------------------------------------------------------------
    const ready = () => {
        if (app.model && app.model.setting && app.model.user) {
            app.model.setting.init(app.data, () => {
                app.model.setting.get(['todayViews', 'allViews', 'logo', 'map', 'facebook', 'youtube', 'twitter', 'instagram', 'latitude', 'longitude', 'email', 'emailPassword', 'mobile', 'address'], (result) => {
                    app.data.todayViews = parseInt(result.todayViews);
                    app.data.allViews = parseInt(result.allViews);
                    app.data.logo = result.logo;
                    app.data.map = result.map;
                    app.data.facebook = result.facebook;
                    app.data.youtube = result.youtube;
                    app.data.twitter = result.twitter;
                    app.data.instagram = result.instagram;
                    app.data.latitude = result.latitude;
                    app.data.longitude = result.longitude;
                    app.data.email = result.email;
                    app.data.emailPassword = result.emailPassword;
                    app.data.mobile = result.mobile;
                    app.data.address = result.address;
                });
            });

            app.model.user.count((error, numberOfUser) => {
                app.data.numberOfUser = error ? 0 : numberOfUser;
            });
        } else {
            setTimeout(ready, 1000);
        }
    };
    ready();

    const fiveMinuteJob = () => {
        const count = {
            todayViews: app.data.todayViews,
            allViews: app.data.allViews,
        };
        app.io.emit('count', count);
        app.model.setting.set(count);
    };
    app.schedule('*/5 * * * *', fiveMinuteJob);

    // Upload ---------------------------------------------------------------------------------------------------------------------------------------
    app.post('/upload', (req, res) => {
        app.getUploadForm().parse(req, (error, fields, files) => {
            if (error) {
                res.send({ error });
            } else {
                res.send({
                    error: 'Error',
                });
            }
        });
    });

    app.post('/user/upload', app.permission.check(), (req, res) => {
        app.getUploadForm().parse(req, (error, fields, files) => {
            console.log('User Upload:', fields, files, req.query);

            if (error) {
                res.send({ error });
            } else {
                let hasResponse = false;
                app.uploadHooks.run(req, fields, files, req.query, (data) => {
                    if (hasResponse == false) res.send(data);
                    hasResponse = true;
                });
            }
        });
        app.uploadComponentImage = (req, dataName, getItem, dataId, srcPath, sendResponse) => {
            if (dataId == 'new') {
                let imageLink = app.path.join('/img/draft', app.path.basename(srcPath)),
                    sessionPath = app.path.join(app.publicPath, imageLink);
                app.fs.rename(srcPath, sessionPath, (error) => {
                    if (error == null) req.session[dataName + 'Image'] = sessionPath;
                    sendResponse({ error, image: imageLink });
                });
            } else {
                req.session[dataName + 'Image'] = null;
                if (getItem) {
                    getItem(dataId, (error, dataItem) => {
                        if (error || dataItem == null) {
                            sendResponse({ error: 'Invalid Id!' });
                        } else {
                            app.deleteImage(dataItem.image);
                            dataItem.image = '/img/' + dataName + '/' + dataItem._id + app.path.extname(srcPath);
                            app.fs.rename(srcPath, app.path.join(app.publicPath, dataItem.image), (error) => {
                                if (error) {
                                    sendResponse({ error });
                                } else {
                                    dataItem.image += '?t=' + new Date().getTime().toString().slice(-8);
                                    dataItem.save((error) => {
                                        if (dataName == 'user') {
                                            dataItem = app.clone(dataItem, { password: '' });
                                            if (req.session.user && req.session.user._id == dataItem._id) {
                                                req.session.user.image = dataItem.image;
                                            }
                                        }

                                        if (error == null) app.io.emit(dataName + '-changed', dataItem);
                                        sendResponse({ error, item: dataItem, image: dataItem.image, });
                                    });
                                }
                            });
                        }
                    });
                } else {
                    const image = '/img/' + dataName + '/' + dataId + app.path.extname(srcPath);
                    app.fs.rename(srcPath,
                        app.path.join(app.publicPath, image),
                        (error) => sendResponse({ error, image })
                    );
                }
            }
        };
    });

    app.uploadCkEditorImage = (category, fields, files, params, done) => {
        if (files.upload && files.upload.length > 0 && fields.ckCsrfToken && params.Type == 'File' && params.category == category) {
            console.log('Hook: uploadCkEditorImage => ckEditor upload');

            const srcPath = files.upload[0].path;
            app.jimp.read(srcPath).then((image) => {
                app.fs.unlinkSync(srcPath);
                if (image) {
                    if (image.bitmap.width > 1024) image.resize(1024, app.jimp.AUTO);
                    const url = `/img/${category}/${app.path.basename(srcPath)}`;
                    image.write(app.path.join(app.publicPath, url), (error) => {
                        done({
                            uploaded: error == null,
                            url,
                            error: { message: error ? 'Upload has errors!' : '' },
                        });
                    });
                } else {
                    done({ uploaded: false, error: 'Upload has errors!' });
                }
            });
        } else {
            done();
        }
    };

    app.uploadImageToBase64 = (srcPath, sendResponse) => {
        app.jimp.read(srcPath).then((image) =>
            image.getBuffer(app.jimp.MIME_PNG, (error, buffer) => {
                app.fs.unlinkSync(srcPath);
                sendResponse({
                    uploaded: error == null,
                    url: 'data:image/png;base64, ' + buffer.toString('base64'),
                    error: { message: error ? 'Upload image failed!' : '' },
                });
            })
        );
    };

    app.adminUploadImage = (dataName, getItem, dataId, srcPath, req, res) => {
        if (dataId == 'new') {
            let imageLink = app.path.join('/img/draft', app.path.basename(srcPath)),
                sessionPath = app.path.join(app.publicPath, imageLink);
            app.fs.rename(srcPath, sessionPath, (error) => {
                if (error == null) req.session[dataName + 'Image'] = sessionPath;
                res.send({ error, image: imageLink });
            });
        } else {
            req.session[dataName + 'Image'] = null;
            if (getItem) {
                getItem(dataId, (error, dataItem) => {
                    if (error || dataItem == null) {
                        res.send({ error: 'Invalid Id!' });
                    } else {
                        app.deleteImage(dataItem.image);
                        dataItem.image = '/img/' + dataName + '/' + dataItem._id + app.path.extname(srcPath);
                        app.fs.rename(srcPath, app.path.join(app.publicPath, dataItem.image), (error) => {
                            if (error) {
                                res.send({ error });
                            } else {
                                dataItem.image += '?t=' + new Date().getTime().toString().slice(-8);
                                dataItem.save((error) => {
                                    if (dataName == 'user') {
                                        dataItem = app.clone(dataItem, { password: '' });
                                        if (req.session.user && req.session.user._id == dataItem._id) {
                                            req.session.user.image = dataItem.image;
                                        }
                                    }
                                    if (error == null) app.io.emit(dataName + '-changed', dataItem);
                                    res.send({ error, item: dataItem, image: dataItem.image, });
                                });
                            }
                        });
                    }
                });
            } else {
                const image = '/img/' + dataName + '/' + dataId + app.path.extname(srcPath);
                app.fs.rename(srcPath, app.path.join(app.publicPath, image), (error) =>
                    res.send({ error, image })
                );
            }
        }
    };
};
