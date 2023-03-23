config = {};

if (process.env.JEST_ENV !== 'fitness') {
  config = {
    presets: [
      '@babel/preset-env',
      ['@babel/preset-react', { runtime: 'automatic' }],
    ],
  };
}

module.exports = config;
