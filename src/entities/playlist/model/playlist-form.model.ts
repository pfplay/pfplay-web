import { z } from 'zod';
import type { Dictonary } from '@/shared/lib/localization/i18n.context';

export type Model = z.infer<ReturnType<typeof getSchema>>;

export const getSchema = (t: Dictonary) =>
  z.object({
    name: z
      .string()
      .min(1, { message: t.common.ec.char_field_required })
      .max(20, { message: t.common.ec.char_limit_20 }),
  });
