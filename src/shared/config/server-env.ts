import 'server-only';
import { z } from 'zod';

/**
 * 서버 전용 환경변수 schema. client component 에서 import 시 server-only 패키지가 빌드 차단.
 * client 측 NEXT_PUBLIC_VERCEL_ENV (catch with '') 와 달리 서버측 VERCEL_ENV 는 fail-fast —
 * deployment 설정 misconfig 가 즉시 표면화되도록.
 *
 * 직접 참조 금지. `serverEnv` 만 사용하세요.
 */
const ServerEnvSchema = z.object({
  EDGE_CONFIG: z.string().url().optional(),
  VERCEL_ENV: z.enum(['production', 'preview', 'development']).optional(),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
});

export type ServerEnv = z.infer<typeof ServerEnvSchema>;

export function parseServerEnv(raw: Record<string, string | undefined>): ServerEnv {
  const result = ServerEnvSchema.safeParse(raw);
  if (!result.success) {
    const issues = result.error.issues
      .map((i) => `  - ${i.path.join('.')}: ${i.message}`)
      .join('\n');
    throw new Error(`❌ Invalid server env:\n${issues}\n\nSee src/shared/config/server-env.ts`);
  }
  return result.data;
}

export const serverEnv = parseServerEnv({
  EDGE_CONFIG: process.env.EDGE_CONFIG,
  VERCEL_ENV: process.env.VERCEL_ENV,
  NODE_ENV: process.env.NODE_ENV,
});
