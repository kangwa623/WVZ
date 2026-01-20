// Webpack config for web platform (if needed)
// This file is optional - Metro handles bundling by default

module.exports = {
  resolve: {
    alias: {
      'react-native-web': require.resolve('react-native-web'),
    },
  },
};
