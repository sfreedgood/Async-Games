const { getJestProjectsAsync } = require('@nx/jest');

module.exports = async () => ({
  projects: [
    ...(await getJestProjectsAsync()),
    '<rootDir>/path/to/jest.config.ts',
  ],
});
