module.exports = {
  parser: '@typescript-eslint/parser',
  extends: ['next/core-web-vitals', 'plugin:prettier/recommended', 'prettier'],
  rules: {
    'react/jsx-uses-react': 0,
    'react/react-in-jsx-scope': 0,
    '@typescript-eslint/no-unsafe-call': 0,
    '@typescript-eslint/no-var-requires': 0,
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
