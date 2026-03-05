const nxPreset = require('@nx/jest/preset').default;

module.exports = {
  ...nxPreset,
  testMatch: ['<rootDir>/**/*.spec.ts', '<rootDir>/**/*.spec.js'],
};
