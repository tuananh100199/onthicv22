module.exports = (app) => {
    const menu = {
        parentMenu: app.parentMenu.trainning,
        menus: {
            4050: { title: 'Thời khóa biểu', link: '/user/time-table' },
        }
    };
    app.permission.add(
        { name: 'timeTable:read' }, { name: 'timeTable:write', menu }, { name: 'timeTable:delete' },
    );

    app.get('/user/time-table', app.permission.check('timeTable:read'), app.templates.admin);

    // APIs -----------------------------------------------------------------------------------------------------------
    app.get('/api/time-table/page/:pageNumber/:pageSize', app.permission.check('timeTable:read'), (req, res) => {
        let pageNumber = parseInt(req.params.pageNumber),
            pageSize = parseInt(req.params.pageSize),
            // condition = req.query.pageCondition || {},
            pageCondition = {};
        try {
            // TODO: tìm kiếm
            // if (condition.searchText) {
            //     const value = { $regex: `.*${condition.searchText}.*`, $options: 'i' };
            //     pageCondition.$or = [
            //         { firstname: value },
            //         { lastname: value },
            //     ];
            // }
            app.model.timeTable.getPage(pageNumber, pageSize, pageCondition, (error, page) => res.send({ error, page }));
        } catch (error) {
            res.send({ error });
        }
    });

    app.get('/api/time-table', app.permission.check('timeTable:read'), (req, res) => {
        app.model.timeTable.get(req.query._id, (error, item) => res.send({ error, item }));
    });

    app.put('/api/time-table', app.permission.check('timeTable:write'), (req, res) => {
        app.model.timeTable.update(req.body._id, req.body.changes, (error, item) => res.send({ error, item }));
    });

    app.delete('/api/time-table', app.permission.check('timeTable:delete'), (req, res) => {
        app.model.timeTable.delete(req.body._id, (error) => res.send({ error }));
    });
};