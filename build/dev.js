const path = require('path');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const ProgressBarPlugin = require('progress-bar-webpack-plugin');
const Chalk = require('chalk');
const FriendlyErrorsPlugin = require('friendly-errors-webpack-plugin');

const port = 8989;
const host = '0.0.0.0';
module.exports = {
  mode: 'development',
  entry: path.resolve(__dirname, '../example/demos.ts'),
  output: {
    path: path.join(__dirname, 'dist'),
    filename: 'main.js',
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js'],
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: ['awesome-typescript-loader'],
      },
      {
        test: /\.tsx?$/,
        enforce: 'pre',
        exclude: /node_modules/,
        use: [
          {
            loader: 'tslint-loader',
          }
        ]
      },
      {test: /\.css$/, loader: 'style-loader!css-loader'},
      {
        test: /\.(png|jpg|gif|svg)$/,
        loader: 'url-loader',
        options: {
          limit: 8192,
          name: '[name].[ext]?[hash]'
        }
      }
    ]
  },
  plugins: [
    new HtmlWebpackPlugin({
      hash: true,
      template: path.resolve(__dirname, '../static/index.html'),
    }),
    new ProgressBarPlugin({
      complete: Chalk.green('█'),
      incomplete: Chalk.white('█'),
      format: '  :bar ' + Chalk.green.bold(':percent') + ' :msg',
      clear: false
    }),
    new FriendlyErrorsPlugin({
      compilationSuccessInfo: {
        notes: [`💻 Running: ${Chalk.green(`http://${host}:${port}`)} 🧞`],
      },
      onErrors: undefined
    }),
    new webpack.HotModuleReplacementPlugin(),
  ],
  devtool: 'inline-source-map',
  devServer: {
    port,
    contentBase: './dist',
    historyApiFallback: true,
    host,
    inline: true,
    hot: true,
    open: true,
    stats: 'errors-only',
    quiet: true
  },
};
