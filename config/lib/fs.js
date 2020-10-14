module.exports = app => {
    
    // Download file (http / https)
    app.downloadFile = (url, path) => {
        let network = require(url.startsWith('http') ? 'http' : 'https'),
            file = app.fs.createWriteStream(path);
        network.get(url, response => response.pipe(file));
    };
    
    app.createFolder = function () {
        for (let i = 0; i < arguments.length; i++) {
            !app.fs.existsSync(arguments[i]) && app.fs.mkdirSync(arguments[i]);
        }
    };
    app.deleteFolder = path => {
        if (app.fs.existsSync(path)) {
            app.fs.readdirSync(path).forEach(file => {
                const curPath = path + '/' + file;
                if (app.fs.lstatSync(curPath).isDirectory()) {
                    app.deleteFolder(curPath);
                } else {
                    app.fs.unlinkSync(curPath);
                }
            });
            app.fs.rmdirSync(path);
        }
    };
    
    app.deleteImage = (image, done) => {
        if (image && image !== '') {
            let imagePath = app.path.join(app.publicPath, image),
                imageIndex = imagePath.indexOf('?t=');
            if (imageIndex != -1) {
                imagePath = imagePath.substring(0, imageIndex);
            }
            
            if (app.fs.existsSync(imagePath)) {
                app.fs.unlinkSync(imagePath);
            }
        }
        if (done) done();
    };
    
    app.deleteFile = (path, done) => {
        if (path && path !== '') {
            const index = path.indexOf('?t=');
            if (index != -1) path = path.substring(0, index);
            if (app.fs.existsSync(path)) app.fs.unlinkSync(path);
        }
        if (done) done();
    };
    
    app.clone = function () {
        let result = {};
        for (let i = 0, length = arguments.length; i < length; i++) {
            const obj = JSON.parse(JSON.stringify(arguments[i]));
            Object.keys(obj).forEach(key => result[key] = obj[key]);
        }
        return result;
    };
    
    app.parseArgToString = (arguments) => {
        let returnString = '';
        for (let i = 0; i < arguments.length; i++) {
            returnString += arguments[i] + (i < arguments.length - 1 ? ', ' : '');
        }
        return returnString;
    };
};