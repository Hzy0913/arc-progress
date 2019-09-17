const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

const ENV = process.env;

const prdWebpackConfig = {
  mode: 'production',
  entry: path.resolve(__dirname, '../example/demos.ts'),
  output: {
    path: path.join(__dirname, '../preview'),
    filename: 'arc-progress.main[hash].js',
    publicPath: '/arc-progress',
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
      {test: /\.css$/, loader: 'style-loader!css-loader'},
      {
        test: /\.(png|jpg|gif|svg)$/,
        loader: 'url-loader',
        options: {
          limit: 128192,
          name: '[name].[ext]?[hash]'
        }
      }
    ]
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: path.resolve(__dirname, '../static/index.html'),
    })
  ]
};

module.exports = prdWebpackConfig;
