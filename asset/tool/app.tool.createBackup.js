let appConfig = require('../../package');
const path = require('path');
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
    app.createFolder(app.path.join(app.assetPath, '/tool/backup'));
    const mongoose = require('mongoose'),
    collections = mongoose.connection.collections,
    listError = [];

    const readAndWriteDb = (collectionName,modelName)=>{
        const model = new mongoose.model(modelName);
        return new Promise((resolve)=>{
            model.find({}).exec((error,items)=>{
                if(error) resolve({error:collectionName,message:'Không đọc được db'});
                else{
                    try{
                        app.fs.writeFileSync(app.path.join(app.assetPath,`/tool/backup/${collectionName}.json`), JSON.stringify(items));
                        resolve({success:true});
                    }catch(error){
                        resolve({error:collectionName,message:'ghi lỗi'});
                    }
                }
            });
        })
    }
    // đọc hết tất cả các collections

    for(const collection in collections){
        let modelName = collections[collection].modelName;
        const writeData = await readAndWriteDb(collection,modelName);
        if(writeData && writeData.success){
            console.log(`${collection} save data success`);
        }else if(writeData && writeData.error){
            listError.push(writeData.error);
        }
    }

    if(listError.length){
        console.log('----------listError: --------------');
        console.log(listError);
    }
}

app.readyHooks.add('Run app.tool.createBackup', {
    ready: () => app.model,
    run
});