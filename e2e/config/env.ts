import { z } from 'zod';

/**
 * E2E 전용 환경변수 schema. Node-only (playwright + helper).
 *
 * silent fallback (`?? 'dev-api...'`) 패턴 금지 — issue #372 / pfplay-web#367.
 * `E2E_API_BASE` 는 신규 명시 env: 휴리스틱 (`localhost` includes) 폴백을 제거.
 *
 * 직접 참조 금지. `e2eEnv` 만 사용하세요.
 */
const E2eEnvSchema = z.object({
  E2E_BASE_URL: z.string().url().default('https://localhost:3000'),
  E2E_API_BASE: z.string().url(),
  VERCEL_AUTOMATION_BYPASS_SECRET: z.string().optional(),
  CI: z.string().optional(),
  // deprecated alias — 호환 위해 유지, 다음 series 에서 제거
  NEXT_PUBLIC_API_HOST_NAME: z.string().url().optional(),
});

export type E2eEnv = z.infer<typeof E2eEnvSchema>;

export function parseE2eEnv(raw: Record<string, string | undefined>): E2eEnv {
  const result = E2eEnvSchema.safeParse(raw);
  if (!result.success) {
    const issues = result.error.issues
      .map((i) => `  - ${i.path.join('.')}: ${i.message}`)
      .join('\n');
    throw new Error(
      `❌ Invalid e2e env:\n${issues}\n\nSee e2e/config/env.ts\n\n` +
        `로컬 실행 시 .env.local 에 다음 추가:\n` +
        `  E2E_API_BASE="http://localhost:8080/api/"\n`
    );
  }
  return result.data;
}

export const e2eEnv = parseE2eEnv({
  E2E_BASE_URL: process.env.E2E_BASE_URL,
  E2E_API_BASE: process.env.E2E_API_BASE,
  VERCEL_AUTOMATION_BYPASS_SECRET: process.env.VERCEL_AUTOMATION_BYPASS_SECRET,
  CI: process.env.CI,
  NEXT_PUBLIC_API_HOST_NAME: process.env.NEXT_PUBLIC_API_HOST_NAME,
});
