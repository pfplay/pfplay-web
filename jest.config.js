const fs = require('fs');
const { defaults } = require('jest-config');

const swcConfig = JSON.parse(fs.readFileSync(`${__dirname}/.swcrc`, 'utf-8'));

module.exports = {
  ...defaults,
  globals: {
    'ts-jest': {
      tsconfig: '<rootDir>/tsconfig.test.json',
    },
  },
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  transform: { '^.+\\.(ts|tsx|js|jsx)$': ['@swc/jest', { ...swcConfig }] },
  moduleDirectories: ['node_modules', '<rootDir>/src'],
  testEnvironment: 'jsdom',
  moduleNameMapper: {
    '@/(.*)': '<rootDir>/src/$1',
  },
};
