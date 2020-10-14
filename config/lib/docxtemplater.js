module.exports = (app) => {
    const PizZip = require('pizzip');
    const Docxtemplater = require('docxtemplater');
    const ImageModule = require('docxtemplater-image-module-free');
    
    const fs = require('fs');
    const path = require('path');
    
    app.docx = {
        // The error object contains additional information when logged with JSON.stringify (it contains a properties object containing all suberrors).
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
            console.log(JSON.stringify({ error: error }, app.docx.replaceErrors));
            
            if (error.properties && error.properties.errors instanceof Array) {
                const errorMessages = error.properties.errors
                .map(function (error) {
                    return error.properties.explanation;
                })
                .join('\n');
                console.log('errorMessages', errorMessages);
                // errorMessages is a humanly readable message looking like this :
                // 'The tag beginning with "foobar" is unopened'
            }
            throw error;
        },
        
        writeDocumentFile: (inputFile, data, outputFile, done) => {
            //Load the docx file as a binary
            const content = fs.readFileSync(app.publicPath + inputFile, 'binary');
            const zip = new PizZip(content);
            let doc;
            try {
                doc = new Docxtemplater(zip);
            } catch (error) {
                // Catch compilation errors (errors caused by the compilation of the template : misplaced tags)
                app.docx.errorHandler(error);
            }
            
            //set the templateVariables
            doc.setData(data);
            
            try {
                // render the document (replace all occurences of {first_name} by John, {last_name} by Doe, ...)
                doc.render();
            } catch (error) {
                // Catch rendering errors (errors relating to the rendering of the template : angularParser throws an error)
                app.docx.errorHandler(error);
            }
            
            var buf = doc.getZip().generate({ type: 'nodebuffer' });
            
            // buf is a nodejs buffer, you can either write it to a file or do anything else with it.
            fs.writeFileSync(app.publicPath + outputFile, buf);
            
            done();
        },
        
        writeDocumentHasImage: (inputFile, data, outputFile, done) => {
            let opts = {};
            opts.centered = false; //Set to true to always center images
            opts.fileType = 'docx'; //Or pptx
            
            opts.getImage = function (tagValue, tagName = 'image') {
                //tagValue is 'examples/image.png'
                //tagName is 'image'
                return fs.readFileSync(app.publicPath + tagValue);
            };
            
            //Pass the function that return image size
            opts.getSize = function (img, tagValue, tagName) {
                //img is the image returned by opts.getImage()
                //tagValue is 'examples/image.png'
                //tagName is 'image'
                //tip: you can use node module 'image-size' here
                return [ 100, 100 ];
            };
            
            var imageModule = new ImageModule(opts);
            
            const content = fs.readFileSync(app.publicPath + inputFile, 'binary');
            const zip = new PizZip(content);
            
            var doc = new Docxtemplater()
            .attachModule(imageModule)
            .loadZip(zip)
            .setData(data)
            .render();
            
            var buf = doc.getZip().generate({ type: 'nodebuffer' });
            
            fs.writeFileSync(app.publicPath + outputFile, buf);
            
            done();
        },
    };
};
