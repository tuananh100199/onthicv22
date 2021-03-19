module.exports = app => {
    const menu = {
        parentMenu: app.parentMenu.trainning,
        menus: {
            4050: { title: 'Danh mục câu hỏi thi', link: '/user/drive-question/category' },
        },
    };
    app.permission.add(
        { name: 'category:read', menu },
    );

    app.get('/user/drive-question/category', app.permission.check('category:read'), app.templates.admin);

    //TODO: Tuấn Anh
};
