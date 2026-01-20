module.exports = function(api) {
  api.cache(true);
  return {
    presets: [],
    plugins: [
      [
        'module-resolver',
        {
          root: ['./src'],
          alias: {
            '@': './src',
          },
        },
      ],
    ],
  };
};
