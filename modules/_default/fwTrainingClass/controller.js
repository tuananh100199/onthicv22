module.exports = (app) => {
    const menu = {
        parentMenu: app.parentMenu.enrollment,
        menus: {
            8099: { title: 'Lớp tập huấn', link: '/user/training-class', icon: 'fa-bars', backgroundColor: '#00b0ff' },
        },
    };

    app.permission.add(
        { name: 'trainingClass:read', menu }, { name: 'trainingClass:write' }, { name: 'trainingClass:delete' },
    );

    app.get('/user/training-class', app.permission.check('trainingClass:read'), app.templates.admin);
    app.get('/user/training-class/:_id', app.permission.check('trainingClass:read'), app.templates.admin);


    // APIs ------------------------------------------------------------------------------------------------------------
    app.get('/api/training-class/page/:pageNumber/:pageSize', app.permission.check('trainingClass:read'), (req, res) => {
        const pageNumber = parseInt(req.params.pageNumber),
            pageSize = parseInt(req.params.pageSize),
            condition=req.query.condition||{};
        app.model.trainingClass.getPage(pageNumber, pageSize, condition, (error, page) => {
            if(error)res.send({error});
            else{
                const getListTeacher = (index=0)=>{
                    if(index>=page.list.length){
                        res.send({page});
                    }else{
                        let trainingClass = page.list[index]._doc;
                        app.model.teacher.count({trainingClass:trainingClass._id},(error,numOfTeacher)=>{
                            if(error)res.send({error});
                            else{
                                Object.assign(trainingClass,{numOfTeacher});
                                page.list[index]=trainingClass;
                                getListTeacher(index+1);
                            }
                        });                        
                    }
                };
                getListTeacher();
            }
        });
    });

    app.get('/api/training-class', (req, res) => {
        app.model.trainingClass.get(req.query._id, (error, item) => res.send({ error, item }));
    });

    app.post('/api/training-class', app.permission.check('trainingClass:write'), (req, res) => {
        app.model.trainingClass.create(req.body.data, (error, item) => res.send({ error, item }));
    });

    app.put('/api/training-class', app.permission.check('trainingClass:write'), (req, res) => {
        const { _id, changes } = req.body;
        app.model.trainingClass.update(_id, changes, (error, item) => res.send({ error, item }));

    });

    app.delete('/api/training-class', app.permission.check('trainingClass:delete'), (req, res) => {
        const { _id } = req.body;
        console.log([_id]);
        app.model.teacher.getAll({trainingClass:{$in:[_id]}},(error,teachers)=>{
            if(error)res.send({error});
            else{
                if(teachers.length==0){
                    app.model.trainingClass.delete(_id, (error) => res.send({ error }));
                }else{
                    // remove training class from all teacher
                    const removeTeacherTrainingClass = (index=0)=>{
                        if(index>=teachers.length){
                            app.model.trainingClass.delete(_id, (error) => res.send({ error }));
                        }else{
                            const teacher=teachers[index];
                            app.model.teacher.deleteTrainingClass(teacher._id,_id,(error)=>{
                                if(error)res.send({error});
                                else removeTeacherTrainingClass(index+1);
                            });
                        }
                    };

                    removeTeacherTrainingClass();
                }
            }
        });
    });

    app.get('/api/training-class/export/:_id', app.permission.check('trainingClass:read'), (req, res) => {
        const _id = req.params._id;
        const sourcePromise = app.excel.readFile(app.publicPath+'/download/DS_TAP_HUAN.xlsx');//Đang hard,sẽ fix lại sau
        const getTeachers = new Promise((resolve,reject)=>{
            app.model.teacher.getAll({trainingClass:{$in:[_id]}},(error,teachers)=>{
                error?reject(error):resolve(teachers);
            });
        });
        Promise.all([sourcePromise,getTeachers]).then(([sourceWorkbook,teachers])=>{
            console.log(teachers);
            //TODO:Vỹ- Lọc ra dữ liệu theo file a hải gửi
            // Để vào ô từ dòng số 8
            app.excel.attachment(sourceWorkbook, res, 'DS_TAP_HUAN.xlsx');
        })
        .catch(error=>console.log(error)||res.send({error}));
        
        // targetWorkbook.xlsx.writeFile('target.xlsx');
        // app.excel.write(worksheet, cells);
        // app.excel.attachment(workbook, res, 'DS_TAP_HUAN.xlsx');
    });

};