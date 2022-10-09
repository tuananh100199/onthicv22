module.exports = (app) => {
    app.permission.add({ name: 'rate:read' }, { name: 'rate:write' }, { name: 'rate:delete' });

    app.get('/api/rate/admin/page/:pageNumber/:pageSize', (req, res) => {
        let pageNumber = parseInt(req.params.pageNumber),
            pageSize = parseInt(req.params.pageSize),
            condition = req.query.condition || {},
            filter = req.query.filter||null,sort=req.query.sort||null,
            pageCondition = {};

            pageCondition.$or = [];
        if (condition.searchText) {
            const value = { $regex: `.*${condition.searchText}.*`, $options: 'i' };
            pageCondition.$or.push(
                { note: value },
            );
        }

        filter && app.handleFilter(filter,['value'],defaultFilter=>{
            // console.log('-----------------defaultCondition:----------------------');
            pageCondition={...pageCondition,...defaultFilter};
        });
        if (pageCondition.$or.length == 0) delete pageCondition.$or;
        pageCondition._refId = condition._refId;
        
        app.model.user.get({ _id: condition._refId }, (error, user) => {
            if (error || !user) {
                res.send({ error: 'Lấy thông tin giáo viên bị lỗi!'});
            } else {
                app.model.rate.getPage(pageNumber, pageSize, pageCondition,sort, (error, page) => {
                    page = app.clone(page);
                    page.lecturer = user;
                    res.send({ error, page });
                });
            }
        });
    });

    app.get('/api/rate/page/:pageNumber/:pageSize', app.permission.check('rate:read'), (req, res) => {
        const pageNumber = parseInt(req.params.pageNumber),
            pageSize = parseInt(req.params.pageSize),
            condition = req.query.pageCondition || {};
        try {
            if (condition.type == 'teacher')
                app.model.course.get(condition._courseId, (error, course) => {
                    if (error || !course) {
                        res.send({ error: 'Invalid parameter!' });
                    } else {
                        const _teachers = course.teacherGroups.map(({ teacher }) => teacher),
                            _teacherIds = _teachers.map(({ _id }) => _id);
                        if (_teacherIds) {
                            condition._refId = { $in: _teacherIds };
                            delete condition._courseId;
                            app.model.rate.getPage(pageNumber, pageSize, condition, (error, page) => {
                                if (error) {
                                    res.send({ error });
                                } else {
                                    const list = app.clone(page.list);
                                    page.list = list.map(item => app.clone(item, { _refId: _teachers.find(({ _id }) => item._refId == _id.toString()) }));
                                    res.send({ page });
                                }
                            });
                        }
                    }
                });
        } catch (error) {
            res.send({ error });
        }
    });

    const updateRatingTeacher = (_teacherId)=> new Promise((resolve,reject)=>{
        app.model.rate.getAll({_refId:_teacherId},(error,ratingTeachers)=>{
            if(error) reject(error);
            else{
                const ratingAmount =ratingTeachers? ratingTeachers.length:0;
                const ratingScore = ratingAmount==0?0:ratingTeachers.reduce((result,rate)=>result+rate.value,0)/ratingAmount;
                app.model.user.update(_teacherId,{ratingAmount,ratingScore},error=>{
                    error?reject(error):resolve();
                });
            }
        });
    });

    app.put('/api/rate/student', app.permission.check('user:login'), (req, res) => {
        const changes = req.body.changes;
        app.model.rate.update(req.body._id, changes, (error, item) => {
            if(error)res.send({error});
            else{
                updateRatingTeacher(item._refId).then(()=>{
                    res.send({item});
                }).catch(error=>res.send({error}));
            }
        });
    });

    app.post('/api/rate/student', app.permission.check('user:login'), (req, res) => { //mobile
        let newData = req.body.newData||{};
        app.model.rate.create(app.clone(newData, { user:newData.user?newData.user: req.session.user._id }),(error, item) =>{
            if(error)res.send({error});
            else{
                updateRatingTeacher(newData._refId).then(()=>{
                    res.send({item});
                }).catch(error=>res.send({error}));
            }
        });
    });

    app.delete('/api/rate/student', app.permission.check('rate:delete'), (req, res) => {
        app.model.rate.get({_id:req.body._id},(error,item)=>{
            if(error||!item) res.send({error:'Không tìm thấy đánh giá'});
            else{
                app.model.rate.delete(item._id,error=>{
                    if(error) res.send({error});
                    else{
                        updateRatingTeacher(item._refId).then(()=>{
                            res.send({item});
                        }).catch(error=>res.send({error}));
                    }
                });
            }
        });
    });
    app.get('/api/rate/student/:type', app.permission.check('user:login'), (req, res) => { //mobile
        const condition = { type: req.params.type, _refId: req.query._refId, user: req.session.user._id };
        app.model.rate.get(condition, (error, item) => res.send({ error, item }));
    });

    app.get('/api/rate/course', app.permission.check('rate:read'), (req, res) => { //mobile
        const courseId = req.query.courseId;
        app.model.course.get({_id: courseId}, (error,item) => {
            if(error || !item)
                res.send({error});
            else{
                let listStudentId = [];
                const listTeacherId = item.teacherGroups && item.teacherGroups.length && item.teacherGroups.map(group => group.teacher._id);
                item.teacherGroups && item.teacherGroups.length && item.teacherGroups.forEach(group=>{
                    group.student && group.student.length && group.student.forEach(student=>{
                        student.user && listStudentId.push(student.user._id);
                    });
                });
                app.model.rate.getAll({_refId: {$in: listTeacherId},user:{$in:listStudentId}}, (error, list) => res.send({ error, list }));
            }
        });
    });

    app.get('/api/rate/student', app.permission.check('rate:read'), (req, res) => {
        const sessionUser = req.session.user,
            listRefId = req.query.listRefId;
        if (listRefId) {
            const condition = { type: 'lesson', _refId: { $in: listRefId } };
            if (sessionUser.isCourseAdmin) {
                app.model.student.getAll({ course: req.query.courseId }, (error, item) => {
                    if (error) {
                        res.send({ error });
                    } else {
                        if (item && item.length) {
                            condition.user = { $in: item.map(item => item.user._id) };
                        }
                        app.model.rate.getAll(condition, (error, item) => res.send({ error, item }));
                    }
                });
            } else {
                app.model.course.get(req.query.courseId, (error, item) => {
                    if (error || !item) {
                        res.send({ error });
                    } else {
                        const listStudent = item.teacherGroups.filter(teacherGroup => teacherGroup.teacher && teacherGroup.teacher._id == sessionUser._id);
                        if (listStudent.length) {
                            condition.user = { $in: listStudent[0].student.map(student => student.user._id) };
                        }
                        app.model.rate.getAll(condition, (error, item) => res.send({ error, item }));
                    }
                });
            }
        } else {
            res.send({ item: [] });
        }
    });

    app.get('/api/rate/lesson/page/:pageNumber/:pageSize', app.permission.check('rate:read'), (req, res) => {
        const pageNumber = parseInt(req.params.pageNumber),
            pageSize = parseInt(req.params.pageSize),
            condition = req.query.pageCondition || {};
        app.model.rate.getPage(pageNumber, pageSize, condition, (error, page) => {
            res.send({ error, page });
        });
    });

    // Hook permissionHooks -------------------------------------------------------------------------------------------
    app.permissionHooks.add('courseAdmin', 'rate', (user) => new Promise(resolve => {
        app.permissionHooks.pushUserPermission(user, 'rate:read');
        resolve();
    }));
    app.permissionHooks.add('lecturer', 'rate', (user) => new Promise(resolve => {
        app.permissionHooks.pushUserPermission(user, 'rate:read');
        resolve();
    }));
};