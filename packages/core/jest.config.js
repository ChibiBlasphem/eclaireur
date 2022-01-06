/** @type {import('@jest/types').Config.InitialOptions} */
module.exports = {
  rootDir: './src',
  transform: {
    '^.+\\.ts$': '@swc-node/jest',
  },
  moduleDirectories: ['node_modules', '<rootDir>/src'],
};
