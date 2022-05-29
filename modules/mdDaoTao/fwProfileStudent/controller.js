module.exports = app => {
    const menu = { 
        parentMenu: app.parentMenu.enrollment, 
        menus: {
            8030: { title: 'Theo dõi hồ sơ học viên', link: '/user/profile-student' }
        } 
    };
    app.permission.add(
        { name: 'profileStudent:read', menu },
        { name: 'profileStudent:write' },
        { name: 'profileStudent:delete' },
    );

    app.get('/user/profile-student', app.permission.check('profileStudent:read'), app.templates.admin);

    app.get('/api/profile-student/page/:pageNumber/:pageSize', app.permission.check('profileStudent:read'), (req, res) => {
        let pageNumber = parseInt(req.params.pageNumber),
            pageSize = parseInt(req.params.pageSize),
            condition = req.query.pageCondition || {},
            courseCondition =  {isDefault:false},
            pageCondition = {},filter=req.query.filter;
            if(condition.courseType){
                pageCondition.courseType=condition.courseType;
                courseCondition.courseType=condition.courseType;
            }
            if(filter){
                app.handleFilter(filter,['identityCard','isDon','isHinh','isIdentityCard','isGiayKhamSucKhoe','isBangLaiA1'],defaultFilter=>{
                    pageCondition={...pageCondition,...defaultFilter};
                });
                if(filter.fullName){
                    pageCondition['$expr']= {
                        '$regexMatch': {
                          'input': { '$concat': ['$lastname', ' ', '$firstname'] },
                          'regex': `.*${filter.fullName}.*`,  //Your text search here
                          'options': 'i'
                        }
                    };
                }    
            }
        new Promise((resolve,reject)=>{// handle condition course.
            if(condition.course){
                pageCondition.course=condition.course;
                resolve(pageCondition);
            }else{
                app.model.course.getAll(courseCondition,(error,courses)=>{
                    if(error) reject(error);
                    else{
                        pageCondition.course = {$in:courses.map(item=>item._id)};
                        resolve(pageCondition);
                    }
                });
            }
        }).then(pageCondition=>{
            app.model.student.getPage(pageNumber, pageSize, pageCondition, (error, page) => {
                res.send({error,page});
            });
        }).catch(error=>res.send({error}));
    });

    app.put('/api/profile-student', app.permission.check('profileStudent:write'), (req, res) => {
        const {_id,changes} = req.body;
        app.model.student.update(_id,changes,(error,item)=>res.send({error,item}));
    });
};