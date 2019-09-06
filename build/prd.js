const path = require('path');

const NODE_ENV = process.env.NODE_ENV;
const prdWebpackConfig= {
  mode: 'production',
  entry: path.resolve(__dirname, '../src/arc-progress.ts'),
  output: {
    path: path.join(__dirname, '../lib'),
    filename: 'index.js',
    libraryExport: 'default',
    library: 'ArcProgress',
    libraryTarget: 'umd'
  },
  resolve: {
    extensions: [ '.tsx', '.ts', '.js' ],
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

// if (NODE_ENV !== 'publish') {
//   prdWebpackConfig.plugins.push(new BundleAnalyzerPlugin())
// }

module.exports = prdWebpackConfig;
