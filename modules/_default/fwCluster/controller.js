module.exports = app => {
    app.createFolder(app.bundlePath);

    const menu = {
        parentMenu: app.parentMenu.setting,
        menus: {
            2040: { title: 'Cluster', link: '/user/cluster', icon: 'fa-braille', backgroundColor: '#4db6ac' }
        }
    };
    app.permission.add({ name: 'cluster:read', menu }, { name: 'cluster:write' }, { name: 'cluster:delete' });

    app.get('/user/cluster', app.permission.check('cluster:read'), app.templates.admin);

    // Cluster APIs ---------------------------------------------------------------------------------------------------------------------------------
    app.get('/api/cluster/all', app.permission.check('cluster:read'), (req, res) => {
        res.send({ items: app.worker.items });
    });

    app.post('/api/cluster', app.permission.check('cluster:write'), (req, res) => {
        app.worker.create();
        res.send({});
    });

    app.put('/api/cluster', app.permission.check('cluster:write'), (req, res) => {
        app.worker.reset(req.body.id);
        res.send({});
    });

    app.delete('/api/cluster', app.permission.check('cluster:delete'), (req, res) => {
        if (app.worker.items.length > 1) {
            app.worker.shutdown(req.body.id);
            res.send({});
        } else {
            res.send({ error: 'Invalid action!' });
        }
    });

    // System Image APIs ----------------------------------------------------------------------------------------------------------------------------
    app.get('/api/cluster/image/all', app.permission.check('cluster:read'), (req, res) => {
        const items = [];
        app.fs.readdirSync(app.bundlePath).forEach(filename => {
            const state = app.fs.statSync(app.bundlePath + '/' + filename);
            if (state.isFile()) {
                items.push({ filename, createdDate: state.mtime });
            }
        });
        res.send({ items });
    });

    app.put('/api/cluster/image', app.permission.check('cluster:write'), (req, res) => {
        const imageFile = app.bundlePath + '/' + req.body.filename,
            extractPath = app.bundlePath + '/' + app.path.parse(req.body.filename).name;
        if (app.fs.existsSync(imageFile)) {
            const DecompressZip = require('decompress-zip'),
                unzipper = new DecompressZip(imageFile);
            unzipper.on('error', error => {
                res.send({ error: 'Unzip has error!' });
            });
            unzipper.on('extract', () => {
                let destPath = app.path.dirname(require.main.filename),
                    mainCodeFilename = require(destPath + '/package.json').main;
                if (app.isDebug) {
                    destPath = app.bundlePath + '/dest';
                    app.deleteFolder(destPath);
                    app.createFolder(destPath);
                    app.createFolder(destPath + '/public');
                }

                app.fs.renameSync(extractPath + '/' + mainCodeFilename, destPath + '/' + mainCodeFilename);
                app.fs.renameSync(extractPath + '/package.json', destPath + '/package.json');
                app.fs.renameSync(extractPath + '/public/admin.template', destPath + '/public/admin.template');
                app.fs.renameSync(extractPath + '/public/home.template', destPath + '/public/home.template');

                app.deleteFolder(destPath + '/public/css');
                app.deleteFolder(destPath + '/public/fonts');
                app.deleteFolder(destPath + '/public/home');
                app.deleteFolder(destPath + '/public/js');
                app.deleteFolder(destPath + '/config');
                app.deleteFolder(destPath + '/modules');

                app.fs.renameSync(extractPath + '/public/css', destPath + '/public/css');
                app.fs.renameSync(extractPath + '/public/fonts', destPath + '/public/fonts');
                app.fs.renameSync(extractPath + '/public/home', destPath + '/public/home');
                app.fs.renameSync(extractPath + '/public/js', destPath + '/public/js');
                app.fs.renameSync(extractPath + '/config', destPath + '/config');
                app.fs.renameSync(extractPath + '/modules', destPath + '/modules');

                app.deleteFolder(extractPath);
                const imageTextFile = app.path.join(destPath, 'imageInfo.txt');
                app.fs.writeFileSync(imageTextFile, app.path.basename(imageFile));
                res.send({});
            });

            unzipper.extract({
                path: extractPath,
                filter: file => app.path.extname(file.filename) !== '.jsx'
            });
        } else {
            res.send({ error: 'Image does not exist!' });
        }
    });

    app.delete('/api/cluster/image', app.permission.check('cluster:delete'), (req, res) => {
        if (req.body.filename) {
            const filepath = app.path.join(app.bundlePath, req.body.filename),
                state = app.fs.statSync(filepath);
            if (filepath.startsWith(app.bundlePath + '/') && app.fs.existsSync(filepath) && state.isFile()) {
                app.deleteFile(filepath, () => res.send({}));
            }
        } else {
            res.send({ error: 'Invalid filename!' });
        }
    });
};