import { RuleTester } from '@typescript-eslint/rule-tester';
import rule from './rule';

const ruleTester = new RuleTester();

globalThis.structuredClone = (val) => JSON.parse(JSON.stringify(val)); // polyfill

ruleTester.run('no-absolute-import-without-prefix', rule, {
  valid: [
    {
      code: `
        import { someFunc } from 'my-prefix/src/utils';
      `,
      options: [{ targetPaths: ['src'], requiredPrefix: 'my-prefix' }],
    },
    {
      code: `
        import { someFunc } from 'my-prefix/src/components/Button';
      `,
      options: [{ targetPaths: ['src'], requiredPrefix: 'my-prefix' }],
    },
  ],

  invalid: [
    {
      code: `
        import { someFunc } from 'src/utils';
      `,
      options: [{ targetPaths: ['src'], requiredPrefix: 'my-prefix' }],
      errors: [
        {
          message: "Import path should start with 'my-prefix/'",
        },
      ],
      output: `
        import { someFunc } from 'my-prefix/src/utils';
      `,
    },
    {
      code: `
        import { someFunc } from 'src/components/Button';
      `,
      options: [{ targetPaths: ['src'], requiredPrefix: 'my-prefix' }],
      errors: [
        {
          message: "Import path should start with 'my-prefix/'",
        },
      ],
      output: `
        import { someFunc } from 'my-prefix/src/components/Button';
      `,
    },
  ],
});
