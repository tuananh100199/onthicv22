module.exports = (app) => {
    const menu = {
        parentMenu: app.parentMenu.encryption,
        menus: {
            90001: { title: 'Quản lý gửi file', link: '/user/encryption/export', icon: 'fa-exchange', backgroundColor: '#00b0ff' },
            90002: { title: 'Quản lý nhận file', link: '/user/encryption/import', icon: 'fa-exchange', backgroundColor: '#00b0ff' },
        },
    };

    app.permission.add(
        { name: 'encryption:read', menu }, { name: 'encryption:write' }, { name: 'encryption:delete' },
    );

    app.get('/user/encryption/export', app.permission.check('encryption:read'), app.templates.admin);
    app.get('/user/encryption/import', app.permission.check('encryption:read'), app.templates.admin);


    // APIs ------------------------------------------------------------------------------------------------------------
    app.get('/api/encryption/page/:pageNumber/:pageSize', (req, res) => {
        const pageNumber = parseInt(req.params.pageNumber),
            pageSize = parseInt(req.params.pageSize);
        let pageCondition = req.query.pageCondition,
            filter=req.query.filter||{},sort=req.query.sort||null;
        filter && app.handleFilter(filter,['author','chucVu'],defaultFilter=>{
            // console.log('-----------------defaultCondition:----------------------');
            pageCondition={...pageCondition,...defaultFilter};
        }); 
        app.model.encryption.getPage(pageNumber, pageSize, pageCondition, sort, (error, page) => {
            res.send({ page, error: error ? 'Danh sách truyền nhận file không sẵn sàng!' : null });
        });
    });

    app.get('/api/encryption', (req, res) => {
        app.model.encryption.get(req.query._id, (error, item) => res.send({ error, item }));
    });

    app.post('/api/encryption', app.permission.check('encryption:write'), (req, res) => {
        app.model.encryption.create(req.body.data, (error, item) => res.send({ error, item }));
    });

    app.put('/api/encryption', app.permission.check('encryption:write'), (req, res) => {
        const { _id, changes } = req.body;
        app.model.encryption.update(_id, changes, (error, item) => res.send({ error, item }));

    });

    app.delete('/api/encryption', app.permission.check('encryption:delete'), (req, res) => {
        const { _id } = req.body;
        app.model.encryption.delete(_id, (error) => res.send({ error }));
    });

};