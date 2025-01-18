import { RuleTester } from '@typescript-eslint/rule-tester';
import rule from './rule';

const ruleTester = new RuleTester();

globalThis.structuredClone = (val) => JSON.parse(JSON.stringify(val)); // polyfill

ruleTester.run('no-direct-service-method-reference', rule, {
  valid: [
    {
      code: `
        import { userService } from '@/shared/api/http/services';
        
        const config = {
          queryFn: () => userService.getUser(),
        };
      `,
    },
    {
      code: `
        import { postService } from '@/shared/api/http/services';
        
        const mutation = {
          mutationFn: (data) => postService.createPost(data),
        };
      `,
    },
    {
      code: `
        import { userService } from '@/shared/api/http/services';
        
        const config = {
          queryFn: async () => userService.getUser(),
        };
      `,
    },
    {
      code: `
        import { otherService } from 'different/path';
        
        const config = {
          queryFn: otherService.getData,
        };
      `,
    },
    {
      code: `
        import { userService } from '@/shared/api/http/services';
        
        const config = {
          someOtherProp: userService.getUser,
        };
      `,
    },
  ],
  invalid: [
    {
      code: `
        import { userService } from '@/shared/api/http/services';
        
        const config = {
          queryFn: userService.getUser,
        };
      `,
      errors: [{ messageId: 'invalidDirectReference' }],
      output: `
        import { userService } from '@/shared/api/http/services';
        
        const config = {
          queryFn: () => userService.getUser(),
        };
      `,
    },
    {
      code: `
        import { postService } from '@/shared/api/http/services';
        
        const mutation = {
          mutationFn: postService.createPost,
        };
      `,
      errors: [{ messageId: 'invalidDirectReference' }],
      output: `
        import { postService } from '@/shared/api/http/services';
        
        const mutation = {
          mutationFn: (request) => postService.createPost(request),
        };
      `,
    },
    {
      code: `
        import { userService as customName } from '@/shared/api/http/services';
        
        const config = {
          queryFn: customName.getUser,
        };
      `,
      errors: [{ messageId: 'invalidDirectReference' }],
      output: `
        import { userService as customName } from '@/shared/api/http/services';
        
        const config = {
          queryFn: () => customName.getUser(),
        };
      `,
    },
  ],
});
