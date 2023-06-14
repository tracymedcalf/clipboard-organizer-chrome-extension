const path = require('path');
const CopyPlugin = require('copy-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

module.exports = {
    mode: "development",
    devtool: "inline-source-map",
    entry: {
        content_script: './src/content_script.js',
        popup: './src/popup.tsx',
        options: './src//options.tsx',
        context_menu: './src/context_menu.js',
    },
    devServer: {
        hot: true,
    },
    output: {
        filename: '[name].js',
        path: path.resolve(__dirname, 'dist'),
        clean: true,
    },
    plugins: [
        new CopyPlugin({
            patterns: [
                { from: 'static' },
                'node_modules/bootstrap/dist/css/bootstrap\.min\.css',
                'node_modules/bootstrap/dist/css/bootstrap\.min\.css\.map',
            ],
        }),
    ],
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                use: 'ts-loader',
                exclude: /node_modules/,
            },
        ],
    },
    resolve: {
        extensions: ['.tsx', '.ts', '.js'],
    },
};
