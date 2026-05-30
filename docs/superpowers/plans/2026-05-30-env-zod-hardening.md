# `process.env` zod 강제 + silent fallback 전수 제거 Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** pfplay-web 의 `process.env` silent fallback 패턴을 zod schema + 단일 모듈로 wrap 해 import-time fail-fast 강제. 휴리스틱 폴백 3건 제거 + ESLint 가드로 재발 차단.

**Architecture:** `src/shared/config/{client-env,server-env,index}.ts` + `e2e/config/env.ts` 4 schema 모듈. 각 모듈 top-level `parse()` → import 시점 throw → build/runtime/test 어디서든 fail-fast. ESLint `no-restricted-syntax` 로 미래 직접 접근 차단.

**Tech Stack:** Next.js 14 (App Router), TypeScript ^5.5, zod ^3.21.4 (이미 의존성), vitest ^4.0, @playwright/test ^1.59, eslint ^9.18 (flat config).

**Spec:** `docs/superpowers/specs/2026-05-30-env-zod-hardening-design.md`
**Issue:** pfplay-web#372
**Branch:** `feature/env-zod-hardening` (이미 origin/development 동기화 후 분기됨)

---

## Chunk 1: Pre-flight + Schema infrastructure

### Phase 0: Pre-flight

**Files:** 없음

- [ ] **Step 0.1: Destructured pattern audit**

Run: `rg "const\s*\{[^}]*\}\s*=\s*process\.env" --type ts -g "!node_modules"`
Expected: `No matches found` (이미 확인됨, 회귀 방지용 재실행).

- [ ] **Step 0.2: Vercel env preflight (user surface)**

본 step 은 agent 가 직접 수행 불가 (Vercel CLI 인증). User 에게 surface:

```
다음 명령을 실행해 .env.local 에 schema 필수 key (NEXT_PUBLIC_API_HOST_NAME, NEXT_PUBLIC_API_WS_HOST_NAME, NEXT_PUBLIC_WAGMI_PROJECT_ID, NEXT_PUBLIC_ALCHEMY_PUBLIC_API_KEY) 가 있는지 확인 부탁드립니다:

  cat .env.local
  vercel env pull .env.vercel.local --environment=preview
  cat .env.vercel.local

누락 발견 시 Vercel 대시보드에서 추가 후 yarn build 가능.
누락 없으면 plan 진행.
```

User 응답 없이도 plan 진행 가능 — 빌드 fail 시 zod 메시지로 즉시 확인 (fallback path 존재). 다만 surface 는 반드시 수행 (silent skip 금지).

### Phase 1: vitest stub + client-env schema (TDD)

**의도된 순서**: client-env.ts 가 module top-level 에서 `parseClientEnv(process.env...)` 실행 → import 시점 throw. vitest 가 import 하기 전에 stub 필요 → setup 먼저.

**Files:**

- Modify: `vitest.setup.ts` (현재 3 라인 → stub 추가)
- Create: `src/shared/config/client-env.ts`
- Create: `src/shared/config/client-env.test.ts`

- [ ] **Step 1.1: Extend vitest.setup.ts with stubEnv**

본 step 은 client-env 의 top-level parse 가 vitest 안에서 throw 않게 하기 위함. 필수 4 key 모두 stub.

`vitest.setup.ts` (전체 교체):

```ts
import { vi } from 'vitest';

// issue #372: clientEnv 가 module top-level parse 라 vitest 가 client-env 모듈을 import 하기 전에
// stub 필요. .env.local 자동 로딩에 의존하지 않고 명시 (CI / 로컬 / 다른 환경 모두 결정적).
// 필수 4 key 만 stub — optional 은 schema default 가 알아서 처리.
vi.stubEnv('NEXT_PUBLIC_API_HOST_NAME', 'http://localhost:8080/api/');
vi.stubEnv('NEXT_PUBLIC_API_WS_HOST_NAME', 'ws://localhost:8080/ws');
vi.stubEnv('NEXT_PUBLIC_WAGMI_PROJECT_ID', 'test-wagmi-project-id');
vi.stubEnv('NEXT_PUBLIC_ALCHEMY_PUBLIC_API_KEY', 'test-alchemy-key');

import '@testing-library/jest-dom';
import { cleanup } from '@testing-library/react';
import { afterEach } from 'vitest';

afterEach(() => {
  cleanup();
});
```

⚠️ `vitest.config.ts` 에 이미 `env: { NEXT_PUBLIC_API_HOST_NAME: '...' }` 가 있음 (단일 key). 본 stubEnv 가 cover 하므로 redundant — **본 PR 에서는 손대지 않음**, 다음 cleanup 으로 미룸.

