module.exports = app => {
    const menu = {
        parentMenu: app.parentMenu.accountant,
        menus: {
            6999: { title: 'Hướng dẫn', link: '/user/accountant-tutorial' },
            7008: { title: 'Quản lý doanh thu', link: '/user/revenue' },
        }
    };
    app.permission.add({ name: 'revenue:read', menu }, { name: 'revenue:write' }, { name: 'revenue:delete' });
    app.get('/user/revenue', app.permission.check('revenue:read'), app.templates.admin);
    app.get('/user/revenue/info', app.permission.check('revenue:read'), app.templates.admin);
    app.get('/user/revenue/debt', app.permission.check('revenue:read'), app.templates.admin);
    app.get('/user/revenue/tracking', app.permission.check('revenue:read'), app.templates.admin);
    app.get('/user/accountant-tutorial', app.permission.check('revenue:read'), app.templates.admin);

    // APIs -----------------------------------------------------------------------------------------------------------------------------------------
    app.get('/api/revenue/page/:pageNumber/:pageSize', app.permission.check('revenue:read'), (req, res) => {
        let pageNumber = parseInt(req.params.pageNumber),
            pageSize = parseInt(req.params.pageSize),
            condition = req.query.pageCondition || {},
            pageCondition = {};
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
            if(condition.course) {
                if((condition.course == '1') && condition.courseTypeId){
                    app.model.course.get({isDefault: true, courseType: condition.courseTypeId}, (error,course) => {
                        pageCondition.course = course._id;
                        app.model.revenue.getPage(pageNumber, pageSize, pageCondition, (error, page) => res.send({ error, page }));
                    });
                } else{
                    pageCondition.course = condition.course;
                    app.model.revenue.getPage(pageNumber, pageSize, pageCondition, (error, page) => res.send({ error, page }));
                }
            } else  {
                pageCondition.courseType = condition.courseTypeId;
                app.model.revenue.getPage(pageNumber, pageSize, pageCondition, (error, page) => res.send({ error, page }));
            }
           
    });

    app.get('/api/revenue/all', app.permission.check('revenue:read'), (req, res) => {
        app.model.revenue.getAll( req.query.condition, (error, list) => res.send({ error, list }));
    });

    app.get('/api/revenue/statistic', app.permission.check('revenue:read'), (req, res) => {
        app.model.setting.get('revenue', data => res.send({item: data}));
    });

    app.get('/api/revenue/month', app.permission.check('revenue:read'), (req, res) => {
        const { dateStart, dateEnd } = req.query,
            monthStart = new Date(dateStart).getMonth(),
            yearStart = new Date(dateStart).getFullYear(),
            monthEnd = new Date(dateEnd).getMonth(),
            yearEnd = new Date(dateEnd).getFullYear(),
            promiseList = [];
        for (let year = yearStart; year <= yearEnd; year++) {
            for (let month = (year == yearStart ? monthStart : 0); ((year < yearEnd) ? (month < 12) : (month <= monthEnd)); month++) {
                promiseList.push(
                    new Promise((resolve, reject) => {
                        app.model.revenue.getAll({ date: { $gte: new Date().setFullYear(year, month, 1), $lt: new Date().setFullYear(year, month + 1, 0) } }, (error, list) => {
                            if (error) {
                                reject(error);
                            } else {
                                const obj = {};
                                const fee = list && list.length ? list.reduce((result,item) => result + parseInt(item.fee) , 0) : 0;
                                obj[month + '/' + year] = fee;
                                resolve(obj);
                            }
                        });
                    }));
            }
        }
        promiseList && Promise.all(promiseList).then(item => {
            res.send({ item });
        }).catch(error => console.error(error) || res.send({ error }));
    });

    app.get('/api/revenue/date', app.permission.check('revenue:read'), (req, res) => {
        const { dateStart, dateEnd } = req.query,
            dayStart = new Date(dateStart).getDate(),
            monthStart = new Date(dateStart).getMonth(),
            yearStart = new Date(dateStart).getFullYear(),
            dayEnd = new Date(dateEnd).getDate(),
            monthEnd = new Date(dateEnd).getMonth(),
            yearEnd = new Date(dateEnd).getFullYear(),
            promiseList = [];
        const calDate = (month) => {
            if(month == 1) return 28;
            else if (month == 4 || month == 6 || month == 9 || month == 11) return 30;
            else return 31;
        };
        for (let year = yearStart; year <= yearEnd; year++) {
            for (let month = (year == yearStart ? monthStart : 0); ((year < yearEnd) ? (month < 12) : (month <= monthEnd)); month++) {
                for(let day = ((year == yearStart && month == monthStart) ? dayStart : 0);(year == yearEnd && month == monthEnd) ? day <= dayEnd : day <= calDate(month, day) ;day++){
                    promiseList.push(
                        new Promise((resolve, reject) => {
                            app.model.revenue.getAll({ date: {$gte: new Date(new Date().setFullYear(year, month, day)).setHours(0,0,0,0), $lt: new Date(new Date().setFullYear(year, month, day + 1)).setHours(0,0,0,0)}}, (error, list) => {
                                if (error) {
                                    reject(error);
                                } else {
                                    const obj = {};
                                    const fee = list && list.length ? list.reduce((result,item) => result + parseInt(item.fee) , 0) : 0;
                                    obj[day + '/'+ month + '/' + year] = fee;
                                    resolve(obj);
                                }
                            });
                        }));
                }
                
            }
        }
        promiseList && Promise.all(promiseList).then(item => {
            res.send({ item });
        }).catch(error => console.error(error) || res.send({ error }));
    });

    app.get('/api/revenue', app.permission.check('revenue:read'), (req, res) => {
        app.model.revenue.get({ _id: req.query._id }, (error, item) => res.send({ error, item }));
    });

    app.post('/api/revenue', app.permission.check('revenue:write'), (req, res) => {
        app.model.revenue.create(req.body.revenue, (error, item) => res.send({ error, item }));
    });

    app.put('/api/revenue', app.permission.check('revenue:write'), (req, res) => {
        app.model.bank.update(req.body._id, req.body.changes, (error, item) => res.send({ error, item }));
    });

    // app.delete('/api/revenue', app.permission.check('bank:delete'), (req, res) => {
    //     const user = req.session.user;
    //     if (user.roles.some(role => role.name == 'admin')) {
    //         app.model.bank.delete(req.body._id, error => res.send({ error }));
    //     } else res.send({ error: 'Bạn không có quyền xóa ngân hàng' });
    // });

};