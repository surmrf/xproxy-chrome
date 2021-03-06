const { merge } = require('webpack-merge');
const config = require('./webpack.config.base');

module.exports = merge(config, {
  mode: 'development',
  optimization: {
    minimize: false,
  },
  watchOptions: {
    ignored: /node_modules/,
  },
});
