import path from "path"
const rootPath = path.join(__dirname, '../');
const dllPath = path.join(__dirname, '../dll');
const srcPath = path.join(rootPath, 'src');
const releasePath = path.join(rootPath, 'dist');
const appPath = path.join(releasePath, 'app');
const appPackagePath = path.join(appPath, 'package.json');
const appNodeModulesPath = path.join(appPath, 'node_modules');
const srcNodeModulesPath = path.join(srcPath, 'node_modules');

const distMainPath = path.join(releasePath, 'electron');

const buildPath = path.join(releasePath, 'build');

export default {
  rootPath,
  dllPath,
  srcPath,
  releasePath,
  appPath,
  appPackagePath,
  appNodeModulesPath,
  srcNodeModulesPath,
  distMainPath,
  buildPath,
}