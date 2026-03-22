import { z } from 'zod';

/**
 * @example optionalString(z.string().email())
 */
export const optionalString = (schema: z.ZodString) =>
  z
    .string()
    .nullish()
    .transform((x) => x ?? undefined) // convert null to undefined
    .refine((val) => !val || schema.safeParse(val).success);

/**
 * @example requiredString(z.string().email())
 */
//
export const requiredString = (schema: z.ZodString, message: string) =>
  z.string().refine((val) => schema.safeParse(val).success, { message });
