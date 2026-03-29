/** @type {import('jest').Config} */
const config = {
  testEnvironment: 'node',
  preset: 'ts-jest',
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  testMatch: ['**/__tests__/**/*.test.ts'],
  globals: {
    'ts-jest': {
      tsconfig: {
        // Relax some settings so ts-jest works without strict module resolution
        esModuleInterop: true,
        allowSyntheticDefaultImports: true,
      },
    },
  },
}

module.exports = config
