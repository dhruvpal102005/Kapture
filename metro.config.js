const { getDefaultConfig } = require('expo/metro-config');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// Fix for socket.io-client in React Native
// The package includes Node.js-specific modules that need to be resolved
config.resolver.sourceExts = [...config.resolver.sourceExts, 'mjs'];

// Resolve Node.js specific modules to browser versions
config.resolver.resolverMainFields = ['react-native', 'browser', 'main'];

// Ensure we use browser/react-native versions of packages
config.resolver.platforms = ['ios', 'android', 'native', 'web'];

module.exports = config;
