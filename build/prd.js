const path = require('path');

const ENV = process.env;
const defaultExport = ENV.npm_config_export;

const prdWebpackConfig = {
  mode: 'production',
  entry: path.resolve(__dirname, '../src/arc-progress.ts'),
  output: {
    path: path.join(__dirname, defaultExport ? '../dist' : '../lib'),
    filename: defaultExport ? 'arc-progress.min.js' : 'index.js',
    libraryExport: defaultExport ? 'default' : undefined,
    library: 'ArcProgress',
    libraryTarget: 'umd'
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
          limit: 8192,
          name: '[name].[ext]?[hash]'
        }
      }
    ]
  },
  plugins: []
};

// if (ENV.NODE_ENV !== 'publish') {
//   prdWebpackConfig.plugins.push(new BundleAnalyzerPlugin())
// }

module.exports = prdWebpackConfig;
