module.exports = (app) => {
    const menu = {
        parentMenu: app.parentMenu.enrollment,
        menus: {
            8085: { title: 'Hình ảnh học viên', link: '/user/verification-image', icon: 'fa-bars', backgroundColor: '#00b0ff' },
        },
    };

    app.permission.add(
        { name: 'verificationImage:read', menu }, { name: 'verificationImage:write' }, { name: 'verificationImage:delete' },
    );

    app.get('/user/verification-image', app.permission.check('verificationImage:read'), app.templates.admin);
    

    // APIs ------------------------------------------------------------------------------------------------------------
    app.get('/api/verification-image/page/:pageNumber/:pageSize', (req, res) => {
        const pageNumber = parseInt(req.params.pageNumber),
            pageSize = parseInt(req.params.pageSize);
        let condition = req.query.pageCondition || {},filter=req.query.filter||{},sort=req.query.sort||null; 
        filter && app.handleFilter(filter,['state'],defaultFilter=>{
            condition={...condition,...defaultFilter};
        });
        if(filter.firstname){// họ tên
            condition['$expr']= {
                '$regexMatch': {
                  'input': {'$concat': ['$lastname', ' ', '$firstname'] },
                  'regex': `.*${filter.firstname}.*`,  //Your text search here
                  'options': 'i'
                }
            };
        }
        app.model.verificationImage.getPage(pageNumber, pageSize, condition , sort, (error, page) => {
            res.send({ page, error: error ? 'Danh sách  hình ảnh học viên không sẵn sàng!' : null });
        });
    });

    app.get('/api/verification-image/all', (req, res) => {//mobile
        const condition = req.query.condition || {};
        app.model.verificationImage.getAll(condition,(error, list) => res.send({ error, list }));
    });

    app.get('/api/verification-image', (req, res) => {
        app.model.verificationImage.get(req.query._id, (error, item) => res.send({ error, item }));
    });

    app.post('/api/verification-image', app.permission.check('verificationImage:write'), (req, res) => {
        app.model.verificationImage.create(req.body.data, (error, item) => res.send({ error, item }));
    });

    app.put('/api/verification-image', app.permission.check('verificationImage:write'), (req, res) => {
        const { _id, changes } = req.body;
        app.model.verificationImage.update(_id, changes, (error, item) => res.send({ error, item }));

    });

    app.put('/api/verification-image/student', app.permission.check('user:login'), (req, res) => {
        const { _id, student } = req.body;
        app.model.verificationImage.get(_id, (error, item) => {
            if(error || !item) res.send({error});
            else{
                const remainStudent = item.remainStudent;
                app.model.verificationImage.update(item._id, {remainStudent: remainStudent - 1}, () => {
                    app.model.verificationImage.addStudent(item._id, student, (error, item) => res.send({ error, item }));
                });
            }
        });
    });

    app.delete('/api/verification-image/student', app.permission.check('user:login'), (req, res) => {
        const { _id, _studentId } = req.body;
        app.model.verificationImage.get(_id, (error, item) => {
            if(error) res.send({error});
            else{
                const remainStudent = item.remainStudent;
                app.model.verificationImage.update(_id, {remainStudent: remainStudent + 1}, () => {
                    app.model.verificationImage.deleteStudent(_id, _studentId, (error) => {
                        if (error) {
                            res.send({ error });
                        } else {
                            app.model.verificationImage.get(_id, (error, item) => res.send({ error, item }));
                        }
                    });
                });
            }
        });
        
    });

    app.delete('/api/verification-image', app.permission.check('verificationImage:delete'), (req, res) => {
        const { _id } = req.body;
        app.model.verificationImage.delete(_id, (error) => res.send({ error }));
    });

};