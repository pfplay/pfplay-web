import { z } from 'zod';
import type { Dictonary } from '@/shared/lib/localization/i18n.context';

export type Model = z.infer<ReturnType<typeof getSchema>>;

export const getSchema = (t: Dictonary) =>
  z.object({
    name: z
      .string()
      .min(1, { message: t.common.ec.char_field_required })
      .max(30, { message: t.common.ec.char_limit_30 })
      .refine((value) => /^[가-힣ㄱ-ㅎㅏ-ㅣa-zA-Z0-9]*$/.test(value), {
        message: t.common.ec.char_limit_30,
      }),
    introduce: z
      .string()
      .min(1, { message: t.common.ec.char_field_required })
      .max(50, { message: t.common.ec.char_limit_50 }),
    domain: z
      .string()
      .optional()
      .refine((value) => !value || /^\S*$/.test(value), {
        message: '도메인에 공백이나 띄어쓰기를 포함할 수 없습니다',
      }),
    limit: z.coerce
      .number({ invalid_type_error: t.createparty.para.noti_djing_limit })
      .int()
      .nonnegative()
      .gte(3, { message: t.createparty.para.noti_djing_limit }),
  });
