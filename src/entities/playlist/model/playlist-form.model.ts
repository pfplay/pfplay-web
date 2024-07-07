import { z } from 'zod';
import type { Dictionary } from '@/shared/lib/localization/i18n.context';

export type Model = z.infer<ReturnType<typeof getSchema>>;

export const getSchema = (t: Dictionary) =>
  z.object({
    name: z
      .string()
      .min(1, { message: t.common.ec.char_field_required })
      .max(20, { message: t.common.ec.char_limit_20 }),
  });
