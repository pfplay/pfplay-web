const fs = require('fs')
const { defaults } = require('jest-config')

const swcConfig = JSON.parse(fs.readFileSync(`${__dirname}/.swcrc`, 'utf-8'))

module.exports = {
  ...defaults,
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  transform: { '^.+\\.(t|j)s$': ['@swc/jest', { ...swcConfig }] },
  moduleDirectories: ['node_modules', 'src'],
  testEnvironment: 'node',
}