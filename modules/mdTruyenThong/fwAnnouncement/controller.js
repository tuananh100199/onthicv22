module.exports = (app) => {
    const menu = {
        parentMenu: app.parentMenu.communication,
        menus: {
            3105: { title: 'Thông báo', link: '/user/announcement' },
        }
    };

    app.permission.add(
        { name: 'announcement:read', menu },
        { name: 'announcement:write' },
        { name: 'announcement:delete' },
    );

    app.get('/user/announcement', app.permission.check('announcement:read'), app.templates.admin);
    app.get('/user/announcement/:_id', app.permission.check('announcement:read'), app.templates.admin);
    app.get('/announcement', app.templates.home);
    app.get('/announcement/:_id', app.templates.home);
    app.get('/thong-bao/:link', app.templates.home);

    // APIs ------------------------------------------------------------------------------------------------------------
    app.get('/api/announcement/page/:pageNumber/:pageSize', app.permission.check('announcement:read'), (req, res) => {
        const pageNumber = parseInt(req.params.pageNumber),
            pageSize = parseInt(req.params.pageSize),
            condition = req.params.condition?req.params.condition:{};
        app.model.announcement.getPage(pageNumber, pageSize, condition, (error, page) => {
            res.send({ page, error });
        });
    });

    app.get('/api/announcement/all', app.permission.check('announcement:read'), (req, res) => {
        app.model.announcement.getAll((error, list) => res.send({ error, list }));
    });

    app.get('/api/announcement', app.permission.check('announcement:read'), (req, res) => {
        app.model.announcement.get(req.query._id, (error, item) => res.send({ error, item }));
    });

    app.post('/api/announcement', app.permission.check('announcement:write'), (req, res) => {
        app.model.announcement.create(req.body.data, (error, item) => res.send({ error, item }));
    });

    app.put('/api/announcement', app.permission.check('announcement:write'), (req, res) => {
        const { _id, changes } = req.body;
        app.model.announcement.update(_id, changes, (error, item) => res.send({ error, item }));
    });

    app.put('/api/announcement/swap', app.permission.check('announcement:write'), (req, res) => {
        const isMoveUp = req.body.isMoveUp.toString() == 'true';
        app.model.announcement.swapPriority(req.body._id, isMoveUp, (error) => res.send({ error }));
    });

    app.delete('/api/announcement', app.permission.check('announcement:delete'), (req, res) => {
        const { _id } = req.body;
        app.model.announcement.delete(_id, (error) => res.send({ error }));
    });

    app.put('/api/announcement/check-link', app.permission.check('announcement:write'), (req, res) => {
        app.model.announcement.get({ link: req.body.link }, (error, item) => {
            res.send({
                error: error ? 'Lỗi hệ thống' : (item == null || item._id == req.body._id ? null : 'Link không hợp lệ'),
            });
        });
    });
    // home api ---------------------------------------------------------
    app.get('/api/home/announcement/page/:pageNumber/:pageSize', (req, res) => {
        const pageNumber = parseInt(req.params.pageNumber),
            pageSize = parseInt(req.params.pageSize),
            today = new Date(),
            condition = {
                active: true,
                $and: [
                    {
                        $or: [
                            { stopPost: null },
                            { stopPost: { $exists: false } },
                            { stopPost: { $gte: today } },
                        ],
                    },
                    {
                        $or: [
                            { startPost: null },
                            { startPost: { $exists: false } },
                            { startPost: { $lte: today } },
                        ],
                    }
                ]
            };
        app.model.announcement.getPage(pageNumber, pageSize, condition, (error, page) => {
            res.send({ page, error });
        });
    });

    app.get('/home/announcement/item', (req, res) => {
        const { _id, link } = req.query;
        new Promise((resolve, reject) => {
            if (_id) {
                app.model.announcement.get({ _id, active: true }, (error, item) => item ? resolve(item) : reject(error ? 'Lỗi khi lấy thông báo!' : 'Thông báo không tồn tại'));
            } else if (link) {
                app.model.announcement.get({ link, active: true }, (error, item) => item ? resolve(item) : reject(error ? 'Lỗi khi lấy thông báo!' : 'Thông báo không tồn tại'));
            }
        }).then(item => {
            item.view++;
            item.save(error => res.send({ error, item }));
        }).catch(error => res.send({ error }));
    });

    // Hook upload images ---------------------------------------------------------------------------------------------------------------------------s
    app.createFolder(app.path.join(app.publicPath, '/img/announcement'));

    app.uploadHooks.add('uploadAnnouncementCkEditor', (req, fields, files, params, done) => {
        app.permission.has(req, () => app.uploadCkEditorImage('announcement', fields, files, params, done), done, 'announcement:write');
    });

    const uploadAnnouncementAvatar = (fields, files, done) => {
        if (
            fields.userData &&
            fields.userData[0].startsWith('announcement:') &&
            files.AnnouncementImage &&
            files.AnnouncementImage.length > 0
        ) {
            console.log('Hook: uploadNewsAvatar => Announcement image upload');
            const _id = fields.userData[0].substring('announcement:'.length);
            app.uploadImage('announcement', app.model.announcement.get, _id, files.AnnouncementImage[0].path, done);
        }
    };
    app.uploadHooks.add('uploadAnnouncementAvatar', (req, fields, files, params, done) => {
        app.permission.has(req, () => uploadAnnouncementAvatar(fields, files, done), done, 'announcement:write');
    });

    
};