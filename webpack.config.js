const fs = require('fs'),
    path = require('path'),
    package = require('./package'),
    HtmlWebpackPlugin = require('html-webpack-plugin'),
    MiniCssExtractPlugin = require('mini-css-extract-plugin');

let cleanFilesluginOptions = null,
    CleanFileslugin = function (options) {
        cleanFilesluginOptions = [];
        options.forEach(option => {
            if (option.path) {
                option = Object.assign({
                    fileExtension: '.js',
                    recursive: false
                }, option);
                option.path = __dirname + option.path;
                cleanFilesluginOptions.push(option);
                console.log('\x1b[46m%s\x1b[0m', 'Clean file ' + option.path + '!');
            }
        });
    };
CleanFileslugin.prototype.apply = compiler => {
    const removeFiles = (option) => {
        fs.readdirSync(option.path).forEach(filePath => {
            filePath = option.path + '/' + filePath;
            const state = fs.statSync(filePath);
            if (option.recursive && state.isDirectory()) {
                removeFiles({
                    path: filePath,
                    fileExtension: option.fileExtension,
                    excludeExtension: option.excludeExtension,
                    recursive: option.recursive
                });
            } else if (state.isFile() && filePath.endsWith(option.fileExtension) && (option.excludeExtension == null || !filePath.endsWith(option.excludeExtension))) {
                console.log('Delete file \x1b[36m%s\x1b[0m!', filePath);
                fs.unlinkSync(filePath);
            }
        });
    };

    compiler.plugin('done', () => {
        cleanFilesluginOptions.forEach(option => removeFiles(option));

        if (cleanFilesluginOptions.length == 0) { // production mode
            //TODO
        }
    });
};

const entry = {};
fs.readdirSync('./view').forEach(folder => {
    if (fs.lstatSync('./view/' + folder).isDirectory() && fs.existsSync('./view/' + folder + '/' + folder + '.jsx')) {
        entry[folder] = path.join(__dirname, 'view', folder, folder + '.jsx');
    }
});

const plugins = [],
    htmlPluginOptions = {
        inject: false,
        hash: true,
        minifyOptions: { removeComments: true, collapseWhitespace: true, conservativeCollapse: true },
        title: package.title,
        keywords: package.keywords,
        description: package.description
    };
fs.readdirSync('./view').forEach(filename => {
    const template = `./view/${filename}/${filename}.pug`;
    if (filename != '.DS_Store' && fs.existsSync(template) && fs.lstatSync(template).isFile()) {
        console.log(template)
        plugins.push(
            new HtmlWebpackPlugin(Object.assign({}, htmlPluginOptions, {
                template,
                filename: filename + '.template'
            }))
        );
    }
});

module.exports = (env, argv) => ({
    entry,
    output: {
        path: path.join(__dirname, 'public'),
        publicPath: '/',
        filename: 'js/[name].js',
    },
    module: {
        rules: [{
            test: /\.jsx?$/,
            exclude: /node_modules/,
            use: {
                query: {
                    plugins: ['@babel/syntax-dynamic-import', "@babel/plugin-proposal-class-properties"],
                    presets: ['@babel/preset-env', '@babel/preset-react']
                },
                loader: 'babel-loader'
            }
        }, {
            test: /\.scss$/,
            use: ['style-loader', 'css-loader', 'sass-loader']
        }, {
            test: /\.css$/,
            use: ['style-loader', 'css-loader']
        }, {
            test: /\.pug$/,
            use: 'pug-loader'
        }]
    },
    plugins: [
        ...plugins,
        new MiniCssExtractPlugin({
            filename: '[name].css',
            chunkFilename: '[id].css'
        }),
        new CleanFileslugin(argv.mode === 'production' ? [] : [{
            path: '/public/js',
            fileExtension: '.js',
            excludeExtension: '.min.js',
            recursive: false
        }, {
            path: '/public',
            fileExtension: '.template',
            recursive: true
        }])
    ],
    devServer: {
        contentBase: path.join(__dirname, 'public'),
        port: package.port + 1,
        historyApiFallback: true,
        disableHostCheck: true,
    }
});
