let appConfig = require('../../package');
const path = require('path');
const { reject } = require('lodash');
const { resolve } = require('path');
// Variables ==================================================================
const app = {
    isDebug: !__dirname.startsWith('/var/www/'),
    fs: require('fs'),
    path,
    database: {},
    model: {},
    publicPath: path.join(__dirname, '../../public'),
    assetPath: path.join(__dirname, '../'),
    modulesPath: path.join(__dirname, '../../modules')
};
if (!app.isDebug && app.fs.existsSync(app.assetPath + 'config.json')) appConfig = Object.assign({}, appConfig, require(app.assetPath + 'config.json'));
// Configure ==================================================================
require('../../config/common')(app);
require('../../config/lib/excel')(app);
require('../../config/lib/fs')(app);
require('../../config/database')(app, appConfig);

// Init =======================================================================
app.loadModules(false);

const run = async () => {
    const mongoose = require('mongoose'),
    collections = mongoose.connection.collections,
    listError = [];
    // const collectionInput = process.argv.slice(2);
    // console.log({collectionInput});
    const rewriteDb = async (collectionName,modelName)=>{
        try {
            const model = new mongoose.model(modelName),
            datas = JSON.parse(app.fs.readFileSync(app.path.join(app.assetPath,`/tool/backup/${collectionName}.json`),'utf8'));
            await model.deleteMany({});
            for(const data of datas){
                await model.create(data);
            }
            return new Promise(resolve=>resolve({success:true}));
        } catch (error) {
            console.error(error);
            return new Promise(resolve=>resolve({error:collectionName,message:error}));
        }
    }
    for(const collection in collections){
        const modelName = collections[collection].modelName;
        // TODO: clear collections data, then add data in backup
        if(modelName=='StaffInfo'||modelName=='Department'){
            const response = await rewriteDb(collection,modelName);
            response && response.error && listError.push(response);
            response && response.success && console.log(`${collection} done restore`);
        }
    }

    if(listError.length){
        console.log('----------listError--------------');
        console.log(listError);
    }else{
        console.log('not found error');
    }
}

app.readyHooks.add('Run app.tool.restoreData', {
    ready: () => app.model, 
    run
});