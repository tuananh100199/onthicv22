module.exports = app => {
    const menu = {
        parentMenu: app.parentMenu.enrollment,
        menus: {
            8019: { title: 'Khóa dự kiến', link: '/user/plan-course', icon: 'fa-envelope-o', backgroundColor: '#00897b' },
        },
    };
    app.permission.add({ name: 'planCourse:read', menu }, { name: 'planCourse:write' }, { name: 'planCourse:delete' },);

    app.get('/user/plan-course', app.permission.check('planCourse:read'), app.templates.admin);

    // APIs -----------------------------------------------------------------------------------------------------------
    app.get('/api/plan-course/page/:pageNumber/:pageSize',app.permission.check('planCourse:read'), (req, res) => {
        const pageNumber = parseInt(req.params.pageNumber),
            pageSize = parseInt(req.params.pageSize),
            condition=req.query.condition||{},pageCondition={};
            if(req.query.courseType){
                pageCondition.courseType = req.query.courseType;
                
            }
            if(condition.searchText){
                pageCondition.title = new RegExp(condition.searchText, 'i');
            }
            if(condition.courseType){
                pageCondition.courseType = condition.courseType;
            }
        app.model.planCourse.getPage(pageNumber, pageSize, pageCondition, (error, page) => res.send({ error, page }));
    });

    app.post('/api/plan-course', app.permission.check('planCourse:write'), (req, res) => {
        app.model.planCourse.create(req.body.data, (error, item) => res.send({ error, item }));
    });

    app.put('/api/plan-course', app.permission.check('planCourse:write'), (req, res) => {
        app.model.planCourse.update(req.body._id, req.body.changes, (error, item) => res.send({ error, item }));
    });

    app.delete('/api/plan-course', app.permission.check('planCourse:delete'), (req, res) => {
        app.model.planCourse.delete(req.body._id, error => res.send({ error }));
    });
};