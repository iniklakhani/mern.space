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
  coveragePathIgnorePatterns: [
    'node_modules',
    'dist',
    'build',
    'migration',
    'scripts',
    'src/server.ts',
  ],
}
