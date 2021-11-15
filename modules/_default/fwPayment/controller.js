module.exports = app => {
    app.post('/api/payment', app.permission.check(), (req, res) => {
        app.model.payment.create(req.body.data, (error, item) => res.send({ error, item }));
    });
};