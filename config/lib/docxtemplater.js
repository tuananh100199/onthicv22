module.exports = app => {
    const PizZip = require('pizzip');
    const Docxtemplater = require('docxtemplater');
    const ImageModule = require('docxtemplater-image-module-free');
    const fs = require('fs');
    const path = require('path');
    // Demo: https://docxtemplater.com/demo
    app.docx = {
        replaceErrors: (key, value) => {
            if (value instanceof Error) {
                return Object.getOwnPropertyNames(value).reduce(function(error, key) {
                    error[key] = value[key];
                    return error;
                }, {});
            }
            return value;
        },
        errorHandler: (error) => {
            if (error.properties && error.properties.errors instanceof Array) {
                const errorMessages = error.properties.errors.map(function(error) {
                    return error.properties.explanation;
                }).join('\n');
            }
            throw error;
        },
        generateFile: (inputFile, data, done) => {
            //Load the docx file as a binary
            const content = fs.readFileSync(app.publicPath + inputFile, 'binary');
            const zip = new PizZip(content);
            try {
                let doc = new Docxtemplater(zip);
                doc.setData(data);
                // render the document (replace all occurences of {first_name} by John, {last_name} by Doe, ...)
                doc.render()
                var buf = doc.getZip().generate({ type: 'nodebuffer' });
                done && done(null, buf);
            } catch (error) { done && done(error); }
        },
        generateFileHasImage: (inputFile, data, done) => {
            //Below the options that will be passed to ImageModule instance
            let opts = {}
            opts.centered = true; //Set to true to always center images
            opts.fileType = 'docx'; //Or pptx
            //Pass your image loader
            opts.getImage = function(tagValue, tagName = 'image') {
                    //tagValue is 'examples/image.png'
                    //tagName is 'image'
                    return fs.readFileSync(tagValue);
                }
                //Pass the function that return image size
            opts.getSize = function(img, tagValue, tagName = 'image') {
                //img is the image returned by opts.getImage()
                //tagValue is 'examples/image.png'
                //tagName is 'image'
                //tip: you can use node module 'image-size' here
                return [120, 120];
            }
            let imageModule = new ImageModule(opts);
            const content = fs.readFileSync(inputFile, 'binary');
            const zip = new PizZip(content);
            // try {
            let doc = new Docxtemplater();
            doc.attachModule(imageModule);
            doc.loadZip(zip);
            doc.setData(data);
            // render the document (replace all occurences of {first_name} by John, {last_name} by Doe, ...)
            doc.render()
            var buf = doc.getZip().generate({ type: 'nodebuffer' });
            done && done(null, buf);
            // } catch (error) { done && done(error); }
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
                errorHandler(error);
            }
            //set the templateVariables
            doc.setData(data);
            try {
                // render the document (replace all occurences of {first_name} by John, {last_name} by Doe, ...)
                doc.render();
            } catch (error) {
                // Catch rendering errors (errors relating to the rendering of the template : angularParser throws an error)
                errorHandler(error);
            }
            var buf = doc.getZip().generate({ type: 'nodebuffer' });
            // buf is a nodejs buffer, you can either write it to a file or do anything else with it.
            fs.writeFileSync(app.publicPath + outputFile, buf);
            done();
        },
    }
}