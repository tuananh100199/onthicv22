module.exports = (app) => {
    const menu = {
        parentMenu: app.parentMenu.enrollment,
        menus: {
            8090: { title: 'Quản lý giáo viên', link: '/user/teacher', icon: 'fa-bars', backgroundColor: '#00b0ff' },
            // 8091: { title: 'Danh mục chứng chỉ', link: '/user/teacher-certification/category', icon: 'fa-bars', backgroundColor: '#00b0ff' },
            8092: { title: 'Danh mục hợp đồng', link: '/user/contract/category', icon: 'fa-bars', backgroundColor: '#00b0ff' },
            8093: { title: 'Danh mục giấy phép lái xe', link: '/user/gplx/category', icon: 'fa-bars', backgroundColor: '#00b0ff' },
            8094: { title: 'Danh mục hồ sơ', link: '/user/profile/category', icon: 'fa-bars', backgroundColor: '#00b0ff' },
            8095: { title: 'Danh mục loại giáo viên', link: '/user/teacher-type/category', icon: 'fa-bars', backgroundColor: '#00b0ff' },
        
        }
    };

    app.permission.add(
        { name: 'teacher:read', menu }, { name: 'teacher:write' }, { name: 'teacher:delete' },
    );
    app.get('/user/teacher-type/category', app.permission.check('category:read'), app.templates.admin);
    app.get('/user/profile/category', app.permission.check('category:read'), app.templates.admin);
    app.get('/user/teacher-certification/category', app.permission.check('category:read'), app.templates.admin);
    app.get('/user/contract/category', app.permission.check('category:read'), app.templates.admin);
    app.get('/user/gplx/category', app.permission.check('category:read'), app.templates.admin);
    app.get('/user/teacher', app.permission.check('teacher:read'), app.templates.admin);
    app.get('/user/teacher/:id', app.permission.check('teacher:write'), app.templates.admin);

    //APIs -----------------------------------------------------------------------------------------------
    app.get('/api/teacher/page/:pageNumber/:pageSize', app.permission.check('teacher:read'), (req, res) => {
        let pageNumber = parseInt(req.params.pageNumber),
            pageSize = parseInt(req.params.pageSize),
            condition=req.query.condition||{},
            pageCondition = { },filter=req.query.filter||{},sort=req.query.sort||null;            
        if (condition.searchText) {
            const value = { $regex: `.*${condition.searchText}.*`, $options: 'i' };
            pageCondition['$or'] = [
                { firstname: value },
                { lastname: value },
                { identityCard: value },
                { maGiaoVien: value },
            ];
        }
        // theo cơ sở
        if (req.session.user.division && req.session.user.division.isOutside){
            pageCondition.division = req.session.user.division._id;
        }

        //courseTypes
        if(condition.courseType){
            pageCondition.courseTypes={$in:[condition.courseType]};
        }
        
        //lọc nghỉ việc
        if(condition.nghiViec){
          pageCondition.thoiGianLamViec={['nghiViec']:condition.nghiViec=='1'?true:false};
        } 


        // lớp tập huấn
        if(condition.trainingClass){
            pageCondition.trainingClass={$in:[condition.trainingClass]};
        }

        // lớp tập huấn
        if(condition.notTrainingClass){
            pageCondition.trainingClass={$nin:[condition.notTrainingClass]};
        }
        // --------------filter------------------------
        // mã giáo viên
        if(filter.maGiaoVien){
            const value = { $regex: `.*${filter.maGiaoVien}.*`, $options: 'i' };
            pageCondition.maGiaoVien=value;
        }

        if(filter.firstname){// họ tên
            pageCondition['$expr']= {
                '$regexMatch': {
                  'input': { '$concat': ['$lastname', ' ', '$firstname'] },
                  'regex': `.*${filter.firstname}.*`,  //Your text search here
                  'options': 'i'
                }
            };
        }

        // course
        if(filter.course && filter.course.length){
            if(filter.course.find(item=>item=='null')){
                const courses = filter.course.filter(course=>course!='null');
                pageCondition.courses= {$in: [null,[],...courses]};
            }else{
                pageCondition.courses={$in:filter.course};
            }
        }
        // filter lọc nghỉ việc
        // if(condition.nghiViec){
        //   pageCondition.thoiGianLamViec={['nghiViec']:condition.nghiViec=='1'?true:false};
        // }
        app.model.teacher.getPage(pageNumber, pageSize, pageCondition, sort , (error, page) => {
            res.send({ error, page});
        });
    });

    app.get('/api/teacher', app.permission.check('teacher:write'), (req, res) => {
        const { _id } = req.query;
        app.model.teacher.get(_id, (error, item) => res.send({ error, item }));
    });

    app.post('/api/teacher', app.permission.check('teacher:write'), (req, res) => {
        let data = req.body.data;
        function convert(str) {
            let date = new Date(str),
                mnth = ('0' + (date.getMonth() + 1)).slice(-2),
                day = ('0' + date.getDate()).slice(-2);
            return [day, mnth, date.getFullYear()].join('');
        }
        new Promise ((resolve,reject)=>{
            app.model.teacher.get({['$or']:[{maGiaoVien:data.maGiaoVien},{identityCard:data.identityCard}]},(error,item)=>{
                if(error) reject(error);
                else if(item) reject('Giáo viên đã tồn tại');
                else{resolve();}
            });
        }).then(()=> new Promise((resolve, reject) => { // Tạo user cho staff
            app.model.user.get({ identityCard: data.identityCard }, (error, user) => {
                if (error) {
                    reject('Lỗi khi đọc thông tin người dùng!');
                } else if (user) {
                    resolve(user._id);
                } else { // staff chưa là user
                    const dataPassword = convert(data.birthday),
                        newUser = {
                            identityCard: data.identityCard,
                            email: data.email,
                            firstname: data.firstname,
                            lastname: data.lastname,
                            phoneNumber: data.phoneNumber,
                            division: data.division,
                            password: dataPassword,
                            birthday: data.birthday,
                            isLecturer:true
                        };
                    app.model.user.create(newUser, (error, user) => {
                        if (error) {
                            reject('Lỗi khi tạo người dùng!');
                        } else { // Tạo user thành công. 
                            resolve(user._id);
                        }
                    });
                }
            });
        })).then(_userId=>{
            data.user = _userId;
            app.model.teacher.create(data, (error, item) => {
                if (error || item == null || item.image == null||item.image=='') {
                    res.send({ error, item });
                } else {
                    app.uploadImage('teacher', app.model.teacher.get, item._id, item.image, data => {
                        res.send(data);
                    });
                }
            });
        }).catch(error=>console.log(error)||res.send({error}));
    });

    app.put('/api/teacher', app.permission.check('teacher:write'), (req, res) => {
        let { _id, changes } = req.body;
        if(changes.courseTypes && changes.courseTypes==' ') Object.assign(changes,{courseTypes:[]});
        app.model.teacher.update(_id, changes, (error, item) => res.send({ error, item }));
    });

    app.delete('/api/teacher', app.permission.check('teacher:write'), (req, res) => {
        app.model.teacher.delete(req.body._id, error => res.send({ error }));
    });
    
    //api trainingClass --------------------------------------------------------------------------------

    app.put('/api/teacher/training-class', app.permission.check('teacher:write'), (req, res) => {
        let { _id, trainingClass,type } = req.body;
        if(type=='add'){
            app.model.teacher.addTrainingClass(_id, trainingClass, (error, item) => res.send({ error, item }));
        }else{
            app.model.teacher.deleteTrainingClass(_id, trainingClass, (error, item) => res.send({ error, item }));
        }
    });

    // Hook upload images staff ---------------------------------------------------------------------------------------------
    app.createFolder(app.path.join(app.publicPath, '/img/teacher'));

    const uploadTeacherImage = (fields, files, done) => {
        if (fields.userData && fields.userData[0].startsWith('teacher:') && files.teacherImage && files.teacherImage.length > 0) {
            const _id = fields.userData[0].substring('teacher:'.length);
            app.uploadImage('teacher', app.model.teacher.get, _id, files.teacherImage[0].path, done);
        }
    };
    app.uploadHooks.add('uploadTeacher', (req, fields, files, params, done) =>
        app.permission.has(req, () => uploadTeacherImage(fields, files, done), done, 'teacher:write'));

};