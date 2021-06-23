module.exports = app => {



    app.get('/user/chat/:id', app.templates.admin);
    // app.get('/user/division/:id', app.permission.check('division:write'), app.templates.admin);


};