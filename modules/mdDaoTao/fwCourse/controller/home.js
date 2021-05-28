module.exports = (app) => {

    app.get('/home/course/page/:pageNumber/:pageSize', (req, res) => {
        const pageNumber = parseInt(req.params.pageNumber),
            pageSize = parseInt(req.params.pageSize);
        app.model.course.getPage(pageNumber, pageSize, { active: true }, (error, page) => {
            res.send({ page, error: error || page == null ? 'Danh sách khóa học không sẵn sàng!' : null });
        });
    });

    app.get('/home/course', (req, res) => {
        app.model.course.get({ _id: req.query._id, active: true }, (error, item) => res.send({ error, item }));
    });
};