const path = require('path');
const { getDefaultConfig } = require('expo/metro-config');
const { withUniwindConfig } = require('uniwind/metro');

const projectRoot = __dirname;
const monorepoRoot = path.resolve(projectRoot, '../..');

const config = getDefaultConfig(projectRoot);

config.watchFolders = [
  ...(config.watchFolders ?? [projectRoot]),
  monorepoRoot,
];
config.resolver.nodeModulesPaths = [
  path.resolve(monorepoRoot, 'node_modules'),
  path.resolve(projectRoot, 'node_modules'),
];

// One physical copy of React for the whole bundle (Clerk + app); avoids invalid hook calls in monorepos.
config.resolver.extraNodeModules = {
  react: path.resolve(monorepoRoot, 'node_modules/react'),
  'react-dom': path.resolve(monorepoRoot, 'node_modules/react-dom'),
};

module.exports = withUniwindConfig(config, {
  cssEntryFile: './src/global.css',
  dtsFile: './src/uniwind-types.d.ts',
});
