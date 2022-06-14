module.exports = (app) => {
    function convert(str,type) {
        let date = new Date(str),
            mnth = ('0' + (date.getMonth() + 1)).slice(-2),
            day = ('0' + date.getDate()).slice(-2);
        return type=='name' ? [day, mnth, date.getFullYear()].join('-') : [day, mnth, date.getFullYear()].join('/');
    }

    app.get('/api/course/student-3b/export', app.permission.check('course:export'), (req, res) => {
        const { listId } = req.query;
        app.model.student.getAll({ _id : { $in: listId }}, (error, listStudents) => {
            if(error || !listStudents.length) res.send({ error: 'Xuất file báo cáo bị lỗi'});
            else{
                let students = [];
                const handleExport = (index=0)=>{
                    if(index>=listStudents.length){
                        const data = {
                            courseType: listStudents[0].courseType.title,
                            course: listStudents[0].course.name,
                            students
                        };
                        app.docx.generateFile('/document/Phu_Luc_3B.docx', data, (error, buf) => {
                            res.send({ error: error, buf: buf });
                        });
                    }else{
                        const student = listStudents[index];
                        const { birthday, identityCard, lastname, firstname, isGiayKhamSucKhoe, isBangLaiA1, residence, soNamLaiXe, soKMLaiXe } = student;                        
                            students.push({
                                idx:index+1,birth:new Date(birthday).getFullYear().toString(), identityCard, lastname, firstname, giaySuckhoe: isGiayKhamSucKhoe ? 'Có' : 'Không', GPLX: isBangLaiA1 ? 'Có' : 'Không', address: residence, soNamLaiXe: soNamLaiXe ? soNamLaiXe : '', soKMLaiXe: soKMLaiXe ? soKMLaiXe : ''
                            });
                        handleExport(index+1);
                    }
                };
                handleExport();
            }
        });
    });

    app.get('/api/course/report-4/export', app.permission.check('course:export'), (req, res) => {
        const { courseId } = req.query;
        app.model.course.get({ _id : courseId}, (error, course) => {
            if(error || !course) res.send({ error: 'Xuất file báo cáo bị lỗi'});
            else{
                const listSubjects = course.subjects;
                let subjects = [];
                const handleExport = (index=0)=>{
                    if(index>=listSubjects.length){
                        const data = {
                            courseType: course.courseType.title,
                            course: course.name,
                            subjects
                        };
                        app.docx.generateFile('/document/Phu_Luc_4.docx', data, (error, buf) => {
                            res.send({ error: error, buf: buf });
                        });
                    }else{
                        const subject = listSubjects[index];
                        const { title, totalTime, gioHocLyThuyetLT, gioHocLyThuyetTH, gioHocTrenDuong, gioHocTrongHinh,cuoiKhoa } = subject;                        
                            subjects.push({
                                idx:index+1, title, totalTime: totalTime || '', gioHocLyThuyetLT: gioHocLyThuyetLT || '', gioHocLyThuyetTH: gioHocLyThuyetTH || '', gioHocTrenDuong: gioHocTrenDuong || '', gioHocTrongHinh: gioHocTrongHinh || '',cuoiKhoa: cuoiKhoa || ''
                            });
                        handleExport(index+1);
                    }
                };
                handleExport();
            }
        });
    });

    app.get('/api/course/student-5/export', app.permission.check('course:export'), (req, res) => {
        const { courseId } = req.query;
        app.model.course.get({ _id : courseId}, (error, course) => {
            if(error || !course) res.send({ error: 'Xuất file báo cáo bị lỗi'});
            else{
                const list = course.teacherGroups;
                let groups = [];
                const handleExport = (index=0)=>{
                    if(index>=list.length){
                        const data = {
                            courseType: course.courseType.title,
                            course: course.name,
                            groups
                        };
                        app.docx.generateFile('/document/Phu_Luc_5.docx', data, (error, buf) => {
                            res.send({ error: error, buf: buf });
                        });
                    }else{
                        const group = list[index];
                        const { student, teacher } = group;                        
                            groups.push({
                                idx:index+1, class: course.name + '-' + (index+1), teacher: teacher.lastname + ' ' + teacher.firstname, numOfStudent: student.length
                            });
                        handleExport(index+1);
                    }
                };
                handleExport();
            }
        });
    });

    app.get('/api/course/report-6/export', app.permission.check('course:export'), (req, res) => {
        const { courseId, teacherId } = req.query;
        app.model.course.get({ _id : courseId}, (error, course) => {
            if(error || !course) res.send({ error: 'Xuất file báo cáo bị lỗi'});
            else{
                const i = course.teacherGroups.findIndex(group => group.teacher._id == teacherId);
                if(i != -1){
                    const list = course.teacherGroups[i].student;
                    let students = [];
                    const handleExport = (index=0)=>{
                        if(index>=list.length){
                            const data = {
                                courseType: course.courseType.title,
                                course: course.name,
                                teacher: course.teacherGroups[i].teacher.lastname + ' '  + course.teacherGroups[i].teacher.firstname,
                                students
                            };
                            app.docx.generateFile('/document/Phu_Luc_6.docx', data, (error, buf) => {
                                res.send({ error: error, buf: buf });
                            });
                        }else{
                            const student = list[index];
                            const { lastname, firstname, birthday, residence, soKMThucHanh, diemCuoiKhoa } = student;                        
                                students.push({
                                    idx:index+1,birth: birthday ? convert(birthday) : '', lastname, firstname, residence, soKMThucHanh: soKMThucHanh ? soKMThucHanh : '', diemCuoiKhoa: diemCuoiKhoa ? diemCuoiKhoa : ''
                                });
                            handleExport(index+1);
                        }
                    };
                    handleExport();
                } else res.send({ error: 'Không tìm thấy lớp!'});
                
            }
        });
    });

    app.get('/api/course/report-8/export', app.permission.check('course:export'), (req, res) => {
        const { listCar } = req.query;
        app.model.car.getAll({ _id : {$in: listCar}}, (error, data) => {
            if(error || !data) res.send({ error: 'Xuất file báo cáo bị lỗi'});
            else{
                let cars = [];
                const handleExport = (index=0)=>{
                    if(index>=data.length){
                        const data = {
                            cars
                        };
                        app.docx.generateFile('/document/Phu_Luc_8.docx', data, (error, buf) => {
                            res.send({ error: error, buf: buf });
                        });
                    }else{
                        const car = data[index];
                        const { brand, division, licensePlates, type } = car;                        
                            cars.push({
                                idx:index+1, licensePlate: licensePlates, division: division && division.title, brand: brand && brand.title, type: type && type.title
                            });
                        handleExport(index+1);
                    }
                };
                handleExport();
            }
        });
    });

    app.get('/api/course/report-tn01/export', app.permission.check('course:report'), (req, res) => {
        const { courseId, bienBan } = req.query;
        app.model.course.get({ _id : courseId}, (error, course) => {
            if(error || !course) res.send({ error: 'Xuất file báo cáo bị lỗi'});
            else{
                let hoiDongTotNghiep = [];
                const list = course.hoiDongTotNghiep;
                const handleExport = (index=0)=>{
                    if(index>=list.length){
                        const data = {
                            courseType: course.courseType.title,
                            course: course.name,
                            hoiDongTotNghiep,
                            numberOfRegister: bienBan.numberOfRegister,
                            numberOfStudent: bienBan.numberOfStudent
                        };
                        app.docx.generateFile('/document/TN01.docx', data, (error, buf) => {
                            res.send({ error: error, buf: buf });
                        });
                    }else{
                        const thanhVien = list[index];
                        const { name, chucVu, nhiemVu, gender } = thanhVien;                        
                            hoiDongTotNghiep.push({
                                idx:index+1, name, chucVu, nhiemVu, gender: (gender == 'female' ? 'Bà' : 'Ông')
                            });
                        handleExport(index+1);
                    }
                };
                handleExport();     
            }
        });
    });

    app.get('/api/course/report-tn03/export', app.permission.check('course:report'), (req, res) => {
        const { courseId } = req.query;
        app.model.course.get({ _id : courseId}, (error, course) => {
            if(error || !course) res.send({ error: 'Xuất file báo cáo bị lỗi'});
            else{
                let hoiDongTotNghiep = [];
                const list = course.hoiDongTotNghiep;
                const handleExport = (index=0)=>{
                    if(index>=list.length){
                        const data = {
                            courseType: course.courseType.title,
                            course: course.name,
                            hoiDongTotNghiep,
                        };
                        app.docx.generateFile('/document/TN03.docx', data, (error, buf) => {
                            res.send({ error: error, buf: buf });
                        });
                    }else{
                        const thanhVien = list[index];
                        const { name, chucVu, nhiemVu, gender } = thanhVien;                        
                            hoiDongTotNghiep.push({
                                idx:index+1, name, chucVu, nhiemVu, gender: (gender == 'female' ? 'Bà' : 'Ông')
                            });
                        handleExport(index+1);
                    }
                };
                handleExport();     
            }
        });
    });

    app.get('/api/course/report-tn04/export', app.permission.check('course:report'), (req, res) => {
        const { courseId, bienBan } = req.query;
        app.model.course.get({ _id : courseId}, (error, course) => {
            if(error || !course) res.send({ error: 'Xuất file báo cáo bị lỗi'});
            else{
                let hoiDongChamThi = [];
                let giaoVienLyThuyet = [];
                let giaoVienThucHanh = [];
                const list = course.hoiDongChamThi;
                const handleExport = (index=0)=>{
                    if(index>=list.length){
                        const data = {
                            courseType: course.courseType.title,
                            course: course.name,
                            totalStudent: bienBan.totalStudent,
                            hoiDongChamThi,
                            giaoVienLyThuyet,
                            giaoVienThucHanh,
                        };
                        app.docx.generateFile('/document/TN04.docx', data, (error, buf) => {
                            res.send({ error: error, buf: buf });
                        });
                    } else {
                        const thanhVien = list[index];
                        const { name, chucVu, nhiemVu, gender } = thanhVien;                        
                            hoiDongChamThi.push({
                                idx:index+1, name, chucVu, nhiemVu, gender: (gender == 'female' ? 'Bà' : 'Ông')
                            });
                            if(thanhVien.chamLyThuyet){
                                giaoVienLyThuyet.push({
                                    idx:index+1, name: 'Giáo viên ' + name, nhiemVu 
                                });
                            }
                            if(thanhVien.chamThucHanh){
                                giaoVienThucHanh.push({
                                    idx:index+1, name: 'Giáo viên ' + name, nhiemVu
                                });
                            }
                            
                        handleExport(index+1);
                    }
                };
                handleExport();     
            }
        });
    });

    app.get('/api/course/report-tn05/export', app.permission.check('course:report'), (req, res) => {
        const { courseId } = req.query;
        app.model.course.get({ _id : courseId}, (error, course) => {
            if(error || !course) res.send({ error: 'Xuất file báo cáo bị lỗi'});
            else{
                let hoiDongChamThi = [];
                let count = 0;
                const list = course.hoiDongChamThi;
                const handleExport = (index=0)=>{
                    if(index>=list.length){
                        const data = {
                            courseType: course.courseType.title,
                            course: course.name,
                            hoiDongChamThi,
                            count
                        };
                        app.docx.generateFile('/document/TN05.docx', data, (error, buf) => {
                            res.send({ error: error, buf: buf });
                        });
                    } else {
                        const thanhVien = list[index];
                        const { name, chucVu, nhiemVu } = thanhVien;                        
                        if(thanhVien.chamLyThuyet || thanhVien.chamThucHanh){
                            ++count;
                            hoiDongChamThi.push({
                                idx:count, name: name, nhiemVu, chucVu 
                            });
                            
                        } else if(thanhVien.isTruongBanChamThi){
                            ++count;
                            hoiDongChamThi.push({
                                idx:count, name: name, chucVu, nhiemVu: 'Trưởng ban' 
                            });
                        } 
                        if(thanhVien.isThuKyChamThi){
                            ++count;
                            hoiDongChamThi.push({
                                idx:count, name: name, chucVu, nhiemVu: 'Thư ký' 
                            });
                            
                        }
                        handleExport(index+1);
                    }
                };
                handleExport();     
            }
        });
    });

    app.get('/api/course/report-tn/export/:listId/:type', app.permission.check('course:report'), (req, res) => {
        const { listId, type } = req.params;
        const listIdArr = listId.split(',');
        const sourcePromise =  app.excel.readFile(app.publicPath + (type == 'tn06' ? '/document/TN06.xlsx' : '/document/TN09.xlsx'));
        const getStudents = new Promise((resolve,reject)=>{ 
            app.model.student.getAll({ _id: {$in: listIdArr}}, (error, listStudents) => {
                error?reject(error):resolve(listStudents);
            });
        });
        Promise.all([sourcePromise,getStudents]).then(([sourceWorkbook,listStudents])=>{
            let worksheet = sourceWorkbook.getWorksheet(1);
            for(let i = 0;i<listStudents.length;i++){
                const student = listStudents[i];
                let item = [];
                item.push(i+1);
                {type == 'tn09' && item.push('');}
                item.push(student ? student.lastname + ' ' + student.firstname :'');
                item.push(student && student.birthday ? convert(student.birthday) : '');
                item.push(student && student.identityCard ? student.identityCard : '');
                item.push(student && student.residence ? student.residence : '');
                {type == 'tn09' && item.push('Đạt');}
                const maxCol = type == 'tn06' ? 6 : 8,
                row = type == 'tn06' ? 10 : 9;
                const insertRow =worksheet.insertRow(row+i,item);
                let j=1;
                while(j<=maxCol){// báo cáo của sở chỉ có 14 cột.
                    insertRow.getCell(j).border = {
                        top: {style:'thin'},
                        left: {style:'thin'},
                        bottom: {style:'thin'},
                        right: {style:'thin'}
                      };
                    j+=1;
                }
            }
            app.excel.attachment(sourceWorkbook, res,type == 'tn06' ?  'DS HV DU THI TOT NGHIEP.xlsx' : 'DS HV TOT NGHIEP.xlsx');
        });
    });

    app.get('/api/course/report-tn07/export', app.permission.check('course:export'), (req, res) => {
        const { courseId, soLuongHocVien } = req.query;
        app.model.course.get({ _id : courseId}, (error, course) => {
            if(error || !course) res.send({ error: 'Xuất file báo cáo bị lỗi'});
            else{
                const data = {
                    courseType: course.courseType.title,
                    course: course.name,
                    soLuongHocVien
                };
                app.docx.generateFile('/document/TN07.docx', data, (error, buf) => {
                    res.send({ error: error, buf: buf });
                });       
            }
        });
    });

    app.get('/api/course/report-tn08/export', app.permission.check('course:report'), (req, res) => {
        const { courseId, bienBan } = req.query;
        const { hocVienKhoa, vangThi, thiLai, tongHocVien, datYeuCau, duTieuChuan} = bienBan;
        app.model.course.get({ _id : courseId}, (error, course) => {
            if(error || !course) res.send({ error: 'Xuất file báo cáo bị lỗi'});
            else{
                let hoiDongKiemTraKetThucKhoa = [];
                let nameThuKy = '', genderThuKy='', chucVuThuKy='',nhiemVuThuKy='';
                const list = course.hoiDongKiemTraKetThucKhoa;
                const handleExport = (index=0)=>{
                    if(index>=list.length){
                        const data = {
                            courseType: course.courseType.title,
                            course: course.name,
                            hoiDongKiemTraKetThucKhoa,
                            hocVienKhoa, vangThi, thiLai, tongHocVien, datYeuCau, duTieuChuan,
                            nameThuKy,genderThuKy,chucVuThuKy,nhiemVuThuKy

                        };
                        app.docx.generateFile('/document/TN08.docx', data, (error, buf) => {
                            res.send({ error: error, buf: buf });
                        });
                    } else {
                        const thanhVien = list[index];
                        const { name, chucVu, nhiemVu, gender } = thanhVien;                        
                        if(thanhVien.thuKyBaoCao){
                            nameThuKy = name;
                            genderThuKy = (gender == 'female' ? 'Bà' : 'Ông');
                            chucVuThuKy = chucVu;
                            nhiemVuThuKy = nhiemVu;
                            
                        } 
                        hoiDongKiemTraKetThucKhoa.push({
                            idx:index+1, name, chucVu, nhiemVu, gender: (gender == 'female' ? 'Bà' : 'Ông')
                        });
                        handleExport(index+1);
                    }
                };
                handleExport();     
            }
        });
    });

    app.get('/api/course/student-11b/export', app.permission.check('user:login'), (req, res) => {
        const {listId} = req.query;
        app.model.student.getAll({ _id : { $in: listId }}, (error, listStudents) => {
            if(error || !listStudents.length) res.send({ error: 'Xuất file báo cáo bị lỗi'});
            else{
                let students = [];
                const handleExport = (index=0)=>{
                    if(index>=listStudents.length){
                        const data = {
                            courseType: listStudents[0].courseType.title,
                            course: listStudents[0].course.name,
                            students
                        };
                        app.docx.generateFile('/document/Phu_Luc_11B.docx', data, (error, buf) => {
                            res.send({ error: error, buf: buf });
                        });
                    }else{
                        const student = listStudents[index];
                        const { birthday, identityCard, lastname, firstname, isGiayKhamSucKhoe, isBangLaiA1, residence, soNamLaiXe, soKMLaiXe, soChungChi } = student;                        
                            students.push({
                                idx:index+1,birth:new Date(birthday).getFullYear().toString(), identityCard, lastname, firstname, isGiayKhamSucKhoe: isGiayKhamSucKhoe ? 'Có' : 'Không', isBangLaiA1: isBangLaiA1 ? 'Có' : 'Không', residence, soNamLaiXe: soNamLaiXe ? soNamLaiXe : '', soKMLaiXe: soKMLaiXe ? soKMLaiXe : '', soChungChi: soChungChi ? soChungChi : ''
                            });
                        handleExport(index+1);
                    }
                };
                handleExport();
            }
        });
    });

    app.get('/api/course/student-12b/export', app.permission.check('user:login'), (req, res) => {
        const {listId} = req.query;
        app.model.student.getAll({ _id : { $in: listId }}, (error, listStudents) => {
            if(error || !listStudents.length) res.send({ error: 'Xuất file báo cáo bị lỗi'});
            else{
                let students = [];
                listStudents.sort((a, b) => {
                    if(a.firstname < b.firstname) { return -1; }
                    if(a.firstname > b.firstname) { return 1; }
                    return 0;
                });
                const handleExport = (index=0)=>{
                    if(index>=listStudents.length){
                        const data = {
                            courseType: listStudents[0].courseType.title,
                            course: listStudents[0].course.name,
                            students
                        };
                        app.docx.generateFile('/document/Phu_Luc_12B.docx', data, (error, buf) => {
                            res.send({ error: error, buf: buf });
                        });
                    }else{
                        const student = listStudents[index];
                        const { birthday, identityCard, lastname, firstname, isGiayKhamSucKhoe, residence, soNamLaiXe, soKMLaiXe, soChungChi, courseType } = student;                        
                            students.push({
                                idx:index+1,birth: birthday ? convert(birthday) : '', identityCard, lastname, firstname, isGiayKhamSucKhoe: isGiayKhamSucKhoe ? 'Có' : 'Không', residence, soNamLaiXe: soNamLaiXe ? soNamLaiXe : '', soKMLaiXe: soKMLaiXe ? soKMLaiXe : '', soChungChi: soChungChi ? soChungChi : '', courseType: courseType.title
                            });
                        handleExport(index+1);
                    }
                };
                handleExport();
            }
        });
    });

    app.get('/api/course/student-12c/export', app.permission.check('user:login'), (req, res) => {
        const {listId, type} = req.query;
        app.model.student.getAll({ _id : { $in: listId }}, (error, listStudents) => {
            if(error || !listStudents.length) res.send({ error: 'Xuất file báo cáo bị lỗi'});
            else{
                let students = [];
                listStudents.sort((a, b) => {
                    if(a.firstname < b.firstname) { return -1; }
                    if(a.firstname > b.firstname) { return 1; }
                    return 0;
                });
                const handleExport = (index=0)=>{
                    if(index>=listStudents.length){
                        const data = {
                            courseType: listStudents[0].courseType.title,
                            course: listStudents[0].course.name,
                            students
                        };
                        if(type == '12c'){
                            app.docx.generateFile('/document/Phu_Luc_12C.docx', data, (error, buf) => {
                                res.send({ error: error, buf: buf });
                            });
                        } else {
                            app.docx.generateFile('/document/Phu_Luc_13.docx', data, (error, buf) => {
                                res.send({ error: error, buf: buf });
                            });
                        }
                    }else{
                        const student = listStudents[index];
                        const { birthday, identityCard, lastname, firstname, lyDoSatHach, residence, noiDungSatHach, soGPLX, coQuan, courseType, ngayHetHanGPLX } = student;                        
                            students.push({
                                idx:index+1,birth: birthday ? convert(birthday) : '', ngayHetHanGPLX: ngayHetHanGPLX ? convert(ngayHetHanGPLX) : '', identityCard, lastname, firstname, lyDoSatHach: lyDoSatHach ? lyDoSatHach : '', residence, noiDungSatHach: noiDungSatHach ? noiDungSatHach : '', soGPLX: soGPLX ? soGPLX : '', coQuan: coQuan ? coQuan : '', courseType: courseType.title
                            });
                        handleExport(index+1);
                    }
                };
                handleExport();
            }
        });
    });

    app.get('/api/course/report-dt03/export/:courseId', app.permission.check('course:report'), (req, res) => {
        const {courseId} = req.params;
        const sourcePromise =  app.excel.readFile(app.publicPath+'/document/DT03.xlsx');
        const getStudents = new Promise((resolve,reject)=>{ 
            app.model.student.getAll({ course : courseId}, (error, listStudents) => {
                error?reject(error):resolve(listStudents);
            });
        });
        Promise.all([sourcePromise,getStudents]).then(([sourceWorkbook,listStudents])=>{
            app.model.subject.getAll({}, (subjects) => {
                const findSubject = (idx) => {
                    switch (idx) {
                        case 1:
                            {
                                const index = subjects.findIndex(subject => subject.title.search('Đạo đức') != -1);
                                if(index != -1) return subjects[index]._id;
                                else return null;
                            }
                        case 2:
                            {
                                const index = subjects.findIndex(subject => subject.title.search('Cấu tạo') != -1);
                                if(index != -1) return subjects[index]._id;
                                else return null;
                            }
                        case 3:
                            {
                                const index = subjects.findIndex(subject => subject.title.search('Kỹ thuật') != -1);
                                if(index != -1) return subjects[index]._id;
                                else return null;
                            }
                        case 4:
                            {
                                const index = subjects.findIndex(subject => subject.title.search('Nghiệp vụ') != -1);
                                if(index != -1) return subjects[index]._id;
                                else return null;
                            }
                        case 5:
                            {
                                const index = subjects.findIndex(subject => subject.title.search('Luật') != -1);
                                if(index != -1) return subjects[index]._id;
                                else return null;
                            }
                    }

                };
                let worksheet = sourceWorkbook.getWorksheet(1);
                for(let i = 0;i<listStudents.length;i++){
                    const student = listStudents[i];
                    let diemLT = 0;
                    let item = [];
                    item.push(i+1);
                    item.push(student ? student.lastname + ' ' + student.firstname :'');
                    item.push(student && student.birthday ? convert(student.birthday) : '');
                    item.push(findSubject(1) && student.tienDoThiHetMon && student.tienDoThiHetMon[findSubject(1)] ? student.tienDoThiHetMon[findSubject(1)].score : 0);
                    item.push(findSubject(2) && student.tienDoThiHetMon && student.tienDoThiHetMon[findSubject(2)] ? student.tienDoThiHetMon[findSubject(2)].score : 0);
                    item.push(findSubject(3) && student.tienDoThiHetMon && student.tienDoThiHetMon[findSubject(3)] ? student.tienDoThiHetMon[findSubject(3)].score : 0);
                    item.push(findSubject(4) && student.tienDoThiHetMon && student.tienDoThiHetMon[findSubject(4)] ? student.tienDoThiHetMon[findSubject(4)].score : 0);
                    item.push(findSubject(5) && student.tienDoThiHetMon && student.tienDoThiHetMon[findSubject(5)] ? student.tienDoThiHetMon[findSubject(5)].score : 0);
                    item.push(student ? student.diemThucHanh : '');
                    for(let idx = 3; idx<=7; idx++){
                        diemLT = diemLT + item[idx];
                    }
                    const diemTB = ((diemLT / 5) + (student && student.diemThucHanh ? student.diemThucHanh : 0))/2;
                    item.push('');
                    item.push(diemTB);
                    item.push(diemTB < 5 ? 'Yếu' : (diemTB < 7 ? 'Trung bình' : (diemTB < 8 ? 'Khá' : 'Giỏi')));
                    const insertRow =worksheet.insertRow(8+i,item);
                    let j=1;
                    while(j<=11){// báo cáo của sở chỉ có 14 cột.
                        insertRow.getCell(j).border = {
                            top: {style:'thin'},
                            left: {style:'thin'},
                            bottom: {style:'thin'},
                            right: {style:'thin'}
                          };
                        j+=1;
                    }
                }
                app.excel.attachment(sourceWorkbook, res,'Bang Diem Thi Tong Hop Het Mon.xlsx');
            });
        });
    });

};