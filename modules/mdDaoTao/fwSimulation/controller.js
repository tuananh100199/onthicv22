module.exports = (app) => {
    const menu = {
        parentMenu: app.parentMenu.trainning,
        menus: {
            4035: { title: 'Mô phỏng', link: '/user/simulator', icon: 'fa-bars', backgroundColor: '#00b0ff' },
        },
    };

    app.permission.add(
        { name: 'simulator:read', menu }, { name: 'simulator:write' }, { name: 'simulator:delete' },
    );

    app.get('/user/simulator', app.permission.check('simulator:read'), app.templates.admin);
    // app.get('/user/simulator/:_id', app.permission.check('simulator:read'), app.templates.admin);
    app.get('/user/hoc-vien/khoa-hoc/:courseId/mon-hoc/mo-phong', app.permission.check('user:login'), app.templates.admin);
    

    // APIs ------------------------------------------------------------------------------------------------------------
    app.get('/api/simulator/page/:pageNumber/:pageSize', (req, res) => {
        const pageNumber = parseInt(req.params.pageNumber),
            pageSize = parseInt(req.params.pageSize);
        const condition = req.query.pageCondition || {};
        app.model.simulator.getPage(pageNumber, pageSize, condition, (error, page) => {
            res.send({ page, error: error ? 'Danh sách lớp ôn tập không sẵn sàng!' : null });
        });
    });

    app.get('/api/simulator/all', (req, res) => {
        const condition = req.query.condition || {};
        app.model.simulator.getAll(condition,(error, list) => res.send({ error, list }));
    });

    app.get('/api/simulator', (req, res) => {
        app.model.simulator.get(req.query._id, (error, item) => res.send({ error, item }));
    });

    app.post('/api/simulator', app.permission.check('simulator:write'), (req, res) => {
        app.model.simulator.create(req.body.data, (error, item) => {
            if (error || (item && item.image == null)) {
                res.send({ error, item });
            } else {
                app.uploadImage('suggestImage', app.model.simulator.get, item._id, item.image, data => res.send(data));
            }
        });
    });

    app.put('/api/simulator', app.permission.check('simulator:write'), (req, res) => {
        const { _id, changes } = req.body;
        app.model.simulator.update(_id, changes, (error, item) => res.send({ error, item }));

    });

    app.put('/api/simulator/swap', app.permission.check('simulator:write'), (req, res) => {
        const isMoveUp = req.body.isMoveUp.toString() == 'true';
        app.model.simulator.swapPriority(req.body._id, isMoveUp, (error) => res.send({ error }));
    });

    app.delete('/api/simulator', app.permission.check('simulator:delete'), (req, res) => {
        const { _id } = req.body;
        app.model.simulator.delete(_id, (error) => res.send({ error }));
    });

    app.createFolder(app.path.join(app.publicPath, '/img/suggestImage'));

    const uploadSuggestImage = (fields, files, done) => {
        if (fields.userData && fields.userData[0].startsWith('image:') && files.ImageSimulator && files.ImageSimulator.length > 0) {
            console.log('Hook: uploadSuggestImage => Suggest Image upload');
            const _id = fields.userData[0].substring('image:'.length);
            app.uploadImage('suggestImage', app.model.simulator.get, _id, files.ImageSimulator[0].path, done);
        }
    };
    app.uploadHooks.add('uploadSuggestImage', (req, fields, files, params, done) =>
        app.permission.has(req, () => uploadSuggestImage(fields, files, done), done, 'simulator:write'));

};