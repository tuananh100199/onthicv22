module.exports = (app) => {
    const menu = {
        parentMenu: app.parentMenu.teacher,
        menus: {
            9010: { title: 'Lớp tập huấn', link: '/user/training-class', icon: 'fa-bars', backgroundColor: '#00b0ff' },
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
        }).then(teachers=>new Promise((resolve,reject)=>{
            const promiseList = teachers.length && teachers.map(teacher=>{
                return new Promise((resolve,reject)=>{
                    app.model.teacherCertification.getAll({teacher:teacher._id},(error,items)=>{
                        if(error) reject(error);
                        else{
                            const chungChiSuPham = items.find(item=>item.category && item.category.isSuPham==true);
                            resolve({...teacher._doc,chungChiSuPham});
                        }
                    });
                });
            });

            promiseList && Promise.all(promiseList)
            .then(listTeacher=>resolve(listTeacher))
            .catch(error=>reject(error));
        }));
        Promise.all([sourcePromise,getTeachers]).then(([sourceWorkbook,teachers])=>{
            //TODO:Vỹ- Lọc ra dữ liệu theo file a hải gửi
            // Để vào ô từ dòng số 8
            let worksheet = sourceWorkbook.getWorksheet(1);
            const text = `                  Đề nghị Sở Giao Thông Vận Tải TP.HCM  xem xét, chấp thuận cho ${teachers.length} giáo viên được tham dự tập huấn để cấp Giấy chứng nhận giáo viên dạy thực hành theo danh sách dưới đây:`;
            worksheet.getRow(4).getCell(1).value=text;
            // insert from row 8
            const startInsertRow = 8;
            for(let i = 0;i<teachers.length;i++){
                const teacher = teachers[i];
                let item = [];
                item.push(i+1);
                item.push(teacher?teacher.lastname:'');
                item.push(teacher?teacher.firstname:'');
                item.push(teacher?teacher.birthday:'');
                item.push(teacher?teacher.identityCard:'');
                item.push(teacher && teacher.contract && teacher.contract.category && teacher.contract.category.title?teacher.contract.category.title:'');// contract
                item.push(teacher?teacher.trinhDoVanHoa:'');
                item.push(teacher&&teacher.trinhDoChuyenMon&&teacher.trinhDoChuyenMon.trinhDo?teacher.trinhDoChuyenMon.trinhDo:'');
                item.push(teacher && teacher.chungChiSuPham?teacher.chungChiSuPham.trinhDo:'');// sư phạm.
                const gplx = teacher && teacher.giayPhepLaiXe && teacher.giayPhepLaiXe.category?teacher.giayPhepLaiXe.category.map(item=>item.title):[];
                item.push(gplx.join(','));//GPLX
                const thamNien =teacher && teacher.giayPhepLaiXe && teacher.giayPhepLaiXe.ngayCap? new Date(new Date() - new Date(teacher.giayPhepLaiXe.ngayCap)).getFullYear()-1970:'';
                item.push(teacher && teacher.giayPhepLaiXe && teacher.giayPhepLaiXe.ngayCap?teacher.giayPhepLaiXe.ngayCap:'');
                item.push(thamNien);
                const insertRow =worksheet.insertRow(startInsertRow+i,item);
                let j=1;
                while(j<=14){// báo cáo của sở chỉ có 14 cột.
                    insertRow.getCell(j).border = {
                        top: {style:'thin'},
                        left: {style:'thin'},
                        bottom: {style:'thin'},
                        right: {style:'thin'}
                      };
                    j+=1;
                }
            }
            app.excel.attachment(sourceWorkbook, res, 'DS_TAP_HUAN.xlsx');
        })
        .catch(error=>console.log(error)||res.send({error}));
        
        // targetWorkbook.xlsx.writeFile('target.xlsx');
        // app.excel.write(worksheet, cells);
        // app.excel.attachment(workbook, res, 'DS_TAP_HUAN.xlsx');
    });

};