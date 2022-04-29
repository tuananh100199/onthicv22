module.exports = app => {
    app.permission.add(
        { name: 'payment:read', menu: { parentMenu: app.parentMenu.accountant, menus: {7001: { title: 'Thu công nợ', link: '/user/payment' }} } },
        { name: 'payment:write' },
        { name: 'payment:delete' },
        { name: 'payment:import' },
    );

    app.get('/user/payment', app.permission.check('payment:read'), app.templates.admin);
    app.get('/user/payment/import', app.permission.check('payment:write'), app.templates.admin);

    app.post('/api/payment', (req, res) => {
        app.database.redisDB.get(`${app.appName}:state:smsAPIToken`, (error, token) => { //get token to auth app
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
                                if (error || !item) {
                                    res.send({ error });
                                } else if (done) {
                                    done(item);
                                }
                            });
                        };
                        const value = { $regex: `.*${originatingAddress}.*`, $options: 'i' };
                        // check whether originatingAddress be in code of bank db ?
                        app.model.bank.get({ $or: [{ shortname: value }, { code: value }] }, (error, bank) => { //check active bank ?
                            if (error || !bank) {
                                res.send({ error: 'This bank doesn\'t exist in db' });
                            } else { //create sms when bank exist ?
                                createSms(
                                    (sms) => {
                                        const { sender, body, timeReceived } = sms;
                                        let { moneyLine, moneyStr, contentLine, contentStr, contentSyntax } = bank;
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
                                        if (lines && lines.length > 0) {
                                            moneyLine = lines[moneyLine];
                                            contentLine = lines[contentLine];
                                            if (moneyLine) {
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
                                            if (contentLine) {
                                                const contentRegex = new RegExp(preRegex(contentStartStr) + '(.+)' + preRegex(contentEndStr), 'i');
                                                let contentPart = contentLine.match(contentRegex); //check null
                                                if (contentPart) {
                                                    contentPart = contentPart[1].trim(); //Ex: 111122223 A1  // regex = /.*(\b(\d{9}|\d{12})\b \b\w+\b).*/
                                                    const contentSyntaxRegex = contentSyntax.replace('{cmnd}', '\\b(\\d{9}|\\d{12})').replace('{ten_loai_khoa_hoc}', '\\b\\w+'); // other character can be escape string ?
                                                    const contentRegex = new RegExp('.*(' + contentSyntaxRegex + ').*', 'i');
                                                    console.log(contentRegex, 'contentRegex');
                                                    contentPart = contentPart.match(contentRegex); // need space between CMND && CType /bug
                                                    if (contentPart) {
                                                        contentPart = contentPart[1].trim(); // contentPart now is 111122223 A1
                                                        // divide contentPart into CMND && CType
                                                        const contentSyntaxDetailRegex = contentSyntax.replace('{cmnd}', '(\\b\\d{9}|\\d{12})').replace('{ten_loai_khoa_hoc}', '(\\b\\w+)'); // other character can be escape string ?
                                                        const contentDetailRegex = new RegExp('.*' + contentSyntaxDetailRegex + '.*', 'i');
                                                        console.log(contentDetailRegex, 'contentDetailRegex ');
                                                        const contentBodys = contentPart.match(contentDetailRegex);
                                                        if (contentBodys && contentBodys.length > 0) {
                                                            let identityCard = '', courseTypeName = '';
                                                            if (contentBodys[1].length > contentBodys[2].length) { // cmnd first
                                                                identityCard = contentBodys[1].trim();
                                                                courseTypeName = contentBodys[2].trim();
                                                            } else {
                                                                identityCard = contentBodys[2].trim();
                                                                courseTypeName = contentBodys[1].trim();
                                                            }
                                                            payment.creditObject = identityCard;
                                                            payment.courseTypeName = courseTypeName;
                                                            app.model.courseType.get({ title: { $regex: courseTypeName, $options: 'i' } }, (error, item) => {
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
                                                                            const { courseFee, discount, lichSuDongTien } = item;
                                                                            const hocPhiDaDong = lichSuDongTien && lichSuDongTien.length ? lichSuDongTien.map(item => item.fee).reduce((prev, next) => prev + next) : 0;
                                                                            const hocPhiConLai = courseFee && courseFee.fee && courseFee.fee - (hocPhiDaDong ? hocPhiDaDong : 0) - ((discount && discount.fee) ? discount.fee : 0);
                                                                            const hocPhi = courseFee && courseFee.fee && courseFee.fee - ((discount && discount.fee) ? discount.fee : 0);
                                                                            const data = {
                                                                                fee: payment.moneyAmount,
                                                                                isOnlinePayment: true,
                                                                            };
                                                                            const year = new Date().getFullYear();
                                                                            app.model.student.addPayment({ _id: item._id }, data, (error, item) => {
                                                                                payment.sms = sms._id;
                                                                                payment.student = item._id;
                                                                                payment.firstname = item.firstname;
                                                                                payment.lastname = item.lastname;
                                                                                payment.courseType = item.courseType && item.courseType._id;
                                                                                if (error) res.send({ error });
                                                                                else {
                                                                                    const revenue = {
                                                                                        payer: item._id,
                                                                                        receiver: null,
                                                                                        fee: payment.moneyAmount,
                                                                                        date: new Date(),
                                                                                        type: 'online',
                                                                                        course: item.course && item.course._id,
                                                                                        courseType: item.courseType && item.courseType._id,
                                                                                    };
                                                                                    app.model.revenue.create(revenue, (error) => {
                                                                                        if (error) res.send({ error });
                                                                                        else {
                                                                                            app.model.setting.get('revenue', result => {
                                                                                                if (result && Object.keys(result).length != 0) {
                                                                                                    let value = result.revenue && result.revenue.split(';');
                                                                                                    value = value.sort((a, b) => parseInt(a.slice(0, 3)) - parseInt(b.slice(0, 3)));
                                                                                                    const indexYear = value.findIndex(item => item.startsWith(year));
                                                                                                    if (indexYear != -1) {
                                                                                                        const newItem = value[indexYear].split(':');
                                                                                                        newItem[2] = parseInt(newItem[2]);
                                                                                                        newItem[2] = newItem[2] + parseInt(payment.moneyAmount);
                                                                                                        value[indexYear] = newItem.join(':');
                                                                                                        data.revenue = value.join(';');
                                                                                                    } else {
                                                                                                        const indexPreviousYear = value.findIndex(item => item.startsWith(year - 1));
                                                                                                        if (indexPreviousYear != -1) {
                                                                                                            const newItem = value[indexPreviousYear].split(':');
                                                                                                            newItem[2] = parseInt(newItem[2]);
                                                                                                            newItem[2] = newItem[2] + parseInt(payment.moneyAmount);
                                                                                                            data.revenue = result.revenue + year + ':revenue:' + newItem[2];
                                                                                                        } else {
                                                                                                            data.revenue = result.revenue + year + ':revenue:' + parseInt(payment.moneyAmount);
                                                                                                        }
                                                                                                    }
                                                                                                    app.model.setting.set(data, err => {
                                                                                                        if (err) {
                                                                                                            res.send({ error: 'Update doanh thu hàng năm bị lỗi' });
                                                                                                        } else {
                                                                                                            if (hocPhi && (hocPhiConLai - data.fee) <= (0)) {
                                                                                                                app.model.student.update({ _id: item._id }, { activeKhoaThucHanh: true }, (error) => {
                                                                                                                    if (error) res.send({ error });
                                                                                                                    else {
                                                                                                                        app.model.payment.create(payment, (error, item) => {
                                                                                                                            if (error || !item) {
                                                                                                                                res.send({ error: error || 'Lỗi khi tạo thu công nợ' });
                                                                                                                            } else {
                                                                                                                                sms.isHandled = true;
                                                                                                                                sms.save((error, item) => res.send({ error, item }));
                                                                                                                            }
                                                                                                                        });
                                                                                                                    }
                                                                                                                });
                                                                                                            }
                                                                                                            else if (hocPhi && (hocPhiConLai - data.fee) <= (hocPhi / 2)) {
                                                                                                                app.model.student.update({ _id: item._id }, { activeKhoaLyThuyet: true }, (error) => {
                                                                                                                    if (error) res.send({ error });
                                                                                                                    else {
                                                                                                                        app.model.payment.create(payment, (error, item) => {
                                                                                                                            if (error || !item) {
                                                                                                                                res.send({ error: error || 'Lỗi khi tạo thu công nợ' });
                                                                                                                            } else {
                                                                                                                                sms.isHandled = true;
                                                                                                                                sms.save((error, item) => res.send({ error, item }));
                                                                                                                            }
                                                                                                                        });
                                                                                                                    }
                                                                                                                });
                                                                                                            } else {
                                                                                                                app.model.payment.create(payment, (error, item) => {
                                                                                                                    if (error || !item) {
                                                                                                                        res.send({ error: error || 'Lỗi khi tạo thu công nợ' });
                                                                                                                    } else {
                                                                                                                        sms.isHandled = true;
                                                                                                                        sms.save((error, item) => res.send({ error, item }));
                                                                                                                    }
                                                                                                                });
                                                                                                            }
                                                                                                        }
                                                                                                    });
                                                                                                } else {
                                                                                                    data.revenue = year + ':revenue:' + parseInt(payment.moneyAmount);
                                                                                                    app.model.setting.set(data, err => {
                                                                                                        if (err) {
                                                                                                            res.send({ error: 'Update doanh thu hàng năm bị lỗi' });
                                                                                                        } else {
                                                                                                            if (hocPhi && (hocPhiConLai - data.fee) <= (0)) {
                                                                                                                app.model.student.update({ _id: item._id }, { activeKhoaThucHanh: true }, (error) => {
                                                                                                                    if (error) res.send({ error });
                                                                                                                    else {
                                                                                                                        app.model.payment.create(payment, (error, item) => {
                                                                                                                            if (error || !item) {
                                                                                                                                res.send({ error: error || 'Lỗi khi tạo thu công nợ' });
                                                                                                                            } else {
                                                                                                                                sms.isHandled = true;
                                                                                                                                sms.save((error, item) => res.send({ error, item }));
                                                                                                                            }
                                                                                                                        });
                                                                                                                    }
                                                                                                                });
                                                                                                            }
                                                                                                            else if (hocPhi && (hocPhiConLai - data.fee) <= (hocPhi / 2)) {
                                                                                                                app.model.student.update({ _id: item._id }, { activeKhoaLyThuyet: true }, (error) => {
                                                                                                                    if (error) res.send({ error });
                                                                                                                    else {
                                                                                                                        app.model.payment.create(payment, (error, item) => {
                                                                                                                            if (error || !item) {
                                                                                                                                res.send({ error: error || 'Lỗi khi tạo thu công nợ' });
                                                                                                                            } else {
                                                                                                                                sms.isHandled = true;
                                                                                                                                sms.save((error, item) => res.send({ error, item }));
                                                                                                                            }
                                                                                                                        });
                                                                                                                    }
                                                                                                                });
                                                                                                            } else {
                                                                                                                app.model.payment.create(payment, (error, item) => {
                                                                                                                    if (error || !item) {
                                                                                                                        res.send({ error: error || 'Lỗi khi tạo thu công nợ' });
                                                                                                                    } else {
                                                                                                                        sms.isHandled = true;
                                                                                                                        sms.save((error, item) => res.send({ error, item }));
                                                                                                                    }
                                                                                                                });
                                                                                                            }
                                                                                                        }
                                                                                                    });
                                                                                                }

                                                                                            });
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
    //     app.database.redisDB.mget(keys, (error, values) => {
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
            condition = req.query.pageCondition || {},filter=req.query.filter||{},sort=req.query.sort||null; 
        try {
            filter && app.handleFilter(filter,[],defaultFilter=>{
                condition={...condition,...defaultFilter};
            });
            if(filter.type){// họ tên
                condition['$expr']= {
                    '$regexMatch': {
                        'input': { '$concat': ['$type',''] },
                        'regex': `.*${filter.type}.*`,  //Your text search here
                        'options': 'i'
                    }
             };
            }
            if(condition.dateStart) {
                const { dateStart, dateEnd } = condition;
                condition.timeReceived = { $gte: dateStart, $lt: dateEnd};
                delete condition.dateStart;
                delete condition.dateEnd;
                app.model.payment.getPage(pageNumber, pageSize, condition,sort, (error, page) => res.send({ error, page }));
            } else app.model.payment.getPage(pageNumber, pageSize, condition, sort, (error, page) => res.send({ error, page }));
        } catch (error) {
            res.send({ error });
        }
    });
    
    app.get('/api/payment/export/:pageNumber/:pageSize/:filter/:sort/:dateStart/:dateEnd', app.permission.check('payment:write'), (req, res) => {
        const { dateStart, dateEnd, pageNumber, pageSize } = req.params;
        let filter=req.params.filter ? JSON.parse(req.params.filter) : {},sort=req.params.sort ? JSON.parse(req.params.sort) : null;
        let condition = {};
        if(dateStart && dateStart != '' && dateStart != 'undefined')
            condition = { timeReceived: {$gte: dateStart, $lt: dateEnd} };
        const sourcePromise =  app.excel.readFile(app.publicPath + '/document/BAO CAO THU CONG NO.xlsx');
        const getPayment = new Promise((resolve,reject)=>{ 
            if(filter.type){// họ tên
                condition['$expr']= {
                    '$regexMatch': {
                        'input': { '$concat': ['$type',''] },
                        'regex': `.*${filter.type}.*`,  //Your text search here
                        'options': 'i'
                    }
             };
            }
            app.model.payment.getPage(pageNumber, pageSize, condition, sort, (error, page) =>{
                error?reject(error):resolve(page);
            });
        });
        Promise.all([sourcePromise,getPayment]).then(([sourceWorkbook, page])=>{
            let worksheet = sourceWorkbook.getWorksheet(1);
            const list = page && page.list ? page.list : [];
            for(let i = 0;i<list.length;i++){
                const payment = list[i];
                let item = [];
                item.push(i+1);
                item.push(payment.type);
                item.push(payment.timeReceived);
                item.push(payment.code);
                item.push(payment.lastname + ' ' + payment.firstname);
                item.push(payment.content);
                item.push(payment.debitAccount);
                item.push(payment.creditAccount);
                item.push(payment.moneyAmount);
                item.push(payment.debitObject);
                item.push(payment.creditObject);
                item.push(payment.userImport ? (payment.userImport.lastname + ' ' + payment.userImport.firstname) : '');
                const maxCol = 12;
                const row = 3;
                const insertRow =worksheet.insertRow(row+i,item);
                let j=1;
                while(j<=maxCol){
                    insertRow.getCell(j).border = {
                        top: {style:'thin'},
                        left: {style:'thin'},
                        bottom: {style:'thin'},
                        right: {style:'thin'}
                      };
                    j+=1;
                }
            }
            app.excel.attachment(sourceWorkbook, res,'BAO CAO THU CONG NO.xlsx');
        });
    });

    app.uploadHooks.add('uploadPaymentFile', (req, fields, files, params, done) => {
        if (files.PaymentFile && files.PaymentFile.length > 0) {
            console.log('Hook: uploadExcelFile => your payment file upload');
            const srcPath = files.PaymentFile[0].path;
            app.excel.readFile(srcPath, workbook => {
                app.deleteFile(srcPath);
                if (workbook) {
                    const worksheet = workbook.getWorksheet(1), data = [], totalRow = worksheet.lastRow.number;
                    const handleUpload = (index = 3) => {
                        const values = worksheet.getRow(index).values;
                        if (values.length == 0 || index == totalRow + 1) {
                            done({ data });
                        } else {
                            const stringToDate = (values) => {
                                values = values ? values.trim() : '';
                                return values.length >= 10 ? new Date(values.slice(6, 10), values.slice(3, 5) - 1, values.slice(0, 2)) : null;
                            };
                            // const email = values[4] && values[4] != undefined ? values[4] : '';
                            data.push({
                                id: index - 1,
                                type: values[2],
                                timeReceived: stringToDate(values[3]),
                                code: values[4],
                                name: values[5],
                                content: values[6],
                                debitAccount: values[7],
                                creditAccount: values[8],
                                moneyAmount: values[9],
                                debitObject: values[10],
                                creditObject: values[11],
                            });
                            handleUpload(index + 1);
                        }
                    };
                    handleUpload();
                } else {
                    done({ error: 'Error' });
                }
            });
        }
    });

    app.post('/api/payment/import', app.permission.check('payment:import'), (req, res) => {
        const sessionUser = req.session.user;
        const { payments } = req.body;
        let err = null;
        if (payments && payments.length > 0) {
            const handleImport = (index = 0) => {
                if (index == payments.length) {
                    const dataEncryption = {
                        type: 'import',
                        author: sessionUser._id,
                        filename: 'Công nợ từ phần mềm kế toán',
                        chucVu: 'Kế toán'
                    };
                    app.model.encryption.create(dataEncryption, () => res.send({ error: err }));
                } else {
                    const { creditObject} = payments[index];
                    const payment = payments[index];
                    payment.userImport = sessionUser._id;
                    app.model.student.get({identityCard: creditObject}, (error, item) => {
                        if (error || !item) {
                            err = error;
                            handleImport(index + 1);
                        } else {
                            const { courseFee, discount, lichSuDongTien } = item;
                            const hocPhiDaDong = lichSuDongTien && lichSuDongTien.length ? lichSuDongTien.map(item => item.fee).reduce((prev, next) => prev + next) : 0;
                            const hocPhiConLai = courseFee && courseFee.fee && courseFee.fee - (hocPhiDaDong ? hocPhiDaDong : 0) - ((discount && discount.fee) ? discount.fee : 0);
                            const hocPhi = courseFee && courseFee.fee && courseFee.fee - ((discount && discount.fee) ? discount.fee : 0);
                            const data = {
                                fee: payment.moneyAmount,
                                isOnlinePayment: false,
                            };
                            const year = new Date().getFullYear();
                            app.model.student.addPayment({ _id: item._id }, data, (error, item) => {
                                payment.student = item._id;
                                payment.firstname = item.firstname;
                                payment.lastname = item.lastname;
                                payment.courseType = item.courseType && item.courseType._id;
                                if(error) {
                                    err = error;
                                    handleImport(index + 1);
                                }
                                else{
                                    const revenue = {
                                        payer: item._id,
                                        receiver: null,
                                        fee: payment.moneyAmount,
                                        date: new Date(),
                                        type: 'offline',
                                        course: item.course && item.course._id,
                                        courseType: item.courseType && item.courseType._id,
                                    };
                                    app.model.revenue.create(revenue, (error) => {
                                        if(error) {
                                            err = error;
                                            handleImport(index + 1);
                                        } 
                                        else {
                                            app.model.setting.get('revenue', result => {
                                                if (result && Object.keys(result).length != 0) {
                                                    let value = result.revenue && result.revenue.split(';');
                                                    value = value.sort((a, b) => parseInt(a.slice(0, 3)) - parseInt(b.slice(0, 3)));
                                                    const indexYear = value.findIndex(item => item.startsWith(year));
                                                    if (indexYear != -1) {
                                                        const newItem = value[indexYear].split(':');
                                                        newItem[2] = parseInt(newItem[2]);
                                                        newItem[2] = newItem[2] + parseInt(payment.moneyAmount);
                                                        value[indexYear] = newItem.join(':');
                                                        data.revenue = value.join(';');
                                                    } else {
                                                        const indexPreviousYear = value.findIndex(item => item.startsWith(year - 1));
                                                        if (indexPreviousYear != -1) {
                                                            const newItem = value[indexPreviousYear].split(':');
                                                            newItem[2] = parseInt(newItem[2]);
                                                            newItem[2] = newItem[2] + parseInt(payment.moneyAmount);
                                                            data.revenue = result.revenue + year + ':revenue:' + newItem[2];
                                                        } else {
                                                            data.revenue = result.revenue + year + ':revenue:' + parseInt(payment.moneyAmount);
                                                        }
                                                    }
                                                    app.model.setting.set(data, err => {
                                                        if (err){
                                                            err = error;
                                                            handleImport(index + 1);
                                                        } else {
                                                            if(hocPhi && (hocPhiConLai-data.fee) <= (0)){
                                                                app.model.student.update({_id: item._id}, {activeKhoaThucHanh: true}, (error) => {
                                                                    if(error) {
                                                                        err = error;
                                                                        handleImport(index + 1);
                                                                    } 
                                                                    else {
                                                                        app.model.payment.create(payment, (error, item) =>{
                                                                            if(error || !item){
                                                                                err = error;
                                                                                handleImport(index + 1);
                                                                            } else {
                                                                                handleImport(index + 1);
                                                                            }
                                                                        });
                                                                    }
                                                                });
                                                            } 
                                                            else if(hocPhi && (hocPhiConLai-data.fee) <= (hocPhi/2)){
                                                                app.model.student.update({_id: item._id}, {activeKhoaLyThuyet: true}, (error) => {
                                                                    if(error) {
                                                                        err = error;
                                                                        handleImport(index + 1);
                                                                    } 
                                                                    else {
                                                                        app.model.payment.create(payment, (error, item) =>{
                                                                            if(error || !item){
                                                                                err = error;
                                                                                handleImport(index + 1);
                                                                            } else {
                                                                                handleImport(index + 1);
                                                                            }
                                                                        });
                                                                    }
                                                                });
                                                            }  else {
                                                                app.model.payment.create(payment, (error, item) =>{
                                                                    if(error || !item){
                                                                        err = error;
                                                                        handleImport(index + 1);
                                                                    } else {
                                                                        handleImport(index + 1);
                                                                    }
                                                                    });
                                                            }
                                                        }
                                                    });
                                                } else {
                                                    data.revenue = year + ':revenue:' + parseInt(payment.moneyAmount);
                                                    app.model.setting.set(data, err => {
                                                        if (err) if(error || !item){
                                                            err = error;
                                                            handleImport(index + 1);
                                                        } else {
                                                            if(hocPhi && (hocPhiConLai-data.fee) <= (0)){
                                                                app.model.student.update({_id: item._id}, {activeKhoaThucHanh: true}, (error) => {
                                                                    if(error) if(error || !item){
                                                                        err = error;
                                                                        handleImport(index + 1);
                                                                    }
                                                                    else {
                                                                        app.model.payment.create(payment, (error, item) =>{
                                                                            if(error || !item){
                                                                                err = error;
                                                                                handleImport(index + 1);
                                                                            } else {
                                                                                handleImport(index + 1);
                                                                            }
                                                                        });
                                                                    }
                                                                });
                                                            } 
                                                            else if(hocPhi && (hocPhiConLai-data.fee) <= (hocPhi/2)){
                                                                app.model.student.update({_id: item._id}, {activeKhoaLyThuyet: true}, (error) => {
                                                                    if(error) {
                                                                        err = error;
                                                                        handleImport(index + 1);
                                                                    }
                                                                    else {
                                                                        app.model.payment.create(payment, (error, item) =>{
                                                                            if(error || !item){
                                                                                err = error;
                                                                                handleImport(index + 1);
                                                                            } else {
                                                                                handleImport(index + 1);
                                                                            }
                                                                        });
                                                                    }
                                                                });
                                                            }  else {
                                                                app.model.payment.create(payment, (error, item) =>{
                                                                    if(error || !item){
                                                                        err = error;
                                                                        handleImport(index + 1);
                                                                    } else {
                                                                        handleImport(index + 1);
                                                                    }
                                                                    });
                                                            }
                                                        }
                                                    });
                                                }
                                
                                            });              
                                        }
                                    });
                                    
                                }
                            });
                        }
                    });
                }
            };
            handleImport();
            } else {
                res.send({ error: 'Danh sách thu công nợ trống!' });
            }
    });
};