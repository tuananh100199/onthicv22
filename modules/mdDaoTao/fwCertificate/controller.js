module.exports = app => {
    const menu = {
        parentMenu: app.parentMenu.trainning,
        menus: {
            4008: { title: 'Phát chứng chỉ, giấy phép', link: '/user/certificate', icon: 'fa fa-university', backgroundColor: 'rgb(106, 90, 205)' }
        }
    };
    app.permission.add({ name: 'certificate:read', menu }, { name: 'certificate:write' }, { name: 'certificate:delete' });

    app.get('/user/certificate', app.permission.check('certificate:read'), app.templates.admin);

    // APIs -----------------------------------------------------------------------------------------------------------
    app.get('/api/certificate/all', (req, res) => {
        const condition = {},
            searchText = req.query.searchText;
        if (searchText) {
            condition.title = new RegExp(searchText, 'i');
        }
        app.model.student.getAll(condition, (error, list) => res.send({ error, list }));
    });

    app.get('/api/certificate/page/:pageNumber/:pageSize', app.permission.check('certificate:read'), (req, res) => {
        let pageNumber = parseInt(req.params.pageNumber),
            pageSize = parseInt(req.params.pageSize),
            condition = req.query.condition || {},
            pageCondition = {};
        pageCondition.$or = [];

        if (condition.searchText){
            const value = { $regex: `.*${condition.searchText}.*`, $options: 'i' };
            pageCondition.$or.push(
                { identityCard: value },
                { firstname: value },
                { lastname: value },
            );
        }

        if (pageCondition.$or.length == 0) delete pageCondition.$or;
        app.model.student.getPage(pageNumber, pageSize, pageCondition, (error, page) => res.send({ error, page }));
    });

    app.get('/api/certificate', app.permission.check('certificate:read'), (req, res) =>
        app.model.student.get(req.query._id, (error, item) => res.send({ error, item })));

    app.put('/api/certificate', app.permission.check('certificate:write'), (req, res) => {
        let { _id, changes } = req.body;
        app.model.student.update(_id, changes, (error, item) => res.send({ error, item }));
    });
};