- [ ] **Step 1.2: Write failing tests for parseClientEnv**

`src/shared/config/client-env.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { parseClientEnv } from './client-env';

const validRaw = {
  NEXT_PUBLIC_API_HOST_NAME: 'https://api.pfplay.xyz/api/',
  NEXT_PUBLIC_API_WS_HOST_NAME: 'wss://api.pfplay.xyz/ws',
  NEXT_PUBLIC_WAGMI_PROJECT_ID: 'test-project-id',
  NEXT_PUBLIC_ALCHEMY_PUBLIC_API_KEY: 'test-alchemy-key',
};

describe('parseClientEnv', () => {
  it('필수 key 모두 있으면 통과', () => {
    expect(() => parseClientEnv(validRaw)).not.toThrow();
  });

  it('NEXT_PUBLIC_API_HOST_NAME 누락 시 throw', () => {
    const { NEXT_PUBLIC_API_HOST_NAME: _omit, ...raw } = validRaw;
    expect(() => parseClientEnv(raw)).toThrowError(/NEXT_PUBLIC_API_HOST_NAME/);
  });

  it('잘못된 URL 형식 → Invalid url 메시지', () => {
    expect(() =>
      parseClientEnv({ ...validRaw, NEXT_PUBLIC_API_HOST_NAME: 'api.pfplay.xyz' })
    ).toThrowError(/url|URL/i);
  });

  it('WS 스킴 검증: ws:// 통과', () => {
    expect(() =>
      parseClientEnv({ ...validRaw, NEXT_PUBLIC_API_WS_HOST_NAME: 'ws://localhost:8080/ws' })
    ).not.toThrow();
  });

  it('WS 스킴 검증: http:// throw', () => {
    expect(() =>
      parseClientEnv({ ...validRaw, NEXT_PUBLIC_API_WS_HOST_NAME: 'http://localhost:8080/ws' })
    ).toThrowError(/ws/);
  });

  it('HTTP_TIMEOUT_MS coerce: "3000" → 3000', () => {
    const parsed = parseClientEnv({ ...validRaw, NEXT_PUBLIC_HTTP_TIMEOUT_MS: '3000' });
    expect(parsed.NEXT_PUBLIC_HTTP_TIMEOUT_MS).toBe(3000);
  });

  it('HTTP_TIMEOUT_MS default: undefined → 4000', () => {
    const parsed = parseClientEnv(validRaw);
    expect(parsed.NEXT_PUBLIC_HTTP_TIMEOUT_MS).toBe(4000);
  });

  it('VERCEL_ENV default: undefined → ""', () => {
    const parsed = parseClientEnv(validRaw);
    expect(parsed.NEXT_PUBLIC_VERCEL_ENV).toBe('');
  });

  it('VERCEL_ENV graceful: 알 수 없는 값 → "" (catch)', () => {
    const parsed = parseClientEnv({ ...validRaw, NEXT_PUBLIC_VERCEL_ENV: 'staging' });
    expect(parsed.NEXT_PUBLIC_VERCEL_ENV).toBe('');
  });

  it('AMPLITUDE_API_KEY optional: undefined 통과', () => {
    const parsed = parseClientEnv(validRaw);
    expect(parsed.NEXT_PUBLIC_AMPLITUDE_API_KEY).toBeUndefined();
  });
});
```

- [ ] **Step 1.3: Run tests to verify they fail**

Run: `yarn test src/shared/config/client-env.test.ts`
Expected: 전부 FAIL (module not found: `./client-env`).

- [ ] **Step 1.4: Implement client-env.ts**

`src/shared/config/client-env.ts`:

```ts
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
  NEXT_PUBLIC_HTTP_TIMEOUT_MS: process.env.NEXT_PUBLIC_HTTP_TIMEOUT_MS,
  NEXT_PUBLIC_USE_MOCK: process.env.NEXT_PUBLIC_USE_MOCK,
  NEXT_PUBLIC_ENABLE_DEV_LOGIN: process.env.NEXT_PUBLIC_ENABLE_DEV_LOGIN,
  NEXT_PUBLIC_VERCEL_ENV: process.env.NEXT_PUBLIC_VERCEL_ENV,
});
```

- [ ] **Step 1.5: Run tests to verify they pass**

Run: `yarn test src/shared/config/client-env.test.ts`
Expected: 10 케이스 PASS. Step 1.1 의 stubEnv 가 module top-level parse 를 만족.

### Phase 2: server-only install + server-env schema (TDD)

