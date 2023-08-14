import { z } from 'zod';

// TODO: AvatarBody 상세 정해지면 수정
export const avatarBodySchema = z.object({
  id: z.number(),
  type: z.enum(['basic', 'dj', 'room', 'ref']),
  name: z.string(),
  image: z.string(),
  point: z.number(),
});

// TODO: AvatarFace 상세 정해지면 수정
export const avatarFaceSchema = avatarBodySchema;

// 질문: Profile설정(nickName, introduction)과 Avatar 설정을 따로 나누는게 맞는지? 아니면 지금처럼 한번에 하는게 맞는지?
export const profileSchema = z.object({
  nickName: z.string().optional(),
  introduction: z.string().optional(),
  avatarBody: avatarBodySchema.optional(),
  avatarFace: avatarFaceSchema.optional(),
});

// TODO: AvatarBody 설정 PR merge 되면 이 AvatarBody 타입 활용해 관련 response 타입 정의
export type AvatarBody = z.infer<typeof avatarBodySchema>;
export type Profile = z.infer<typeof profileSchema>;
