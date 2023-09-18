import  webpack from 'webpack'
import path from "path"
import webpackPaths from './webpack.paths';
import { merge } from 'webpack-merge';
import baseConfig from './webpack.default.config';

const configuration: webpack.Configuration = {

  entry: {
    api: path.join(webpackPaths.srcPath, 'index.ts')
  },

  output: {
    path: path.join(webpackPaths.releasePath, 'bin'),
    filename: 'index.js',
    library: {
      name: ['@tm-electron', '[name]'],
      type: 'umd'
    },
  },

  mode: 'production'
};

export default merge(baseConfig, configuration);