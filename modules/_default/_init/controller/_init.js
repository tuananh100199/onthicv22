module.exports = (app) => {
    app.createFolder(app.assetPath, app.path.join(app.assetPath, '/upload'), app.path.join(app.assetPath, '/temp'));

    // Upload ---------------------------------------------------------------------------------------------------------------------------------------
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
    });

    app.get('/temp/:dateFolderName/img/:dataFolderName/:imageName', app.permission.check('user:login'), (req, res) => {
        let { dateFolderName, dataFolderName, imageName } = req.params;
        dateFolderName = dateFolderName.trim();
        dataFolderName = dataFolderName.trim();
        imageName = imageName.trim();
        const imagePath = app.path.join(app.assetPath, 'temp', dateFolderName, 'img', dataFolderName, imageName);
        if (app.fs.existsSync(imagePath) && !(dateFolderName.startsWith('../') || dateFolderName.startsWith('./') || dataFolderName.startsWith('../') || dataFolderName.startsWith('./') || imageName.startsWith('../') || imageName.startsWith('./'))) {
            res.sendFile(imagePath);
        } else {
            res.sendFile(app.path.join(app.publicPath, '/img/avatar-default.png'));
        }
    });

    app.uploadImage = (dataName, getItem, _id, srcPath, done) => {
        if (_id == 'new') { // Upload hình ảnh khi chưa có tạo đối tượng trong database
            const dateFolderName = app.date.getDateFolderName(),
                image = app.path.join('/temp', dateFolderName, 'img', dataName, app.path.basename(srcPath));
            app.createFolder(
                app.path.join(app.assetPath, '/temp', dateFolderName),
                app.path.join(app.assetPath, '/temp', dateFolderName, 'img'),
                app.path.join(app.assetPath, '/temp', dateFolderName, 'img', dataName));
            app.fs.rename(srcPath, app.path.join(app.assetPath, image), (error) => done({ error, image }));
        } else { // Cập nhật image vào item
            const image = '/img/' + dataName + '/' + _id + app.path.extname(srcPath),
                destPath = app.path.join(app.publicPath, image);
            getItem(_id, (error, item) => {
                if (error || item == null) {
                    done({ error: error || 'Invalid Id!' });
                } else {
                    if (srcPath.startsWith('/temp/') || srcPath.startsWith('\\temp\\')) {
                        srcPath = app.path.join(app.assetPath, srcPath);
                    } else {
                        app.deleteImage(item.image); // Xoá hình cũ
                    }
                    console.log('dataName', dataName);

                    if (dataName && dataName.startsWith('gioi-thieu')) {
                        app.fs.rename(srcPath, destPath, (error) => {
                            if (error) {
                                done({ error });
                            } else {
                                if (dataName.startsWith('gioi-thieu1')) {
                                    item.image1 = image + '?t=' + new Date().getTime().toString().slice(-8);
                                    item.save((error) => done({ error, item, image: item.image1 }));
                                } else if (dataName.startsWith('gioi-thieu2')) {
                                    item.image2 = image + '?t=' + new Date().getTime().toString().slice(-8);
                                    item.save((error) => done({ error, item, image: item.image2 }));
                                } else {
                                    item.image3 = image + '?t=' + new Date().getTime().toString().slice(-8);
                                    item.save((error) => done({ error, item, image: item.image3 }));
                                }
                            }
                        });
                    } else if (dataName && dataName.startsWith('loginForm')) {
                        app.fs.rename(srcPath, destPath, (error) => {
                            if (error) {
                                done({ error });
                            } else {
                                if (dataName.startsWith('loginFormBackground')) {
                                    item.imageBackground = image + '?t=' + new Date().getTime().toString().slice(-8);
                                    item.save((error) => done({ error, item, image: item.imageBackground }));
                                } else {
                                    item.image = image + '?t=' + new Date().getTime().toString().slice(-8);
                                    item.save((error) => done({ error, item, image: item.image }));
                                }
                            }
                        });
                    } else if (dataName && dataName.startsWith('hang')) {
                        app.fs.rename(srcPath, destPath, (error) => {
                            if (error) {
                                done({ error });
                            } else {
                                if (dataName.startsWith('hang1')) {
                                    item.image1 = image + '?t=' + new Date().getTime().toString().slice(-8);
                                    item.save((error) => done({ error, item, image: item.image1 }));
                                } else if (dataName.startsWith('hang2')) {
                                    item.image2 = image + '?t=' + new Date().getTime().toString().slice(-8);
                                    item.save((error) => done({ error, item, image: item.image2 }));
                                } else {
                                    item.image3 = image + '?t=' + new Date().getTime().toString().slice(-8);
                                    item.save((error) => done({ error, item, image: item.image3 }));
                                }
                            }
                        });
                    } else {
                        app.fs.rename(srcPath, destPath, (error) => {
                            if (error) {
                                done({ error });
                            } else {
                                item.image = image + '?t=' + new Date().getTime().toString().slice(-8);
                                item.save((error) => done({ error, item, image: item.image }));
                            }
                        });
                    }
                    // app.fs.rename(srcPath, destPath, (error) => {
                    //     if (error) {
                    //         done({ error });
                    //     } else {
                    //         item.image = image + '?t=' + new Date().getTime().toString().slice(-8);
                    //         item.save((error) => done({ error, item, image: item.image }));
                    //     }
                    // });

                }
            });
        }
    };

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
                            url, width: '80%', height: ' ',
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

    // handleFilterConditionDefault (default handle) ---------------------------------------------------------------------------
    app.handleFilter = (filter, fields, done) => {
        let condition = {};
        fields.forEach(name => {
            if (filter[name]) {
                if (Array.isArray(filter[name])) {
                    condition[name] = { $in: filter[name] };
                } else {
                    condition[name] = { $regex: `.*${filter[name]}.*`, $options: 'i' };
                }
            }
        });
        done && done(condition);
    };

    // System state ---------------------------------------------------------------------------------------------------------------------------------
    app.state = {
        prefixKey: `${app.appName}:state:`,

        initState: {
            todayViews: 0,
            allViews: 0,
            logo: '/img/favicon.ico',
            map: '/img/map.png',
            contact: '/img/contact.jpg',
            subscribe: '/img/subscribe.jpg',
            footer: '/img/footer.jpg',
            facebook: 'https://www.facebook.com',
            fax: '',
            youtube: '',
            twitter: '',
            instagram: '',
            email: app.email.from,
            emailPassword: app.email.password,
            mobile: '(08) 2214 6555',
            address: '',
            smsAPIToken: app.getToken(32),
            activeZalo: false,
            zaloId: ''
        },

        init: () => app.database.redisDB.keys(`${app.appName}:state:*`, (_, keys) => {
            keys && Object.keys(app.state.initState).forEach(key => {
                const redisKey = `${app.appName}:state:${key}`;
                if (keys.indexOf(redisKey) == -1) app.database.redisDB.set(redisKey, app.state.initState[key]);
            });
        }),

        get: (...params) => {
            const n = params.length,
                prefixKeyLength = app.state.prefixKey.length;
            if (n >= 1 && typeof params[n - 1] == 'function') {
                const done = params.pop(); // done(error, values)
                const keys = n == 1 ? app.state.keys : params.map(key => `${app.appName}:state:${key}`); // get chỉ có done => đọc hết app.state
                app.database.redisDB.mget(keys, (error, values) => {
                    if (error || values == null) {
                        done(error || 'Error when get Redis value!');
                    } else if (n == 2) {
                        done(null, values[0]);
                    } else {
                        const state = {};
                        keys.forEach((key, index) => state[key.substring(prefixKeyLength)] = values[index]);
                        done(null, state);
                    }
                });
            } else {
                console.log('Error when get app.state');
            }
        },

        set: (...params) => {
            const n = params.length;
            if (n >= 1 && typeof params[n - 1] == 'function') {
                const done = (n % 2) ? params.pop() : null;
                for (let i = 0; i < n - 1; i += 2) params[i] = app.state.prefixKey + params[i];
                n == 1 ? done() : app.database.redisDB.mset(params, error => done && done(error));
            } else {
                console.log('Error when set app.state');
            }
        },
    };
    app.state.keys = Object.keys(app.state.initState).map(key => app.state.prefixKey + key);

    // Hook readyHooks ------------------------------------------------------------------------------------------------------------------------------
    app.readyHooks.add('readyInit', {
        ready: () => app.database.redisDB,
        run: () => app.primaryWorker && app.state.init(),
    });
};