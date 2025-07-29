const path = require('path');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');

// Load environment variables
require('dotenv').config();

// Debug: log environment variables (if needed)
if (process.env.REACT_APP_WEATHER_API_KEY) {
  console.log('Weather API key found in environment');
}

// Get environment variables that start with REACT_APP_
function getClientEnvironment() {
  const raw = Object.keys(process.env)
    .filter(key => key.startsWith('REACT_APP_'))
    .reduce((env, key) => {
      env[key] = process.env[key];
      return env;
    }, {
      NODE_ENV: process.env.NODE_ENV || 'development',
    });

  // Stringify all values so we can feed them into webpack DefinePlugin
  const stringified = {
    'process.env': Object.keys(raw).reduce((env, key) => {
      env[key] = JSON.stringify(raw[key]);
      return env;
    }, {}),
  };

  return { raw, stringified };
}

const env = getClientEnvironment();

module.exports = (envArgs, argv) => ({
  mode: argv.mode || 'development',
  entry: './src/main.jsx',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'bundle.js',
    publicPath: argv.mode === 'production' ? '/website2.0/' : '/',
    clean: true,
  },
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env', '@babel/preset-react'],
          },
        },
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader', 'postcss-loader'],
      },
      {
        test: /\.(png|jpg|jpeg|gif|svg|glb)$/,
        type: 'asset/resource',
      },
    ],
  },
  resolve: {
    extensions: ['.js', '.jsx'],
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: './index.html',
    }),
    new CopyWebpackPlugin({
      patterns: [
        {
          from: 'public',
          to: '.',
          globOptions: {
            ignore: ['**/index.html'],
          },
        },
      ],
    }),
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify(argv.mode || 'development'),
      'process.env.REACT_APP_WEATHER_API_KEY': JSON.stringify(process.env.REACT_APP_WEATHER_API_KEY),
    }),
  ],
  devServer: {
    static: {
      directory: path.join(__dirname, 'public'),
    },
    port: 3000,
    open: true,
    historyApiFallback: true,
    host: '127.0.0.1',
  },
});