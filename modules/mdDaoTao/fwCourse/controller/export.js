module.exports = (app) => {

    app.get('/api/course/export/:_courseId', app.permission.check('course:export'), (req, res) => {
        app.model.course.get(req.params._courseId, (error, course) => {
            if (error) {
                res.send({ error });
            } else {
                const numOfLesson = course.subjects.reduce((a, b) => (b.lessons ? b.lessons.length : 0) + a, 0);

                const workbook = app.excel.create(), worksheet = workbook.addWorksheet(`Danh sách điểm của học viên lớp ${course.name}`);
                const cells = [
                    { cell: 'A1', border: '1234', value: 'STT', font: { size: 12, align: 'center' }, bold: true },
                    { cell: 'B1', border: '1234', value: 'Họ', font: { size: 12, align: 'center' }, bold: true },
                    { cell: 'C1', border: '1234', value: 'Tên', font: { size: 12, align: 'center' }, bold: true },
                ];
                let row = 2;
                course.teacherGroups.forEach(group => {
                    group.student.forEach(item => {
                        row++;
                        worksheet.insertRow(row, [row - 2, item.lastname, item.firstname]);
                    });
                });
                new Promise((resolve, reject) => {
                    let count = 0;
                    let countIndex = 0;
                    ['A1:A2', 'B1:B2', 'C1:C2'].forEach((item) => worksheet.mergeCells(item));
                    for (const item of course.subjects) {
                        if (item) {
                            app.model.subject.get(item._id, (error, subject) => {
                                if (error) {
                                    reject(error);
                                } else {
                                    cells.push({
                                        cell: `${String.fromCharCode('D'.charCodeAt() + countIndex)}1`,
                                        border: '1234',
                                        value: subject.title,
                                        font: { size: 12, align: 'center' }, bold: true
                                    });
                                    const currentCountIndex = countIndex;
                                    countIndex += subject.lessons.length;
                                    worksheet.mergeCells(`${String.fromCharCode('D'.charCodeAt() + currentCountIndex)}1:${String.fromCharCode('D'.charCodeAt() + (countIndex - 1))}1`);
                                    for (const lesson of subject.lessons) {
                                        cells.push({
                                            cell: `${String.fromCharCode('D'.charCodeAt() + count)}2`,
                                            border: '1234',
                                            value: lesson.title,
                                            font: { size: 12, align: 'center' },
                                            bold: true
                                        });
                                        let rowCell = 2;
                                        course.teacherGroups.forEach(group => {
                                            group.student.forEach(item => {
                                                rowCell++;
                                                const value = item.tienDoHocTap && item.tienDoHocTap[subject._id] && item.tienDoHocTap[subject._id][lesson._id] && item.tienDoHocTap[subject._id][lesson._id].score || 0;
                                                worksheet.getCell(`${String.fromCharCode('D'.charCodeAt() + count)}${rowCell}`).value = `${value}/${lesson.questions.length}`;
                                            });
                                        });
                                        count++;
                                        if (count == numOfLesson) {
                                            const colAvgWord = String.fromCharCode('D'.charCodeAt() + numOfLesson);
                                            cells.push({
                                                cell: `${colAvgWord}1`,
                                                border: '1234',
                                                value: 'Điểm trung bình',
                                                font: { size: 12, align: 'center' }, bold: true
                                            });
                                            worksheet.mergeCells(`${colAvgWord}1:${colAvgWord}2`);
                                            let rowSum = 2;
                                            course.teacherGroups.forEach(group => {
                                                group.student.forEach(() => {
                                                    rowSum++;
                                                    let sum = 0;
                                                    for (let i = 0; i < numOfLesson; i++) {
                                                        const scoreText = worksheet.getCell(`${String.fromCharCode('D'.charCodeAt() + i)}${rowSum}`).text;
                                                        const scoreSplitted = scoreText.split('/');
                                                        let score = parseInt(scoreSplitted[0]);
                                                        let sumOfQuestion = parseInt(scoreSplitted[1]);
                                                        let div = 0;
                                                        if (sumOfQuestion > 0) {
                                                            div = score / sumOfQuestion;
                                                        }
                                                        sum += div;
                                                    }
                                                    sum /= numOfLesson;
                                                    worksheet.getCell(`${colAvgWord}${rowSum}`).value = parseFloat(sum).toFixed(2);
                                                });
                                            });
                                            resolve();
                                        }
                                    }
                                }
                            });
                        }
                    }
                }).then(() => {
                    app.excel.write(worksheet, cells);
                    app.excel.attachment(workbook, res, `Danh sách điểm của học viên lớp ${course.name}.xlsx`);
                }).catch(error => res.send(error));
            }
        });
    });

    app.get('/api/course/learning-progress/export/:_courseId/:filter', app.permission.check('course:export'), (req, res) => {
        const pageNumber = parseInt(req.params.pageNumber),
            pageSize = parseInt(req.params.pageSize),
            sessionUser = req.session.user,
            condition = req.query.pageCondition || {},
            pageCondition = { course: req.params._courseId || { $ne: null } },
            filter = req.params.filter;
        let listStudent = [],
            subjects = [],
            monThiTotNghiep = [];
        const isAdmin = sessionUser.isCourseAdmin || sessionUser.permissions.includes('course:write');

        new Promise((resolve, reject) => {
            if (isAdmin) {
                if (condition.searchText) {
                    const value = { $regex: `.*${condition.searchText}.*`, $options: 'i' };
                    pageCondition.$or = [
                        { firstname: value },
                        { lastname: value },
                    ];
                }
                app.model.student.getPage(pageNumber, pageSize, pageCondition, (error, page) => {
                    if (error || !page) {
                        error && console.error(error);
                        reject('Lỗi khi đọc danh sách sinh viên!');
                    } else {
                        page = app.clone(page);
                        listStudent = page && page.list ? page.list.map(item => item = app.clone(item)) : [];
                        subjects = listStudent.length && listStudent[0].course && listStudent[0].course.subjects ? listStudent[0].course.subjects : [];
                        resolve();
                    }
                });
            } else if (sessionUser.isLecturer) {
                app.model.course.get(condition.courseId, (error, item) => {
                    if (error || !item) {
                        error && console.error(error);
                        reject('Lỗi khi đọc thông tin khóa học!');
                    } else {
                        item = app.clone(item);
                        const studentTeacherGroup = item.teacherGroups.find(teacherGroup => teacherGroup.teacher && teacherGroup.teacher._id == sessionUser._id);
                        listStudent = studentTeacherGroup && studentTeacherGroup.student ? studentTeacherGroup.student : [];
                        subjects = item.subjects ? item.subjects : [];
                        resolve();
                    }
                });
            } else {
                reject('Bạn không đủ quyền!');
            }
        }).then(() => {
            const monLyThuyet = subjects.filter(subject => subject.monThucHanh == false),
                students = [];
            listStudent.forEach((student => {
                student = app.clone(student, { subject: {} });
                let tongDiemLyThuyet = 0;
                subjects.forEach(subject => {
                    let diemMonHoc = 0, completedLessons = 0, numberLessons = subject.lessons ? subject.lessons.length : 0;
                    if (numberLessons) {
                        if (student && student.tienDoHocTap && student.tienDoHocTap[subject._id] && !subject.monThucHanh) {
                            const listLessons = Object.entries(student.tienDoHocTap[subject._id]);
                            let tongDiemMonHoc = 0;
                            (listLessons || []).forEach(lesson => {
                                tongDiemMonHoc += lesson[1].trueAnswers ? Number(lesson[1].score) / Object.keys(lesson[1].trueAnswers).length * 10 : 0;
                            });
                            diemMonHoc = Number(tongDiemMonHoc / numberLessons).toFixed(1);
                        }
                        if (subject && student.tienDoHocTap && student.tienDoHocTap[subject._id]) {
                            completedLessons = (Object.keys(student.tienDoHocTap[subject._id]).length > numberLessons ?
                                numberLessons :
                                Object.keys(student.tienDoHocTap[subject._id]).length);
                        }
                    }

                    if (!subject.monThucHanh) {
                        tongDiemLyThuyet += Number(diemMonHoc);
                    }

                    const obj = {};
                    obj[subject._id] = { completedLessons, diemMonHoc, numberLessons };
                    student.subject = app.clone(student.subject, obj);
                });

                const diemLyThuyet = Number((tongDiemLyThuyet / monLyThuyet.length).toFixed(1));
                const diemThucHanh = student.diemThucHanh ? Number(student.diemThucHanh) : 0;

                let filterTotNghiep = true,
                    filterThiTotNghiep = true;
                if (isAdmin) {
                    const diemThiTotNghiep = student && student.diemThiTotNghiep && student.diemThiTotNghiep.length ? student.diemThiTotNghiep : [];
                    monThiTotNghiep = student && student.course && student.course.monThiTotNghiep && student.course.monThiTotNghiep.length ? student.course.monThiTotNghiep : [];
                    if (diemThiTotNghiep.length) {
                        for (let i = 0; i < diemThiTotNghiep.length; i++) {
                            if (diemThiTotNghiep[i].diemLiet || diemThiTotNghiep[i].point < monThiTotNghiep[i].score) {
                                filterTotNghiep = false;
                                break;
                            }
                        }
                    } else {
                        filterTotNghiep = false;
                    }
                    const diemThiHetMon = student && student.diemThiHetMon && student.diemThiHetMon;
                    if (diemThiHetMon.length) {
                        for (let i = 0; i < diemThiHetMon.length; i++) {
                            if (diemThiHetMon[i].point < 5) {
                                filterThiTotNghiep = false;
                                break;
                            }
                        }
                    } else {
                        filterThiTotNghiep = false;
                    }
                }

                if ((filter == 'thiHetMon' && 5 <= ((diemLyThuyet + diemThucHanh) / 2).toFixed(1)) ||
                    (filter == 'thiTotNghiep' && filterThiTotNghiep) ||
                    (filter == 'totNghiep' && filterTotNghiep) ||
                    (filter == 'satHach' && student.datSatHach) ||
                    !['thiHetMon', 'thiTotNghiep', 'totNghiep', 'satHach'].includes(filter)) {
                    students.push(app.clone(student, { diemLyThuyet, diemThucHanh }));
                }
            }));
            const workbook = app.excel.create(), worksheet = workbook.addWorksheet(filter);
            const cells = [
                { cell: 'A1', value: 'STT', bold: true, border: '1234' },
                { cell: 'B1', value: 'Họ', bold: true, border: '1234' },
                { cell: 'C1', value: 'Tên', bold: true, border: '1234' },
                { cell: 'D1', value: 'CMND/CCCD', bold: true, border: '1234' },
                { cell: 'E1', value: 'Điểm lý thuyết', bold: true, border: '1234' },
                { cell: 'F1', value: 'Điểm thực hành', bold: true, border: '1234' },
                { cell: 'G1', value: 'Điểm trung bình', bold: true, border: '1234' },
            ];
            let columns = [
                { header: 'STT', key: 'id', width: 15 },
                { header: 'Họ', key: 'lastname', width: 20 },
                { header: 'Tên', key: 'firstname', width: 20 },
                { header: 'CMND/CCCD', key: 'identityCard', width: 20 },
                { header: 'Điểm lý thuyết', key: 'diemLyThuyet', width: 20 },
                { header: 'Điểm thực hành', key: 'diemThucHanh', width: 20 },
                { header: 'Điểm trung bình', key: 'diemTB', width: 20 },
            ];
            const listMonThi = subjects.concat(monThiTotNghiep);
            listMonThi.push({ title: 'Sát hạch', _id: 'satHach' });
            listMonThi.length && listMonThi.forEach((monThi, index) => {
                const col = String.fromCharCode('H'.charCodeAt() + index) + '1';
                cells.push({ cell: col, value: monThi.title, bold: true, border: '1234' });
                columns.push({ header: monThi.title, key: monThi._id.toString(), width: 20 });
            });
            worksheet.columns = columns;
            students.filter(item => item).forEach((item, index) => {
                const obj = {
                    id: index + 1,
                    lastname: item.lastname,
                    firstname: item.firstname,
                    identityCard: item.identityCard,
                    diemLyThuyet: item.diemLyThuyet,
                    diemThucHanh: item.diemThucHanh,
                    diemTB: ((item.diemLyThuyet + item.diemThucHanh) / 2).toFixed(1),
                };
                subjects.length && subjects.forEach((monThi, index) => {
                    obj[monThi._id] = item.diemThiHetMon[index] ? item.diemThiHetMon[index].point : 0;
                });
                monThiTotNghiep.length && monThiTotNghiep.forEach((monThi, index) => {
                    obj[monThi._id] = item.diemThiTotNghiep[index] ? item.diemThiTotNghiep[index].point : 0;
                });
                obj['satHach'] = item.datSatHach ? 'X' : '';
                worksheet.addRow(obj);
            });
            app.excel.write(worksheet, cells);
            app.excel.attachment(workbook, res, 'BangDiemHocVien.xlsx');
        }).catch(error => console.error(error) || res.send({ error }));
    });

    app.get('/api/course/student/export/:_courseId', app.permission.check('course:export'), (req, res) => {
        const sessionUser = req.session.user,
            division = sessionUser.division,
            courseId = req.params._courseId;
        if (sessionUser && sessionUser.isCourseAdmin && division && division.isOutside) {
            res.send({ error: 'Bạn không có quyền xuất file excel này!' });
        } else {
            app.model.student.getAll({ course: courseId, division: division._id }, (error, students) => {
                if (error) {
                    res.send({ error: 'Hệ thống bị lỗi!' });
                } else {
                    const workbook = app.excel.create(), worksheet = workbook.addWorksheet('Student');
                    const cells = [
                        { cell: 'A1', value: 'STT', bold: true, border: '1234' },
                        { cell: 'B1', value: 'Họ', bold: true, border: '1234' },
                        { cell: 'C1', value: 'Tên', bold: true, border: '1234' },
                        { cell: 'D1', value: 'CMND/CCCD', bold: true, border: '1234' },
                        { cell: 'E1', value: 'Cơ sở', bold: true, border: '1234' },
                        { cell: 'F1', value: 'Email', bold: true, border: '1234' },
                        { cell: 'G1', value: 'Loại khóa học', bold: true, border: '1234' },
                        { cell: 'H1', value: 'Khóa học', bold: true, border: '1234' },
                    ];

                    worksheet.columns = [
                        { header: 'STT', key: '_id', width: 15 },
                        { header: 'Họ', key: 'lastname', width: 15 },
                        { header: 'Tên', key: 'firstname', width: 15 },
                        { header: 'CMND/CCCD', key: 'identityCard', width: 15 },
                        { header: 'Cơ sở', key: 'division', width: 30 },
                        { header: 'Email', key: 'email', width: 40 },
                        { header: 'Loại khóa học', key: 'courseType', width: 40 },
                        { header: 'Khóa học', key: 'course', width: 80 },
                    ];
                    students.forEach((student, index) => {
                        worksheet.addRow({
                            _id: index + 1,
                            lastname: student.lastname,
                            firstname: student.firstname,
                            identityCard: student.identityCard,
                            division: student.division ? student.division.title : '',
                            email: student.user && student.user.email,
                            courseType: student.courseType ? student.courseType.title : '',
                            course: student.course ? student.course.name : '',
                        });
                    });
                    app.excel.write(worksheet, cells);
                    app.excel.attachment(workbook, res, 'Student.xlsx');
                }
            });
        }
    });

    app.get('/api/course/teacher-student/export/:_courseId', app.permission.check('course:export'), (req, res) => {
        const sessionUser = req.session.user,
            division = sessionUser.division,
            courseId = req.params._courseId;
        if (sessionUser && sessionUser.isCourseAdmin && division && division.isOutside) {
            res.send({ error: 'Bạn không có quyền xuất file excel này!' });
        } else {
            app.model.course.get(courseId, (error, course) => {
                if (error) {
                    res.send({ error: 'Hệ thống bị lỗi!' });
                } else {
                    const workbook = app.excel.create(), worksheet = workbook.addWorksheet('Teacher and student');
                    const cells = [
                        { cell: 'A1', value: 'Giáo viên', bold: true, border: '1234' },
                        { cell: 'B1', value: 'STT', bold: true, border: '1234' },
                        { cell: 'C1', value: 'Họ', bold: true, border: '1234' },
                        { cell: 'D1', value: 'Tên', bold: true, border: '1234' },
                        { cell: 'E1', value: 'CMND/CCCD', bold: true, border: '1234' },
                        { cell: 'F1', value: 'Cơ sở', bold: true, border: '1234' },
                        { cell: 'G1', value: 'Email', bold: true, border: '1234' },
                        { cell: 'H1', value: 'Loại khóa học', bold: true, border: '1234' },
                        { cell: 'I1', value: 'Khóa học', bold: true, border: '1234' },
                    ];
                    worksheet.columns = [
                        { header: 'Giáo viên', key: 'teacher', width: 30 },
                        { header: 'STT', key: '_id', width: 15 },
                        { header: 'Họ', key: 'lastname', width: 15 },
                        { header: 'Tên', key: 'firstname', width: 15 },
                        { header: 'CMND/CCCD', key: 'identityCard', width: 15 },
                        { header: 'Cơ sở', key: 'division', width: 30 },
                        { header: 'Email', key: 'email', width: 40 },
                        { header: 'Loại khóa học', key: 'courseType', width: 40 },
                        { header: 'Khóa học', key: 'course', width: 80 },
                    ];

                    let count = 2, mergeStart = 0, mergeEnd = 0;
                    course && course.teacherGroups.forEach(group => {
                        cells.push({
                            cell: `${'A' + count}`,
                            border: '1234',
                            value: group.teacher.lastname + ' ' + group.teacher.firstname,
                            font: { size: 12, align: 'center' },
                            bold: true
                        });
                        let indexStudent = 0;
                        if (group.student && group.student.length > 0) {
                            group.student.forEach((student, index) => {
                                worksheet.addRow({
                                    _id: index + 1,
                                    lastname: student.lastname,
                                    firstname: student.firstname,
                                    identityCard: student.identityCard,
                                    division: student.division ? student.division.title : '',
                                    email: student.user && student.user.email,
                                    courseType: student.courseType ? student.courseType.title : '',
                                    course: student.course ? student.course.name : '',
                                });
                                indexStudent += 1;
                            });
                        } else {
                            worksheet.addRow({});
                            indexStudent = 1;
                        }
                        mergeStart = count;
                        mergeEnd = count + indexStudent - 1;
                        worksheet.mergeCells(`${'A' + mergeStart}:${'A' + mergeEnd}`);
                        count += indexStudent;
                    });
                    app.excel.write(worksheet, cells);
                    app.excel.attachment(workbook, res, 'Teacher and student.xlsx');
                }
            });
        }
    });

    app.get('/api/course/final-exam/export/:_subjectId/:_studentId', app.permission.check('user:login'), (req, res) => {
        const {_subjectId,_studentId} = req.params;
        app.model.student.get({_id:_studentId}, (error, student) => {
            if (!error && student) {
                const tienDoThiHetMon = student.tienDoThiHetMon;
                if (tienDoThiHetMon && tienDoThiHetMon[_subjectId] && tienDoThiHetMon[_subjectId].answers) {
                    const listIdQuestion = Object.keys(tienDoThiHetMon[_subjectId].answers);
                    app.model.driveQuestion.getAll((error, list) => {
                        if (error || list.length == 0) {
                            res.send({ error: 'Lấy câu hỏi thi bị lỗi!' });
                        } else {
                            const newQuestion = list.filter(question => listIdQuestion.indexOf(question._id.toString()) != -1);
                            const driveTest = {
                                questions: newQuestion,
                            };
                            const data = {
                                firstname: student.firstname || '',
                                lastname: student.lastname || '',
                            };
                            driveTest && driveTest.questions && driveTest.questions.map((question,index) => {
                                const answers = question && question.answers && question.answers.split('\n');
                                    data['question' + (index + 1)] = question.title;
                                    for(let i = 0; i<4; i++){
                                        if(tienDoThiHetMon[_subjectId].answers[question._id] == i)
                                            data[(index+1)+''+(i+1)] = 'X';
                                        else data[(index+1)+''+(i+1)] = '';
                                        data['question'+ (index+1) + (i+1)] = answers[i] ? answers[i] : '';
                                        
                                    }      
                            });
                            app.docx.generateFile('/document/KTLX.docx', data, (error, buf) => {
                                res.send({ error: error, buf: buf });
                            });
                        }
                    });
                } else{
                    res.send({error: 'Học viên chưa làm bài kiểm tra này'});
                } 
            } else {
                res.send({ error: 'Lấy câu hỏi thi bị lỗi!' });
            }
        });
    });

    app.get('/api/course/sat-hach/export', app.permission.check('course:export'), (req, res) => {
        const {satHachs,type} = req.query;
        let courses = [];
        const dateFormat = require('dateformat');
        const handleExport = (index=0)=>{
            if(index>=satHachs.length){
                const data = {
                    courses
                };
                const template = {
                    dangKy:'/document/BAO_CAO_DANG_KY_SAT_HACH_LAI_XE.docx',
                    deNghi:'/document/BAO_CAO_DE_NGHI_SAT_HACH_LAI_XE.docx'
                };
                app.docx.generateFile(template[type], data, (error, buf) => {
                    res.send({ error: error, buf: buf });
                });
            }else{
                const _courseId = satHachs[index];
                app.model.course.get({_id:_courseId}, (error, course) => {
                    if(error || !course){
                        res.send({error:'Lấy thông tin khóa học bị lỗi'});
                    }else{
                        const {name,courseType ,thoiGianKhaiGiang} = course;     
                        app.model.student.count({ course: _courseId }, (error, numberOfStudents) => {
                            if(error) res.send({error});
                            else{
                                courses.push({
                                    idx:index+1,name,courseType:courseType.title,numberOfStudents,thoiGianKhaiGiang:dateFormat(thoiGianKhaiGiang,'dd/mm/yyyy'),
                                });
                                handleExport(index+1);
                            }
                        });                 
                        

                    }
                });
            }
        };

        handleExport();
    });

};