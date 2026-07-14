import { z } from 'zod';

/**
 * 브라우저 + 서버 양쪽에서 import 가능한 NEXT_PUBLIC_* 환경변수 schema.
 * Next.js 가 build 시점에 `process.env.NEXT_PUBLIC_X` 정적 표현을 리터럴로 inline 한다.
 *
 * silent fallback (`?? 'sensible-default'`) 패턴 금지 — issue #372 / pfplay-web#367 의
 * 40일 잠복 root cause 였다. 모든 필수 key 는 import 시점 throw 로 fail-fast.
 *
 * 직접 참조 금지. `clientEnv` 만 사용하세요.
 * (See: docs/superpowers/specs/2026-05-30-env-zod-hardening-design.md)
 */
const ClientEnvSchema = z.object({
  NEXT_PUBLIC_API_HOST_NAME: z.string().url(),
  NEXT_PUBLIC_API_WS_HOST_NAME: z.string().regex(/^wss?:\/\//, 'must start with ws:// or wss://'),
  NEXT_PUBLIC_WAGMI_PROJECT_ID: z.string().min(1),
  NEXT_PUBLIC_ALCHEMY_PUBLIC_API_KEY: z.string().min(1),
  NEXT_PUBLIC_AMPLITUDE_API_KEY: z.string().optional(),
  // optional — 미설정 시 Web Push 토글이 런타임에서 비활성(unsupported) 처리.
  NEXT_PUBLIC_VAPID_PUBLIC_KEY: z.string().optional(),
  NEXT_PUBLIC_HTTP_TIMEOUT_MS: z.coerce.number().int().positive().default(4000),
  NEXT_PUBLIC_USE_MOCK: z.enum(['true', 'false']).optional(),
  NEXT_PUBLIC_ENABLE_DEV_LOGIN: z.enum(['true', 'false']).optional(),
  // Vercel 의 미래 enum 확장 (예: 'staging') 에 대해 graceful — 위반 대신 빈 문자열 폴백
  NEXT_PUBLIC_VERCEL_ENV: z
    .enum(['production', 'preview', 'development', ''])
    .catch('')
    .default(''),
});

export type ClientEnv = z.infer<typeof ClientEnvSchema>;

/**
 * 테스트용 export. production code 는 `clientEnv` 만 사용.
 */
export function parseClientEnv(raw: Record<string, string | undefined>): ClientEnv {
  const result = ClientEnvSchema.safeParse(raw);
  if (!result.success) {
    const issues = result.error.issues
      .map((i) => `  - ${i.path.join('.')}: ${i.message}`)
      .join('\n');
    throw new Error(`❌ Invalid client env:\n${issues}\n\nSee src/shared/config/client-env.ts`);
  }
  return result.data;
}

/**
 * Next.js NEXT_PUBLIC_* 인라인 규칙상 키는 명시 (spread 불가).
 */
export const clientEnv = parseClientEnv({
  NEXT_PUBLIC_API_HOST_NAME: process.env.NEXT_PUBLIC_API_HOST_NAME,
  NEXT_PUBLIC_API_WS_HOST_NAME: process.env.NEXT_PUBLIC_API_WS_HOST_NAME,
  NEXT_PUBLIC_WAGMI_PROJECT_ID: process.env.NEXT_PUBLIC_WAGMI_PROJECT_ID,
  NEXT_PUBLIC_ALCHEMY_PUBLIC_API_KEY: process.env.NEXT_PUBLIC_ALCHEMY_PUBLIC_API_KEY,
  NEXT_PUBLIC_AMPLITUDE_API_KEY: process.env.NEXT_PUBLIC_AMPLITUDE_API_KEY,
  NEXT_PUBLIC_VAPID_PUBLIC_KEY: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
  NEXT_PUBLIC_HTTP_TIMEOUT_MS: process.env.NEXT_PUBLIC_HTTP_TIMEOUT_MS,
  NEXT_PUBLIC_USE_MOCK: process.env.NEXT_PUBLIC_USE_MOCK,
  NEXT_PUBLIC_ENABLE_DEV_LOGIN: process.env.NEXT_PUBLIC_ENABLE_DEV_LOGIN,
  NEXT_PUBLIC_VERCEL_ENV: process.env.NEXT_PUBLIC_VERCEL_ENV,
});