**Files:**

- Modify: `package.json` (yarn add)
- Create: `src/shared/config/server-env.ts`
- Create: `src/shared/config/server-env.test.ts`

- [ ] **Step 2.1: Install server-only package**

`server-only` 는 Next.js 14 의 transitive 가 아님 (`yarn why server-only` 결과 not found).

Run: `yarn add server-only`
Expected: package.json dependencies 에 `"server-only": "^0.0.1"` 추가됨. yarn.lock 업데이트.

- [ ] **Step 2.2: Write failing tests for parseServerEnv**

`src/shared/config/server-env.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { parseServerEnv } from './server-env';

describe('parseServerEnv', () => {
  it('빈 객체도 통과 (모두 optional or default)', () => {
    const parsed = parseServerEnv({});
    expect(parsed.NODE_ENV).toBe('development');
  });

  it('EDGE_CONFIG optional 통과', () => {
    expect(() => parseServerEnv({})).not.toThrow();
  });

  it('EDGE_CONFIG: 잘못된 URL → throw', () => {
    expect(() => parseServerEnv({ EDGE_CONFIG: 'not-a-url' })).toThrowError(/url|URL/i);
  });

  it('VERCEL_ENV enum: production 통과', () => {
    const parsed = parseServerEnv({ VERCEL_ENV: 'production' });
    expect(parsed.VERCEL_ENV).toBe('production');
  });

  it('VERCEL_ENV enum: 알 수 없는 값 → throw (server 측은 fail-fast)', () => {
    expect(() => parseServerEnv({ VERCEL_ENV: 'staging' })).toThrowError(/VERCEL_ENV/);
  });

  it('NODE_ENV enum: test 통과', () => {
    const parsed = parseServerEnv({ NODE_ENV: 'test' });
    expect(parsed.NODE_ENV).toBe('test');
  });
});
```

- [ ] **Step 2.3: Run tests to verify they fail**

Run: `yarn test src/shared/config/server-env.test.ts`
Expected: 전부 FAIL (module not found).

- [ ] **Step 2.4: Implement server-env.ts**

`src/shared/config/server-env.ts`:

```ts
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
```

- [ ] **Step 2.5: Run tests to verify they pass**

Run: `yarn test src/shared/config/server-env.test.ts`
Expected: 6 케이스 PASS. `server-only` 의 vitest 환경 영향은 noop (Next.js 빌드 시점에만 차단).

### Phase 3: Barrel + Phase 1+2+3 commit

**Files:**

- Create: `src/shared/config/index.ts`

- [ ] **Step 3.1: Create barrel index.ts**

`src/shared/config/index.ts`:

```ts
export { clientEnv, parseClientEnv, type ClientEnv } from './client-env';
// server-env 는 'server-only' import 가 있어 barrel 에서 re-export 시 client 측 사고 위험.
// 명시적으로 server 측 코드는 `@/shared/config/server-env` 직접 import 권장.
// (필요 시 별도 server-barrel 생성)
```

⚠️ 기존 `dom-id.ts`, `max-message-amount.ts`, `time.ts` 는 barrel 없이 직접 import 패턴 — 본 PR 신규 `index.ts` 는 env 만 export, 기존 sibling import path 변경 0.

- [ ] **Step 3.2: Run full test suite (smoke)**

Run: `yarn test`
Expected: 모든 unit/integration GREEN (기존 + 신규 client-env 10 + server-env 6 케이스).

- [ ] **Step 3.3: Run type check**

Run: `yarn test:type`
Expected: 0 errors.

- [ ] **Step 3.4: Commit Phase 1+2+3**

```bash
git add src/shared/config/client-env.ts src/shared/config/client-env.test.ts \
        src/shared/config/server-env.ts src/shared/config/server-env.test.ts \
        src/shared/config/index.ts vitest.setup.ts \
        package.json yarn.lock
git commit -m "feat(config): introduce client/server env zod schemas (#372)

- src/shared/config/{client-env,server-env,index}.ts 신규
- import-time fail-fast (zod safeParse + throw on issue)
- NEXT_PUBLIC_* 키 명시 (Next.js inline 규칙)
- VERCEL_ENV graceful catch('') for future Vercel enum extension (client only;
  server 측은 fail-fast 로 deploy misconfig 즉시 표면화)
- server-only 패키지 추가 (Next.js 14 transitive 아님 확인)
- vitest.setup.ts stubEnv 추가 (필수 4 key, test 격리)

Refs: pfplay-web#372

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>"
```

---

## Chunk 2: E2E schema + 전수 sweep

### Phase 4: E2E config schema

