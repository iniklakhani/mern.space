/** @type {import('ts-jest').JestConfigWithTsJest} **/
module.exports = {
  testEnvironment: 'node',
  transform: {
    '^.+.tsx?$': [
      'ts-jest',
      {
        isolatedModules: true,
      },
    ],
  },
  verbose: true,
  collectCoverage: true,
  coverageProvider: 'v8',
  collectCoverageFrom: ['src/**/*.ts', '!tests/**', '!**node_modules/**'],
  maxWorkers: 1,
}
