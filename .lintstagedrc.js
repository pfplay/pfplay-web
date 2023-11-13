const path = require('path');

const buildLintCommand = (filenames) =>
  `yarn lint --fix --file ${filenames
    .map((f) => path.relative(process.cwd(), f))
    .join(' --file ')}`;

const buildPrettierCommand = (filenames) =>
  `yarn format --write ${filenames.map((f) => path.relative(process.cwd(), f)).join(' ')}`;

module.exports = {
  '*.{ts,tsx}': [buildPrettierCommand, buildLintCommand],
  '*.{js,css,md}': [buildPrettierCommand],
};