**Files:**

- Create: `e2e/config/env.ts`

- [ ] **Step 4.1: Create e2e/config/env.ts**

`e2e/config/env.ts`:

```ts
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
```

- [ ] **Step 4.2: User surface (.env.local 가이드, gitignored)**

본 step 은 commit 대상 아님. User 에게 surface (Step 7.2 의 .env.example 가 영구 가이드):

```
.env.local 에 추가 필요:
  E2E_API_BASE="http://localhost:8080/api/"
(.env.local 은 gitignored, commit 안 됨)
```

- [ ] **Step 4.3: Commit Phase 4**

```bash
git add e2e/config/env.ts
git commit -m "feat(e2e): introduce e2e/config/env.ts with E2E_API_BASE (#372)

- Node-only e2e schema (playwright + helper)
- E2E_API_BASE 신규 명시 env (localhost 휴리스틱 폴백 제거)
- NEXT_PUBLIC_API_HOST_NAME 은 호환 위해 optional alias 유지
- 로컬 실행: .env.local 에 E2E_API_BASE 명시 필요 (.env.example 참조)

Refs: pfplay-web#372

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>"
```

### Phase 5: src/ sweep (11 production files)

**Scope 변경 (reviewer 지적 반영)**: mock decorator 2 파일 (mock-return / mock-resolve) 은 sweep 대상 제외. decorator 가 invocation-time runtime read 의도, test 가 runtime mutation 패턴 사용. ESLint override 로 예외 처리 (Phase 8).

따라서 sweep = 13 - 2 = **11 files** (spec §6 rows 1, 4, 5, 6, 7, 8, 9, 10, 11, 14, 15).

각 step: 파일 읽기 → process.env 라인 대치 → import 추가 → 저장. 그룹 끝 일괄 `yarn test`.

- [ ] **Step 5.1: `src/app/_providers/wallet.provider.tsx`**

`process.env.NEXT_PUBLIC_WAGMI_PROJECT_ID as string` →
import 추가: `import { clientEnv } from '@/shared/config';`
대치: `clientEnv.NEXT_PUBLIC_WAGMI_PROJECT_ID` (캐스팅 제거)

- [ ] **Step 5.2: `src/app/api/og/route.tsx`**

`process.env.NEXT_PUBLIC_API_HOST_NAME?.replace(/\/+$/, '')` →
대치: `clientEnv.NEXT_PUBLIC_API_HOST_NAME.replace(/\/+$/, '')` (optional chain 제거 — schema 가 보장)

- [ ] **Step 5.3: `src/app/link/[linkDomain]/layout.tsx`**

Step 5.2 와 동일 패턴.

- [ ] **Step 5.4: `src/entities/wallet/api/use-fetch-nfts.query.ts`**

`process.env.NEXT_PUBLIC_ALCHEMY_PUBLIC_API_KEY` → `clientEnv.NEXT_PUBLIC_ALCHEMY_PUBLIC_API_KEY`

- [ ] **Step 5.5: `src/features/sign-in/by-social/ui/sign-in-button-for-dev.component.tsx`**

`process.env.NODE_ENV === 'development' || process.env.NEXT_PUBLIC_ENABLE_DEV_LOGIN === 'true'` →
NODE_ENV 부분 그대로 유지 (Node 내장 + ESLint selector exempt),
대치: `clientEnv.NEXT_PUBLIC_ENABLE_DEV_LOGIN === 'true'`

- [ ] **Step 5.6: `src/shared/api/system-status/get-system-status.ts`** (silent fallback 제거)

`process.env.NEXT_PUBLIC_API_HOST_NAME ?? ''` → `clientEnv.NEXT_PUBLIC_API_HOST_NAME`

- [ ] **Step 5.7: `src/shared/api/system-status/get-edge-config-maintenance.ts`** (server-only)

`process.env.VERCEL_ENV || 'development'` → `serverEnv.VERCEL_ENV ?? 'development'` (optional 그대로)
`process.env.EDGE_CONFIG` → `serverEnv.EDGE_CONFIG`
Import: `import { serverEnv } from '@/shared/config/server-env';`

- [ ] **Step 5.8: `src/shared/api/websocket/client.ts`**

`process.env.NEXT_PUBLIC_API_WS_HOST_NAME as string` → `clientEnv.NEXT_PUBLIC_API_WS_HOST_NAME` (캐스팅 제거)

- [ ] **Step 5.9: `src/shared/api/http/client/client.ts`** (2건)

