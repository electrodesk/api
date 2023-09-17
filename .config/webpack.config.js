/**
 * Base webpack config used across other specific configs
 */
const webpack = require('webpack');
const TsconfigPathsPlugins = require('tsconfig-paths-webpack-plugin')
const webpackPaths = require('./webpack.paths')
const path = require('path')

const configuration = {
  stats: 'errors-only',

  module: {
    rules: [
      {
        test: /\.[jt]sx?$/,
        exclude: /node_modules/,
        use: {
          loader: 'ts-loader',
        },
      },
    ],
  },

  /**
   * Determine the array of extensions that should be used to resolve modules.
   */
  resolve: {
    extensions: ['.js', '.jsx', '.json', '.ts', '.tsx'],
    modules: [webpackPaths.srcPath, 'node_modules'],
    // There is no need to add aliases here, the paths in tsconfig get mirrored
    plugins: [new TsconfigPathsPlugins()],
  },

  plugins: [
    new webpack.EnvironmentPlugin({
      NODE_ENV: 'production',
    })
  ],

  entry: {
    api: path.join(webpackPaths.srcPath, 'index.ts')
  },

  output: {
    path: path.join(webpackPaths.releasePath, 'bin'),
    filename: 'index.js',
    library: {
      name: ['@tm-electron', '[name]'],
      type: 'commonjs'
    },
  },

  mode: 'production'
};

module.exports = configuration;