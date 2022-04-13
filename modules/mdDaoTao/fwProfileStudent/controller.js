module.exports = app => {
    const menu = { 
        parentMenu: app.parentMenu.enrollment, 
        menus: {
            8030: { title: 'Bổ sung hồ sơ học viên', link: '/user/profile-student' }
        } 
    };
    app.permission.add(
        { name: 'profileStudent:read', menu },
        { name: 'profileStudent:write' },
        { name: 'profileStudent:delete' },
    );

    app.get('/user/profile-student', app.permission.check('profileStudent:read'), app.templates.admin);

    // app.get('/api/profile-student/page/:pageNumber/:pageSize', app.permission.check('profileStudent:read'), (req, res) => {
    //     const pageNumber = parseInt(req.params.pageNumber),
    //         pageSize = parseInt(req.params.pageSize),
    //         condition = req.query.pageCondition || {},
    //         pageCondition = {};
    //         if(condition.course) pageCondition.course=condition.course;
    //         if(condition.courseType) pageCondition.courseType=condition.courseType;
    //     // handle searchText
    //     pageCondition['$or'] =[];
    //     if (condition.searchText) {
    //         const value = { $regex: `.*${condition.searchText}.*`, $options: 'i' };
    //         pageCondition['$or'] = [
    //             { firstname: value },
    //             { lastname: value },
    //             { identityCard: value },
    //         ];
    //     }

    //     // handleFilter
    //     if(condition.filterCondition && condition.filterCondition.profileType){
    //         let filterCondition = condition.filterCondition;
    //         if(condition.filterCondition.profileType=='done'){
    //             pageCondition.isDon=true;
    //             pageCondition.isHinh=true;
    //             pageCondition.isIdentityCard=true;
    //             pageCondition.isGiayKhamSucKhoe=true;
    //             pageCondition.isBangLaiA1=true;
    //         }else if(condition.filterCondition.profileType=='notDone'){
    //             delete filterCondition.profileType;
    //             if(filterCondition.isDon=='false' && filterCondition.isHinh=='false' &&filterCondition.isIdentityCard=='false' && filterCondition.isGiayKhamSucKhoe=='false' && filterCondition.isBangLaiA1=='false'){
    //                 for(const key in filterCondition) pageCondition['$or'].push({[key]:false});
    //             }else{
    //                 for(const key in filterCondition) filterCondition[key]=='true' && Object.assign(pageCondition,{[key]:false});
    //             }
    //         }
    //     }
    //     if(pageCondition['$or'].length==0) delete delete pageCondition.$or;
    //     app.model.student.getPage(pageNumber, pageSize, pageCondition, (error, page) => {
    //         res.send({error,page});
    //         // res.send({ page, error: error || page == null ? 'Danh sách trống!' : null });
    //     });
    // });

    app.get('/api/profile-student/page/:pageNumber/:pageSize', app.permission.check('profileStudent:read'), (req, res) => {
        const pageNumber = parseInt(req.params.pageNumber),
            pageSize = parseInt(req.params.pageSize),
            condition = req.query.pageCondition || {},
            pageCondition = {},filter=req.query.filter;
            if(condition.course) pageCondition.course=condition.course;
            if(condition.courseType) pageCondition.courseType=condition.courseType;
        // handle searchText
        pageCondition['$or'] =[];
        if (condition.searchText) {
            const value = { $regex: `.*${condition.searchText}.*`, $options: 'i' };
            pageCondition['$or'] = [
                { firstname: value },
                { lastname: value },
                { identityCard: value },
            ];
        }

        // handleFilter
        // if(condition.filterCondition){
        //     let filterCondition = condition.filterCondition;
        //     for(const key in filterCondition){
        //         filterCondition[key]!='all' && Object.assign(pageCondition,{[key]:filterCondition[key]=='1'?true:false});
        //     }

        // }
        if(filter){
            for(const key in filter){
                filter[key]!='all' && Object.assign(pageCondition,{[key]:{$in:filter[key]}});
            }
        }
        if(pageCondition['$or'].length==0) delete delete pageCondition.$or;
        app.model.student.getPage(pageNumber, pageSize, pageCondition, (error, page) => {
            res.send({error,page});
            // res.send({ page, error: error || page == null ? 'Danh sách trống!' : null });
        });
    });

    app.put('/api/profile-student', app.permission.check('profileStudent:write'), (req, res) => {
        const {_id,changes} = req.body;
        app.model.student.update(_id,changes,(error,item)=>res.send({error,item}));
    });
};