```ts
// before
const HTTP_TIMEOUT_MS = Number(process.env.NEXT_PUBLIC_HTTP_TIMEOUT_MS) || 4000;
// ...
baseURL: process.env.NEXT_PUBLIC_API_HOST_NAME,

// after
import { clientEnv } from '@/shared/config';
const HTTP_TIMEOUT_MS = clientEnv.NEXT_PUBLIC_HTTP_TIMEOUT_MS;  // zod coerce.number 가 4000 default 보장
// ...
baseURL: clientEnv.NEXT_PUBLIC_API_HOST_NAME,
```

- [ ] **Step 5.10: `src/shared/lib/analytics/index.ts`**

`return process.env.NEXT_PUBLIC_AMPLITUDE_API_KEY;` → `return clientEnv.NEXT_PUBLIC_AMPLITUDE_API_KEY;`

- [ ] **Step 5.11: `src/shared/lib/functions/log/log-environment.ts`**

`process.env.NEXT_PUBLIC_VERCEL_ENV === 'production'` → `clientEnv.NEXT_PUBLIC_VERCEL_ENV === 'production'`

- [ ] **Step 5.12: Run full test suite**

Run: `yarn test`
Expected: 모든 unit/integration GREEN. mock decorator 테스트 (sweep 제외) 도 기존처럼 동작 (process.env runtime mutation 호환).

- [ ] **Step 5.13: Run type check**

Run: `yarn test:type`
Expected: 0 errors. `as string` 제거로 type narrowing 더 정확.

- [ ] **Step 5.14: Commit Phase 5**

```bash
git add src/
git commit -m "refactor(env): sweep src/ to clientEnv/serverEnv (11 files) (#372)

- 11 production runtime files migrate
- silent \`?? ''\` 제거: get-system-status.ts
- as string 캐스팅 제거: wallet.provider, websocket/client
- Number() || 4000 패턴 제거: http/client (zod coerce.number default)
- NODE_ENV 직접 비교는 유지 (Node 내장)
- mock decorator (mock-return/mock-resolve) 는 sweep 제외 —
  invocation-time runtime read 의도 (test mutation 패턴 호환 위해)
  → Phase 8 ESLint override 로 예외 처리

Refs: pfplay-web#372

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>"
```

### Phase 6: e2e/ sweep (6 files)

- [ ] **Step 6.1: `playwright.config.ts`** (5건)

```ts
// before
forbidOnly: !!process.env.CI,
retries: process.env.CI ? 1 : 0,
reporter: process.env.CI ? 'github' : 'list',
baseURL: process.env.E2E_BASE_URL ?? 'https://localhost:3000',
extraHTTPHeaders: process.env.VERCEL_AUTOMATION_BYPASS_SECRET
  ? { 'x-vercel-protection-bypass': process.env.VERCEL_AUTOMATION_BYPASS_SECRET }

// after
import { e2eEnv } from './e2e/config/env';
// ...
forbidOnly: !!e2eEnv.CI,
retries: e2eEnv.CI ? 1 : 0,
reporter: e2eEnv.CI ? 'github' : 'list',
baseURL: e2eEnv.E2E_BASE_URL,  // default('https://localhost:3000') 가 schema
extraHTTPHeaders: e2eEnv.VERCEL_AUTOMATION_BYPASS_SECRET
  ? { 'x-vercel-protection-bypass': e2eEnv.VERCEL_AUTOMATION_BYPASS_SECRET }
```

- [ ] **Step 6.2: `e2e/auth/shared.ts`**

`process.env.VERCEL_AUTOMATION_BYPASS_SECRET` 2건 → `e2eEnv.VERCEL_AUTOMATION_BYPASS_SECRET`
import: `import { e2eEnv } from '../config/env';`

- [ ] **Step 6.3: `e2e/helpers/partyroom.helpers.ts`** (silent fallback 제거)

```ts
// before
const BASE_URL = process.env.E2E_BASE_URL ?? 'https://localhost:3000';
const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_HOST_NAME ??
  (process.env.E2E_BASE_URL?.includes('localhost')
    ? 'http://localhost:8080/api/'
    : 'https://dev-api.pfplay.xyz/api/');

// after
import { e2eEnv } from '../config/env';
const BASE_URL = e2eEnv.E2E_BASE_URL;
const API_BASE_URL = e2eEnv.E2E_API_BASE;
```

기존 주석 (localhost 휴리스틱 설명) 은 제거 — 이제 silent 아님.

- [ ] **Step 6.4: `e2e/mobile/chunk4.helpers.ts`** (silent fallback 제거)

Step 6.3 와 동일 패턴. 기존 chunk 4 fix 주석 (L23-28) 제거.

