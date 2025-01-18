const path = require('path');

const buildLintCommand = (filenames) =>
  `yarn eslint --fix ${filenames.map((f) => path.relative(process.cwd(), f)).join(' ')}`;

const buildPrettierCommand = (filenames) =>
  `yarn prettier --write ${filenames.map((f) => path.relative(process.cwd(), f)).join(' ')}`;

module.exports = {
  '*.{ts,tsx}': [buildPrettierCommand, buildLintCommand],
  '*.{js,css,md}': [buildPrettierCommand],
};
