const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Ensure large JSON assets (item-index.json) are bundled as JS modules.
// JSON is resolved by default; this config exists for future asset tweaks.
module.exports = config;
