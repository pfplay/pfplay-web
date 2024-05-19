import { z } from 'zod';

export type Model = z.infer<typeof schema>;

export const schema = z.object({
  nickname: z
    .string()
    .min(1, { message: '1자 이상 입력해주세요' })
    .max(16, { message: '16자 제한' })
    .refine((value) => /^[가-힣ㄱ-ㅎㅏ-ㅣa-zA-Z0-9]*$/.test(value), {
      message: '한/영/숫자만 가능하고 띄어쓰기 및 특수문자 사용 불가',
    }),
  introduction: z
    .string()
    .min(1, { message: '1자 이상 입력해주세요' })
    .max(50, { message: '50자 제한' }),
});
