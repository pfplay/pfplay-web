import { z } from 'zod';

// TODO: Login 적용된 후 로그인 User, Profile, AvatarBody, AvatarFace 상세 따라서 수정
export const avatarBodySchema = z.object({
  id: z.number(),
  type: z.enum(['basic', 'dj', 'room', 'ref']),
  name: z.string(),
  image: z.string(),
  point: z.number(),
});

// TODO: AvatarFace 상세 정해지면 수정
export const avatarFaceSchema = avatarBodySchema;

export const profileSchema = z.object({
  nickName: z.string().optional(),
  introduction: z.string().optional(),
  avatarBody: avatarBodySchema.optional(),
  avatarFace: avatarFaceSchema.optional(),
});

export type AvatarBody = z.infer<typeof avatarBodySchema>;
export type Profile = z.infer<typeof profileSchema>;
