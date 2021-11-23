module.exports = app => {
    app.permission.add(
        { name: 'payment:read', menu: { parentMenu: app.parentMenu.trainning, menus: {5000: { title: 'Thu công nợ', link: '/user/payment' }} } },
        { name: 'payment:write' },
        { name: 'payment:delete' },
    );

    app.get('/user/payment', app.permission.check('payment:read'), app.templates.admin);

    app.post('/api/payment', app.permission.check(), (req, res) => { // todo: check token sent from app SMSChecker
        const suffixKeys= ['smsAPIToken', 'moneyLineIndex', 'contentLineIndex'];
        const keys = suffixKeys.map(item => `${app.appName}:state:${item}`);
        app.redis.mget(keys, (error, values) => {
            if(error ||!values || values.length == 0){
                res.send({error:'Error when get token'});
            } else {
                if(req.body.token == values[0]){
                    if(req.body.data){
            const {originatingAddress, body, timestamp} = req.body.data; // check timestamp ?
            const BANK=['OCB'], HIEPPHAT='hiepphat'; // let ?  because it's dynamic 
            if(originatingAddress && BANK.includes(originatingAddress.toUpperCase()) && body && body.includes('+') && body.includes(HIEPPHAT)){ // parse sms
                const TYPE='BC', DEBITACCOUNT='1121', CREDITACCOUNT = '131', CONTENT = 'Thu công nợ online'; 
                const moneyLineIndex = parseInt(values[1]), contentLineIndex = parseInt(values[2]);
                const timeReceived = new Date(timestamp); // Date(timestamp * 1000) if length < 13 digit, second not milisecond 
                const mongoose = require('mongoose');
                const objectId = mongoose.Types.ObjectId(); // var id = new mongoose.Types.ObjectId();
                const code = TYPE + objectId.toString().toUpperCase();
                const payment = {
                    type: TYPE,
                    timeReceived,
                    code,
                    content: CONTENT,
                    debitAccount: DEBITACCOUNT,
                    creditAccount: CREDITACCOUNT,
                    debitObject: originatingAddress,
                };
                // Use config parse body of sms store in DB from FE by type of bank template
                // Parse amount of money by #line and filter string by number character, check > 0
                const lines = body.split(/\r\n|\n\r|\n|\r/); // It works on all operating systems, only for line format content
                if(lines && lines.length > 0){
                    const moneyLine = lines[moneyLineIndex], contentLine = lines[contentLineIndex];
                    if(moneyLine){
                        let money = moneyLine.replace(/\D/g,''); // Strip all non-numeric characters from string
                        money = parseInt(money);
                        if(money > 0){
                            payment.moneyAmount = money;
                        }
                    }
                    if(contentLine){ //'hiepphat_029493094_A1_' //42354769_K17
                        const hiepPhatIndex = contentLine.indexOf(HIEPPHAT);
                        if(hiepPhatIndex !=-1){
                            const contentBody = contentLine.substring(hiepPhatIndex);
                            const contentBodys = contentBody.split(' '); // _ is dynamic ?
                            if(contentBodys && contentBodys.length > 0){
                                const identityCard = contentBodys[1].trim(), courseName = contentBodys[2].trim();
                                payment.creditObject = identityCard;
                                payment.courseName = courseName;
                                app.model.course.get({ name:  { $regex: courseName, $options: 'i' } }, (error, item) => {
                                    if (error || !item) {
                                        res.send({ error: 'Nonexist course' });
                                    } else {
                                        const condition = {
                                            identityCard,
                                            course: item._id,
                                        };
                                        app.model.student.get(condition,(error,item)=>{
                                            if (error || !item) {
                                                res.send({ error: 'Nonexist student' });
                                            } else {
                                                item.hocPhiDaDong = (item.hocPhiDaDong || 0) + payment.moneyAmount; // plus fee paid
                                                item.save((error, student) => {
                                                    if (error || !student) {
                                                        res.send({ error });
                                                    } else {
                                                payment.student = item._id;
                                                payment.firstname = item.firstname;
                                                payment.lastname = item.lastname;
                                                payment.course = item.course && item.course._id;
                                                app.model.payment.create(payment, (error, item) => res.send({ error, item }));                                                        
                                                    }
                                                    
                                                });
                                            }
                                        });
                                    }
                                });
                            }
                        }
                    }
                }
            } else
                res.send({ error: 'Invalid SMS' });
        } else 
            res.send({ error:'Null data in req.body' });
                } else {
                    res.send({error:'Invalid token'});
                }
            }
        });
    });

    app.get('/api/payment/page/:pageNumber/:pageSize', app.permission.check('payment:read'), (req, res) => {
        let pageNumber = parseInt(req.params.pageNumber),
            pageSize = parseInt(req.params.pageSize),
            condition = req.query.pageCondition || {};
        try {
            app.model.payment.getPage(pageNumber, pageSize, condition, (error, page) => res.send({ error, page }));
        } catch (error) {
            res.send({ error });
        }
    });
};