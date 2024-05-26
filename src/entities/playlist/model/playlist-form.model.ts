import { z } from 'zod';

export type Model = z.infer<typeof schema>;

export const schema = z.object({
  name: z.string().min(1, { message: '1자 이상 입력해주세요' }).max(20, { message: '20자 제한' }),
});
