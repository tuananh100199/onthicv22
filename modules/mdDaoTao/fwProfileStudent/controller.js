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

    // app.get('/api/profile-student/page/:pageNumber/:pageSize', app.permission.check('profileStudent:read'), (req, res) => {
    //     let pageNumber = parseInt(req.params.pageNumber),
    //         pageSize = parseInt(req.params.pageSize),
    //         condition = req.query.pageCondition || {},
    //         courseCondition =  {isDefault:false},
    //         pageCondition = {},filter=req.query.filter;
    //         if(condition.courseType){
    //             pageCondition.courseType=condition.courseType;
    //             courseCondition.courseType=condition.courseType;
    //         }
    //         if(filter){
    //             app.handleFilter(filter,['fullName','identityCard','isDon','isHinh','isIdentityCard','isGiayKhamSucKhoe','isBangLaiA1'],defaultFilter=>{
    //                 pageCondition={...pageCondition,...defaultFilter};
    //             });    
    //         }
    //     new Promise((resolve,reject)=>{// handle condition course.
    //         if(condition.course){
    //             pageCondition.course=condition.course;
    //             resolve(pageCondition);
    //         }else{
    //             app.model.course.getAll(courseCondition,(error,courses)=>{
    //                 if(error) reject(error);
    //                 else{
    //                     pageCondition.course = {$in:courses.map(item=>item._id)};
    //                     resolve(pageCondition);
    //                 }
    //             });
    //         }
    //     }).then(pageCondition=>{
    //         app.model.student.getPage(pageNumber, pageSize, pageCondition, (error, page) => {
    //             res.send({error,page});
    //         });
    //     }).catch(error=>res.send({error}));
    // });

    app.get('/api/profile-student/page/:pageNumber/:pageSize', app.permission.check('profileStudent:read'), (req, res) => {
        let pageNumber = parseInt(req.params.pageNumber),
            pageSize = parseInt(req.params.pageSize),
            condition = req.query.pageCondition || {},
            pageCondition = {},
            filter=req.query.filter;
            
            const {_courseTypeId,_courseId} = condition;
        new Promise ((resolve,reject)=>{//get courseType
            const courseTypeCondition = _courseTypeId?{_id:_courseTypeId}:{};
            app.model.courseType.get(courseTypeCondition,(error,courseType)=>(error||!courseType)?reject('Không có loại khóa học nào'):resolve(courseType));
        }).then(courseType=> new Promise((resolve,reject)=>{
            const courseCondition = {courseType:courseType._id,isDefault:false};
            if(_courseId) courseCondition._id = _courseId;
            app.model.course.get(courseCondition,(error,course)=>(error||!course)?reject('Không tìm thấy khóa học!'):resolve({courseType,course}));
        })).then(({courseType,course})=>{
            pageCondition = {
                courseType:courseType._id,
                course:course._id
            };

            if(filter){
                app.handleFilter(filter,['fullName','identityCard'],defaultFilter=>{
                    pageCondition={...pageCondition,...defaultFilter};
                });

                // handle filter giay to dang ky
                pageCondition['$and'] = [];
                const keys = Object.keys(filter);
                // let $inCondition = [], $ninCondition = [];
                for(const key of keys){
                    if(key.startsWith('giayToDangKy')){
                        if(filter[key].length==1){
                            const giayTo = key.split(':')[1];
                            if(filter[key]=='1'){
                                pageCondition['$and'].push({giayToDangKy: {$in:[giayTo]}});
                            }else{
                                pageCondition['$and'].push({giayToDangKy:{$nin:[giayTo]}});
                            }                            
                        }
                    }
                }
                if(!pageCondition['$and'].length) delete pageCondition['$and'];
            }

            app.model.student.getPage(pageNumber, pageSize, pageCondition, (error, page) => {
                res.send({error, page ,courseType, course});
            });
        }).catch(error=>res.send({error}));
    });

    app.put('/api/profile-student', app.permission.check('profileStudent:write'), (req, res) => {
        const {_id,changes} = req.body;
        app.model.student.update(_id,changes,(error,item)=>res.send({error,item}));
    });
};