var webpackMerge = require('webpack-merge');
var commonConfig = require('./base.webpack.config.js');
var path = require('path');
var ExtractTextPlugin = require('extract-text-webpack-plugin');


var basePath = __dirname;

module.exports = webpackMerge(commonConfig, {
  devtool: 'cheap-module-source-map',
  output: {
    path: path.join(basePath, 'dist'),
    filename: '[chunkhash].[name].js',
  },
  plugins: [
    new ExtractTextPlugin({
      filename: '[chunkhash].[name].css',
      disable: false,
      allChunks: true,
    })
  ],
});
