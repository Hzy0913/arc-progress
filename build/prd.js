const path = require('path');

const ENV = process.env;
const defaultExport = ENV.npm_config_export;

const prdWebpackConfig = {
  mode: 'production',
  entry: path.resolve(__dirname, '../src/arc-progress.tsx'),
  output: {
    path: path.join(__dirname, '../lib'),
    filename: 'index.js',
    libraryTarget: 'commonjs2'
  },
  externals: {
    react: 'react'
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js'],
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: ['awesome-typescript-loader']
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

module.exports = prdWebpackConfig;