- [ ] **Step 6.5: `e2e/mobile/display-board.tos.spec.ts`** (silent fallback 제거 — **hot finding**, PR #367 동일 패턴)

```ts
// before (L44, L52)
extraHTTPHeaders: process.env.VERCEL_AUTOMATION_BYPASS_SECRET
  ? { 'x-vercel-protection-bypass': process.env.VERCEL_AUTOMATION_BYPASS_SECRET }
// ...
const API_BASE = process.env.NEXT_PUBLIC_API_HOST_NAME ?? 'https://dev-api.pfplay.xyz/api/';

// after
import { e2eEnv } from '../config/env';
// ...
extraHTTPHeaders: e2eEnv.VERCEL_AUTOMATION_BYPASS_SECRET
  ? { 'x-vercel-protection-bypass': e2eEnv.VERCEL_AUTOMATION_BYPASS_SECRET }
// ...
const API_BASE = e2eEnv.E2E_API_BASE;
```

- [ ] **Step 6.6: `e2e/e2e-b.dj-state-machine.spec.ts`**

`process.env.E2E_BASE_URL ?? 'https://localhost:3000'` → `e2eEnv.E2E_BASE_URL` (default 가 schema)
import: `import { e2eEnv } from './config/env';`

- [ ] **Step 6.7: Run type check on e2e/**

Run: `yarn test:type`
Expected: 0 errors (src/ + e2e/ 모두).

- [ ] **Step 6.8: Local e2e smoke (1 spec, optional)**

본 step 은 backend 동작 필요. agent 가 backend boot 못 하면 warn 후 skip:

```bash
# .env.local 에 E2E_API_BASE 가 설정되어 있다고 가정
npx playwright test e2e/e2e-a.lobby.spec.ts --project=chromium
```

Expected: PASS or skip-with-warn.

- [ ] **Step 6.9: Commit Phase 6**

```bash
git add e2e/ playwright.config.ts
git commit -m "refactor(e2e): sweep helpers/specs to e2eEnv (6 files) (#372)

- playwright.config.ts, e2e/auth/shared.ts
- e2e/helpers/partyroom.helpers.ts (silent fallback 제거)
- e2e/mobile/chunk4.helpers.ts (silent fallback 제거)
- e2e/mobile/display-board.tos.spec.ts (silent fallback 제거 — PR#367 동일 패턴 잠복지)
- e2e/e2e-b.dj-state-machine.spec.ts
- 휴리스틱 localhost includes 폴백 0

Refs: pfplay-web#372

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>"
```

---

## Chunk 3: CI workflow + ESLint guard + 마무리

### Phase 7: CI workflow + .env.example

**Files:**

- Modify: `.github/workflows/vercel-preview-e2e.yml`
- Create: `.env.example`

- [ ] **Step 7.1: Add E2E_API_BASE to CI workflow**

`.github/workflows/vercel-preview-e2e.yml` (line ~96-102 env block):

```yaml
env:
  # 기존 ↓ 유지 (schema 호환 alias, 다음 series 에서 제거 예정)
  NEXT_PUBLIC_API_HOST_NAME: https://stg-api.pfplay.xyz/api/
  # issue #372: e2e helper 의 silent fallback 휴리스틱 제거. 명시적 E2E_API_BASE 사용.
  E2E_API_BASE: https://stg-api.pfplay.xyz/api/
```

- [ ] **Step 7.2: Create .env.example**

⚠️ Vite/Next.js 는 `.env.example` 을 자동 로드하지 않음 — `.env`, `.env.local`, `.env.[mode]`, `.env.[mode].local` 만. 따라서 placeholder string (`<obtain from ...>`) 안전.

`.env.example`:

```bash
# pfplay-web 로컬 환경변수 예시. 실제 값은 .env.local 에 (gitignored).
# 본 파일은 schema (src/shared/config/client-env.ts, server-env.ts, e2e/config/env.ts) 와 동기.

# ===== client-env (NEXT_PUBLIC_*) =====
NEXT_PUBLIC_API_HOST_NAME="http://localhost:8080/api/"
NEXT_PUBLIC_API_WS_HOST_NAME="ws://localhost:8080/ws"
NEXT_PUBLIC_WAGMI_PROJECT_ID="<obtain from WalletConnect>"
NEXT_PUBLIC_ALCHEMY_PUBLIC_API_KEY="<obtain from Alchemy>"

# optional
NEXT_PUBLIC_AMPLITUDE_API_KEY=""
NEXT_PUBLIC_HTTP_TIMEOUT_MS="4000"
NEXT_PUBLIC_USE_MOCK="false"
NEXT_PUBLIC_ENABLE_DEV_LOGIN="true"

# ===== e2e/config (Node-only) =====
# issue #372: 휴리스틱 폴백 대신 명시
E2E_API_BASE="http://localhost:8080/api/"
# Vercel preview 자동화 시에만 필요
# VERCEL_AUTOMATION_BYPASS_SECRET="..."
```

- [ ] **Step 7.3: Commit Phase 7**

```bash
git add .github/workflows/vercel-preview-e2e.yml .env.example
git commit -m "chore(env): add E2E_API_BASE to CI + .env.example doc (#372)

- vercel-preview-e2e.yml env block 에 E2E_API_BASE 추가
- NEXT_PUBLIC_API_HOST_NAME 은 schema 호환 위해 유지 (deprecated)
- .env.example 신규 (로컬 setup 가이드, .env.local 은 여전히 gitignored)

Refs: pfplay-web#372

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>"
```

### Phase 8: ESLint guard

**Files:**

- Modify: `eslint.config.js`

`eslint.config.js` 에 **이미 `no-restricted-syntax` 규칙이 존재** (LogicalExpression right-hand assign 금지). 신규 selector 를 기존 array 에 머지 (기존 객체 보존).

- [ ] **Step 8.1: Merge new selector into existing no-restricted-syntax**

기존 (line 87-93):

```js
'no-restricted-syntax': [
  2,
  {
    selector: "LogicalExpression[right.type='AssignmentExpression']",
    message: 'right-hand assign is not allowed',
  },
],
```

수정 후 (두 selector 가 coexist):

```js
'no-restricted-syntax': [
  2,
  {
    selector: "LogicalExpression[right.type='AssignmentExpression']",
    message: 'right-hand assign is not allowed',
  },
  {
    // NODE_ENV 는 Node 내장 + dev-build replace 이점 유지를 위해 :not 으로 예외
    selector:
      "MemberExpression[object.object.name='process'][object.property.name='env']:not([property.name='NODE_ENV'])",
    message:
      'process.env 직접 접근 금지. clientEnv / serverEnv (src/shared/config) 또는 e2eEnv (e2e/config) 를 사용하세요. issue #372 참조.',
  },
],
```

- [ ] **Step 8.2: Add override block for exempt paths**

`tseslint.config(...)` 의 **마지막 config 객체로** (기존 `**/*.test.*`, `**/*.stories.*` 등 override 들 뒤에) 추가:

```js
{
  files: [
    'src/shared/config/**/*.ts',
    'src/shared/lib/decorators/mock/**/*.ts',
    'e2e/config/**/*.ts',
    'next.config.js',
    '**/*.test.{ts,tsx}',
    '**/*.integration.test.ts',
    'vitest.setup.ts',
  ],
  rules: {
    'no-restricted-syntax': 'off',
  },
},
```

⚠️ ESLint flat config 의 적용 순서: 뒤의 block 이 앞을 override. 본 block 이 tseslint.config 의 마지막 element 여야 함.

⚠️ `'no-restricted-syntax': 'off'` 로 끄면 LogicalExpression right-hand assign 가드도 같이 꺼짐. 본 override 적용 path 들 (config 파일, test, mock decorator) 은 모두 정상적인 코드 경로라 이 trade-off 수용. 필요 시 후속 PR 에서 selector 별 disable 패턴 도입.

- [ ] **Step 8.3: Run lint**

Run: `yarn lint`
Expected: `no-restricted-syntax` 위반 0.

만약 잔존 위반 발생:

- `process.env.NODE_ENV` 같은 keep 대상이 잡히면 selector `:not([property.name='NODE_ENV'])` 가 적용 안 됨 → 다시 확인
- sweep 누락된 파일이 잡히면 해당 파일 재 sweep
- override 누락 path 가 잡히면 Step 8.2 의 files list 보강

- [ ] **Step 8.4: Commit Phase 8**

```bash
git add eslint.config.js
git commit -m "chore(eslint): no-restricted-syntax guard for process.env (#372)

