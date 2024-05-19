import { z } from 'zod';

export type Model = z.infer<typeof schema>;

export const schema = z.object({
  name: z
    .string()
    .min(1, { message: '1자 이상 입력해주세요' })
    .max(30, { message: '한글 30자, 영문 30자 제한 / 띄어쓰기,특수문자 사용 불가' })
    .refine((value) => /^[가-힣ㄱ-ㅎㅏ-ㅣa-zA-Z0-9]*$/.test(value), {
      message: '한글 30자, 영문 30자 제한 / 띄어쓰기,특수문자 사용 불가',
    }),
  introduce: z
    .string()
    .min(1, { message: '1자 이상 입력해주세요' })
    .max(50, { message: '한/영 구분 없이 띄어쓰기 포함 50자 제한' }),
  domain: z
    .string()
    .optional()
    .refine((value) => !value || /^\S*$/.test(value), {
      message: '도메인에 공백이나 띄어쓰기를 포함할 수 없습니다',
    }),
  limit: z.coerce
    .number({ invalid_type_error: '디제잉 1회당 제한 시간은 3분 이상부터 가능해요' })
    .int()
    .nonnegative()
    .gte(3, { message: '디제잉 1회당 제한 시간은 3분 이상부터 가능해요' }),
});
