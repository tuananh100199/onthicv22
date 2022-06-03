module.exports = app => {
    const menu = {
        parentMenu: app.parentMenu.facility,
        menus: {
            40004: { title: 'Quản lý thiết bị giảng dạy', link: '/user/device' }
        }
    };
    app.permission.add({ name: 'device:read', menu }, { name: 'device:write' }, { name: 'device:delete' }, { name: 'device:import' }, { name: 'device:export' });

    app.get('/user/device', app.permission.check('device:read'), app.templates.admin);
    app.get('/user/device/manager', app.permission.check('device:read'), app.templates.admin);
    app.get('/user/device/manager/import', app.permission.check('device:read'), app.templates.admin);
    app.get('/user/device/category', app.permission.check('car:read'), app.templates.admin);

    // APIs -----------------------------------------------------------------------------------------------------------------------------------------
    app.get('/api/device/page/:pageNumber/:pageSize', app.permission.check('device:read'), (req, res) => {
        const pageNumber = parseInt(req.params.pageNumber),
            pageSize = parseInt(req.params.pageSize);
        let pageCondition = req.query.pageCondition,
            searchText = pageCondition && pageCondition.searchText;

        if (searchText) {
            pageCondition.name = new RegExp(searchText, 'i');
        }
        delete pageCondition.searchText;
        app.model.device.getPage(pageNumber, pageSize, pageCondition, (error, page) => {
            res.send({ page, error });
        });
    });

    app.get('/api/device', app.permission.check('device:read'), (req, res) => {
        app.model.device.get(req.query._id, (error, item) => res.send({ error, item }));
    });

    app.post('/api/device', app.permission.check('device:write'), (req, res) => {
        const data = req.body.data;
        app.model.device.create(data, (error, item) => {
            res.send({ error, item });
        });
    });

    app.put('/api/device', app.permission.check('device:write'), (req, res) => {
        const { _id, changes } = req.body,
            $unset = {};
        app.model.device.update(_id, changes, $unset, (error, item) => res.send({ error, item }));
    });

    app.delete('/api/device', app.permission.check('device:write'), (req, res) => {
        const device = req.body.item;
        app.model.device.delete(device._id, (error, item) => res.send({ error, item }));
    });
};