- 기존 no-restricted-syntax (LogicalExpression right-hand assign) 와 머지
- selector 에 :not([property.name='NODE_ENV']) — Node 내장은 예외
- override paths: src/shared/config/, src/shared/lib/decorators/mock/,
  e2e/config/, next.config.js, *.test.*, *.integration.test.*, vitest.setup.ts
- 재발 차단: 새 코드에서 process.env 직접 접근 시 lint fail
- 메시지에 우회법 (clientEnv/serverEnv/e2eEnv) 명시

Refs: pfplay-web#372

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>"
```

### Phase 9: 최종 검증 + push

- [ ] **Step 9.1: Full verification gate**

```bash
yarn test       # all GREEN
yarn test:type  # 0 errors
yarn lint       # 0 violations
yarn build      # success
```

⚠️ **`yarn build` recovery note**: 빌드가 zod schema error 로 fail 한다면 **그것이 본 PR 의 의도된 동작**이다. `.env.local` 에 schema 필수 4 key 가 모두 있는지 확인 (Step 0.2 의 surface 가 그것). 누락 시:

1. `vercel env pull .env.vercel.local --environment=preview` 로 가져오기
2. 필요한 key 만 `.env.local` 로 복사
3. `yarn build` 재시도

본 fail 은 silent fallback 이 사라진 직접적 효과이므로, panic 으로 revert 하지 말 것.

- [ ] **Step 9.2: Local boot smoke**

Run: `npx next dev` (yarn dev 금지 — https/turbo 차단, [[reference_pfplay_web_local_dev_http_webpack]])
Expected: localhost:3000 (http) 부팅 성공, 로그에 schema error 없음.
Ctrl+C 로 종료.

- [ ] **Step 9.3: Optional local e2e smoke (backend 동작 가정)**

`.env.local` 에 `E2E_API_BASE` 있는지 확인 후:

```bash
npx playwright test e2e/e2e-a.lobby.spec.ts --project=chromium
```

Backend 미동작 시 skip + warn surface.

- [ ] **Step 9.4: Push**

```bash
git push -u origin feature/env-zod-hardening
```

- [ ] **Step 9.5: Write PR body to temp file**

Heredoc + 백틱 escape 가 cross-shell 위험 → `--body-file` 방식 사용.

Write tool 로 `.git/pr-body-372.md` (gitignored 영역) 작성:

```markdown
## 배경

