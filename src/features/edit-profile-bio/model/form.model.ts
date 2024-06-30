import { z } from 'zod';
import { type Dictonary } from '@/shared/lib/localization/i18n.context';
import { optionalString, requiredString } from '@/shared/lib/zod/string';

export type Model = z.infer<ReturnType<typeof getSchema>>;

export const getSchema = (t: Dictonary) =>
  z.object({
    nickname: requiredString(
      z
        .string()
        .min(1, {
          message: t.common.ec.char_field_required,
        })
        .max(12, {
          message: t.common.ec.char_limit_12,
        })
    ).refine((value) => /^[가-힣ㄱ-ㅎㅏ-ㅣa-zA-Z0-9]*$/.test(value), {
      message: t.common.ec.char_limit_12,
    }),
    introduction: optionalString(
      z.string().max(50, {
        message: t.common.ec.char_limit_50,
      })
    ),
  });
