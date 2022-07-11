module.exports = (app) => {
    const menu = {
        parentMenu: app.parentMenu.accountant,
        menus: {
            7020: { title: 'Code giảm giá', link: '/user/discount-code', icon: 'fa-money', backgroundColor: '#00897b' },
        },
    };

    app.permission.add(
        { name: 'discountCode:read', menu }, { name: 'discountCode:write' }, { name: 'discountCode:delete' },
    );

    app.get('/user/discount-code', app.permission.check('discountCode:read'), app.templates.admin);
    app.get('/user/hoc-vien/khoa-hoc/:_id/cong-no/giam-gia', app.permission.check('user:login'), app.templates.admin);
    

     // APIs ------------------------------------------------------------------------------------------------------------
    app.get('/api/discount-code/page/:pageNumber/:pageSize', (req, res) => {
        const pageNumber = parseInt(req.params.pageNumber),
            pageSize = parseInt(req.params.pageSize);
        app.model.discountCode.getPage(pageNumber, pageSize, req.query.pageCondition, (error, page) => {
            res.send({ page, error: error ? 'Danh sách gói học phí không sẵn sàng!' : null });
        });
    });

    app.get('/api/discount-code/all', (req, res) => { //mobile
        const condition = req.query.condition || {};
        app.model.discountCode.getAll(condition,(error, list) => res.send({ error, list }));
    });

    app.get('/api/discount-code', (req, res) => {
        console.log(req.query.condition);
        app.model.discountCode.get(req.query.condition, (error, item) => res.send({ error, item }));
    });

    app.post('/api/discount-code', app.permission.check('discountCode:write'), (req, res) => {
        const data = req.body.data;
        if(data.isPersonal && !data.code){
            const makeId = (length) => {
                let result = '';
                let characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
                let charactersLength = characters.length;
                for (let i = 0; i < length; i++) {
                    result += characters.charAt(Math.floor(Math.random() *
                        charactersLength));
                }
                app.model.discountCode.get({ code: result}, (error, item) =>{
                    if(!item || error){
                        data.code = result;
                        app.model.discountCode.create(data, (error, item) => res.send({ error, item }));
                    }
                    else makeId(length);
                });
            };
            makeId(5);
        } else app.model.discountCode.create(data, (error, item) => res.send({ error, item }));
    });

    app.put('/api/discount-code', app.permission.check('discountCode:write'), (req, res) => {
        const { _id, changes } = req.body;
        app.model.discountCode.update(_id, changes, (error, item) => res.send({ error, item }));

    });

    app.put('/api/discount-code/default', app.permission.check('discountCode:write'), (req, res) => {
        const { discount } = req.body;
        app.model.discountCode.update({}, { isDefault: false }, (error) => {
            if (error) res.send({ error });
            else app.model.discountCode.update(discount._id, { isDefault: true }, (error, item) => {
                res.send({ error, item });
            });
        });

    });

    app.delete('/api/discount-code', app.permission.check('discountCode:delete'), (req, res) => {
        const { _id } = req.body;
        app.model.discountCode.delete(_id, (error) => res.send({ error }));
    });

};