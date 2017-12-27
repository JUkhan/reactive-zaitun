var webpackMerge = require('webpack-merge');
var commonConfig = require('./base.webpack.config.js');
var path = require('path');
var webpack = require('webpack');
var ExtractTextPlugin = require('extract-text-webpack-plugin');

var basePath = __dirname;

module.exports = webpackMerge.strategy({
  entry: 'prepend',
})(commonConfig, {
  // For development https://webpack.js.org/configuration/devtool/#for-development
  devtool: 'inline-source-map',  
  output: {
    path: path.join(basePath, 'dist'),
    filename: '[name].js',
  },
  devServer: {
    port: 8080,
    hot: false,
  },
  plugins: [
    new webpack.HotModuleReplacementPlugin(),
    new ExtractTextPlugin({
      disable: true,
    }),
  ],
});
