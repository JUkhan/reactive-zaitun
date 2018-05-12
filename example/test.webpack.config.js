const path = require ('path');
var basePath = __dirname;
var glob = require("glob");

module.exports = {
  entry: glob.sync("./test/**/*.ts"),
  devtool: 'inline-source-map',
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        exclude: path.resolve (basePath, 'node_modules'),
        loader: 'awesome-typescript-loader',
        options: {
          useCache: true,
        },
      },
    ],
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js'],
  },
  output: {
    filename: 'test-bundle.js',
    path: path.resolve (__dirname, ''),
  },
};
