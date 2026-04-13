const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// On web, expo-sqlite has no native backing and must not be bundled.
// Resolve it (and its subpaths) to an empty module so Metro never pulls in
// the native implementation. Platform guards at runtime prevent any of the
// SQLite-dependent code paths from executing on web.
config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (
    platform === 'web' &&
    (moduleName === 'expo-sqlite' || moduleName.startsWith('expo-sqlite/'))
  ) {
    return { type: 'empty' };
  }
  return context.resolveRequest(context, moduleName, platform);
};

module.exports = config;
