module.exports = {
  displayName: '@async-games/async-games-frontend',
  preset: '../../jest.preset.js',
  testMatch: [
    '<rootDir>/**/*.spec.ts',
    '<rootDir>/**/*.spec.tsx',
    '<rootDir>/**/*.spec.js',
  ],
  transform: {
    '^(?!.*\\.(js|jsx|ts|tsx|css|json)$)': '@nx/react/plugins/jest',
    '^.+\\.[tj]sx?$': ['babel-jest', { presets: ['@nx/react/babel'] }],
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx'],
  setupFilesAfterEnv: ['<rootDir>/test-setup.ts'],
  coverageDirectory: 'test-output/jest/coverage',
  // Snapshot specs (*.snap.test.tsx) import Storybook ESM and run under the
  // Vitest `component-test` target, not Jest.
  testPathIgnorePatterns: ['/node_modules/', '\\.snap\\.test\\.[jt]sx?$'],
};
