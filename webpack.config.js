const package = require('./package'),
    fs = require('fs'),
    path = require('path'),
    endOfLine = require('os').EOL;

const cleanFilesluginOptions = [],
    CleanFileslugin = function (options) {
        options.forEach(option => {
            if (option.path) {
                option = Object.assign({ fileExtension: '.js' }, option, { path: __dirname + option.path });
                cleanFilesluginOptions.push(option);
                console.log(`  - Clean files in folder ${option.path}!`);
            }
        });
    };
CleanFileslugin.prototype.apply = compiler => {
    const removeFiles = (option) => {
        fs.readdirSync(option.path).forEach(filePath => {
            filePath = option.path + '/' + filePath;
            const state = fs.statSync(filePath);
            if (option.recursive && state.isDirectory()) {
                removeFiles(Object.assign({}, option, { path: filePath }));
            } else if (state.isFile() && filePath.endsWith(option.fileExtension) && (option.excludeExtension == null || !filePath.endsWith(option.excludeExtension))) {
                console.log(`Delete file ${filePath}`);
                fs.unlinkSync(filePath);
            }
        });
    };

    compiler.hooks.done.tap('CleanFiles', () => cleanFilesluginOptions.forEach(removeFiles));
};

const moduleContainer = { admin: {}, home: {} }, // Add template here
    templateNames = Object.keys(moduleContainer);
const UpdateModulesPlugin = function (options) { };
UpdateModulesPlugin.prototype.apply = compiler => compiler.hooks.done.tap('UpdateModules', () => {
    templateNames.forEach(templateName => {
        moduleContainer[templateName].moduleNames = [];
        moduleContainer[templateName].importText = '// That code below is generated automatically. Do not change them manually!\n';
    });

    const moduleData = [];
    fs.readdirSync(`./modules`).forEach(mainModuleName => {
        fs.statSync(`./modules/${mainModuleName}`).isDirectory() && fs.readdirSync(`./modules/${mainModuleName}`).forEach(moduleName => {
            if (fs.statSync(`./modules/${mainModuleName}/${moduleName}`).isDirectory() && fs.existsSync(`./modules/${mainModuleName}/${moduleName}/index.jsx`)) {
                moduleData.push(mainModuleName + '|' + moduleName);
            }
        });
    });
    moduleData.sort().forEach(item => {
        const [mainModuleName, moduleName] = item.split('|');
        const moduleTextLines = fs.readFileSync(`./modules/${mainModuleName}/${moduleName}/index.jsx`).toString().split(endOfLine);
        if (moduleTextLines.length && moduleTextLines[0].startsWith('//TEMPLATES: ')) {
            const templates = moduleTextLines[0].substring('//TEMPLATES: '.length).split('|');
            templateNames.forEach(templateName => {
                if (templates.indexOf(templateName) != -1) {
                    moduleContainer[templateName].moduleNames.push(moduleName);
                    moduleContainer[templateName].importText += `import ${moduleName} from 'modules/${mainModuleName}/${moduleName}/index';\n`;
                }
            });
        } else {
            console.warn(`  - Warning: ${mainModuleName}:${moduleName} không thuộc template nào cả!`);
        }
    });

    templateNames.forEach(templateName => {
        const templateModule = moduleContainer[templateName];
        if (templateModule.preModuleNames == null || templateModule.preModuleNames.length != templateModule.moduleNames.length) {
            templateModule.preModuleNames = [...templateModule.moduleNames];
            fs.writeFileSync(`./view/${templateName}/modules.jsx`, `${templateModule.importText}\nexport const modules = [${templateModule.moduleNames.join(', ')}];`);
        }
    });
});

const entry = {};
fs.readdirSync('./view').forEach(folder => {
    if (fs.lstatSync('./view/' + folder).isDirectory() && fs.existsSync('./view/' + folder + '/' + folder + '.jsx')) {
        entry[folder] = path.join(__dirname, 'view', folder, folder + '.jsx');
    }
});
const genHtmlWebpackPlugins = (isProductionMode) => {
    const HtmlWebpackPlugin = isProductionMode ? require(require.resolve('html-webpack-plugin', { paths: [require.main.path] })) : require('html-webpack-plugin'),
        plugins = [],
        htmlPluginOptions = {
            inject: false,
            hash: true,
            minifyOptions: { removeComments: true, collapseWhitespace: true, conservativeCollapse: true },
            title: package.title,
            keywords: package.keywords,
            version: package.version,
            description: package.description,
        };
    fs.readdirSync('./view').forEach(filename => {
        const template = `./view/${filename}/${filename}.pug`;
        if (filename != '.DS_Store' && fs.existsSync(template) && fs.lstatSync(template).isFile()) {
            const options = Object.assign({ template, filename: filename + '.template' }, htmlPluginOptions);
            plugins.push(new HtmlWebpackPlugin(options));
        }
    });
    return plugins;
};

module.exports = (env, argv) => ({
    entry,
    output: {
        path: path.join(__dirname, 'public'),
        publicPath: '/',
        filename: 'js/[name].[contenthash].js',
    },
    plugins: [
        ...genHtmlWebpackPlugins(argv.mode === 'production'),
        new CleanFileslugin(argv.mode === 'production' ?
            [
                { path: '/public/js', fileExtension: '.txt' },
            ] : [
                { path: '/public/js', fileExtension: '.txt' },
                { path: '/public/js', fileExtension: '.js', excludeExtension: '.min.js' },
                { path: '/public', fileExtension: '.template' },
            ]),
        new UpdateModulesPlugin(),
    ],
    module: {
        rules: [
            { test: /\.pug$/, use: ['pug-loader'] },
            { test: /\.css$/i, use: ['style-loader', 'css-loader'] },
            { test: /\.s[ac]ss$/i, use: ['style-loader', 'css-loader', 'sass-loader'] },
            {
                test: /\.jsx?$/, exclude: /node_modules/,
                use: {
                    options: {
                        plugins: ['@babel/plugin-syntax-dynamic-import', '@babel/plugin-proposal-class-properties'],
                        presets: ['@babel/preset-env', '@babel/preset-react'],
                        cacheDirectory: true,
                        cacheCompression: false,
                    },
                    loader: 'babel-loader',
                }
            },
        ]
    },
    devServer: {
        contentBase: path.join(__dirname, 'public'),
        port: package.port + 1,
        compress: true,
        historyApiFallback: true,
        disableHostCheck: true,
        open: true,
    },
    resolve: {
        alias: { exceljsFE: path.resolve(__dirname, 'node_modules/exceljs/dist/exceljs.min') },
        modules: [path.resolve(__dirname, './'), 'node_modules'],
        extensions: ['.js', '.jsx', '.json'],
    },
    optimization: { minimize: true },
});