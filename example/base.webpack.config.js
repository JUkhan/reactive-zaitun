var path = require ('path');
var HtmlWebpackPlugin = require ('html-webpack-plugin');
var webpack = require ('webpack');
var basePath = __dirname;
var ExtractTextPlugin = require ('extract-text-webpack-plugin');
var {CheckerPlugin} = require ('awesome-typescript-loader');
const CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = {
  context: path.join (basePath, 'src'),
  resolve: {
    modules: [basePath, path.resolve (basePath, 'src'), 'node_modules'],
    extensions: ['.ts', '.tsx', '.js', '.jsx',  '.scss', '.css'],
  },
  entry: {
    app: './main.ts',
    appStyles: [/*'./styles/devTool.scss',*/ './styles/styles.scss','./styles/ui.scss'],
    //vendor: [
      //'jquery',      
      //'materialize-css',
    //],
    //vendorStyles: [
      //'../node_modules/bootstrap/dist/css/bootstrap.css',
      //'../node_modules/materialize-css/dist/css/materialize.css',
    //],
  },
  module: {
    loaders: [
      {
        test: /\.tsx?$/,
        exclude: path.resolve (basePath, 'node_modules'),
        loader: 'awesome-typescript-loader',
        options: {
          useCache: true,
        },
      },
      {
        test: /\.scss$/,
        exclude: /node_modules/,
        loader: ExtractTextPlugin.extract ({
          fallback: 'style-loader',
          use: [
            {loader: 'css-loader'},
            {loader: 'sass-loader'},
          ],
        }),
      },
      {
        test: /\.css$/,
        exclude: /node_modules/,
        loader: ExtractTextPlugin.extract ({
          fallback: 'style-loader',
          use: {
            loader: 'css-loader',
          },
        }),
      },
      // Loading glyphicons => https://github.com/gowravshekar/bootstrap-webpack
      // Using here url-loader and file-loader
      {
        test: /\.(woff|woff2)(\?v=\d+\.\d+\.\d+)?$/,
        loader: 'url-loader?limit=10000&mimetype=application/font-woff',
      },
      {
        test: /\.ttf(\?v=\d+\.\d+\.\d+)?$/,
        loader: 'url-loader?limit=10000&mimetype=application/octet-stream',
      },
      {
        test: /\.eot(\?v=\d+\.\d+\.\d+)?$/,
        loader: 'file-loader',
      },
      {
        test: /\.svg(\?v=\d+\.\d+\.\d+)?$/,
        loader: 'url-loader?limit=10000&mimetype=image/svg+xml',
      },
      {
        test: /\.(png|jpg)$/,
        exclude: /node_modules/,
        loader: 'url-loader?limit=5000',
      },
      {
        test: /\.html$/,
        loader: 'html-loader',
      },
      {
        test: /\.worker\.js$/,
        use: { loader: 'worker-loader' }
      }
    ],
  },
  plugins: [
    new HtmlWebpackPlugin ({
      filename: 'index.html', //Name of file in ./dist/
      template: 'index.html', //Name of template in ./src
      hash: true,
    }),
    new webpack.optimize.CommonsChunkPlugin ({
      names: ['vendor', 'manifest'],
    }),
    new webpack.HashedModuleIdsPlugin (),
    new CheckerPlugin (),    
    new CopyWebpackPlugin([
      {from:'assets', to:'assets'}       
    ])
  ],
};
