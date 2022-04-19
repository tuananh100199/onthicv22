module.exports = app => {
    const menu = {
        parentMenu: app.parentMenu.enrollment,
        menus: {
            // 4008: { title: 'Phát chứng chỉ, giấy phép', link: '/user/certificate', icon: 'fa fa-university', backgroundColor: 'rgb(106, 90, 205)' },
            // 4009: { title: 'Phát chứng chỉ sơ cấp', link: '/user/certification'},
            8040: { title: 'Phát chứng chỉ, giấy phép', link: '/user/license'},
        }
    };
    app.permission.add({ name: 'certificate:read', menu }, { name: 'certificate:write' }, { name: 'certificate:delete' });

    app.get('/user/certificate', app.permission.check('certificate:read'), app.templates.admin);
    app.get('/user/certification', app.permission.check('certificate:read'), app.templates.admin);
    app.get('/user/license', app.permission.check('certificate:read'), app.templates.admin);
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

        
        if(condition.totNghiep||condition.totNghiep=='true') pageCondition.totNghiep=true;
        if(condition.datSatHach||condition.datSatHach=='true') pageCondition.datSatHach=true;
        if (pageCondition.$or.length == 0) delete pageCondition.$or;

        app.model.student.getPage(pageNumber, pageSize, pageCondition, (error, page) => res.send({ error, page }));
    });

    app.get('/api/certificate', app.permission.check('certificate:read'), (req, res) =>
        app.model.student.get(req.query._id, (error, item) => res.send({ error, item })));

    app.put('/api/certificate', app.permission.check('certificate:write'), (req, res) => {
        let { _id, changes } = req.body;
        app.model.student.update(_id, changes, (error, item) => res.send({ error, item }));
    });

    app.get('/api/license/page/:pageNumber/:pageSize', app.permission.check('certificate:read'), (req, res) => {
        let pageNumber = parseInt(req.params.pageNumber),
            pageSize = parseInt(req.params.pageSize),
            condition=req.query.condition||{},
            filter=req.query.filter||null,
            sort=req.query.sort||null,
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
        if(condition.isLicense) pageCondition.isLicense=true;
        pageCondition.datSatHach=true;
        if(filter){
            app.handleFilter(filter,['isCertification','isLicense','course','kySatHach'],filterCondition=>{
                pageCondition={...pageCondition,...filterCondition};
            });

            if(filter.capPhat && filter.capPhat.length<2){// đk đã cấp phát chứng chỉ và chỉ có 1 đk
                // nếu như chọn cả 2 đk là cấp phát và chưa cấp phát thì ko gán câu nghi vấn.
                filter.capPhat.forEach(item=>{
                    if(item=='1'){
                        pageCondition.hasCertification=true;
                        pageCondition.hasLicense=true;
                    }else{
                        pageCondition.$or.push({hasCertification:false},{hasLicense:false});
                    }
                });
            }
        } 
        
        if (pageCondition.$or.length == 0) delete pageCondition.$or;
        app.model.student.getPage(pageNumber, pageSize, pageCondition,sort, (error, page) => res.send({ error, page }));
    });

    app.get('/api/certificate/license/export', app.permission.check('user:login'), (req, res) => {
        const {listStudents} = req.query;
        let students = [];
        const handleExport = (index=0)=>{
            if(index>=listStudents.length){
                const currentDate = new Date();
                const dateFormat = require('dateformat');
                const data = {
                    currentdate:dateFormat(currentDate, 'dd/mm/yyyy'),
                    students
                };
                app.docx.generateFile('/document/BIEN_BAN_BAN_GIAO_GPLX.docx', data, (error, buf) => {
                    res.send({ error: error, buf: buf });
                });
            }else{
                const _studentId = listStudents[index];
                app.model.student.get({_id:_studentId}, (error, student) => {
                    if(error || !student){
                        res.send({error:'Lấy thông tin học viên bị lỗi'});
                    }else{
                        const {birthday,courseType,lastname,firstname} = student;                        
                        students.push({
                            idx:index+1,birth:new Date(birthday).getFullYear().toString(),title:courseType.title,lastname,firstname
                        });
                        handleExport(index+1);

                    }
                });
            }
        };

        handleExport();
    });
};