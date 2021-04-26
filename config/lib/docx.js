module.exports = app => {
    const PizZip = require('pizzip');
    const Docxtemplater = require('docxtemplater');
    const ImageModule = require('docxtemplater-image-module-free');
    // Demo: https://docxtemplater.com/demo

    app.docx = {
        replaceErrors: (key, value) => {
            if (value instanceof Error) {
                return Object.getOwnPropertyNames(value).reduce(function (error, key) {
                    error[key] = value[key];
                    return error;
                }, {});
            }
            return value;
        },
        errorHandler: (error) => {
            if (error.properties && error.properties.errors instanceof Array) {
                // const errorMessages = error.properties.errors.map(error => error.properties.explanation).join('\n');
            }
            throw error;
        },
        generateFile: (inputFile, data, done) => {
            const content = app.fs.readFileSync(app.publicPath + inputFile, 'binary');
            const zip = new PizZip(content);
            try {
                let doc = new Docxtemplater(zip);
                doc.setData(data);
                doc.render();
                let buf = doc.getZip().generate({ type: 'nodebuffer' });
                done && done(null, buf);
            } catch (error) { done && done(error); }
        },
        generateFileHasImage: (inputFile, data, done) => {
            let opts = {
                centered: true,
                fileType: 'docx',
                getImage: tagValue => app.fs.readFileSync(tagValue),
                getSize: () => [120, 120],
                // getImage: function (tagValue, tagName = 'image') { // tagValue is 'examples/image.png' | 'image'
                //     return app.fs.readFileSync(tagValue);
                // },
                // getSize: function (img, tagValue, tagName = 'image') {
                //     // img is the image returned by opts.getImage()
                //     // tagValue is 'examples/image.png'
                //     // tagName is 'image'
                //     return [120, 120];
                // }
            };

            //Pass your image loader
            let imageModule = new ImageModule(opts);
            const content = app.fs.readFileSync(inputFile, 'binary');
            const zip = new PizZip(content);
            try {
                let doc = new Docxtemplater();
                doc.attachModule(imageModule);
                doc.loadZip(zip);
                doc.setData(data);
                doc.render();
                let buf = doc.getZip().generate({ type: 'nodebuffer' });
                done && done(null, buf);
            } catch (error) { done && done(error); }
        },
        writeDocumentFile: (inputFile, data, outputFile, done) => {
            const content = app.fs.readFileSync(app.publicPath + inputFile, 'binary');
            const zip = new PizZip(content);
            let doc;
            try {
                doc = new Docxtemplater(zip);
            } catch (error) {
                done({ error });
            }
            doc.setData(data);

            try {
                doc.render();
            } catch (error) {
                done({ error });
            }
            let buf = doc.getZip().generate({ type: 'nodebuffer' });
            app.fs.writeFile(app.publicPath + outputFile, buf, done);
        },
    };
};