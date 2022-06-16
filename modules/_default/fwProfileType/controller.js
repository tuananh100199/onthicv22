module.exports = app => {
    const menu = {
        parentMenu: app.parentMenu.enrollment,
        menus: {
            8021: { title: 'Loại hồ sơ', link: '/user/profile-type', icon: 'fa-envelope-o', backgroundColor: '#00897b' },
        },
    };
    app.permission.add({ name: 'profileType:read', menu }, { name: 'profileType:write' }, { name: 'profileType:delete' },);

    app.get('/user/profile-type', app.permission.check('profileType:read'), app.templates.admin);

    // APIs -----------------------------------------------------------------------------------------------------------
    app.get('/api/profile-type/page/:pageNumber/:pageSize',app.permission.check('profileType:read'), (req, res) => {
        const pageNumber = parseInt(req.params.pageNumber),
            pageSize = parseInt(req.params.pageSize),
            condition=req.query.condition||{},
            pageCondition={};
        console.log({condition});
        if(condition.searchText){
            pageCondition.title = new RegExp(condition.searchText, 'i');
        }
        app.model.profileType.getPage(pageNumber, pageSize, pageCondition, (error, page) => res.send({ error, page }));
    });

    app.post('/api/profile-type', app.permission.check('profileType:write'), (req, res) => {
        app.model.profileType.create(req.body.data, (error, item) => res.send({ error, item }));
    });

    app.put('/api/profile-type', app.permission.check('profileType:write'), (req, res) => {
        app.model.profileType.update(req.body._id, req.body.changes, (error, item) => res.send({ error, item }));
    });

    app.delete('/api/profile-type', app.permission.check('profileType:delete'), (req, res) => {
        app.model.profileType.delete(req.body._id, error => res.send({ error }));
    });
};