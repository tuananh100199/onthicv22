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

    //TODO: dọn rác /temp/:dateFolderName cách 1 ngày
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
                    if (srcPath.startsWith('/temp/')) {
                        srcPath = app.path.join(app.assetPath, srcPath);
                    } else {
                        app.deleteImage(item.image); // Xoá hình cũ
                    }
                    app.fs.rename(srcPath, destPath, (error) => {
                        if (error) {
                            done({ error });
                        } else {
                            item.image = image + '?t=' + new Date().getTime().toString().slice(-8);
                            item.save((error) => done({ error, item, image: item.image }));
                        }
                    });
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

    // Hook readyHooks ------------------------------------------------------------------------------------------------------------------------------
    app.readyHooks.add('readyInit', {
        ready: () => app.model != null && app.model.setting != null && app.state,
        run: () => {
            const enableInit = process.env['enableInit'] == 'true';
            if (enableInit) {
                app.model.setting.init(app.state.data, () => app.state.refresh())
            } else {
                setTimeout(() => { app.state.refresh() }, 200);
            }
        },
    });
};
