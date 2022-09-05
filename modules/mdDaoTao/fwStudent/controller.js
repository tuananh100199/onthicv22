module.exports = (app) => {
    const menu = {
        parentMenu: app.parentMenu.enrollment,
        menus: {
            8020: { title: 'Ứng viên', link: '/user/pre-student' },
            8027: { title: 'Học viên', link: '/user/student' },
            8060: { title: 'Theo dõi công nợ', link: '/user/student/debt-enroll' },
        }
    },
        menuFailStudent = {
            parentMenu: app.parentMenu.trainning,
            menus: {
                4055: { title: 'Học viên chưa tốt nghiệp', link: '/user/student/fail-graduation' },
                4060: { title: 'Học viên chưa đạt sát hạch', link: '/user/student/fail-exam' },
                4062: { title: 'Học viên hoàn thành khóa', link: '/user/student/done-course' },
            }
        },
        menuDebt = {
            parentMenu: app.parentMenu.accountant,
            menus: {
                7005: { title: 'Theo dõi công nợ', link: '/user/student/debt' },
            }
        },
        menuActiveCourse = {
            parentMenu: app.parentMenu.accountant,
            menus: {
                7007: { title: 'Kích hoạt khóa học', link: '/user/student/active-course' },
            }
        };

    app.permission.add(
        { name: 'student:read' }, { name: 'student:write' }, { name: 'student:delete', menu }, { name: 'student:import' }, { name: 'student: fail', menu: menuFailStudent },//TODO: Thầy TÙNG
        { name: 'pre-student:read', menu }, { name: 'pre-student:write' }, { name: 'pre-student:delete' }, { name: 'pre-student:import' }, { name: 'pre-student:export' },
        { name: 'debt:read', menu: menuDebt }, { name: 'debt:write' }, { name: 'debt:delete' },
        { name: 'activeCourse:read', menu: menuActiveCourse }, { name: 'activeCourse:write' }, { name: 'activeCourse:delete' },
    );

    app.get('/user/student/import-fail-pass', app.permission.check('student:import'), app.templates.admin);
    app.get('/user/student/fail-exam', app.permission.check('student:read'), app.templates.admin);
    app.get('/user/student/fail-graduation', app.permission.check('student:read'), app.templates.admin);
    app.get('/user/student/debt', app.permission.check('debt:read'), app.templates.admin);
    app.get('/user/student/payment/:_id', app.permission.check('debt:write'), app.templates.admin);
    app.get('/user/pre-student', app.permission.check('pre-student:read'), app.templates.admin);
    app.get('/user/pre-student/import', app.permission.check('pre-student:import'), app.templates.admin);
    app.get('/user/student/active-course',app.permission.check('activeCourse:read'), app.templates.admin);
    app.get('/user/student/debt-enroll', app.permission.check('debt:read'), app.templates.admin);
    app.get('/user/revenue', app.permission.check('debt:read'), app.templates.admin);
    app.get('/user/student', app.permission.check('student:read'), app.templates.admin);
    app.get('/user/student/done-course', app.permission.check('student:read'), app.templates.admin);
    
    // Student APIs ---------------------------------------------------------------------------------------------------
    app.get('/api/student/page/:pageNumber/:pageSize', (req, res) => {
        let pageNumber = parseInt(req.params.pageNumber),
            pageSize = parseInt(req.params.pageSize),
            condition = req.query.pageCondition || {},
            pageCondition = { course: req.query.course || { $ne: null } };
        try {
            if (req.session.user.isCourseAdmin && req.session.user.division && req.session.user.division.isOutside) { // Session user là quản trị viên khóa học
                pageCondition.division = req.session.user.division._id;
            }

            if (condition.courseType) pageCondition.courseType = condition.courseType;
            if (condition.daThiHetMon) pageCondition.diemThucHanh = { $exists: true, $gte: 5 };
            if (condition.course) pageCondition.course = condition.course;
            if (condition.datSatHach) pageCondition.datSatHach = condition.datSatHach;
            if (condition.totNghiep) pageCondition.totNghiep = condition.totNghiep;
            if (condition.searchText) {
                const value = { $regex: `.*${condition.searchText}.*`, $options: 'i' };
                pageCondition.$or = [
                    // { phoneNumber: value },
                    // { email: value },
                    { firstname: value },
                    { lastname: value },
                    { identityCard: value },
                ];
            }
            app.model.student.getPage(pageNumber, pageSize, pageCondition, (error, page) => res.send({ error, page }));
        } catch (error) {
            res.send({ error });
        }
    });

    app.get('/api/student/debt/page/:pageNumber/:pageSize', app.permission.check('debt:read'), (req, res) => {
        let pageNumber = parseInt(req.params.pageNumber),
            pageSize = parseInt(req.params.pageSize),
            condition = req.query.pageCondition || {},
            pageCondition = {},filter=req.query.filter||{},sort=req.query.sort||null; 

        try {
            if (req.session.user.isCourseAdmin && req.session.user.division && req.session.user.division.isOutside) { // Session user là quản trị viên khóa học
                pageCondition.division = req.session.user.division._id;
            }
            // if (condition.searchText) {
            //     const value = { $regex: `.*${condition.searchText}.*`, $options: 'i' };
            //     pageCondition.$or = [
            //         { firstname: value },
            //         { lastname: value },
            //         { identityCard: value },
            //     ];
            // }
            if(condition.course) {
                if((condition.course == '1') && condition.courseTypeId){
                    app.model.course.get({isDefault: true, courseType: condition.courseTypeId}, (error,course) => {
                        pageCondition.course = course._id;
                        app.model.student.getPage(pageNumber, pageSize, pageCondition, (error, page) => res.send({ error, page }));
                    });
                } else{
                    pageCondition.course = condition.course;
                    app.model.student.getPage(pageNumber, pageSize, pageCondition, (error, page) => res.send({ error, page }));
                }
            } else  {
                if(condition.courseTypeId) pageCondition.courseType = condition.courseTypeId;
                filter && app.handleFilter(filter,['coursePayment','fullName', 'courseFee', 'discount'],defaultFilter=>{
                    pageCondition={...pageCondition,...defaultFilter};
                });
                if(sort && sort.fullName) sort = {firstname:sort.fullName};
                app.model.student.getPage(pageNumber, pageSize, pageCondition, sort, (error, page) => res.send({ error, page }));
            }
            // app.model.student.getPage(pageNumber, pageSize, pageCondition, (error, page) => res.send({ error, page }));
        } catch (error) {
            res.send({ error });
        }
    });

    app.get('/api/student/official/page/:pageNumber/:pageSize', app.permission.check('student:read'), (req, res) => {
        let pageNumber = parseInt(req.params.pageNumber),
            pageSize = parseInt(req.params.pageSize),
            filter=req.query.filter||null,sort=req.query.sort||null,
            pageCondition = { course: null };
        app.model.course.getAll({isDefault:true},(error,defaultCourses)=>{
            if(error)res.send({error});
            else{
                const defaultIds = defaultCourses.map(item=>item._id.toString());
                pageCondition.course={};
                pageCondition.course={['$nin']:defaultIds};
                if (req.session.user.isCourseAdmin && req.session.user.division && req.session.user.division.isOutside) { // Session user là quản trị viên khóa học
                    pageCondition.division = req.session.user.division._id;
                }
                
                if(filter){
                    app.handleFilter(filter,['courseType','fullName','division','course'],filterCondition=>{
                        pageCondition={...pageCondition,...filterCondition};
                    });
                }
                if(sort && sort.fullName) sort={firstname:sort.fullName}; 

                app.model.student.getPage(pageNumber, pageSize, pageCondition, sort, (error, page) => {
                    res.send({ error, page });
                });
            }
        });
    });



    app.get('/api/student', app.permission.check('user:login'), (req, res) => {
        app.model.student.get(req.query._id, (error, item) => res.send({ error, item }));
    });

    app.put('/api/student', app.permission.check('user:login'), (req, res) => {
        app.model.student.update(req.body._id, req.body.changes||{}, (error, item) => res.send({ error, item }));
    });

    app.post('/api/student/payment', app.permission.check('courseFee:write'), (req, res) => {
        const studentId = req.body._studentId,
            data = req.body.payment,
            {courseFee, fee} = req.body;
        const year = new Date().getFullYear();
        app.model.student.get({ _id: studentId }, (error, item) => {
            if (error) {
                res.send({ error });
            } else if (!item) {
                res.send({ check: 'Không tìm thấy học viên!' });
            } else {
                if(item.discount && item.discount.fee && !item.daNhanKhuyenMai){
                    const discount = item.discount;
                    const dataDiscount = {
                        name: discount.name,
                        type: 'goi',
                        fee: discount.fee,
                        date: new Date(), 
                        user: item.user && item.user._id
                    };
                    app.model.discountHistory.create(dataDiscount, () =>{
                        app.model.student.addPayment({ _id: item._id }, data, (error, item) => {
                            if(error) res.send({error});
                            else{
                                const revenue = {
                                    payer: studentId,
                                    receiver: req.session.user._id,
                                    fee: data.fee,
                                    date: new Date(),
                                    type: 'offline',
                                    course: item.course && item.course._id,
                                    courseType: item.courseType && item.courseType._id,
                                };
                                app.model.revenue.create(revenue, (error) => {
                                    if (error) res.send({error});
                                    else {
                                        app.model.setting.get('revenue', result => {
                                            if (result && Object.keys(result).length != 0) {
                                                let value = result.revenue && result.revenue.split(';');
                                                value = value.sort((a, b) => parseInt(a.slice(0, 3)) - parseInt(b.slice(0, 3)));
                                                const indexYear = value.findIndex(item => item.startsWith(year));
                                                if (indexYear != -1) {
                                                    const newItem = value[indexYear].split(':');
                                                    newItem[2] = parseInt(newItem[2]);
                                                    newItem[2] = newItem[2] + parseInt(data.fee);
                                                    value[indexYear] = newItem.join(':');
                                                    data.revenue = value.join(';');
                                                } else {
                                                    const indexPreviousYear = value.findIndex(item => item.startsWith(year - 1));
                                                    if (indexPreviousYear != -1) {
                                                        const newItem = value[indexPreviousYear].split(':');
                                                        newItem[2] = parseInt(newItem[2]);
                                                        newItem[2] = newItem[2] + parseInt(data.fee);
                                                        data.revenue = result.revenue + year + ':revenue:' + newItem[2];
                                                    } else {
                                                        data.revenue = result.revenue + year + ':revenue:' + parseInt(data.fee);
                                                    }
                                                }
                                                app.model.setting.set(data, err => {
                                                    if (err) {
                                                        res.send({ error: 'Update doanh thu hàng năm bị lỗi' });
                                                    } else {
                                                        if(courseFee && (fee-data.fee) <= 0){
                                                            if(courseFee == data.fee){
                                                                app.model.student.update({_id: item._id}, {activeKhoaLyThuyet: true, activeKhoaThucHanh: true, soGioThucHanhTangThem: 1}, (error, student) => res.send({ error, item: student}));
                                                            } else {
                                                                app.model.student.update({_id: item._id}, {activeKhoaLyThuyet: true, activeKhoaThucHanh: true}, (error, student) => res.send({ error, item: student}));
                                                            }
                                                        } else if(courseFee && (fee-data.fee) <= (courseFee/2)){
                                                            app.model.student.update({_id: item._id}, {activeKhoaLyThuyet: true}, (error, student) => res.send({ error, item: student}));
                                                        } else res.send({ error, student: item });
                                                    }
                                                });
                                            } else {
                                                data.revenue = year + ':revenue:' + parseInt(data.fee);
                                                app.model.setting.set(data, err => {
                                                    if (err) {
                                                        res.send({ error: 'Update doanh thu hàng năm bị lỗi' });
                                                    } else {
                                                        if(courseFee && ((fee-data.fee) <= (courseFee/2))){
                                                            app.model.student.update({_id: item._id}, {activeKhoaLyThuyet: true}, (error, student) => res.send({ error, item: student}));
                                                        } else res.send({ error, student: item });
                                                    }
                                                });
                                            }
                            
                                        });
                                    }
                                });
                                
                            }
                        });
                    });
                } else {
                    app.model.student.addPayment({ _id: item._id }, data, (error, item) => {
                        if(error) res.send({error});
                        else{
                            const revenue = {
                                payer: studentId,
                                receiver: req.session.user._id,
                                fee: data.fee,
                                date: new Date(),
                                type: 'offline',
                                course: item.course && item.course._id,
                                courseType: item.courseType && item.courseType._id,
                            };
                            app.model.revenue.create(revenue, (error) => {
                                if (error) res.send({error});
                                else {
                                    app.model.setting.get('revenue', result => {
                                        if (result && Object.keys(result).length != 0) {
                                            let value = result.revenue && result.revenue.split(';');
                                            value = value.sort((a, b) => parseInt(a.slice(0, 3)) - parseInt(b.slice(0, 3)));
                                            const indexYear = value.findIndex(item => item.startsWith(year));
                                            if (indexYear != -1) {
                                                const newItem = value[indexYear].split(':');
                                                newItem[2] = parseInt(newItem[2]);
                                                newItem[2] = newItem[2] + parseInt(data.fee);
                                                value[indexYear] = newItem.join(':');
                                                data.revenue = value.join(';');
                                            } else {
                                                const indexPreviousYear = value.findIndex(item => item.startsWith(year - 1));
                                                if (indexPreviousYear != -1) {
                                                    const newItem = value[indexPreviousYear].split(':');
                                                    newItem[2] = parseInt(newItem[2]);
                                                    newItem[2] = newItem[2] + parseInt(data.fee);
                                                    data.revenue = result.revenue + year + ':revenue:' + newItem[2];
                                                } else {
                                                    data.revenue = result.revenue + year + ':revenue:' + parseInt(data.fee);
                                                }
                                            }
                                            app.model.setting.set(data, err => {
                                                if (err) {
                                                    res.send({ error: 'Update doanh thu hàng năm bị lỗi' });
                                                } else {
                                                    if(courseFee && (fee-data.fee) <= 0){
                                                        if(courseFee == data.fee){
                                                            app.model.student.update({_id: item._id}, {activeKhoaLyThuyet: true, activeKhoaThucHanh: true, soGioThucHanhTangThem: 1}, (error, student) => res.send({ error, item: student}));
                                                        } else {
                                                            app.model.student.update({_id: item._id}, {activeKhoaLyThuyet: true, activeKhoaThucHanh: true}, (error, student) => res.send({ error, item: student}));
                                                        }
                                                    } else if(courseFee && (fee-data.fee) <= (courseFee/2)){
                                                        app.model.student.update({_id: item._id}, {activeKhoaLyThuyet: true}, (error, student) => res.send({ error, item: student}));
                                                    } else res.send({ error, student: item });
                                                }
                                            });
                                        } else {
                                            data.revenue = year + ':revenue:' + parseInt(data.fee);
                                            app.model.setting.set(data, err => {
                                                if (err) {
                                                    res.send({ error: 'Update doanh thu hàng năm bị lỗi' });
                                                } else {
                                                    if(courseFee && ((fee-data.fee) <= (courseFee/2))){
                                                        app.model.student.update({_id: item._id}, {activeKhoaLyThuyet: true}, (error, student) => res.send({ error, item: student}));
                                                    } else res.send({ error, student: item });
                                                }
                                            });
                                        }
                        
                                    });
                                }
                            });
                            
                        }
                    });
                }
                
            }
        });
    });

    app.post('/api/student/payment-extra', app.permission.check('courseFee:write'), (req, res) => {
        const studentId = req.body._studentId;
        const year = new Date().getFullYear();
        app.model.student.get({ _id: studentId }, (error, student) => {
            if (error) {
                res.send({ error });
            } else if (!student) {
                res.send({ check: 'Không tìm thấy học viên!' });
            } else {
                const cartItem = student.cart ? student.cart.item : [],
                transactionId = student.cart ? student.cart.transactionId : '';
                const data = {item:  cartItem, transactionId};
                app.model.student.addPaymentExtra({ _id: student._id }, data, (error) => {
                    if(error) res.send({error});
                    else{
                        const fee = cartItem.reduce((result,item) => result + parseInt(item.fees) , 0);
                        const revenue = {
                            payer: studentId,
                            receiver: req.session.user._id,
                            fee: fee,
                            date: new Date(),
                            type: 'offline',
                            course: student.course && student.course._id,
                            courseType: student.courseType && student.courseType._id,
                        };
                        app.model.revenue.create(revenue, (error) => {
                            if(error) res.send({ error });
                            else {
                                app.model.setting.get('revenue', result => {
                                    let dataRevenue = {};
                                    if (result && Object.keys(result).length != 0) {
                                        let value = result.revenue && result.revenue.split(';');
                                        value = value.sort((a, b) => parseInt(a.slice(0, 3)) - parseInt(b.slice(0, 3)));
                                        const indexYear = value.findIndex(item => item.startsWith(year));
                                        if (indexYear != -1) {
                                            const newItem = value[indexYear].split(':');
                                            newItem[2] = parseInt(newItem[2]);
                                            newItem[2] = newItem[2] + parseInt(fee);
                                            value[indexYear] = newItem.join(':');
                                            dataRevenue.revenue = value.join(';');
                                        } else {
                                            const indexPreviousYear = value.findIndex(item => item.startsWith(year - 1));
                                            if (indexPreviousYear != -1) {
                                                const newItem = value[indexPreviousYear].split(':');
                                                newItem[2] = parseInt(newItem[2]);
                                                newItem[2] = newItem[2] + parseInt(fee);
                                                dataRevenue.revenue = result.revenue + year + ':revenue:' + newItem[2];
                                            } else {
                                                dataRevenue.revenue = result.revenue + year + ':revenue:' + parseInt(fee);
                                            }
                                        }
                                        app.model.setting.set(dataRevenue, err => {
                                            if (err) {
                                                res.send({ error: 'Update doanh thu hàng năm bị lỗi' });
                                            } else {
                                                app.model.student.update({_id: student._id}, {cart: {}}, (error, student) => res.send({ error, item: student}));
                                            }
                                        });
                                    } else {
                                        dataRevenue.revenue = year + ':revenue:' + parseInt(fee);
                                        app.model.setting.set(dataRevenue, err => {
                                            if (err) {
                                                res.send({ error: 'Update doanh thu hàng năm bị lỗi' });
                                            } else {
                                                app.model.student.update({_id: student._id}, {cart: {}}, (error, student) => res.send({ error, item: student}));
                                            }
                                        });
                                    }
                    
                                });
                            }
                        });
                       
                    }
                });
            }
        });
    });

    app.delete('/api/student', app.permission.check('student:delete'), (req, res) => {
        app.model.student.delete(req.body._id, (error) => res.send({ error }));
    });

    app.get('/api/student/score', app.permission.check('user:login'), (req, res) => {//mobile
        const _userId = req.session.user._id,
            _courseId = req.query.courseId;
        app.model.student.get({ user: _userId, course: _courseId }, (error, item) => {
            res.send({ error, item: item && item.tienDoHocTap?item.tienDoHocTap:{} });
        });
    });

    app.get('/api/student/subject/score', app.permission.check('user:login'), (req, res) => {//mobile
        const _userId = req.session.user._id,
            _courseId = req.query.courseId;
        app.model.student.get({ user: _userId, course: _courseId }, (error, item) => {
            res.send({ error, item: item && item.tienDoThiHetMon });
        });
    });

    app.get('/api/student/export/:_courseId/:filter', app.permission.check('course:read'), (req, res) => {
        let pageNumber = parseInt(req.params.pageNumber),
            pageSize = parseInt(req.params.pageSize),
            condition = req.query.pageCondition || {},
            pageCondition = { courseType: req.params._courseId || { $ne: null }, course: { $ne: null } },
            filter = req.params.filter;
        function dateToText(date) {
            const newDate = new Date(date);
            let year = newDate.getFullYear();
            let month = (1 + newDate.getMonth()).toString().padStart(2, '0');
            let day = newDate.getDate().toString().padStart(2, '0');
            return day + '/' + month + '/' + year;
        }
        try {
            if (req.session.user.isCourseAdmin && req.session.user.division && req.session.user.division.isOutside) { // Session user là quản trị viên khóa học
                pageCondition.division = req.session.user.division._id;
            }

            if (condition.courseType) pageCondition.courseType = condition.courseType;
            if (filter == 'HVChuaDatSatHach') pageCondition.datSatHach = false;
            if (filter == 'HVChuaTotNghiep') {
                pageCondition.diemThucHanh = { $exists: true, $gte: 5 };
                pageCondition.totNghiep = false;
            }
            if (condition.searchText) {
                const value = { $regex: `.*${condition.searchText}.*`, $options: 'i' };
                pageCondition.$or = [
                    // { phoneNumber: value },
                    // { email: value },
                    { firstname: value },
                    { lastname: value },
                    { identityCard: value },
                ];
            }
            app.model.student.getPage(pageNumber, pageSize, pageCondition, (error, page) => {
                const students = page && page.list ? page.list.map(item => item = app.clone(item)) : [];
                const workbook = app.excel.create(), worksheet = workbook.addWorksheet(filter);
                const cells = [
                    { cell: 'A1', value: 'STT', bold: true, border: '1234' },
                    { cell: 'B1', value: 'Họ', bold: true, border: '1234' },
                    { cell: 'C1', value: 'Tên', bold: true, border: '1234' },
                    { cell: 'D1', value: 'CMND/CCCD', bold: true, border: '1234' },
                    { cell: 'E1', value: 'Khóa học', bold: true, border: '1234' },
                ];

                let columns = [
                    { header: 'STT', key: '_id', width: 5 },
                    { header: 'Họ', key: 'lastname', width: 15 },
                    { header: 'Tên', key: 'firstname', width: 15 },
                    { header: 'CMND/CCCD', key: 'identityCard', width: 15 },
                    { header: 'Khóa học', key: 'course', width: 40 },
                ];

                if (filter == 'HVChuaTotNghiep') {
                    cells.push(
                        { cell: 'F1', value: 'Ngày dự kiến thi tốt nghiệp', bold: true, border: '1234' },
                        { cell: 'G1', value: 'Lý do chưa tốt nghiệp', bold: true, border: '1234' }
                    );
                    columns.push(
                        { header: 'Ngày dự kiến thi tốt nghiệp', key: 'ngayDuKienThiTotNghiep', width: 30 },
                        { header: 'Lý do chưa tốt nghiệp', key: 'liDoChuaTotNghiep', width: 80 },
                    );
                } else if (filter == 'HVChuaDatSatHach') {
                    cells.push(
                        { cell: 'F1', value: 'Ngày dự kiến thi sát hạch', bold: true, border: '1234' },
                        { cell: 'G1', value: 'Lý do chưa đạt sát hạch', bold: true, border: '1234' }
                    );
                    columns.push(
                        { header: 'Ngày dự kiến thi sát hạch', key: 'ngayDuKienThiSatHach', width: 30 },
                        { header: 'Lý do chưa đạt sát hạch', key: 'liDoChuaDatSatHach', width: 80 },
                    );
                }
                worksheet.columns = columns;
                students.forEach((student, index) => {
                    const obj = {
                        _id: index + 1,
                        lastname: student.lastname,
                        firstname: student.firstname,
                        identityCard: student.identityCard,
                        course: student.course ? student.course.name : '',
                    };
                    if (filter == 'HVChuaTotNghiep') {
                        obj['ngayDuKienThiTotNghiep'] = student.ngayDuKienThiTotNghiep ? dateToText(student.ngayDuKienThiTotNghiep) : '';
                        obj['liDoChuaTotNghiep'] = student.liDoChuaTotNghiep ? student.liDoChuaTotNghiep : '';
                    } else if (filter == 'HVChuaDatSatHach') {
                        obj['ngayDuKienThiSatHach'] = student.ngayDuKienThiSatHach;
                        obj['liDoChuaDatSatHach'] = student.liDoChuaDatSatHach ? student.liDoChuaDatSatHach : '';
                    }
                    worksheet.addRow(obj);
                });
                app.excel.write(worksheet, cells);
                app.excel.attachment(workbook, res, 'DanhSachHocVien.xlsx');
            });
        } catch (error) {
            res.send({ error });
        }
    });

    app.get('/api/student/official/export/:filter', app.permission.check('student:write'), (req, res) => {
        const filter = req.params.filter && req.params.filter!='all'?JSON.parse(req.params.filter):{};
        let pageCondition={};
        filter && app.handleFilter(filter,['division','courseType','course'],filterCondition=>{
            pageCondition={...filterCondition};
        });
        if(filter.fullName){// họ tên
            pageCondition['$expr']= {
                '$regexMatch': {
                    'input': { '$concat': ['$lastname', ' ', '$firstname'] },
                    'regex': `.*${filter.fullName}.*`,  //Your text search here
                    'options': 'i'
                }
            };
        }
        new Promise((resolve,reject)=>{
            app.model.course.getAll({isDefault:true},(error,defaultCourses)=>error?reject(error):resolve(defaultCourses));
        }).then(defaultCourses=>new Promise((resolve,reject)=>{
            if(!pageCondition.course && defaultCourses.length){
                pageCondition.course={$nin:defaultCourses.map(course=>course._id)};
            }
            app.model.student.getAll(pageCondition,(error,students)=>error?reject(error):resolve(students));
        })).then(list=> {// print report
            const workbook = app.excel.create(), worksheet = workbook.addWorksheet('Học viên');
            const cells = [
                { cell: 'A1', value: 'STT', bold: true, border: '1234' },
                { cell: 'B1', value: 'họ', bold: true, border: '1234' },
                { cell: 'C1', value: 'tên', bold: true, border: '1234' },
                { cell: 'D1', value: 'email', bold: true, border: '1234' },
                { cell: 'E1', value: 'Số điện thoại', bold: true, border: '1234' },
                { cell: 'F1', value: 'Giới tính', bold: true, border: '1234' },
                { cell: 'G1', value: 'Ngày sinh', bold: true, border: '1234' },
                { cell: 'H1', value: 'Quốc tịch', bold: true, border: '1234' },
                { cell: 'I1', value: 'Nơi cư trú', bold: true, border: '1234' },
                { cell: 'J1', value: 'Nơi đăng ký hộ khẩu thường trú', bold: true, border: '1234' },
                { cell: 'K1', value: 'Số CMND,CCCD', bold: true, border: '1234' },
                { cell: 'L1', value: 'Nơi cấp CMND,CCCD', bold: true, border: '1234' },
                { cell: 'M1', value: 'Ngày cấp CMND,CCCD', bold: true, border: '1234' },
                { cell: 'N1', value: 'Bản sao CMND,CCCD', bold: true, border: '1234' },
                { cell: 'O1', value: 'Số GPLX 2 bánh', bold: true, border: '1234' },
                { cell: 'P1', value: 'Ngày trúng tuyển GPLX 2 bánh', bold: true, border: '1234' },
                { cell: 'Q1', value: 'Nơi cấp GPLX 2 bánh', bold: true, border: '1234' },
                { cell: 'R1', value: 'Bản sao bằng lái A1', bold: true, border: '1234' },
                { cell: 'S1', value: 'Giấy khám sức khỏe', bold: true, border: '1234' },
                { cell: 'T1', value: 'Ngày khám sức khỏe', bold: true, border: '1234' },
                { cell: 'U1', value: 'Hình thẻ 3x4', bold: true, border: '1234' },
                { cell: 'V1', value: 'Hình chụp trực tiếp', bold: true, border: '1234' },
                { cell: 'W1', value: 'Hạng đăng ký', bold: true, border: '1234' },
                { cell: 'X1', value: 'Khóa học', bold: true, border: '1234' },
                { cell: 'Y1', value: 'Đơn', bold: true, border: '1234' },
            ];
            worksheet.columns = [
                { key: 'idx', header: 'STT', width: 10  },
                { key: 'lastname', header: 'họ', width: 20  },
                { key: 'firstname', header: 'tên', width: 10  },
                { key: 'email', header: 'email', width: 15  },
                { key: 'phoneNumber', header: 'Số điện thoại', width: 15 },
                { key: 'sex', header: 'Giới tính', width: 10 },
                { key: 'birthday', header: 'Ngày sinh', width: 15 },
                { key: 'nationality', header: 'Quốc tịch', width: 15 },
                { key: 'residence', header: 'Nơi cư trú', width: 25 },
                { key: 'regularResidence', header: 'Nơi đăng ký hộ khẩu thường trú', width: 25  },
                { key: 'identityCard', header: 'Số CMND,CCCD', width: 15 },
                { key: 'identityIssuedBy', header: 'Nơi cấp CMND,CCCD', width: 25  },
                { key: 'identityDate', header: 'Ngày cấp CMND,CCCD', width: 15  },
                { key: 'isIdentityCard', header: 'Bản sao CMND,CCCD', width: 20  },
                { key: 'giayPhepLaiXe2BanhSo', header: 'Số GPLX 2 bánh', width: 20  },
                { key: 'giayPhepLaiXe2BanhNgay', header: 'Ngày trúng tuyển GPLX 2 bánh', width: 25  },
                { key: 'giayPhepLaiXe2BanhNoiCap', header: 'Nơi cấp GPLX 2 bánh', width: 20  },
                { key: 'isBangLaiA1', header: 'Bản sao bằng lái A1', width: 20  },
                { key: 'giayKhamSucKhoe', header: 'Giấy khám sức khỏe', width: 20  },
                { key: 'giayKhamSucKhoeNgayKham', header: 'Ngày khám sức khỏe', width: 20 },
                { key: 'hinhThe3x4', header: 'Hình thẻ 3x4', width: 20 },
                { key: 'hinhChupTrucTiep', header: 'Hình chụp trực tiếp', width: 20 },
                { key: 'courseType', header: 'Hạng đăng ký', width: 20 },
                { key: 'course', header: 'Khóa học', width: 20 },
                { key: 'isDon', header: 'Đơn', width: 10 },
            ];
            list.forEach((student, index) => {
                worksheet.addRow({
                    idx: index + 1,
                    lastname:student.lastname,
                    firstname:student.firstname,
                    email:student.user?student.user.email:'',
                    phoneNumber: student.user?student.user.phoneNumber:'',
                    sex: student.sex,
                    birthday: student.birthday,
                    nationality: student.nationality,
                    residence: student.residence,
                    regularResidence: student.regularResidence,
                    identityCard: student.identityCard,
                    identityIssuedBy: student.identityIssuedBy,
                    identityDate: student.identityDate,
                    isIdentityCard: student.isIdentityCard?'x':'',
                    giayPhepLaiXe2BanhSo: student.giayPhepLaiXe2BanhSo,
                    giayPhepLaiXe2BanhNgay: student.giayPhepLaiXe2BanhNgay,
                    giayPhepLaiXe2BanhNoiCap: student.giayPhepLaiXe2BanhNoiCap,
                    isBangLaiA1: student.isBangLaiA1?'x':'',
                    giayKhamSucKhoe: student.giayKhamSucKhoe?'x':'',
                    giayKhamSucKhoeNgayKham: student.giayKhamSucKhoeNgayKham,
                    hinhThe3x4: student.hinhThe3x4?'x':'',
                    hinhChupTrucTiep: student.hinhChupTrucTiep?'x':'',
                    courseType: student.courseType?student.courseType.title:'',
                    course: student.course?student.course.name:'',
                    isDon: student.isDon?'x':'',
                });
            });
            app.excel.write(worksheet, cells);
            app.excel.attachment(workbook, res, 'HOC_VIEN.xlsx');
        }).catch(error=>console.log(error)||res.send({error}));
    });
    // Active Course APIs -----------------------------------------------------------------------------------------------

    app.get('/api/student/active-course/page/:pageNumber/:pageSize', app.permission.check('activeCourse:read'), (req, res) => {
        let pageNumber = parseInt(req.params.pageNumber),
            pageSize = parseInt(req.params.pageSize),
            condition = req.query.pageCondition || {},
            pageCondition = {};

        try {
            if (req.session.user.isCourseAdmin && req.session.user.division && req.session.user.division.isOutside) { // Session user là quản trị viên khóa học
                pageCondition.division = req.session.user.division._id;
            }
            if (condition.searchText) {
                const value = { $regex: `.*${condition.searchText}.*`, $options: 'i' };
                pageCondition.$or = [
                    { firstname: value },
                    { lastname: value },
                    { identityCard: value },
                ];
            }
            app.model.student.getPage(pageNumber, pageSize, pageCondition, (error, page) => res.send({ error, page }));
        } catch (error) {
            res.send({ error });
        }
    });

    app.put('/api/student/active-course', app.permission.check('activeCourse:write'), (req, res) => {
            const {_id, type} = req.body;
        app.model.student.get({ _id }, (error, item) => {
            if (error) {
                res.send({ error });
            } else if (!item) {
                res.send({ check: 'Không tìm thấy học viên!' });
            } else {
                if(type=='lyThuyet'){//TODO:Gán khóa học mặc định cho học viên,
                    app.model.student.update({_id: item._id},{activeKhoaLyThuyet:true}, (error, student) => res.send({ error, item: student}));

                }else if(type=='thucHanh'){
                    //TODO: Gán khóa học mặc định cho học viên.
                    // Để trong khi chờ courseAdmin gán khóa học thì học viên vẫn có khóa học lý thuyết để học trước.
                    app.model.course.get({isDefault: true, courseType: item.courseType}, (error,course) =>{
                        if(error || !course) res.send({error:'Không tìm thấy khóa học mặc định!'});
                        else{
                            app.model.student.update({_id: item._id},{course: course._id,activeKhoaLyThuyet:true,activeKhoaThucHanh:true}, (error, student) => res.send({ error, item: student}));
                        }
                    }); 
                }
            }
        });
    });

    // Tiến độ học tập APIS--------------------------------------------------------------------------------------------
    app.put('/api/student/learning-progress/done', app.permission.check('student:write'), (req, res) => {
        const {studentId,courseId,type} = req.body;
        new Promise((resolve,reject)=>{
            //get student
            app.model.student.get({_id:studentId,course:courseId},(error,student)=>{
                error?reject(error):resolve(student);
            });
        }).then(student=> new Promise((resolve,reject)=>{
            // get course
            app.model.course.get({_id:courseId},(error,course)=>{
                error?reject(error):resolve({student,course});
            });
        })).then(({student,course})=> new Promise((resolve,reject)=>{
            // map data subject, lesson, video, question into course.
            let subjects = course.subjects;
            subjects=subjects.filter(subject=>{
                if(type=='lyThuyet'){
                    return !subject.monThucHanh;
                }else if(type=='thucHanh'){
                    return subject.monThucHanh;
                }else{
                    return true;
                }
            });
            if(subjects && subjects.length){
                let promiseList = [];
                subjects.forEach(item=>{
                    const subjectPromise = new Promise((resolve,reject)=>{
                        app.model.subject.get({_id:item._id},(error,subject)=>{
                            if(error) reject(error);
                            else{
                                resolve(subject);
                            }
                        });
                    }).catch(error=>reject(error));

                    promiseList.push(subjectPromise);
                });
                promiseList.length && Promise.all(promiseList).then(subjects => {
                    course.subjects=subjects;
                    resolve({student,course});
                }).catch(error => reject(error));
            }else{
                reject('Không có môn học');
            }
        })).then(({student,course})=>{
            const randomIntFromInterval=(min, max)=> { // random from min to max 
                return Math.floor(Math.random() * (max - min + 1) + min);
            };
            const subjects = course.subjects;
            let tienDoHocTap = student.tienDoHocTap || {};
            let tienDoHocTapNew = {};
            let tienDoThiHetMon = student.tienDoThiHetMon || {};
            let tienDoThiHetMonNew = {};
            subjects.forEach(subject=>{
                tienDoHocTapNew[subject._id]={};
                // nếu là môn lý thuyết thì sẽ có tiến độ thi hết môn.
                const randomDiemThiHetMon = randomIntFromInterval(5,10);
                if(!course.monThucHanh) tienDoThiHetMonNew[subject._id]={score:randomDiemThiHetMon,diemTB:randomDiemThiHetMon/10};
                const lessons = subject.lessons;
                lessons.forEach(lesson=>{
                    tienDoHocTapNew[subject._id][lesson._id]={
                        view:'true',
                        diemTB:1,
                        score:5,
                        state:'pass',
                        isPass:'true',
                        totalSeconds : randomIntFromInterval(2700,3600),
                    };
                });
            });
            Object.assign(tienDoHocTap, tienDoHocTapNew);
            Object.assign(tienDoThiHetMon, tienDoThiHetMonNew);
            app.model.student.update(studentId,{tienDoHocTap,tienDoThiHetMon},(error,item)=>{
                res.send({error,item});
            });
        }).catch(error=>console.log(error)||res.send({error}));
    });

    // Pre-student APIs -----------------------------------------------------------------------------------------------
    app.get('/api/pre-student/page/:pageNumber/:pageSize', app.permission.check('pre-student:read'), (req, res) => {
        let pageNumber = parseInt(req.params.pageNumber),
            pageSize = parseInt(req.params.pageSize),
            condition = req.query.condition || {},filter=req.query.filter||null,sort=req.query.sort||null,
            pageCondition = { course: null };
            app.model.course.getAll({isDefault:true},(error,defaultCourses)=>{
                if(error)res.send('không có khóa học mặc định');
                else{
                    const defaultIds = defaultCourses.map(item=>item._id.toString());
                    pageCondition.course={};
                    pageCondition.course={['$in']:[...defaultIds,null]};
                    if (req.session.user.isCourseAdmin && req.session.user.division && req.session.user.division.isOutside) { // Session user là quản trị viên khóa học
                        pageCondition.division = req.session.user.division._id;
                    }
        
                    if (condition.courseType) pageCondition.courseType = condition.courseType;
                    if (condition.searchPlanCourse) pageCondition.planCourse = { $regex: `.*${condition.searchPlanCourse}.*`, $options: 'i' };
                    if (condition.searchText) {
                        const value = { $regex: `.*${condition.searchText}.*`, $options: 'i' };
                        pageCondition['$or'] = [
                            { firstname: value },
                            { lastname: value },
                            { identityCard: value },
                        ];
                    }
                    if(filter){
                        app.handleFilter(filter,['fullName','courseType','division'],filterCondition=>{
                            pageCondition={...pageCondition,...filterCondition};
                        });
                    }
                    if(sort && sort.fullName) sort={firstname:sort.fullName}; 

                    app.model.student.getPage(pageNumber, pageSize, pageCondition, sort, (error, page) => {
                        res.send({ error, page });
                    });
                }
            });
            // try {
            // if (req.session.user.isCourseAdmin && req.session.user.division && req.session.user.division.isOutside) { // Session user là quản trị viên khóa học
            //     pageCondition.division = req.session.user.division._id;
            // }

            // if (condition.courseType) pageCondition.courseType = condition.courseType;
            // if (condition.searchPlanCourse) pageCondition.planCourse = { $regex: `.*${condition.searchPlanCourse}.*`, $options: 'i' };
            // if (condition.searchText) {
            //     const value = { $regex: `.*${condition.searchText}.*`, $options: 'i' };
            //     pageCondition['$or'] = [
            //         { firstname: value },
            //         { lastname: value },
            //         { identityCard: value },
            //     ];
            // }

            // app.model.student.getPage(pageNumber, pageSize, pageCondition, req.query.sort, (error, page) => {
            //     res.send({ error, page });
            // });
            // } catch (error) {
            //     res.send({ error });
            // }
    });

    app.get('/api/pre-student/course/page/:pageNumber/:pageSize/:courseType', app.permission.check('pre-student:read'), (req, res) => {
        let pageNumber = parseInt(req.params.pageNumber),
            pageSize = parseInt(req.params.pageSize),
            courseType = req.params.courseType,
            condition = req.query.condition || {};
            app.model.course.get({courseType,isDefault:true},(error,defaultCourse)=>{
                if(error||!defaultCourse) res.send({error:'không tìm thấy khóa mặc định!'});
                // Những ứng viên được phép gán khóa học chính thức thì phải có khóa mặc định
                else{
                    let pageCondition = { 
                        ['$and']:[{
                        //điều kiện ứng viên: chưa có khóa chính thức.
                            ['$or']:[
                                {course:defaultCourse}
                            ]
                        }] 
                    };
                    if (req.session.user.isCourseAdmin && req.session.user.division && req.session.user.division.isOutside) { // Session user là quản trị viên khóa học
                        // pageCondition.division = req.session.user.division._id;
                        pageCondition['$and'].push({division:req.session.user.division._id});
                    }

                    // if (condition.searchPlanCourse) pageCondition.planCourse = { $regex: `.*${condition.searchPlanCourse}.*`, $options: 'i' };
                    if (condition.searchPlanCourse) pageCondition['$and'].push({planCourse:{ $regex: `.*${condition.searchPlanCourse}.*`, $options: 'i' }});
                    if (condition.searchText) {
                        const value = { $regex: `.*${condition.searchText}.*`, $options: 'i' };   
                        pageCondition['$and'].push({['$or']:[
                            { firstname: value },
                            { lastname: value },
                            { identityCard: value },
                        ]});
                    }
        
                    if(pageCondition['$and'].length==0) delete pageCondition.$and;
        
                    app.model.student.getPage(pageNumber, pageSize, pageCondition, req.query.sort, (error, page) => {
                        res.send({ error, page });
                    });
                }
            });
            
            
    });

    const getDefaultCourse = courseType=>new Promise((resolve,reject)=>{//hàm lấy khóa học mặc định
        if(!courseType){
            reject('Không tìm thấy khóa học mặc định');
        }else{
            app.model.course.get({courseType,isDefault:true},(error,item)=>{
                if(error || !item) reject('Không tìm thấy khóa học mặc định');
                else{
                    resolve(item._id);
                }
            });
        }
        
    });

    app.post('/api/pre-student', app.permission.check('pre-student:write'), (req, res) => {
        let data = req.body.student;
        function convert(str) {
            let date = new Date(str),
                mnth = ('0' + (date.getMonth() + 1)).slice(-2),
                day = ('0' + date.getDate()).slice(-2);
            return [day, mnth, date.getFullYear()].join('');
        }
        delete data.course; // Không được gán khóa học cho pre-student
        if(!data.discount||data.discount=='') delete data.discount;
        const createNewUser = new Promise((resolve, reject) => { // Tạo user cho pre
            app.model.user.get({ identityCard: data.identityCard }, (error, user) => {
                if (error) {
                    reject('Lỗi khi đọc thông tin người dùng!');
                } else if (user) {
                    resolve(user._id);
                } else { // pre chưa là user
                    const dataPassword = convert(data.birthday),
                        newUser = {
                            identityCard: data.identityCard,
                            email: data.email,
                            firstname: data.firstname,
                            lastname: data.lastname,
                            phoneNumber: data.phoneNumber,
                            division: data.division || req.session.user.division,
                            password: dataPassword,
                            birthday: data.birthday,
                        };
                    app.model.user.create(newUser, (error, user) => {
                        if (error) {
                            reject('Lỗi khi tạo người dùng!');
                        } else { // Tạo user thành công. Gửi email & password đến người dùng!
                            resolve(user._id);
                            // app.model.setting.get('email', 'emailPassword', 'emailCreateMemberByAdminTitle', 'emailCreateMemberByAdminText', 'emailCreateMemberByAdminHtml', result => {
                            //     const url = `${app.isDebug || app.rootUrl}/active-user/${user._id}`,
                            //         fillParams = (data) => data.replaceAll('{name}', `${user.lastname} ${user.firstname}`)
                            //             .replaceAll('{firstname}', user.firstname).replaceAll('{lastname}', user.lastname)
                            //             .replaceAll('{email}', user.email).replaceAll('{password}', dataPassword).replaceAll('{url}', url),
                            //         mailTitle = result.emailCreateMemberByAdminTitle,
                            //         mailText = fillParams(result.emailCreateMemberByAdminText),
                            //         mailHtml = fillParams(result.emailCreateMemberByAdminHtml);
                            //     app.email.sendEmail(result.email, result.emailPassword, user.email, app.email.cc, mailTitle, mailText, mailHtml, null);
                            // });
                        }
                    });
                }
            });
        });
        // .then(_userId => { // Tạo student 
        //     data.user = _userId;   // assign id of user to user field of prestudent
        //     delete data.email;
        //     delete data.phoneNumber;
        //     app.model.student.create(data, (error, item) => {
        //         if (error || item == null || item.image == null) {
        //             res.send({ error, item });
        //         } else {
        //             app.uploadImage('pre-student', app.model.student.get, item._id, item.image, data => {
        //                 res.send(data);
        //             });
        //         }
        //     });
        // }).catch(error => res.send({ error }));

        Promise.all([createNewUser,getDefaultCourse(data.courseType)]).then(([_userId,_defaultCourseId]) => {
            data.user = _userId;   // assign id of user to user field of prestudent
            delete data.email;
            delete data.phoneNumber;
            data.course=_defaultCourseId;
            app.model.student.create(data, (error, item) => {
                if (error || item == null || item.image == null) {
                    res.send({ error, item });
                } else {
                    app.uploadImage('pre-student', app.model.student.get, item._id, item.image, data => {
                        res.send(data);
                    });
                }
            });
        }).catch(error => console.log(error) || res.send({ error }));
    });

    app.post('/api/pre-student/import', app.permission.check('pre-student:write'), (req, res) => {
        const sessionUser = req.session.user;
        let students = req.body.students;
        let studentError = []; // những học viên có số CMND,CCCD của giáo viên dự kiến sai
        let err = null;
        function convert(str) {
            let date = new Date(str),
                mnth = ('0' + (date.getMonth() + 1)).slice(-2),
                day = ('0' + date.getDate()).slice(-2);
            return [day, mnth, date.getFullYear()].join('');
        }

        getDefaultCourse(req.body.courseType).then(defaultCourse=>{
            if (students && students.length) {
                const handleCreateStudent = (index = 0) => {
                    if (index == students.length) {
                        const dataEncryption ={
                            author: sessionUser._id,
                            type: 'export',
                            filename: 'Import danh sách ứng viên.xlsx',
                            chucVu: 'Tuyển sinh',
                        };
                        app.model.encryption.create(dataEncryption, () => {
                            res.send({ error: err, studentError });
                        });
                    } else {
                        const student = students[index];
                        student.division = req.body.division;
                        const dataPassword = convert(student.birthday),
                            newUser = { ...student, password: dataPassword, active: true };
                        app.model.user.create(newUser, (error, user) => {
                            if (error && !user) {
                                err = error;
                                handleCreateStudent(index + 1);
                            } else { 
                                student.user = user._id;   // assign id of user to user field of prestudent
                                student.courseType = req.body.courseType;
                                student.course = defaultCourse._id;
                                student.courseFee = req.body.courseFee;
                                student.discount = req.body.discount && req.body.discount!=''?req.body.discount:null;
                                student.coursePayment = req.body.coursePayment;
                                app.model.user.get({ identityCard: student.lecturerIdentityCard, isLecturer: true }, (error, user) => {
                                    if (error || !user) {
                                        studentError.push({ error: `${student.lecturerIdentityCard}` });
                                        handleCreateStudent(index + 1);
                                    } else {
                                        student.planLecturer = user._id;
                                        app.model.student.create(student, () => {
                                            handleCreateStudent(index + 1);
                                        });
                                    }
                                });
                            }
                        });
                    }
                };
                handleCreateStudent();
            } else {
                res.send({ error: 'Danh sách ứng viên trống!' });
            }
        }).catch(error=>console.log(error) || res.send({error}));
        
    });

    app.put('/api/pre-student', app.permission.check('pre-student:write'), (req, res) => {
        let { _id, changes } = req.body;
        delete changes.course; // Không được gán khóa học cho pre-student
        if(!changes.discount||changes.discount=='') delete changes.discount;
        if(changes.courseType && changes.courseType!=''){
            getDefaultCourse(changes.courseType).then(_defaultCourseId=>{
                changes.course=_defaultCourseId;
                app.model.student.update(_id, changes, (error, item) => res.send({ error, item }));
            }).catch(error=>res.send({error}));
        }else{
            app.model.student.update(_id, changes, (error, item) => res.send({ error, item }));
        }
        // Promise.all([getDefaultCourseFee(changes), getDefaultDiscount(changes), getDefaultCoursePayment(changes)]).then(([_courseFeeId, _discountId, _coursePaymentId]) => {
        //     changes.courseFee = _courseFeeId;
        //     changes.discount = _discountId;
        //     changes.coursePayment = _coursePaymentId;
        //     app.model.student.update(_id, changes, (error, item) => res.send({ error, item }));
        // }).catch(error => console.log(error) || res.send({ error }));
    });

    app.delete('/api/pre-student', app.permission.check('pre-student:delete'), (req, res) => {
        const { _id } = req.body;
        app.model.student.get(_id, (error, student) => {
            if (student) {
                if (student.course && !student.course.isDefault) {
                    res.send({ error: 'Bạn không được quyền xoá học viên!' });
                } else if (req.session.user.division && req.session.user.division.isOutside && student.user && req.session.user.division._id != student.user._id) {
                    res.send({ error: 'Bạn không được quyền xoá học viên không thuộc cơ sở của bạn!' });
                } else {
                    app.model.student.delete(_id, (error) => res.send({ error }));
                }
            } else {
                res.send({ error: error ? 'Hệ thống gặp lỗi!' : 'Ứng viên không tồn tại!' });
            }
        });
    });

    app.get('/api/pre-student/export', app.permission.check('pre-student:export'), (req, res) => {
        const sessionUser = req.session.user;
        new Promise((resolve,reject)=>{
            app.model.course.getAll({isDefault:true},(error,defaultCourses)=>error?reject(error):resolve(defaultCourses));
        }).then(defaultCourses=> new Promise((resolve,reject)=>{// get student
            const defaultIds = defaultCourses.map(item=>item._id.toString());
            app.model.student.getAll({course:{['$in']:defaultIds}},(error,students)=>error?reject(error):resolve(students));
        })).then(list=> {// print report
            const workbook = app.excel.create(), worksheet = workbook.addWorksheet('Ứng viên');
            const cells = [
                { cell: 'A1', value: 'STT', bold: true, border: '1234' },
                { cell: 'B1', value: 'họ', bold: true, border: '1234' },
                { cell: 'C1', value: 'tên', bold: true, border: '1234' },
                { cell: 'D1', value: 'email', bold: true, border: '1234' },
                { cell: 'E1', value: 'Số điện thoại', bold: true, border: '1234' },
                { cell: 'F1', value: 'Giới tính', bold: true, border: '1234' },
                { cell: 'G1', value: 'Ngày sinh', bold: true, border: '1234' },
                { cell: 'H1', value: 'Quốc tịch', bold: true, border: '1234' },
                { cell: 'I1', value: 'Nơi cư trú', bold: true, border: '1234' },
                { cell: 'J1', value: 'Nơi đăng ký hộ khẩu thường trú', bold: true, border: '1234' },
                { cell: 'K1', value: 'Số CMND,CCCD', bold: true, border: '1234' },
                { cell: 'L1', value: 'Nơi cấp CMND,CCCD', bold: true, border: '1234' },
                { cell: 'M1', value: 'Ngày cấp CMND,CCCD', bold: true, border: '1234' },
                { cell: 'N1', value: 'Bản sao CMND,CCCD', bold: true, border: '1234' },
                { cell: 'O1', value: 'Số GPLX 2 bánh', bold: true, border: '1234' },
                { cell: 'P1', value: 'Ngày trúng tuyển GPLX 2 bánh', bold: true, border: '1234' },
                { cell: 'Q1', value: 'Nơi cấp GPLX 2 bánh', bold: true, border: '1234' },
                { cell: 'R1', value: 'Bản sao bằng lái A1', bold: true, border: '1234' },
                { cell: 'S1', value: 'Giấy khám sức khỏe', bold: true, border: '1234' },
                { cell: 'T1', value: 'Ngày khám sức khỏe', bold: true, border: '1234' },
                { cell: 'U1', value: 'Hình thẻ 3x4', bold: true, border: '1234' },
                { cell: 'V1', value: 'Hình chụp trực tiếp', bold: true, border: '1234' },
                { cell: 'W1', value: 'Số CMND,CCCD của cố vấn học tập', bold: true, border: '1234' },
                { cell: 'X1', value: 'Tên cố vấn học tập', bold: true, border: '1234' },
                { cell: 'Y1', value: 'Đơn', bold: true, border: '1234' },
            ];
            worksheet.columns = [
                { key: 'idx', header: 'STT', width: 10  },
                { key: 'lastname', header: 'họ', width: 20  },
                { key: 'firstname', header: 'tên', width: 10  },
                { key: 'email', header: 'email', width: 15  },
                { key: 'phoneNumber', header: 'Số điện thoại', width: 15 },
                { key: 'sex', header: 'Giới tính', width: 10 },
                { key: 'birthday', header: 'Ngày sinh', width: 15 },
                { key: 'nationality', header: 'Quốc tịch', width: 15 },
                { key: 'residence', header: 'Nơi cư trú', width: 25 },
                { key: 'regularResidence', header: 'Nơi đăng ký hộ khẩu thường trú', width: 25  },
                { key: 'identityCard', header: 'Số CMND,CCCD', width: 15 },
                { key: 'identityIssuedBy', header: 'Nơi cấp CMND,CCCD', width: 25  },
                { key: 'identityDate', header: 'Ngày cấp CMND,CCCD', width: 15  },
                { key: 'isIdentityCard', header: 'Bản sao CMND,CCCD', width: 20  },
                { key: 'giayPhepLaiXe2BanhSo', header: 'Số GPLX 2 bánh', width: 20  },
                { key: 'giayPhepLaiXe2BanhNgay', header: 'Ngày trúng tuyển GPLX 2 bánh', width: 25  },
                { key: 'giayPhepLaiXe2BanhNoiCap', header: 'Nơi cấp GPLX 2 bánh', width: 20  },
                { key: 'isBangLaiA1', header: 'Bản sao bằng lái A1', width: 20  },
                { key: 'giayKhamSucKhoe', header: 'Giấy khám sức khỏe', width: 20  },
                { key: 'giayKhamSucKhoeNgayKham', header: 'Ngày khám sức khỏe', width: 20 },
                { key: 'hinhThe3x4', header: 'Hình thẻ 3x4', width: 20 },
                { key: 'hinhChupTrucTiep', header: 'Hình chụp trực tiếp', width: 20 },
                { key: 'lecturerIdentityCard', header: 'Số CMND,CCCD của cố vấn học tập', width: 20 },
                { key: 'lecturerName', header: 'Tên cố vấn học tập', width: 20 },
                { key: 'isDon', header: 'Đơn', width: 10 },
            ];
            list.forEach((student, index) => {
                worksheet.addRow({
                    idx: index + 1,
                    lastname:student.lastname,
                    firstname:student.firstname,
                    email:student.user?student.user.email:'',
                    phoneNumber: student.user?student.user.phoneNumber:'',
                    sex: student.sex,
                    birthday: student.birthday,
                    nationality: student.nationality,
                    residence: student.residence,
                    regularResidence: student.regularResidence,
                    identityCard: student.identityCard,
                    identityIssuedBy: student.identityIssuedBy,
                    identityDate: student.identityDate,
                    isIdentityCard: student.isIdentityCard?'x':'',
                    giayPhepLaiXe2BanhSo: student.giayPhepLaiXe2BanhSo,
                    giayPhepLaiXe2BanhNgay: student.giayPhepLaiXe2BanhNgay,
                    giayPhepLaiXe2BanhNoiCap: student.giayPhepLaiXe2BanhNoiCap,
                    isBangLaiA1: student.isBangLaiA1?'x':'',
                    giayKhamSucKhoe: student.giayKhamSucKhoe?'x':'',
                    giayKhamSucKhoeNgayKham: student.giayKhamSucKhoeNgayKham,
                    hinhThe3x4: student.hinhThe3x4?'x':'',
                    hinhChupTrucTiep: student.hinhChupTrucTiep?'x':'',
                    lecturerIdentityCard: student.lecturerIdentityCard,
                    lecturerName: student.lecturerName,
                    isDon: student.isDon?'x':'',
                });
            });
            app.excel.write(worksheet, cells);
            const dataEncryption ={
                author: sessionUser._id,
                type: 'export',
                filename: 'DANH_SACH_UNG_VIEN.xlsx',
                chucVu: 'Tuyển sinh',
            };
            app.model.encryption.create(dataEncryption, () => {
                app.excel.attachment(workbook, res, 'DANH_SACH_UNG_VIEN.xlsx');
            });
        }).catch(error=>console.log(error)||res.send({error}));
    });
    app.get('/api/student/phieu-thu/export', app.permission.check('user:login'), (req, res) => {
        const {userId, billId, feeText} = req.query;
        app.model.student.get({ _id : userId}, (error, student) => {
            if(error || !student) res.send({ error: 'Xuất file báo cáo bị lỗi'});
            else{
                const { lastname, firstname, residence, lichSuDongTien, division } = student;
                const index = lichSuDongTien.findIndex(item => item._id == billId);
                if(index != -1){
                    const lichSu = lichSuDongTien[index];
                    const data = {
                        name: lastname + ' ' + firstname,
                        residence: residence,
                        fee: lichSu.fee,
                        feeText: feeText.charAt(0).toUpperCase() + feeText.slice(1) + ' Việt Nam Đồng',
                        reason: 'Nộp học phí chính thức',
                        division:division? division.title :''
                    };     
                    app.docx.generateFile('/document/Phieu_Thu.docx', data, (error, buf) => {
                        res.send({ error: error, buf: buf });
                    });  
                } else {
                    res.send({ error: 'Không tìm thấy lịch sử mua hàng'});
                }                    
            }
        });
    });

    app.get('/api/student/debt/export/page/:pageNumber/:pageSize/:filter/:sort', app.permission.check('student:write'), (req, res) => {
        let pageNumber = parseInt(req.params.pageNumber),
            pageSize = parseInt(req.params.pageSize),
            pageCondition = {},filter=req.params.filter ? JSON.parse(req.params.filter) : {},sort=req.params.sort ? JSON.parse(req.params.sort) : null; 
        const sessionUser = req.session.user;
        const renderLichSuDongTien = (lichSuDongTien, type) => {
            let text = '';
            if (lichSuDongTien.length) {
                lichSuDongTien.forEach((item, index) => {
                    let i = index + 1;
                    if (type == 'fee') text = text + 'Lần ' + i + ': ' + item.fee + '\n';
                    else if (type == 'isOnline') text = text + 'Lần ' + i + ': ' + (item.isOnlinePayment ? 'Thanh toán online' : 'Thanh toán trực tiếp') + '\n';
                    else if (type == 'sum') text = parseInt(text + item.fee);
                });
                return text;
            } else return text;
        };
        const chechHocPhiConLai = (item) => {
            const lichSuDongTien = item && item.lichSuDongTien;
            let fee = item && item.courseFee ? item.courseFee.fee - (item.discount ? item.discount.fee : 0) : 0;
            let soTienDaDong = 0;
            lichSuDongTien && lichSuDongTien.length ? lichSuDongTien.forEach(item => {
                soTienDaDong = parseInt(soTienDaDong + item.fee);
            }) : 0;
            return fee - soTienDaDong;
        };
        try {
            if (req.session.user.isCourseAdmin && req.session.user.division && req.session.user.division.isOutside) { // Session user là quản trị viên khóa học
                pageCondition.division = req.session.user.division._id;
            }
            filter && app.handleFilter(filter,['coursePayment','fullName', 'courseFee', 'discount'],defaultFilter=>{
                pageCondition={...pageCondition,...defaultFilter};
            });
            if(sort && sort.fullName) sort = {firstname:sort.fullName};
            app.model.student.getPage(pageNumber, pageSize, pageCondition, sort, (error, page) => {
               if(page && page.list){
                    const list = page && page.list ? page.list : [];
                    const workbook = app.excel.create(), worksheet = workbook.addWorksheet('Theo Doi Cong No');
                const cells = [
                    { cell: 'A1', value: 'STT', bold: true, border: '1234' },
                    { cell: 'B1', value: 'Họ', bold: true, border: '1234' },
                    { cell: 'C1', value: 'Tên', bold: true, border: '1234' },
                    { cell: 'D1', value: 'CMND/CCCD', bold: true, border: '1234' },
                    { cell: 'E1', value: 'Loại gói', bold: true, border: '1234' },
                    { cell: 'F1', value: 'Số tiền gói', bold: true, border: '1234' },
                    { cell: 'G1', value: 'Giảm giá', bold: true, border: '1234' },
                    { cell: 'H1', value: 'Số tiền phải đóng', bold: true, border: '1234' },
                    { cell: 'I1', value: 'Số lần thanh toán', bold: true, border: '1234' },
                    { cell: 'J1', value: 'Số tiền thanh toán', bold: true, border: '1234' },
                    { cell: 'K1', value: 'Hình thức thanh toán', bold: true, border: '1234' },
                    { cell: 'L1', value: 'Số tiền đã đóng', bold: true, border: '1234' },
                    { cell: 'M1', value: 'Số tiền còn nợ', bold: true, border: '1234' },
                ];

                worksheet.columns = [
                    { header: 'STT', key: '_id', width: 15 },
                    { header: 'Họ', key: 'lastname', width: 15 },
                    { header: 'Tên', key: 'firstname', width: 15 },
                    { header: 'CMND/CCCD', key: 'identityCard', width: 15 },
                    { header: 'Loại gói', key: 'loaiGoi', width: 30 },
                    { header: 'Số tiền gói', key: 'soTienGoi', width: 15 },
                    { header: 'Giảm giá', key: 'giamGia', width: 15 },
                    { header: 'Số tiền phải đóng', key: 'soTienPhaiDong', width: 15 },
                    { header: 'Số lần thanh toán', key: 'soLanThanhToan', width: 15 },
                    { header: 'Số tiền thanh toán', key: 'soTienThanhToan', width: 40 },
                    { header: 'Hình thức thanh toán', key: 'hinhThucThanhToan', width: 40 },
                    { header: 'Số tiền đã đóng', key: 'soTienDaDong', width: 15 },
                    { header: 'Số tiền còn nợ', key: 'soTienConNo', width: 15 },

                ];
                list.forEach((item, index) => {
                    worksheet.addRow({
                        _id: index + 1,
                        lastname: item.lastname,
                        firstname: item.firstname,
                        identityCard: item.identityCard,
                        loaiGoi: item.courseFee ? item.courseFee.name : '',
                        soTienGoi: item.courseFee ? item.courseFee.fee : '',
                        giamGia: item.discount ? item.discount.fee : '',
                        soTienPhaiDong: item.courseFee ? item.courseFee.fee - (item.discount ? item.discount.fee : 0) : '',
                        soLanThanhToan: item.coursePayment ? item.coursePayment.numOfPayments : '',
                        soTienThanhToan: item.lichSuDongTien ? renderLichSuDongTien(item.lichSuDongTien, 'fee') : '',
                        hinhThucThanhToan: item.lichSuDongTien ? renderLichSuDongTien(item.lichSuDongTien, 'isOnline') : '',
                        soTienDaDong: item.lichSuDongTien ? renderLichSuDongTien(item.lichSuDongTien, 'sum') : '',
                        soTienConNo: chechHocPhiConLai(item) ? chechHocPhiConLai(item) : ''

                    });
                });
                app.excel.write(worksheet, cells);
                const dataEncryption ={
                    author: sessionUser._id,
                    type: 'export',
                    filename: 'Theo Doi Cong No.xlsx',
                    chucVu: 'Kế toán',
                };
                app.model.encryption.create(dataEncryption, () => {
                    app.excel.attachment(workbook, res, 'Theo Doi Cong No.xlsx');
                });
                }
            });
        } catch (error) {
            res.send({ error: 'Hệ thống bị lỗi!' });
        }
    });

    // User API ------------------------------------------------------------------------------------------------------
    app.get('/api/student/user', app.permission.check('user:login'), (req, res) => {
        app.model.student.get(req.query.condition, (error, item) => res.send({ error, item }));
    });

    // Hook permissionHooks -------------------------------------------------------------------------------------------
    app.permissionHooks.add('courseAdmin', 'pre-student', (user) => new Promise(resolve => {
        app.permissionHooks.pushUserPermission(user, 'pre-student:read', 'pre-student:write', 'pre-student:delete');

        // Quản lý khóa học nội bộ (isOutSide=true) thì được import danh sách ứng viên bằng file Excel
        if (user.division && !user.division.isOutside) app.permissionHooks.pushUserPermission(user, 'pre-student:import');
        resolve();
    }));

    // Hook upload images student ---------------------------------------------------------------------------------------------
    app.createFolder(app.path.join(app.publicPath, '/img/student'));

    const uploadStudentImage = (fields, files, done) => {
        if (fields.userData && fields.userData[0].startsWith('student:') && files.StudentImage && files.StudentImage.length > 0) {
            console.log('Hook: uploadStudent => student image upload');
            const _id = fields.userData[0].substring('student:'.length);
            app.uploadImage('student', app.model.student.get, _id, files.StudentImage[0].path, done);
        }
    };
    app.uploadHooks.add('uploadStudent', (req, fields, files, params, done) =>
        app.permission.has(req, () => uploadStudentImage(fields, files, done), done, 'student:write'));

    // Hook upload images pre-student ---------------------------------------------------------------------------------------------
    app.createFolder(app.path.join(app.publicPath, '/img/pre-student'));
    const uploadPreStudentImage = (fields, files, done) => {
        if (fields.userData && fields.userData[0].startsWith('pre-student:') && files.PreStudentImage && files.PreStudentImage.length > 0) {
            console.log('Hook: uploadPreStudent => pre-student image upload');
            const _id = fields.userData[0].substring('pre-student:'.length);
            app.uploadImage('pre-student', app.model.student.get, _id, files.PreStudentImage[0].path, done);
        }
    };
    app.uploadHooks.add('uploadPreStudentImage', (req, fields, files, params, done) =>
        app.permission.has(req, () => uploadPreStudentImage(fields, files, done), done, 'pre-student:write'));

    // Hook upload pre-students excel---------------------------------------------------------------------------------------
    app.uploadHooks.add('uploadExcelFile', (req, fields, files, params, done) => {
        const userData = fields.userData[0],
        profileParams = userData.slice(15,-1).split(',').map(item=>{
            const data = item.split('-');
            return {key:data[0],column:data[1]};
        });
        if (files.CandidateFile && files.CandidateFile.length > 0) {
            console.log('Hook: uploadExcelFile => your excel file upload');
            const srcPath = files.CandidateFile[0].path;
            app.excel.readFile(srcPath, workbook => {
                app.deleteFile(srcPath);
                if (workbook) {
                    const worksheet = workbook.getWorksheet(1), data = [], totalRow = worksheet.lastRow.number;
                    const getCellValue = (row, col) => worksheet.getCell(`${col}${row}`).text;
                    
                    const handleUpload = (index = 2) => {
                        const values = worksheet.getRow(index).values;
                        if (values.length == 0 || index == totalRow + 1) {
                            done({ data });
                        } else {
                            const stringToDate = (values) => {
                                values = values ? values.trim() : '';
                                return values.length >= 10 ? new Date(values.slice(6, 10), values.slice(3, 5) - 1, values.slice(0, 2)) : null;
                            };
                            const email = values[4] && values[4] != undefined ? values[4] : '';
                            const profiles = profileParams.filter(item=>{
                                const value = getCellValue(index,item.column);
                                return value && value.toLowerCase().trim()=='x';
                            }).map(item=>item.key);
                            data.push({
                                id: index - 1,
                                lastname: values[2],
                                firstname: values[3],
                                email: email.text || email,
                                phoneNumber: values[5],
                                sex: values[6] && values[6].toLowerCase().trim() == 'nam' ? 'male' : 'female',
                                birthday: stringToDate(values[7]),
                                nationality: values[8],
                                residence: values[9],
                                regularResidence: values[10],
                                identityCard: values[11],
                                identityIssuedBy: values[12],
                                identityDate: stringToDate(values[13]),
                                giayToDangKy:profiles,
                                // isIdentityCard:values[14] && values[14].toLowerCase().trim() == 'x' ? true : false,
                                // giayPhepLaiXe2BanhSo: values[15],
                                // giayPhepLaiXe2BanhNgay: stringToDate(values[16]),
                                // giayPhepLaiXe2BanhNoiCap: values[17],
                                // isBangLaiA1:values[18] && values[18].toLowerCase().trim() == 'x' ? true : false,
                                // giayKhamSucKhoe: values[19] && values[19].toLowerCase().trim() == 'x' ? true : false,
                                // giayKhamSucKhoeNgayKham: values[19] && values[19].toLowerCase().trim() == 'x' ? stringToDate(values[20]) : null,
                                // hinhThe3x4: values[21] && values[21].toLowerCase().trim() == 'x' ? true : false,
                                // hinhChupTrucTiep: values[22] && values[22].toLowerCase().trim() == 'x' ? true : false,
                                lecturerIdentityCard: values[18],
                                lecturerName: values[19],
                                // isDon:values[25] && values[25].toLowerCase().trim() == 'x' ? true : false,
                                // isGiayKhamSucKhoe: values[19] && values[19].toLowerCase().trim() == 'x' ? true : false,
                                // isHinh: values[21] && values[21].toLowerCase().trim() == 'x' ? true : false,
                            });
                            handleUpload(index + 1);
                        }
                    };
                    handleUpload();
                } else {
                    done({ error: 'Error' });
                }
            });
        }
    });

    // Hook upload fail pass student excel---------------------------------------------------------------------------------------
    app.uploadHooks.add('uploadExcelFailPassStudentFile', (req, fields, files, params, done) => {
        if (files.FailPassStudentFile && files.FailPassStudentFile.length > 0 && fields.userData && fields.userData.length > 0 && fields.userData[0].startsWith('FailPassStudentFile:')) {
            console.log('Hook: uploadExcelFailPassStudentFile => your excel fail pass student file upload');
            const srcPath = files.FailPassStudentFile[0].path;
            app.excel.readFile(srcPath, workbook => {
                app.deleteFile(srcPath);
                if (workbook) {
                    const userData = fields.userData[0], userDatas = userData.split(':'), worksheet = workbook.getWorksheet(1), data = [],
                        getCellValue = (row, col) => worksheet.getCell(`${col}${row}`).text,
                        setCellValue = (row, col, value) => {
                            worksheet.getCell(`${col}${row}`).value = value;
                        },
                        startRow = parseInt(userDatas[1]), endRow = parseInt(userDatas[2]),
                        // totalRow = endRow - startRow + 1,
                        colCourseType = userDatas[6], courseTypeSelected = userDatas[7], colIdCard = userDatas[8];
                    const handleUpload = (index = startRow) => {
                        if (index > endRow) { // end loop  
                            if (data.some(({ identityCard }) => identityCard == undefined)) { //check map not 100%, map fail then not push identityCard to data
                                const tempFolderName = app.date.getDateFolderName(), tempFilePath = app.path.join(app.assetPath, 'temp', tempFolderName);
                                if (!app.fs.existsSync(tempFilePath)) {
                                    app.createFolder(tempFilePath);
                                }
                                setCellValue(startRow - 6, colIdCard, 'CMND/CCCD');
                                const colIdCardValues = worksheet.getColumn(colIdCard);
                                colIdCardValues.width = 20;
                                colIdCardValues.eachCell({ includeEmpty: false }, (cell) => { //highlight nhap cmnd 
                                    if (cell.text == '\'') {
                                        cell.fill = {
                                            type: 'pattern',
                                            pattern: 'solid',
                                            fgColor: { argb: 'FFFFFF00' },
                                        };
                                    }
                                });
                                workbook.xlsx.writeFile(app.path.join(tempFilePath, 'abc.xlsx')).then(() => { //wait for write file done, then resolve,if not, file res maybe empty
                                    done({ fileName: 'abc.xlsx', notify: 'Vui lòng chờ file được tải về máy' });
                                });
                            } else {
                                done({ data, notify: 'Tải lên file thành công' });
                            }
                        } else {
                            if (getCellValue(index, colCourseType).trim() == courseTypeSelected) {
                                let identityCard = getCellValue(index, colIdCard); //check getCellValue null
                                const fullname = getCellValue(index, userDatas[3]).trim(),
                                    birthday = getCellValue(index, userDatas[4]),
                                    course = getCellValue(index, userDatas[5]).trim(),
                                    toDateObject = str => {
                                        const dateParts = str.split('/');
                                        return new Date(+dateParts[2], dateParts[1] - 1, +dateParts[0]);
                                    },
                                    name = { $regex: course, $options: 'i' };
                                identityCard = typeof identityCard == 'string' ? identityCard.trim() : '';
                                if (identityCard == '' || identityCard == '\'') { // find identitycard = '' => map
                                    app.model.course.get({ name }, (error, item) => {
                                        if (error || !item) {
                                            setCellValue(index, colIdCard, '\''); //Nhập CMND/CCCD
                                            data.push({ fullname, birthday, courseName: course });
                                            handleUpload(index + 1);
                                        } else {
                                            const condition = {
                                                fullname,
                                                birthday: typeof birthday == 'object' ? birthday : toDateObject(birthday.trim()),
                                                course: item._id,
                                            };
                                            app.model.student.mapToId(condition, (error, list) => {
                                                if (error || list.length == 0 || list.length > 2) {
                                                    setCellValue(index, colIdCard, '\''); //Nhập CMND/CCCD
                                                    data.push({ fullname, birthday, courseName: course });
                                                    handleUpload(index + 1);
                                                } else if (list.length == 1 && list[0]) { //map success
                                                    const { identityCard } = list[0];
                                                    setCellValue(index, colIdCard, `'${identityCard}`); // add ' before it to check 00..
                                                    data.push({ fullname, birthday, courseName: course, course: item._id, identityCard });
                                                    handleUpload(index + 1);
                                                }
                                            });

                                        }
                                    });
                                } else { // available identity card
                                    app.model.course.get({ name }, (error, item) => {
                                        if (error || !item) {
                                            data.push({ fullname, birthday, courseName: course }); // course shoud be push ?
                                            handleUpload(index + 1);
                                        } else {
                                            data.push({
                                                fullname, birthday, courseName: course, course: item._id, identityCard
                                            });
                                            handleUpload(index + 1);
                                        }
                                    });
                                }
                            } else {
                                handleUpload(index + 1);
                            }
                        }
                    };
                    handleUpload();
                } else {
                    done({ error: 'Đọc file Excel bị lỗi!' });
                }
            });
        }
    });

    app.put('/api/student/import-fail-pass', app.permission.check('student:import'), (req, res) => {
        const sessionUser = req.session.user, division = sessionUser.division;
        if (sessionUser && !sessionUser.isLecturer && division && !division.isOutside) {
            const { student, type } = req.body,
                changes = [
                    { datSatHach: true, liDoChuaDatSatHach: '' }, //Pass
                    { datSatHach: false, liDoChuaDatSatHach: '' }, //Fail liDoChuaDatSatHach for admin define
                    { datSatHach: false, liDoChuaDatSatHach: 'Vắng thi' }, //Absence 
                ];
            let err = null;
            if (student && student.length > 0) {
                if (type) {
                    const handleImport = (index = 0) => {
                        if (index == student.length) {
                            res.send({ error: err });
                        } else {
                            const { identityCard, course,kySatHach } = student[index];
                            app.model.student.get({ identityCard, course }, (error, item) => {
                                if (error || !item) {
                                    err = error;
                                    handleImport(index + 1);
                                } else {
                                    Object.entries(changes[parseInt(type)]).forEach(([key, value]) => {
                                        item[key] = value;
                                    });

                                    // thêm kỳ sát hạch và ngày sát hạch
                                    item.kySatHach= kySatHach;
                                    item.modifiedDate = new Date();
                                    item.save((error, student) => {
                                        if (error || !student) {
                                            err = error;
                                        }
                                        handleImport(index + 1);
                                    });
                                }
                            });
                        }
                    };
                    handleImport();
                } else {
                    res.send({ error: 'Kiểu import file trống!' });
                }
            } else {
                res.send({ error: 'Danh sách học viên trống!' });
            }
        } else {
            res.send({ error: 'Bạn không có quyền import danh sách học viên!' });
        }
    });

    app.get('/api/student/download-fail-pass', app.permission.check('student:import'), (req, res) => {
        const sessionUser = req.session.user,
            tempFolderName = app.date.getDateFolderName(), tempFolderPath = app.path.join(app.assetPath, 'temp', tempFolderName),
            division = sessionUser.division;
        if (sessionUser && sessionUser.isLecturer && division && division.isOutside) {
            res.send({ error: 'Bạn không có quyền tải file excel này!' });
        } else {
            if (app.fs.existsSync(app.path.join(tempFolderPath, 'abc.xlsx'))) {
                res.download(app.path.join(tempFolderPath, 'abc.xlsx'), 'Danh sách học viên.xlsx', (error) => {
                    if (error) {
                        res.send({ error });
                    } else {
                        app.deleteFile(app.path.join(tempFolderPath, 'abc.xlsx'));
                    }
                });
            } else res.send({ error: 'File không tồn tại trên server' });

        }
    });

    // Hook permissionHooks -------------------------------------------------------------------------------------------
    app.permissionHooks.add('courseAdmin', 'student', (user) => new Promise(resolve => {
        app.permissionHooks.pushUserPermission(user, 'student:read', 'student:write');
        // Quản lý khóa học nội bộ thì được import danh sách học viên bằng file Excel
        if (user.division && !user.division.isOutside) app.permissionHooks.pushUserPermission(user, 'student:import');
        resolve();
    }));
};