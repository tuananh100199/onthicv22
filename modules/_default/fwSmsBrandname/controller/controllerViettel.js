module.exports = (app) => {
    const http = require('http');
    const viettelSmsKeys = ['usernameViettel','passwordViettel','brandName','totalSMSViettel'];
    app.sms.sendByViettel = (body,email)=>{
        const {phone,mess} = body;
        return new Promise((resolve)=>{
            app.model.setting.get(...viettelSmsKeys,data=>{
                const {usernameViettel:user,passViettel:pass,brandName} = data,
                dataEncode = Number(app.sms.checkNonLatinChar(mess)),
                tranId = `${phone}_${new Date().getTime()}`,
                dataRequest = JSON.stringify({user,pass,tranId,phone,dataEncode,mess,brandName});
                resolve(dataRequest);
            });
        }).then(dataRequest=> new Promise((resolve,reject)=>{
            console.log({dataRequest});
            const options ={
                host: '125.212.226.79',
                port: 9020,
                path: '/service/sms_api',
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json;charset=UTF-8',
                },
            };
                const request = http.request(options, response => {
                    console.log(`statusCode: ${response.statusCode}`);
                    response.on('data', data => {
                        let resData = {};
                        try {
                            resData = JSON.parse(data.toString());
                        } catch (e) {
                            console.error(e);
                            reject(e);
                        }
    
                        if(resData.code==1){// getData success
                            app.model.smsBrandName.create({email,phone,total:resData.totalSMS},(error,item)=>{
                                if(error || !item) reject('Saving SMS fail');
                                else{
                                    resolve({item,resData});
                                }
                            });
                        }else{
                            reject('Unsuccess request');
                        }
                    });
                  });
                  
                  request.on('error', error => console.error(error)||reject(error));
                  request.write(dataRequest);
                  request.end();
            
        }));
    };
    // Api ---------------------------------------------------------------------------------------------------------------------------------------
    
    
    app.post('/api/brand-name/viettel', (req, res) => {
        const {phone='0832202178',mess='Hello Le Ho Vy',email='levy310898@gmail.com'} = req.body;//for testing
        app.sms.sendByViettel({phone,mess},email)
        .then(item=>res.send({item}))
        .catch(error=>res.send({error}));
    });
};