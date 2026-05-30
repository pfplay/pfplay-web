const fs = require('node:fs');
const path = require('node:path');
const eslint = require('@eslint/js');
const pluginNext = require('@next/eslint-plugin-next');
const pluginI18next = require('eslint-plugin-i18next');
const pluginImport = require('eslint-plugin-import');
const pluginReactHooks = require('eslint-plugin-react-hooks');
const pluginStorybook = require('eslint-plugin-storybook');
const unusedImportsPlugin = require('eslint-plugin-unused-imports');
const globals = require('globals');
const tseslint = require('typescript-eslint');
const customPlugin = require('./eslint-custom-plugin');

module.exports = tseslint.config(
  {
    extends: [eslint.configs.recommended, tseslint.configs.recommended],
    ignores: ['node_modules', 'build', 'dist', '*.min.js', '.next/*'],
    files: ['**/*.{js,jsx,ts,tsx}'],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
      parser: tseslint.parser,
      parserOptions: {
        ecmaVersion: 2020,
        sourceType: 'module',
      },
    },
    plugins: {
      'unused-imports': unusedImportsPlugin,
      import: pluginImport,
      i18next: pluginI18next,
      'react-hooks': pluginReactHooks,
      custom: customPlugin,
      '@next/next': pluginNext,
    },
    rules: {
      '@typescript-eslint/ban-ts-comment': 1,
      '@typescript-eslint/camelcase': 0,
      '@typescript-eslint/consistent-type-assertions': 2,
      '@typescript-eslint/explicit-function-return-type': 0,
      '@typescript-eslint/explicit-member-accessibility': 2,
      '@typescript-eslint/no-empty-object-type': 0,
      '@typescript-eslint/interface-name-prefix': 0,
      '@typescript-eslint/no-empty-function': 1,
      '@typescript-eslint/no-empty-interface': 0,
      '@typescript-eslint/no-explicit-any': 0,
      '@typescript-eslint/no-inferrable-types': 0,
      '@typescript-eslint/no-namespace': 0,
      '@typescript-eslint/no-non-null-assertion': 2,
      '@typescript-eslint/no-unnecessary-type-constraint': 0,
      '@typescript-eslint/no-unsafe-call': 0,
      '@typescript-eslint/no-var-requires': 0,
      '@typescript-eslint/no-unused-vars': [
        2,
        {
          vars: 'all',
          varsIgnorePattern: '^_',
          args: 'after-used',
          argsIgnorePattern: '^_',
        },
      ],
      '@typescript-eslint/no-use-before-define': 0,
      'import/order': [
        2,
        {
          groups: ['builtin', 'external', 'internal', ['parent', 'sibling', 'index'], 'unknown'],
          pathGroups: [
            {
              pattern: '{next*,next*/**,react*,react*/**}',
              group: 'external',
              position: 'before',
            },
            {
              pattern: '@/**',
              group: 'internal',
              position: 'before',
            },
          ],
          pathGroupsExcludedImportTypes: ['react', 'next'],
          alphabetize: {
            order: 'asc',
            caseInsensitive: false,
          },
        },
      ],
      'no-else-return': 2,
      'no-restricted-syntax': [
        2,
        {
          selector: "LogicalExpression[right.type='AssignmentExpression']",
          message: 'right-hand assign is not allowed',
        },
        {
          // NODE_ENV 는 Node 내장 + dev-build replace 이점 유지를 위해 :not 으로 예외
          selector:
            "MemberExpression[object.object.name='process'][object.property.name='env']:not([property.name='NODE_ENV'])",
          message:
            'process.env 직접 접근 금지. clientEnv / serverEnv (src/shared/config) 또는 e2eEnv (e2e/config) 를 사용하세요. issue #372 참조.',
        },
      ],
      'promise/param-names': 0,
      'promise/catch-or-return': 0,
      'promise/always-return': 0,
      'react/prop-types': 0,
      'react/jsx-no-target-blank': 0,
      'react-hooks/exhaustive-deps': 1,
      'react/display-name': 0,
      'react/no-unknown-property': 0,
      'react/jsx-key': 0,
      'react/jsx-uses-react': 0,
      'react/react-in-jsx-scope': 0,
      'unused-imports/no-unused-imports': 2,
      'unused-imports/no-unused-vars': 0,
      'i18next/no-literal-string': [1, { validateTemplate: true }],
      'custom/no-direct-service-method-reference': 2,
      'custom/no-absolute-import-without-prefix': [
        2,
        {
          targetPaths: getSubDirectories(path.resolve(__dirname, 'src')),
          requiredPrefix: '@',
        },
      ],
    },
  },
  {
    files: ['**/*.js'],
    rules: {
      '@typescript-eslint/no-require-imports': 0,
    },
  },
  {
    files: ['**/*.stories.*'],
    plugins: {
      storybook: pluginStorybook,
    },
    rules: {
      'import/no-anonymous-default-export': 0,
      'i18next/no-literal-string': 0,
    },
  },
  {
    files: ['**/*.test.*'],
    rules: {
      'i18next/no-literal-string': 0,
    },
  },
  {
    files: [
      'src/shared/config/**/*.ts',
      'src/shared/lib/decorators/mock/**/*.ts',
      'e2e/config/**/*.ts',
      'next.config.js',
      '**/*.test.{ts,tsx}',
      '**/*.integration.test.ts',
      'vitest.setup.ts',
    ],
    rules: {
      'no-restricted-syntax': 'off',
    },
  }
);

function getSubDirectories(directoryPath) {
  return fs
    .readdirSync(directoryPath)
    .map((file) => path.join(directoryPath, file)) // 파일 전체 경로로 변환
    .filter((file) => fs.statSync(file).isDirectory()) // 디렉터리만 필터링
    .map((directory) => path.relative(directoryPath, directory)); // 상대 경로로 변환
}