- issue #372 — pfplay-web#367 의 root cause = e2e helper 의 `process.env` silent fallback 40일 잠복. PR #370 (chunk 4) 에서 동일 패턴이 다른 파일에 잔존, localhost 휴리스틱으로 우회.
- 본 PR 은 패턴 자체를 zod schema 강제로 제거.

## 변경

- `src/shared/config/{client-env,server-env,index}.ts` 신규 schema (zod top-level parse, import-time fail-fast)
- `e2e/config/env.ts` 신규 e2e schema + `E2E_API_BASE` 명시 env
- 17 파일 sweep (production 11 + e2e 6)
- mock decorator 2 파일은 invocation-time runtime read 의도 → ESLint override 로 예외
- ESLint `no-restricted-syntax` 가드 (기존 LogicalExpression 가드와 머지)
- vitest.setup.ts stubEnv 추가 (test 격리)
- `.env.example` 신규 (로컬 setup 가이드)
- `server-only` 패키지 추가 (Next.js 14 transitive 아님)

## 검증

- yarn test / yarn test:type / yarn lint / yarn build 모두 GREEN
- npx next dev 로컬 부팅 GREEN
- E2E 로컬 1 spec 라운드 GREEN (가능 시)
- CI vercel-preview-e2e 18+ tests GREEN (push 후 확인)

## Hot finding

`e2e/mobile/display-board.tos.spec.ts:52` 에 PR #367 이 발견한 정확히 그 silent fallback 패턴 (`?? 'https://dev-api.pfplay.xyz/api/'`) 이 다른 파일로 잠복. 본 PR 에서 제거.

## prod ship

development 머지 후 사용자 명시 시까지 release/main 보류.
chunk 1~4 묶음 + 본 PR 동시 ship 검토는 사용자 게이트.

closes #372

🤖 Generated with [Claude Code](https://claude.com/claude-code)
```

- [ ] **Step 9.6: Open PR with body-file**

```bash
gh pr create \
  --base development \
  --title "[refactor/e2e] process.env zod 강제 + silent fallback 전수 제거" \
  --body-file .git/pr-body-372.md
```

- [ ] **Step 9.7: vercel-preview-e2e workflow GREEN 확인**

PR push 후 CI 자동 트리거. 18+ tests GREEN 확인 (chunk 4 spec 포함).
실패 시 root cause 조사 → fix → 재push.

## Done

- PR merged → development 진입
- 사용자 release/main 게이트
- Follow-up: `NEXT_PUBLIC_API_HOST_NAME` deprecated alias 제거 (다음 series), lint-staged pre-commit 강제, t3-oss/env-nextjs 추상화 검토, `vitest.config.ts` 의 redundant env 정리 (현재 yagni)
