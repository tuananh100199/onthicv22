const fs = require('fs'),
    path = require('path'),
    package = require('./package');

const cleanFilesPluginOptions = [],
    CleanFilesPlugin = function (options) {
        options.forEach(option => {
            if (option.path) {
                option = Object.assign({ fileExtension: '.js' }, option, { path: __dirname + option.path });
                cleanFilesPluginOptions.push(option);
                console.log('\x1b[46m%s\x1b[0m', `Clean file in folder ${option.path}!`);
            }
        });
    };
CleanFilesPlugin.prototype.apply = compiler => {
    const removeFiles = (option) => {
        fs.readdirSync(option.path).forEach(filePath => {
            filePath = option.path + '/' + filePath;
            const state = fs.statSync(filePath);
            if (option.recursive && state.isDirectory()) {
                removeFiles(Object.assign({}, option, { path: filePath }));
            } else if (state.isFile() && filePath.endsWith(option.fileExtension) && (option.excludeExtension == null || !filePath.endsWith(option.excludeExtension))) {
                console.log('Delete file \x1b[36m%s\x1b[0m!', filePath);
                fs.unlinkSync(filePath);
            }
        });
    };
    
    compiler.hooks.done.tap('CleanFiles', () => cleanFilesPluginOptions.forEach(removeFiles));
};

const entry = {};
fs.readdirSync('./view').forEach(folder => {
    if (fs.lstatSync('./view/' + folder).isDirectory() && fs.existsSync('./view/' + folder + '/' + folder + '.jsx')) {
        entry[folder] = path.join(__dirname, '/view', folder, folder + '.jsx');
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
        filename: 'js/[name].js',
    },
    plugins: [
        ...genHtmlWebpackPlugins(argv.mode === 'production'),
        new CleanFilesPlugin(argv.mode === 'production' ?
            [
                { path: '/public/js', fileExtension: '.txt' },
            ] : [
                { path: '/public', fileExtension: '.svg' },
                { path: '/public', fileExtension: '.ttf' },
                { path: '/public', fileExtension: '.eot' },
                { path: '/public/js', fileExtension: '.txt' },
                { path: '/public/js', fileExtension: '.js', excludeExtension: '.min.js' },
                { path: '/public', fileExtension: '.template' }
            ])
    ],
    module: {
        rules: [
            { test: /\.pug$/, use: ['pug-loader'] },
            { test: /\.css$/, use: ['style-loader', 'css-loader'] },
            { test: /\.s[ac]ss$/i, use: ['style-loader', 'css-loader', 'sass-loader'] },
            {
                test: /\.(jpe?g|png|gif|woff|woff2|eot|ttf|svg)(\?[a-z0-9=.]+)?$/,
                use: 'url-loader?limit=100000'
            },
            {
                test: /\.jsx?$/, exclude: /node_modules/,
                use: {
                    options: {
                        plugins: ['@babel/plugin-syntax-dynamic-import', '@babel/plugin-proposal-class-properties'],
                        presets: ['@babel/preset-env', '@babel/preset-react'],
                        cacheDirectory: true,
                        cacheCompression: false
                    },
                    loader: 'babel-loader'
                }
            }
        ]
    },
    devServer: {
        contentBase: path.join(__dirname, 'public'),
        port: package.port + 1,
        compress: true,
        historyApiFallback: true,
        disableHostCheck: true
    },
    optimization: { minimize: true }
});
