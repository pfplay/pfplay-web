module.exports = {
  parser: '@typescript-eslint/parser',
  extends: [
    'plugin:@typescript-eslint/recommended',
    'next/core-web-vitals',
    'plugin:prettier/recommended',
    'prettier',
  ],
  plugins: ['unused-imports', 'import'],
  rules: {
    'prettier/prettier': ['error', { endOfLine: 'auto' }],
    '@typescript-eslint/ban-ts-comment': 1,
    '@typescript-eslint/camelcase': 0,
    '@typescript-eslint/consistent-type-assertions': 2,
    '@typescript-eslint/explicit-function-return-type': 0,
    '@typescript-eslint/explicit-member-accessibility': 2,
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
            pattern: '{@/**}',
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
    'unused-imports/no-unused-imports-ts': 2,
    'unused-imports/no-unused-vars-ts': 0,
  },
  overrides: [
    {
      files: ['**/*.stories.*'],
      rules: {
        'import/no-anonymous-default-export': 0,
      },
    },
    {
      files: ['*/*.test.ts'],
      env: {
        jest: true,
      },
      extends: ['plugin:jest/recommended'],
      plugins: ['jest'],
      rules: {
        'jest/no-identical-title': 0,
      },
    },
  ],
};
