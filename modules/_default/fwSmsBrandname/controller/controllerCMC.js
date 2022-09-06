module.exports = (app) => {
    const http = require('http');
    const cmcSmsKeys = ['usernameCMC','passwordCMC','brandNameCMC','totalSmsCMS'];
    app.sms.sendByCMC = (body,email)=>{
        const {phone:Phonenumber,mess:Message} = body;
        return new Promise((resolve)=>{
            app.model.setting.get(...cmcSmsKeys,data=>{
                const {usernameCMC:user,passwordCMC:pass,brandNameCMC:Brandname} = data,
                dataEncode = Number(app.sms.checkNonLatinChar(Message)),
                dataRequest = JSON.stringify({user,pass,Phonenumber,dataEncode,Message,Brandname});
                resolve(dataRequest);
            });
        }).then(dataRequest=> new Promise((resolve,reject)=>{
            console.log({dataRequest});
            const path = dataRequest.dataEncode ? '/CMC_TEST/api/sms/sendUTF' : '/CMC_TEST/api/sms/Send';
            delete dataRequest.dataEncode;
            console.log('data request send: ', {dataRequest});
            const options ={
                host: '124.158.6.45',
                path,
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
                            console.log({resData});
                        } catch (e) {
                            console.error(e);
                            reject(e);
                        }
    
                        if(resData.Code==1){// getData success
                            app.model.smsBrandName.create({email,phone:Phonenumber,total:resData.totalSMS},(error,item)=>{
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
    
    
    app.post('/api/brand-name/cmc', (req, res) => {
        console.log('into cmc test calling api');
        const {phone='0832202178',mess='Hello Le Ho Vy',email='levy310898@gmail.com'} = req.body;//for testing
        app.sms.sendByCMC({phone,mess},email)
        .then(item=>res.send({item}))
        .catch(error=>res.send({error}));
    });
};