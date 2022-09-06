module.exports = app => {
    
    app.createFolder(app.backupPath);
    app.createFolder(app.path.join(app.backupPath,'dbs'));
    app.createFolder(app.path.join(app.backupPath,'files'));
    app.createFolder(app.path.join(app.backupPath,'temp'));
    app.backup = {};
    app.backup.backupFilePath = {
        asset:app.assetPath,
        public:app.publicPath
    };
    app.backup.createDatabaseBackup = async () => {
        const date = new Date();
        const tempPath = app.path.join(app.assetPath, '/temp');
        //filename: backup_yyyymmdd_hhmmss
        const fileName = `backup_db_${date.getFullYear()}${(date.getMonth()+1).toString().padStart(2, '0')}${date.getDate().toString().padStart(2, '0')}_${date.getHours().toString().padStart(2, '0')}${date.getMinutes().toString().padStart(2, '0')}${date.getSeconds().toString().padStart(2, '0')}`;
        app.createFolder(app.path.join(tempPath,fileName));
        const mongoose = require('mongoose'),
        collections = mongoose.connection.collections,
        listError = [];
    
        const readAndWriteDb = (collectionName,modelName)=>{// đọc từng collection và tạo 1 collection json
            const model = new mongoose.model(modelName);
            return new Promise((resolve)=>{
                model.find({}).exec((error,items)=>{
                    if(error) resolve({error:collectionName,message:'Không đọc được db'});
                    else{
                        try{
                            app.fs.writeFileSync(app.path.join(tempPath,`${fileName}/${collectionName}.json`), JSON.stringify(items));
                            resolve({success:true});
                        }catch(error){
                            resolve({error:collectionName,message:'ghi lỗi'});
                        }
                    }
                });
            });
        };
        // đọc hết tất cả các collections và tạo folder backup.
    
        for(const collection in collections){
            let modelName = collections[collection].modelName;
            const response = await readAndWriteDb(collection,modelName);
            response && response.error && listError.push(response.error);
        }

        if (listError.length){
            app.deleteFolder(app.path.join(tempPath,fileName));
            return new Promise( resolve => resolve({error:listError}));
        } 

        //TODO: tạo file zip trong folder backup. tên file là backup_yyyymmdd_hhmmss. 
        // xóa folder backup vừa tạo trong temp bất kể tạo zip thành công hay không
        try{

            const archiver = require('archiver'), zip = archiver('zip');
            const folderPath = app.path.join(app.backupPath,'/dbs');
            const output = app.fs.createWriteStream(app.path.join(folderPath, `/${fileName}.zip`));
            output.on('close', function () {
                console.log(zip.pointer() + ' total bytes');
                console.log('archiver has been finalized and the output file descriptor has closed.');
                app.deleteFolder(app.path.join(tempPath,fileName));
            });
            zip.on('error', (err)=>{
                throw err;
            });
            zip.pipe(output);
            // append files from a sub-directory, putting its contents at the root of archive
            zip.directory(app.path.join(tempPath,fileName), false);
            zip.finalize();
        }catch(error){
            app.deleteFolder(app.path.join(tempPath,fileName));
            return new Promise (resolve=>resolve({error}));
        }
        // return link zip if success, return error if fail
        return new Promise (resolve=>resolve({success:true}));
    };

    app.backup.restoreDatabaseBackup = (fileName,done) =>{
        const extractPath = app.path.join(app.backupPath, 'restoreFolder');
        if(app.fs.existsSync(extractPath)) app.deleteFolder(extractPath);
        app.createFolder(extractPath);
        const filepath = app.path.join(app.backupPath,'/dbs/', fileName);
        if (app.fs.existsSync(filepath)) {
            const DecompressZip = require('decompress-zip'),unzipper = new DecompressZip(filepath);
            unzipper.on('error', error => console.error(error) || done(error));
            unzipper.on('extract', async () => {
                const mongoose = require('mongoose'),
                collections = mongoose.connection.collections,
                listError = [];
                const rewriteDb = async (collectionName,modelName)=>{
                    try {
                        const model = new mongoose.model(modelName),
                        datas = JSON.parse(app.fs.readFileSync(app.path.join(extractPath,`${collectionName}.json`),'utf8'));
                        await model.deleteMany({});
                        for(const data of datas){
                            await model.create(data);
                        }
                        return new Promise(resolve=>resolve({success:true}));
                    } catch (error) {
                        return new Promise(resolve=>resolve({error:collectionName,message:error}));
                    }
                };
                for(const collection in collections){
                    const modelName = collections[collection].modelName;
                    // TODO: clear collections data, then add data in backup
                    const response = await rewriteDb(collection,modelName);
                    response && response.error && listError.push(response);
                    // response && response.success && console.log(`${collection} done restore`);
                }

                if(listError.length){
                    app.deleteFolder(extractPath);
                    done && done(listError);
                }else{
                    app.deleteFolder(extractPath);
                    done && done();
                }
            });

            unzipper.extract({
                path: extractPath,
            });
        }else{
            app.deleteFolder(extractPath);
            done('not found backup');
        }
    };

    app.backup.deleteExpireBackup = (expireDay,folder)=>{
        const currentDate = new Date();
        const folderPath = app.path.join(app.backupPath,folder);
        app.fs.readdirSync(folderPath).forEach(fileName => {
            const state = app.fs.statSync(app.backupPath + '/' + fileName),
            createdDate = new Date(state.mtime),
            expireDate = new Date(createdDate.setDate(createdDate.getDate() + Number(expireDay)));
            if(expireDate.getTime()<currentDate.getTime()){
                app.deleteFile(app.path.join(folderPath, fileName));
            }
        });
    };

    app.backup.createFileBackup = async () =>{
        const date = new Date();
        const tempPath = app.path.join(app.backupPath, '/temp');
        const fileName = `backup_file_${date.getFullYear()}${(date.getMonth()+1).toString().padStart(2, '0')}${date.getDate().toString().padStart(2, '0')}_${date.getHours().toString().padStart(2, '0')}${date.getMinutes().toString().padStart(2, '0')}${date.getSeconds().toString().padStart(2, '0')}`;    
        const backupTempPath = app.path.join(tempPath,fileName);
        app.createFolder(backupTempPath);
        const fse = require('fs-extra');
        const createBackupFolder = async (backupPath,folderName)=>{
            if (app.fs.existsSync(backupPath)) {
                const desPath = app.path.join(backupPath,folderName);
                app.createFolder(desPath);
                const srcPath = app.backup.backupFilePath[folderName];
                return new Promise(resolve=>{
                    try{
                        fse.copySync(srcPath,desPath);
                        resolve();
                    }catch(error){
                        console.log(error)||resolve({error});
                    }
                });
                
            }else{
                return new Promise(resolve=>resolve({error:'not found folder'}));
            }
        };
        try{
            let listError = [];
            Object.keys(app.backup.backupFilePath).forEach(async key=>{
                const response = await createBackupFolder(backupTempPath,key);
                if(!response || response.error) listError.push(`create folder backup ${key} fail`);
            });
            // await createBackupFolder(backupTempPath,'asset');
            if(listError.length)throw (listError);
            else{
                const archiver = require('archiver'), zip = archiver('zip');
                const folderPath = app.path.join(app.backupPath,'/files');
                const output = app.fs.createWriteStream(app.path.join(folderPath, `/${fileName}.zip`));
                output.on('close', function () {
                    console.log(zip.pointer() + ' total bytes');
                    console.log('archiver has been finalized and the output file descriptor has closed.');
                    app.deleteFolder(app.path.join(tempPath,fileName));
                });
                zip.on('error', (err)=>{
                    throw err;
                });
                zip.pipe(output);
                // append files from a sub-directory, putting its contents at the root of archive
                zip.directory(app.path.join(tempPath,fileName), false);
                zip.finalize();
            }
            // return link zip if success, return error if fail
            return new Promise (resolve=>resolve({success:true}));
        }catch(error){
            app.deleteFolder(app.path.join(tempPath,fileName));
            return new Promise(resolve=>resolve({error}));
        }
    };

    app.backup.restoreFileBackup = (fileName,done) =>{
        const extractPath = app.path.join(app.backupPath,'/temp', 'restoreFolder');
        if(app.fs.existsSync(extractPath)) app.deleteFolder(extractPath);
        app.createFolder(extractPath);
        const filepath = app.path.join(app.backupPath,'/files/', fileName);
        if (app.fs.existsSync(filepath)) {
            const DecompressZip = require('decompress-zip'),unzipper = new DecompressZip(filepath);
            unzipper.on('error', error => console.error(error) || done(error));
            unzipper.on('extract', async () => {
                const fse = require('fs-extra');
                let listError = [];
                Object.keys(app.backup.backupFilePath).forEach(key=>{
                    const srcPath = app.path.join(extractPath,key),
                    desPath = app.backup.backupFilePath[key];
                    try{
                        fse.copySync(srcPath,desPath);
                    }catch(error){
                        listError.push(error);
                    }
                });      
                if(listError.length){
                    app.deleteFolder(extractPath);
                    done && done(listError);
                }else{
                    app.deleteFolder(extractPath);
                    done && done();
                }
            });

            unzipper.extract({
                path: extractPath,
            });
        }else{
            app.deleteFolder(extractPath);
            done('not found backup');
        }
    };

    const menu = {
        parentMenu: app.parentMenu.setting,
        menus: {
            2050: { title: 'Backup', link: '/user/backup', icon: 'fa-braille', backgroundColor: '#4db6ac' }
        }
    };
    app.permission.add({ name: 'backup:read', menu }, { name: 'backup:write' }, { name: 'backup:delete' });

    app.get('/user/backup', app.permission.check('backup:read'), app.templates.admin);

    //  APIs Backup Database---------------------------------------------------------------------------------------------------------------------------------

    app.get('/api/backup/database/all', app.permission.check('backup:read'), (req, res) => {
        const items = [];
        const folderPath = app.path.join(app.backupPath,'/dbs');
        app.fs.readdirSync(folderPath).forEach(filename => {
            const state = app.fs.statSync(folderPath + '/' + filename);
            if (state.isFile()) {
                items.push({ filename, createdDate: state.mtime, size:state.size });
            }
        });
        res.send({ items });
    });

    app.post('/api/backup/database', app.permission.check('backup:write'), async (req, res) => {
        const response = await app.backup.createDatabaseBackup();
        if(response && response.error) res.send({error:response.error});
        else res.send({});
    });

    app.post('/api/backup/database/restore', app.permission.check('backup:write'), (req, res) => {
        const fileName = req.body.fileName;
        app.backup.restoreDatabaseBackup(fileName,error=>res.send({error}));
    });

    app.delete('/api/backup/database', app.permission.check('backup:delete'), (req, res) => {
        if (req.body.filename) {
            const filepath = app.path.join(app.backupPath,'/dbs/', req.body.filename),
                state = app.fs.statSync(filepath);
            if (app.fs.existsSync(filepath) && state.isFile()) {
                app.deleteFile(filepath, () => res.send({}));
            }
        } else {
            res.send({ error: 'Invalid filename!' });
        }
    });

    app.get('/api/backup/database/download/:fileName', app.permission.check('backup:read'), (req, res) => {
        const { fileName } = req.params;
        const dir = app.path.join(app.backupPath, `/dbs/${fileName}`);
        if (app.fs.existsSync(dir)) {
            return res.sendFile(dir);

        }else{
            res.status(404).send('Not Found!');
        }
    });

    //  APIs Backup File---------------------------------------------------------------------------------------------------------------------------------

    app.get('/api/backup/file/all', app.permission.check('backup:read'), (req, res) => {
        const items = [];
        const folderPath = app.path.join(app.backupPath,'/files');
        app.fs.readdirSync(folderPath).forEach(filename => {
            const state = app.fs.statSync(folderPath + '/' + filename);
            if (state.isFile()) {
                items.push({ filename, createdDate: state.mtime, size:state.size });
            }
        });
        res.send({ items });
    });

    app.post('/api/backup/file', app.permission.check('backup:write'), async (req, res) => {
        const response = await app.backup.createFileBackup();
        if(response && response.error){
            res.send({error:response.error});
        } 
        else res.send({});
    });

    app.post('/api/backup/file/restore', app.permission.check('backup:write'), (req, res) => {
        const fileName = req.body.fileName;
        app.backup.restoreFileBackup(fileName,error=>res.send({error}));
    });

    app.delete('/api/backup/file', app.permission.check('backup:delete'), (req, res) => {
        if (req.body.filename) {
            const filepath = app.path.join(app.backupPath,'/files/', req.body.filename),
                state = app.fs.statSync(filepath);
            if (app.fs.existsSync(filepath) && state.isFile()) {
                app.deleteFile(filepath, () => res.send({}));
            }
        } else {
            res.send({ error: 'Invalid filename!' });
        }
    });

    app.get('/api/backup/file/download/:fileName', app.permission.check('backup:read'), (req, res) => {
        const { fileName } = req.params;
        const dir = app.path.join(app.backupPath, `/files/${fileName}`);
        if (app.fs.existsSync(dir)) {
            return res.sendFile(dir);

        }else{
            res.status(404).send('Not Found!');
        }
    });
    // daily schedule
    app.schedule('0 0 * * *',()=>{
        // tạo backup daily
        app.model.setting.get('backupCreateDaily','backupDeleteDaily','backupExpireDay',data=>{
            if (app.primaryWorker && data.backupCreateDaily && data.backupCreateDaily=='true') app.backup.createBackup();
            if (app.primaryWorker && data.backupDeleteDaily && data.backupCreateDaily=='true' && data.backupExpireDay){
                app.backup.deleteExpireBackup(data.backupExpireDay,'dbs');
            } 
        });
    });
    
};