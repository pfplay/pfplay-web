import { z } from 'zod';
import { optionalString, requiredString } from './string';

describe('string', () => {
  const emails = [undefined, '', 'user@email.com', null, 'foo', 12345];

  describe('optionalString', () => {
    test('올바르게 동작하는지 확인', () => {
      const emailInputSchema = optionalString(z.string().email());

      const validateResult = emails.map((email) => emailInputSchema.safeParse(email).success);

      expect(validateResult).toEqual([true, true, true, true, false, false]);
    });
  });

  describe('requiredString', () => {
    test('올바르게 동작하는지 확인', () => {
      const emailInputSchema = requiredString(z.string().email());

      const validateResult = emails.map((email) => emailInputSchema.safeParse(email).success);

      expect(validateResult).toEqual([false, false, true, false, false, false]);
    });
  });
});
