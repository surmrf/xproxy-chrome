const path = require('path');
const CopyPlugin = require('copy-webpack-plugin');
const HtmlPlugin = require('html-webpack-plugin');
const WebpackBar = require('webpackbar');

const config = {
  context: path.join(__dirname, '..'),
  entry: {
    index: path.join(__dirname, '../src/index.ts'),
    options: path.join(__dirname, '../src/pages/options/index.tsx'),
    popup: path.join(__dirname, '../src/pages/popup/index.tsx'),
    home: path.join(__dirname, '../src/pages/home/index.tsx'),
  },
  devtool: false,
  output: {
    filename: '[name].js',
    path: path.join(__dirname, '../lib'),
  },
  resolve: {
    extensions: ['.js', '.jsx', '.ts', '.tsx'],
    alias: {
      '@': path.join(__dirname, '../src'),
    },
  },
  stats: 'errors-only',
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: [
          {
            loader: 'babel-loader',
            options: {
              presets: [
                '@babel/preset-react',
                [
                  '@babel/preset-env',
                  {
                    useBuiltIns: 'entry',
                    corejs: '3',
                  },
                ],
                '@babel/preset-typescript',
              ],
              plugins: [
                [
                  'babel-plugin-import',
                  {
                    libraryName: '@material-ui/icons',
                    libraryDirectory: 'esm',
                    camel2DashComponentName: false,
                  },
                ],
                [
                  '@babel/plugin-transform-runtime',
                  {
                    regenerator: true,
                  },
                ],
                '@babel/plugin-proposal-class-properties',
              ],
            },
          },
        ],
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader'],
      },
      {
        test: /\.less$/,
        use: ['style-loader', 'css-loader', 'less-loader'],
      },
      {
        test: /\.(png|jpg|jpeg|gif|svg|woff|woff2|eot|ttf)$/,
        loader: 'url-loader',
      },
    ],
  },
  plugins: [
    new CopyPlugin({
      patterns: [
        './src/manifest.json',
        {
          from: './src/assets/**/*.png',
          to: ({ absoluteFilename }) => {
            return absoluteFilename.replace('src/', 'lib/');
          },
        },
        {
          from: './src/_locales/**/*.json',
          to: ({ absoluteFilename }) => {
            return absoluteFilename.replace('src/', 'lib/');
          },
        },
        {
          from: './src/fonts/*',
          to: ({ absoluteFilename }) => {
            return absoluteFilename.replace('src/', 'lib/');
          },
        },
      ],
    }),
    new HtmlPlugin({
      chunks: ['options'],
      filename: 'pages/options/index.html',
      template: path.join(__dirname, '../src/template/index.html'),
    }),
    new HtmlPlugin({
      chunks: ['popup'],
      filename: 'pages/popup/index.html',
      template: path.join(__dirname, '../src/template/index.html'),
    }),
    new HtmlPlugin({
      chunks: ['home'],
      filename: 'pages/home/index.html',
      template: path.join(__dirname, '../src/template/index.html'),
    }),
    new WebpackBar(),
  ],
};

module.exports = config;
