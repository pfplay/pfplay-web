import { z } from 'zod';
import { type Dictionary } from '@/shared/lib/localization/i18n.context';

export type Model = z.infer<ReturnType<typeof getSchema>>;

export const getSchema = (t: Dictionary) =>
  z.object({
    nickname: z
      .string()
      .min(1, {
        message: t.common.ec.char_field_required,
      })
      .max(12, {
        message: t.common.ec.char_limit_12,
      })
      .regex(/^[가-힣ㄱ-ㅎㅏ-ㅣa-zA-Z0-9]*$/, {
        message: t.common.ec.char_limit_12,
      }),
    introduction: z
      .string()
      .max(50, {
        message: t.common.ec.char_limit_50,
      })
      .nullish()
      .transform((value) => value ?? undefined),
  });
