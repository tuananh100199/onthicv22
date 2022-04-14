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

    app.get('/api/profile-student/page/:pageNumber/:pageSize', app.permission.check('profileStudent:read'), (req, res) => {
        let pageNumber = parseInt(req.params.pageNumber),
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

        // }
        // if(filter){
        //     for(const key in filter){
        //         filter[key]!='all' && Object.assign(pageCondition,{[key]:{$in:filter[key]}});
        //     }
        // }

        filter && app.handleFilter(filter,['isDon','isHinh','isIdentityCard','isGiayKhamSucKhoe','isBangLaiA1'],defaultFilter=>{
            pageCondition={...pageCondition,...defaultFilter};
        }); 
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