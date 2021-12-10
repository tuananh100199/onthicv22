module.exports = app => {
    app.permission.add(
        { name: 'payment:read', menu: { parentMenu: app.parentMenu.trainning, menus: {5000: { title: 'Thu công nợ', link: '/user/payment' }} } },
        { name: 'payment:write' },
        { name: 'payment:delete' },
    );

    app.get('/user/payment', app.permission.check('payment:read'), app.templates.admin);

    app.post('/api/payment', app.permission.check(), (req, res) => {
        app.redis.get(`${app.appName}:state:smsAPIToken`, (error, token) => { //get token to auth app
            if (error || !token) {
                res.send({
                    error: 'Error when get token'
                });
            } else {
                if (req.body.token == token) { // check token sent from app SMSChecker
                    if (req.body.data) {
                        const {
                            originatingAddress,
                            body,
                            timestamp
                        } = req.body.data; // check timestamp ?
                        const createSms = (done) => {
                            const newData = {
                                sender: originatingAddress.toUpperCase(),
                                body: body.trim(),
                                timeReceived: new Date(timestamp),  // Date(timestamp * 1000) if length < 13 digit, second not milisecond 
                            };
                            app.model.sms.create(newData, (error, item) => {
                                if(error || !item){
                                    res.send({error});
                                } else if(done){
                                    done(item);
                                }
                            });
                        };
                        const value = { $regex: `.*${originatingAddress}.*`, $options: 'i' };
                        // check whether originatingAddress be in code of bank db ?
                        app.model.bank.get({ $or: [{ shortname: value }, { code: value }] }, (error, bank) => { //check active bank ?
                            if(error || !bank){
                                res.send({error: 'This bank doesn\'t exist in db'});
                            } else { //create sms when bank exist ?
                                createSms(
                                    (sms) => {
                                        const {sender, body, timeReceived} = sms;
                                        let {moneyLine, moneyStr, contentLine, contentStr, contentSyntax} = bank;
                                        const moneyStartStr = moneyStr.split('/:money/')[0], // /:money/ is fixed ?
                                              moneyEndStr = moneyStr.split('/:money/')[1],
                                              contentStartStr = contentStr.split('/:content/')[0],
                                              contentEndStr = contentStr.split('/:content/')[1];
                                        const TYPE = 'BC', DEBITACCOUNT = '1121', CREDITACCOUNT = '131', CONTENT = 'Thu công nợ online';
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
                                                    debitObject: sender,
                                             };
                                                // Gen regex to parse
                                        const reEscape = /[\-\[\]{}()+?.,\\\^$|#\s]/g;
                                        const preRegex = str => str.replace(reEscape, '\\$&');
                            // Use config parse body of sms store in DB from FE by type of bank template
                            // Parse amount of money by #line and filter string by number character, check > 0
                                        const lines = body.split(/\r\n|\n\r|\n|\r/); // It works on all operating systems, only for line format content
                                        if(lines && lines.length > 0){
                                            moneyLine = lines[moneyLine];
                                            contentLine = lines[contentLine];
                                            if(moneyLine){
                                                const moneyRegex = new RegExp(preRegex(moneyStartStr) + '(.+)' + preRegex(moneyEndStr), 'i');
                                                const moneyPart = moneyLine.match(moneyRegex);
                                                if (moneyPart) {
                                                    let money = moneyPart[1].replace(/\D/g, ''); // Strip all non-numeric characters from string
                                                    money = parseInt(money);
                                                    if (money > 0) {
                                                        payment.moneyAmount = money;
                                                    }
                                                } else console.log('parse money fail');
                                            }
                                            if(contentLine){
                                                const contentRegex = new RegExp(preRegex(contentStartStr) + '(.+)' + preRegex(contentEndStr), 'i');
                                                let contentPart = contentLine.match(contentRegex); //check null
                                                if (contentPart) {
                                                    contentPart = contentPart[1].trim(); //Ex: 111122223 A1  // regex = /.*(\b(\d{9}|\d{12})\b \b\w+\b).*/
                                                    const contentSyntaxRegex = contentSyntax.replace('{cmnd}','\\b(\\d{9}|\\d{12})').replace('{ten_loai_khoa_hoc}','\\b\\w+'); // other character can be escape string ?
                                                    const contentRegex = new RegExp('.*(' + contentSyntaxRegex + ').*', 'i');
                                                    console.log(contentRegex,'contentRegex');
                                                    contentPart = contentPart.match(contentRegex); // need space between CMND && CType /bug
                                                    if(contentPart){ 
                                                        contentPart = contentPart[1].trim(); // contentPart now is 111122223 A1
                                                        // divide contentPart into CMND && CType
                                                        const contentSyntaxDetailRegex = contentSyntax.replace('{cmnd}','(\\b\\d{9}|\\d{12})').replace('{ten_loai_khoa_hoc}','(\\b\\w+)'); // other character can be escape string ?
                                                        const contentDetailRegex = new RegExp('.*' + contentSyntaxDetailRegex + '.*', 'i');
                                                        console.log(contentDetailRegex,'contentDetailRegex ');
                                                        const contentBodys = contentPart.match(contentDetailRegex);
                                                        if (contentBodys && contentBodys.length > 0) {
                                                            let identityCard = '', courseTypeName = '';
                                                            if(contentBodys[1].length > contentBodys[2].length){ // cmnd first
                                                                  identityCard = contentBodys[1].trim();
                                                                  courseTypeName = contentBodys[2].trim();
                                                            } else {
                                                                  identityCard = contentBodys[2].trim();
                                                                  courseTypeName = contentBodys[1].trim();
                                                            }
                                                            payment.creditObject = identityCard;
                                                            payment.courseTypeName = courseTypeName;
                                                            app.model.courseType.get({ title: { $regex: courseTypeName, $options: 'i'}}, (error, item) => {
                                                    if (error || !item) {
                                                        res.send({
                                                            error: 'Nonexist courseType'
                                                        });
                                                    } else {
                                                        const condition = {
                                                            identityCard,
                                                            courseType: item._id,
                                                        };
                                                        app.model.student.get(condition, (error, item) => {
                                                            if (error || !item) {
                                                                res.send({
                                                                    error: 'Nonexist student'
                                                                });
                                                            } else {
                                                                item.hocPhiDaDong = (item.hocPhiDaDong || 0) + payment.moneyAmount; // plus fee paid
                                                                item.save((error, student) => {
                                                                    if (error || !student) {
                                                                        res.send({
                                                                            error
                                                                        });
                                                                    } else {
                                                                        payment.sms = sms._id;
                                                                        payment.student = item._id;
                                                                        payment.firstname = item.firstname;
                                                                        payment.lastname = item.lastname;
                                                                        payment.courseType = item.courseType && item.courseType._id;
                                                                        app.model.payment.create(payment, (error, item) =>{
                                                                            if(error || !item){
                                                                                res.send({error: error || 'Lỗi khi tạo thu công nợ'});
                                                                            } else {
                                                                                sms.isHandled = true;
                                                                                sms.save((error, item) => res.send({error, item}));
                                                                            }
                                                                        });
                                                                    }
                                                                });
                                                            }
                                                        });
                                                    }
                                                });
                                                        }
                                                    } else console.log('parse content detail fail');
                                                } else console.log('parse content fail');
                                            }
                                        }                                  
                                    }
                                );
                            }
                        }); 
                    } else
                        res.send({
                            error: 'Null data in req.body'
                        });
                } else {
                    res.send({
                        error: 'Invalid token'
                    });
                }
            }
        });
    });


    // app.post('/api/payment', app.permission.check(), (req, res) => { 
    //     const suffixKeys= ['smsAPIToken', 'moneyLine', 'moneyStr', 'contentLine', 'contentStr', 'banks']; //'moneyStartStr', 'moneyEndStr', 'contentStartStr', 'contentEndStr'
    //     const keys = suffixKeys.map(item => `${app.appName}:state:${item}`);
    //     app.redis.mget(keys, (error, values) => {
    //         if(error ||!values || values.length == 0){
    //             res.send({error:'Error when get token'});
    //         } else {
    //             console.log(values,'values');
    //             if(req.body.token == values[0]){ // check token sent from app SMSChecker
    //                 if(req.body.data){
    //         const {originatingAddress, body, timestamp} = req.body.data; // check timestamp ?
    //         const BANKS = JSON.parse(values[5]), moneyStartStr = values[2].split('/:money/')[0], moneyEndStr = values[2].split('/:money/')[1],  
    //               contentStartStr = values[4].split('/:content/')[0], contentEndStr = values[4].split('/:content/')[1]; //moneyStartStr=values[1], HIEPPHAT=values[3]; // let ?  because it's dynamic 
    //         console.log(BANKS,'vBANKS');
    //         if(originatingAddress && BANKS.includes(originatingAddress.toUpperCase()) && body && body.includes(moneyStartStr)){ // && body.includes(HIEPPHAT)
    //             const TYPE='BC', DEBITACCOUNT='1121', CREDITACCOUNT = '131', CONTENT = 'Thu công nợ online'; 
    //             const moneyLineIndex = parseInt(values[1]), contentLineIndex = parseInt(values[3]);
    //             const mongoose = require('mongoose');
    //             const objectId = mongoose.Types.ObjectId(); // var id = new mongoose.Types.ObjectId();
    //             const code = TYPE + objectId.toString().toUpperCase();
    //             const payment = {
    //                 type: TYPE,
    //                 timeReceived: new Date(timestamp), // Date(timestamp * 1000) if length < 13 digit, second not milisecond 
    //                 code,
    //                 content: CONTENT,
    //                 debitAccount: DEBITACCOUNT,
    //                 creditAccount: CREDITACCOUNT,
    //                 debitObject: originatingAddress,
    //             };
    //                             // Gen regex to parse
    //             const reEscape = /[\-\[\]{}()+?.,\\\^$|#\s]/g;
    //             const preRegex = str => str.replace(reEscape, '\\$&');
    //             // Use config parse body of sms store in DB from FE by type of bank template
    //             // Parse amount of money by #line and filter string by number character, check > 0
    //             const lines = body.split(/\r\n|\n\r|\n|\r/); // It works on all operating systems, only for line format content
    //             if(lines && lines.length > 0){
    //                 const moneyLine = lines[moneyLineIndex], contentLine = lines[contentLineIndex];
    //                 if(moneyLine){
    //                     const moneyRegex = new RegExp(preRegex(moneyStartStr) + '(.+)' + preRegex(moneyEndStr),  'i');
    //                     const moneyPart = moneyLine.match(moneyRegex);
    //                     if(moneyPart){
    //                     let money = moneyPart[1].replace(/\D/g,''); // Strip all non-numeric characters from string
    //                     money = parseInt(money);
    //                     if(money > 0){
    //                         payment.moneyAmount = money;
    //                     }
    //                     } else console.log('match money fail');
    //                 }
    //                 if(contentLine){ //42354769 A1
    //                     const contentRegex = new RegExp(preRegex(contentStartStr) + '(.+)' + preRegex(contentEndStr),  'i');
    //                     let contentPart = contentLine.match(contentRegex); //check null
    //                     if(contentPart){
    //                         contentPart = contentPart[1].trim();  // regex = /.*(\b(\d{4}|\d{6})\b \b\w+\b).*/
    //                         contentPart = contentPart.match(/.*(\b(\d{9}|\d{12})\b \b\w+\b).*/); // need space between CMND && CType
    //                         if(contentPart){
    //                             contentPart = contentPart[1].trim(); // contentPart now is 42354769 A1
    //                             const contentBodys = contentPart.split(' ');
    //                                 if(contentBodys && contentBodys.length > 0){
    //                             const identityCard = contentBodys[0].trim(), courseTypeName = contentBodys[1].trim();
    //                             payment.creditObject = identityCard;
    //                             payment.courseTypeName = courseTypeName;
    //                             app.model.courseType.get({ title:  { $regex: courseTypeName, $options: 'i' } }, (error, item) => {
    //                                 if (error || !item) {
    //                                     res.send({ error: 'Nonexist courseType' });
    //                                 } else {
    //                                     const condition = {
    //                                         identityCard,
    //                                         courseType: item._id,
    //                                     };
    //                                     app.model.student.get(condition,(error,item)=>{
    //                                         if (error || !item) {
    //                                             res.send({ error: 'Nonexist student' });
    //                                         } else {
    //                                             item.hocPhiDaDong = (item.hocPhiDaDong || 0) + payment.moneyAmount; // plus fee paid
    //                                             item.save((error, student) => {
    //                                                 if (error || !student) {
    //                                                     res.send({ error });
    //                                                 } else {
    //                                             payment.student = item._id;
    //                                             payment.firstname = item.firstname;
    //                                             payment.lastname = item.lastname;
    //                                             payment.courseType = item.courseType && item.courseType._id;
    //                                             app.model.payment.create(payment, (error, item) => res.send({ error, item }));                                                        
    //                                                 }
                                                    
    //                                             });
    //                                         }
    //                                     });
    //                                 }
    //                             });
    //                         }
    //                         } else console.log('match detail content fail');
    //                     } else console.log('match content fail');
    //                 }
    //             }
    //         } else
    //             res.send({ error: 'Invalid SMS' });
    //     } else 
    //         res.send({ error:'Null data in req.body' });
    //             } else {
    //                 res.send({error:'Invalid token'});
    //             }
    //         }
    //     });
    // });

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