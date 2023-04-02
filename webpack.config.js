const { resolve } = require('path');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');

module.exports = {
  context: resolve(__dirname, 'src'),
  entry: './index.js',
  output: {
    filename: 'index.js',
    path: resolve(__dirname, 'dist')
  },
  optimization: {
    splitChunks: { chunks: 'all' }
  },
  target: 'node18.12',
  plugins: [new CleanWebpackPlugin()]
};
