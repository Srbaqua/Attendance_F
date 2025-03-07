const { getDefaultConfig, mergeConfig } = require('@react-native/metro-config');
const path = require('path');
const fs = require('fs');

// Function to recursively get all asset files
function getAssetFiles(dir, assetExts) {
  let results = [];
  if (!fs.existsSync(dir)) return results; // Prevent errors if directory doesn't exist

  const list = fs.readdirSync(dir);
  list.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      results = results.concat(getAssetFiles(filePath, assetExts));
    } else {
      const ext = path.extname(file).slice(1);
      if (assetExts.includes(ext)) {
        results.push(filePath);
      }
    }
  });

  return results;
}

// Get the default Metro configuration
const defaultConfig = getDefaultConfig(__dirname);

// Define additional Metro configuration
const customConfig = {
  transformer: {
    babelTransformerPath: require.resolve('react-native-svg-transformer'),
    getTransformOptions: async () => ({
      transform: {
        experimentalImportSupport: false,
        inlineRequires: false, // Set to false to prevent Metro cache issues
      },
    }),
    assetPlugins: ['expo-asset/tools/hashAssetFiles'],
  },
  resolver: {
    assetExts: [...defaultConfig.resolver.assetExts.filter(ext => ext !== 'svg'), 'svg', 'png', 'jpg', 'jpeg', 'gif'],
    sourceExts: [...defaultConfig.resolver.sourceExts, 'svg'],
    extraNodeModules: new Proxy({}, {
      get: (target, name) => path.join(process.cwd(), `node_modules/${name}`),
    }),
    nodeModulesPaths: [path.resolve(__dirname, 'node_modules')],
    platforms: ['ios', 'android'],
    blockList: [/node_modules\/.*\/node_modules\/react-native\/.*/], // Updated from blacklistRE
  },
  watchFolders: [path.resolve(__dirname, 'node_modules')],
  projectRoot: path.resolve(__dirname),
};

// Merge default and custom Metro configurations
module.exports = mergeConfig(defaultConfig, customConfig);
