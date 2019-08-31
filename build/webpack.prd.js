/**
 * prd 配置未使用
 */

const path = require('path');
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;
const babelrc = require('./babelrc');

const NODE_ENV = process.env.NODE_ENV;
const prdWebpackConfig= {
  mode: 'production',
  // entry: path.resolve(__dirname, '../src/index.js'),
  entry: {
    './react/react': ['react'],
    './reactdom/redom': ['react-dom']
  },
  output: {
    path: path.join(__dirname, '../lib'),
    filename: "tplus-ui-mobile.js",
    libraryTarget: 'commonjs2'  //模块输出方式
  },
  optimization: {
    minimize: false
  },
  externals: {
    react: 'react', //打包时候排除react
    'react-dom': 'react-dom', //打包时候排除react
  },
  module: {
    rules: [
      {
        test: /(\.jsx|\.js)$/,
        loader: 'babel-loader',
        include: [
          path.resolve(__dirname, '../src'),
          path.resolve(__dirname, 'app.js'),
        ],
        options: babelrc
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
  plugins: []
};

if (NODE_ENV !== 'publish') {
  prdWebpackConfig.plugins.push(new BundleAnalyzerPlugin())
}

module.exports = prdWebpackConfig;
