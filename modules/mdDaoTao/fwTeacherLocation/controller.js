module.exports = (app) => {
    const menu = {
        parentMenu: app.parentMenu.teacher,
        menus: {
            9070: { title: 'Định vị giáo viên', link: '/user/teacher-location', icon: 'fa-bars', backgroundColor: '#00b0ff' },
        },
    };

    app.permission.add(
        { name: 'teacherLocation:read', menu }, { name: 'teacherLocation:write' }, { name: 'teacherLocation:delete' },
    );

    app.get('/user/teacher-location', app.permission.check('teacherLocation:read'), app.templates.admin);
    app.get('/user/teacher-location/:_id', app.permission.check('teacherLocation:read'), app.templates.admin);
   
    

    // APIs ------------------------------------------------------------------------------------------------------------
    app.get('/api/teacher-location/page/:pageNumber/:pageSize', (req, res) => {
        const pageNumber = parseInt(req.params.pageNumber),
            pageSize = parseInt(req.params.pageSize);
        let condition = req.query.pageCondition || {};
        if(condition.date){
            const date = condition.date;
            let conditionDate = new Date(new Date(date).getFullYear(), new Date(date).getMonth(), new Date(date).getDate());
            let conditionNextDate = new Date(new Date(conditionDate).setDate(conditionDate.getDate()  + 1));
            condition.date = {$gte: conditionDate, $lt: conditionNextDate};
        }
        app.model.teacherLocation.getPage(pageNumber, pageSize, condition, (error, page) => {
            res.send({ page, error: error ? 'Danh sách lớp ôn tập không sẵn sàng!' : null });
        });
    });

    app.get('/api/teacher-location/all', (req, res) => {
        const condition = req.query.condition || {};
        app.model.teacherLocation.getAll(condition,(error, list) => res.send({ error, list }));
    });

    app.get('/api/teacher-location/random', (req, res) => {
        const condition = req.query.condition || {};
        const chooseRandom = (arr, num = 1) => {
            const result = [];
            for(let i = 0; i < num; ){
               const random = Math.floor(Math.random() * arr.length);
               if(result.indexOf(arr[random]) !== -1){
                  continue;
               }
               result.push(arr[random]);
               i++;
            }
            return result;
         };
        app.model.teacherLocation.getAll(condition,(error, list) => {
            let randomList = [];
            if(list.length > 10) randomList = chooseRandom(list, 10);
            else randomList = list;
            res.send({error, list:randomList});
        });
    });

    app.get('/api/teacher-location', (req, res) => {
        app.model.teacherLocation.get(req.query._id, (error, item) => res.send({ error, item }));
    });

    app.post('/api/teacher-location', app.permission.check('teacherLocation:write'), (req, res) => {
        const data = req.body.data;
        if(data){
            app.model.teacherLocation.get({timeTable: data.timeTable}, (error, item) => {
                if(error) res.send({ error});
                else if(!item){
                    app.model.teacherLocation.create(data, (error, item) => res.send({ error, item }));
                } else app.model.teacherLocation.addRecord({_id: item._id}, data, (error, item) => res.send({ error, item }));
        });
       } else res.send({error: 'Không nhận được dữ liệu'});   
    });

    app.put('/api/teacher-location', app.permission.check('teacherLocation:write'), (req, res) => {
        const { _id, changes } = req.body;
        app.model.teacherLocation.update(_id, changes, (error, item) => res.send({ error, item }));

    });

    app.put('/api/teacher-location/swap', app.permission.check('teacherLocation:write'), (req, res) => {
        const isMoveUp = req.body.isMoveUp.toString() == 'true';
        app.model.teacherLocation.swapPriority(req.body._id, isMoveUp, (error) => res.send({ error }));
    });

    app.delete('/api/teacher-location', app.permission.check('teacherLocation:delete'), (req, res) => {
        const { _id } = req.body;
        app.model.teacherLocation.delete(_id, (error) => res.send({ error }));
    });

    app.permissionHooks.add('lecturer', 'teacherLocation', (user) => new Promise(resolve => {
        app.permissionHooks.pushUserPermission(user, 'teacherLocation:write');
        resolve();
    }));
};