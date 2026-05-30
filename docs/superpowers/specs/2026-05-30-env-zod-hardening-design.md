# `process.env` zod 강제 + silent fallback 전수 제거 — Design

- **Issue**: pfplay-web#372
- **Date**: 2026-05-30
- **Branch**: `feature/env-zod-hardening`
- **관련 사례**: pfplay-web#367 (chunk 3.1 mandatory CI 완성, 동일 패턴 40일 잠복 root cause), PR #370 (chunk 4, helper 부분 localhost-heuristic 우회)
- **관련 메모리**: `reference_e2e_silent_env_fallback_pattern`

## 1. 배경 (Why)

`process.env.X ?? 'sensible-default'` 패턴은 DX 개선 의도지만 multi-environment 배포에서 silent leak 의 정확한 매개체다.

직전 사례:

- PR #367: `e2e/helpers/partyroom.helpers.ts:8` 의 `NEXT_PUBLIC_API_HOST_NAME ?? 'https://dev-api.pfplay.xyz/api/'` 가 40 일 잠복. e2e CI 가 stg-api 가 아닌 dev-api 로 DELETE fan-out → stg partyroom 못 찾음 → silent 404 흡수. 표면화에 9 iter hotfix.
- PR #370: 동일 패턴이 `e2e/mobile/chunk4.helpers.ts` 에 잔존, "localhost 휴리스틱" 으로 우회. **패턴 자체는 그대로**.

본 작업의 root cause 는 환경 변수 미설정 시 hardcoded default 로 silent fallback 하는 안전 그물의 부재한 경계다. 본 설계는 그 경계를 zod schema 로 명시한다.

### 현재 잔존 위험 (audit 결과)

`process.env.\w+` 정적 grep — **43 occurrence / 24 파일** (issue 본문 추정 50~100 보다 적음, manageable).

분류:

| 카테고리                   | 건수  | 비고                                                                                                                                                                                                          |
| -------------------------- | ----- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| production runtime 필수    | 6     | `NEXT_PUBLIC_API_HOST_NAME`, `NEXT_PUBLIC_API_WS_HOST_NAME`, `NEXT_PUBLIC_WAGMI_PROJECT_ID`, `NEXT_PUBLIC_ALCHEMY_PUBLIC_API_KEY`, `NEXT_PUBLIC_AMPLITUDE_API_KEY` (opt), `NEXT_PUBLIC_HTTP_TIMEOUT_MS` (opt) |
| build-time flag (NODE_ENV) | 4     | `error.tsx`, `react-query.provider`, mock decorators                                                                                                                                                          |
| Next.js system var         | 1     | `VERCEL_ENV` (next.config 가 NEXT*PUBLIC* 으로 인라인)                                                                                                                                                        |
| server-only RSC            | 2     | `EDGE_CONFIG`, `VERCEL_ENV` (`get-edge-config-maintenance.ts`)                                                                                                                                                |
| e2e helper / spec (Node)   | 8     | `E2E_BASE_URL`, `NEXT_PUBLIC_API_HOST_NAME`, `VERCEL_AUTOMATION_BYPASS_SECRET`                                                                                                                                |
| **silent fallback ⚠️**     | **3** | `partyroom.helpers.ts:13`, `chunk4.helpers.ts:26`, **`display-board.tos.spec.ts:52` (구 패턴 그대로)**                                                                                                        |
| vitest mutation (의도)     | 4     | mock decorator tests, integration test                                                                                                                                                                        |

`e2e/mobile/display-board.tos.spec.ts:52` 가 #367 이 발견한 정확히 그 패턴 (`?? 'https://dev-api.pfplay.xyz/api/'`) 으로 다른 파일에 잠복 — 본 설계의 즉시 효용 근거.

## 2. 목표 (What)

1. production / server / e2e 영역의 `process.env` 직접 접근을 zod schema 로 wrap 한 단일 모듈로 통합
2. 모듈 import 시점 (top-level parse) 에 validation 강제 → 빌드 / SSR / runtime 어디서든 fail-fast
3. 휴리스틱 폴백 (localhost 패턴, `?? 'dev-api...'`) 전수 제거
4. ESLint `no-restricted-syntax` 가드로 재발 차단 (config 모듈 외 영역의 `process.env` 직접 접근 금지)

비목표 (out of scope):

- vitest 테스트의 `process.env.X = ...` mutation 격리 — 의도된 패턴, 가드 예외 처리만
- ESLint 가드의 lint-staged 강제 — 본 PR 은 lint 에만 추가, pre-commit 강제는 follow-up
- Vercel 대시보드의 env 설정 변경 — 기존 사용 key 그대로

## 3. 비기능 요구사항

- 빌드 영향: 미설정 환경에서 빌드 fail (현재 stg/prod 모두 정상이라 영향 0 예상)
- 런타임 영향: 0 (parse 는 module top-level 1 회)
- 번들 영향: zod 이미 의존성. schema 객체 자체 ~수 KB 미만
- 개발 경험: 잘못된 형식 (URL 스킴 누락 등) 시 정확한 zod 메시지 노출

## 4. 아키텍처

### 4.1 모듈 레이아웃

`src/shared/config/` 디렉토리는 **이미 존재** (`dom-id.ts`, `max-message-amount.ts`, `time.ts` 3 파일). env schema 모듈은 sibling 추가 + 신규 `index.ts` barrel 도입:

```
src/shared/config/
  ├── dom-id.ts              # 기존
  ├── max-message-amount.ts  # 기존
  ├── time.ts                # 기존
  ├── client-env.ts          # 신규 — NEXT_PUBLIC_* (browser+server 양쪽 import 가능, build 시 inline)
  ├── server-env.ts          # 신규 — 서버 전용, 첫 줄 import 'server-only'
  └── index.ts               # 신규 barrel — export { clientEnv } + 기존 sibling re-export (있으면 merge)

e2e/config/
  └── env.ts                 # 신규 — E2E_BASE_URL, E2E_API_BASE, VERCEL_AUTOMATION_BYPASS_SECRET, CI
```

`server-env.ts` 의 `import 'server-only'` 는 Next.js 공식 패키지로, 실수로 client component 에서 import 시 빌드 단계에서 차단된다. **기존 sibling (dom-id 등) 에 barrel 이 없다면 본 PR 의 신규 `index.ts` 는 env 만 export — 기존 sibling 의 import path 변경 0**.

### 4.2 NEXT*PUBLIC* 인라인 가정

Next.js build-time replace 는 정적 표현 `process.env.NEXT_PUBLIC_X` 에만 적용된다 (Webpack `DefinePlugin` 기반). 따라서:

```ts
// ❌ 동작 안 함 (NEXT_PUBLIC_* inline 누락 → 브라우저 undefined)
const parsed = ClientEnvSchema.parse(process.env);

// ✅ 키 명시 (각 표현이 빌드 시 리터럴로 replace 됨)
const parsed = ClientEnvSchema.parse({
  NEXT_PUBLIC_API_HOST_NAME: process.env.NEXT_PUBLIC_API_HOST_NAME,
  // ...
});
```

본 설계는 후자만 사용한다. server-env.ts / e2e/config/env.ts 는 Node runtime 이라 `{...process.env}` spread 도 안전하지만 명시 일관성 차원에서 동일하게 키 나열한다.

### 4.3 Import-time fail-fast 구조

```ts
// src/shared/config/client-env.ts
import { z } from 'zod';

const ClientEnvSchema = z.object({
  NEXT_PUBLIC_API_HOST_NAME: z.string().url(),
  NEXT_PUBLIC_API_WS_HOST_NAME: z.string().regex(/^wss?:\/\//, 'must start with ws:// or wss://'),
  NEXT_PUBLIC_WAGMI_PROJECT_ID: z.string().min(1),
  NEXT_PUBLIC_ALCHEMY_PUBLIC_API_KEY: z.string().min(1),
  NEXT_PUBLIC_AMPLITUDE_API_KEY: z.string().optional(),
  NEXT_PUBLIC_HTTP_TIMEOUT_MS: z.coerce.number().int().positive().default(4000),
  NEXT_PUBLIC_USE_MOCK: z.enum(['true', 'false']).optional(),
  NEXT_PUBLIC_ENABLE_DEV_LOGIN: z.enum(['true', 'false']).optional(),
  // Vercel 의 미래 enum 확장 (예: 'staging') 에 대해 graceful — schema 위반 대신 빈 문자열로 폴백
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

`server-env.ts`, `e2e/config/env.ts` 도 동일 구조.

## 5. Schema 계약

### 5.1 client-env.ts

| Key                                  | 유형                                                                      | 필수 | 비고                                                   |
| ------------------------------------ | ------------------------------------------------------------------------- | ---- | ------------------------------------------------------ |
| `NEXT_PUBLIC_API_HOST_NAME`          | `z.string().url()`                                                        | ✅   | trailing `/` 정규화는 호출처                           |
| `NEXT_PUBLIC_API_WS_HOST_NAME`       | `z.string().regex(/^wss?:\/\//)`                                          | ✅   | ws/wss                                                 |
| `NEXT_PUBLIC_WAGMI_PROJECT_ID`       | `z.string().min(1)`                                                       | ✅   | `as string` 캐스팅 제거                                |
| `NEXT_PUBLIC_ALCHEMY_PUBLIC_API_KEY` | `z.string().min(1)`                                                       | ✅   | NFT/wallet 필수                                        |
| `NEXT_PUBLIC_AMPLITUDE_API_KEY`      | `z.string().optional()`                                                   | –    | 분석 옵트인                                            |
| `NEXT_PUBLIC_HTTP_TIMEOUT_MS`        | `z.coerce.number().int().positive().default(4000)`                        | –    | `Number(...) \|\| 4000` 패턴 대체                      |
| `NEXT_PUBLIC_USE_MOCK`               | `z.enum(['true','false']).optional()`                                     | –    | 기존 동작 보존                                         |
| `NEXT_PUBLIC_ENABLE_DEV_LOGIN`       | `z.enum(['true','false']).optional()`                                     | –    | dev 전용                                               |
| `NEXT_PUBLIC_VERCEL_ENV`             | `z.enum(['production','preview','development','']).catch('').default('')` | –    | next.config 가 빈문자열 보장 + 미래 enum 확장 graceful |

### 5.2 server-env.ts

| Key           | 유형                                                                 | 필수 | 비고                                     |
| ------------- | -------------------------------------------------------------------- | ---- | ---------------------------------------- |
| `EDGE_CONFIG` | `z.string().url().optional()`                                        | –    | Vercel Edge Config, 부재 시 기능 disable |
| `VERCEL_ENV`  | `z.enum(['production','preview','development']).optional()`          | –    | server-side 분기                         |
| `NODE_ENV`    | `z.enum(['development','production','test']).default('development')` | –    | Node 내장                                |

### 5.3 e2e/config/env.ts

| Key                               | 유형                                                 | 필수 | 비고                                    |
| --------------------------------- | ---------------------------------------------------- | ---- | --------------------------------------- |
| `E2E_BASE_URL`                    | `z.string().url().default('https://localhost:3000')` | –    | 로컬 dev default                        |
| `E2E_API_BASE`                    | `z.string().url()`                                   | ✅   | **신규**. 휴리스틱 폴백 제거            |
| `VERCEL_AUTOMATION_BYPASS_SECRET` | `z.string().optional()`                              | –    | preview 환경만                          |
| `CI`                              | `z.string().optional()`                              | –    | playwright.config                       |
| `NEXT_PUBLIC_API_HOST_NAME`       | `z.string().url().optional()`                        | –    | deprecated alias, 다음 series 에서 제거 |

`E2E_API_BASE` 명시 정책:

- `.env.local` 에 `E2E_API_BASE="http://localhost:8080/api/"` 추가
- `.github/workflows/vercel-preview-e2e.yml` env block 에 `E2E_API_BASE: https://stg-api.pfplay.xyz/api/` 추가
- 기존 `NEXT_PUBLIC_API_HOST_NAME` workflow env 는 schema 호환 위해 유지 (deprecated 주석)

## 6. Migration map (24 파일)

대치 규칙:

- production code: `process.env.NEXT_PUBLIC_X` → `clientEnv.NEXT_PUBLIC_X`
- server-only: `process.env.X` → `serverEnv.X`
- e2e helper/spec: `process.env.X` → `e2eEnv.X`
- `NODE_ENV` 직접 비교 (`=== 'development'`): 그대로 유지 (Node 내장, dev-build replace 이점 유지)
- vitest test 의 `process.env.X = ...` mutation: 그대로 (ESLint 예외)

| #   | 파일                                                                     | 변경                                                                            |
| --- | ------------------------------------------------------------------------ | ------------------------------------------------------------------------------- |
| 1   | `src/app/_providers/wallet.provider.tsx`                                 | `as string` 제거, `clientEnv.NEXT_PUBLIC_WAGMI_PROJECT_ID`                      |
| 2   | `src/app/_providers/react-query.provider.tsx`                            | NODE_ENV 유지                                                                   |
| 3   | `src/app/error.tsx`                                                      | NODE_ENV 유지                                                                   |
| 4   | `src/app/api/og/route.tsx`                                               | `clientEnv.NEXT_PUBLIC_API_HOST_NAME` (RSC route handler)                       |
| 5   | `src/app/link/[linkDomain]/layout.tsx`                                   | 동                                                                              |
| 6   | `src/entities/wallet/api/use-fetch-nfts.query.ts`                        | `clientEnv.NEXT_PUBLIC_ALCHEMY_PUBLIC_API_KEY`                                  |
| 7   | `src/features/sign-in/by-social/ui/sign-in-button-for-dev.component.tsx` | NODE_ENV 유지 + `clientEnv.NEXT_PUBLIC_ENABLE_DEV_LOGIN === 'true'`             |
| 8   | `src/shared/api/system-status/get-system-status.ts`                      | **silent `?? ''` 제거** → `clientEnv.NEXT_PUBLIC_API_HOST_NAME`                 |
| 9   | `src/shared/api/system-status/get-edge-config-maintenance.ts`            | `serverEnv.VERCEL_ENV`, `serverEnv.EDGE_CONFIG`                                 |
| 10  | `src/shared/api/websocket/client.ts`                                     | `clientEnv.NEXT_PUBLIC_API_WS_HOST_NAME`                                        |
| 11  | `src/shared/api/http/client/client.ts`                                   | `clientEnv.NEXT_PUBLIC_HTTP_TIMEOUT_MS` + `clientEnv.NEXT_PUBLIC_API_HOST_NAME` |
| 12  | `src/shared/lib/decorators/mock/mock-return.decorator.ts`                | NODE_ENV 유지, `NEXT_PUBLIC_USE_MOCK` → `clientEnv.NEXT_PUBLIC_USE_MOCK`        |
| 13  | `src/shared/lib/decorators/mock/mock-resolve.decorator.ts`               | 동                                                                              |
| 14  | `src/shared/lib/analytics/index.ts`                                      | `clientEnv.NEXT_PUBLIC_AMPLITUDE_API_KEY`                                       |
| 15  | `src/shared/lib/functions/log/log-environment.ts`                        | `clientEnv.NEXT_PUBLIC_VERCEL_ENV === 'production'`                             |
| 16  | `playwright.config.ts`                                                   | `e2eEnv.CI`, `e2eEnv.E2E_BASE_URL`, `e2eEnv.VERCEL_AUTOMATION_BYPASS_SECRET`    |
| 17  | `e2e/auth/shared.ts`                                                     | `e2eEnv.VERCEL_AUTOMATION_BYPASS_SECRET`                                        |
| 18  | `e2e/helpers/partyroom.helpers.ts`                                       | **silent fallback 제거** → `e2eEnv.E2E_API_BASE`                                |
| 19  | `e2e/mobile/chunk4.helpers.ts`                                           | 동                                                                              |
| 20  | `e2e/mobile/display-board.tos.spec.ts`                                   | **silent fallback 제거** → `e2eEnv.E2E_API_BASE`                                |
| 21  | `e2e/e2e-b.dj-state-machine.spec.ts`                                     | `e2eEnv.E2E_BASE_URL`                                                           |
| 22  | `src/features/partyroom/exit/api/use-exit-partyroom.integration.test.ts` | vitest mutation 유지                                                            |
| 23  | `src/shared/lib/decorators/mock/mock-return.decorator.test.ts`           | vitest mutation 유지                                                            |
| 24  | `src/shared/lib/decorators/mock/mock-resolve.decorator.test.ts`          | vitest mutation 유지                                                            |

## 7. ESLint 가드

`eslint.config.js` 에 `no-restricted-syntax` 추가:

```js
{
  selector: "MemberExpression[object.object.name='process'][object.property.name='env']",
  message: "process.env 직접 접근 금지. clientEnv / serverEnv (src/shared/config) 또는 e2eEnv (e2e/config) 를 사용하세요. issue #372 참조."
}
```

예외 (override 룰 적용):

- `src/shared/config/**/*.ts` (schema 자체)
- `e2e/config/**/*.ts` (e2e schema 자체)
- `next.config.js` (Next.js 빌드 시점)
- `**/*.test.{ts,tsx}` (vitest test 의 의도된 mutation)
- `**/*.integration.test.ts` (동)

## 8. 테스트

### 8.1 유닛

- `src/shared/config/client-env.test.ts`
  - 필수 key 누락 시 throw (각 필수 key 별 1 케이스)
  - 잘못된 URL 형식 → `Invalid url` 메시지 포함
  - `NEXT_PUBLIC_API_WS_HOST_NAME` 의 스킴 검증 (ws:// 통과, http:// throw)
  - `NEXT_PUBLIC_HTTP_TIMEOUT_MS` coerce.number 동작 (`"3000"` → 3000) 및 default (`undefined` → 4000)
  - `NEXT_PUBLIC_VERCEL_ENV` default (`undefined` → `''`)
- `src/shared/config/server-env.test.ts`
  - `NODE_ENV` default 및 enum 검증
  - `EDGE_CONFIG` optional 동작
- `e2e/config/env.test.ts` 는 별도 vitest project (이미 e2e 와 src 가 분리). 생성 보류 — e2e 모듈 import 자체가 smoke 역할.

테스트는 `parseClientEnv(raw)` / `parseServerEnv(raw)` 함수를 호출하는 형태 → process.env 격리 0 영향.

### 8.2 Integration

`clientEnv` import 가 module top-level parse 라 vitest 가 첫 import 하는 시점에 schema 통과해야 한다. **현재 `vitest.setup.ts` 는 env stub 0** (testing-library/jest-dom + cleanup 만). Vite 가 자동 로딩하는 `.env` 우선순위 (`.env.test.local` → `.env.local` → `.env.test` → `.env`) 에서 NEXT*PUBLIC*\* 가 잡힐 수도 있지만, 보장이 약하다.

**결정 — 명시적 stub 도입**: `vitest.setup.ts` 에 필수 key 전체 `vi.stubEnv(...)` 추가하여 의존성 끊기. 로컬 `.env.local` 변경이나 CI 환경 변경에 robust.

```ts
// vitest.setup.ts (신규 추가)
import { vi } from 'vitest';
vi.stubEnv('NEXT_PUBLIC_API_HOST_NAME', 'http://localhost:8080/api/');
vi.stubEnv('NEXT_PUBLIC_API_WS_HOST_NAME', 'ws://localhost:8080/ws');
vi.stubEnv('NEXT_PUBLIC_WAGMI_PROJECT_ID', 'test-project-id');
vi.stubEnv('NEXT_PUBLIC_ALCHEMY_PUBLIC_API_KEY', 'test-alchemy-key');
// ... (필수 key 전체)
```

- `use-exit-partyroom.integration.test.ts` 의 기존 `process.env.NEXT_PUBLIC_API_HOST_NAME` 동적 읽기는 그대로 둠 (vitest mutation 의도 보존).
- `parseClientEnv` 단위 테스트는 위 stub 영향 0 (입력 객체로 호출).

### 8.3 E2E

추가 spec 불요. e2e/config/env.ts import → schema 통과 = 자동 smoke. 단:

- 로컬 1 spec (e2e-a 또는 chunk4) 라운드 GREEN 확인
- CI vercel-preview-e2e 18+ tests GREEN

## 9. Rollout

### 9.1 브랜치 & PR

- 브랜치: `feature/env-zod-hardening` (origin/development 동기화 후 분기)
- 단일 PR: development 머지

### 9.2 Commit 구조 (논리 단위 squash before push)

1. `feat(config): introduce client/server env zod schemas (closes #372)`
2. `feat(e2e): introduce e2e/config/env.ts with E2E_API_BASE`
3. `refactor(env): sweep src/ to clientEnv/serverEnv (15 files)`
4. `refactor(e2e): sweep e2e helpers/specs to e2eEnv (8 files)`
5. `chore(env): add E2E_API_BASE to CI workflow + .env.example doc` (`.env.local` 은 gitignored 라 commit 대상 아님 — 로컬 가이드는 본 spec + `.env.example` 에 명시)
6. `chore(eslint): no-restricted-syntax guard for process.env`
7. `test(config): client/server env parse tests`
8. `docs: link reference_e2e_silent_env_fallback_pattern in env.ts JSDoc`

[[feedback_commit_consolidation_before_push]] 에 따라 push 직전 squash.

### 9.3 검증 게이트 (모두 GREEN 후 push)

- 사전: 호출처 sweep 전 destructured pattern (`const { X } = process.env`) audit — `rg 'const\s*\{[^}]*\}\s*=\s*process\.env'`
- 사전: Vercel preflight — `vercel env pull .env.vercel.local` 으로 dev/stg 에 schema 필수 key 모두 있는지 확인 (실제 push 전 빌드 fail 회피)
- `yarn test:type` — 0 errors
- `yarn test` — 모든 unit/integration GREEN
- `yarn lint` — 신규 guard 위반 0
- `npx next dev` 로컬 부팅 검증 (yarn dev 금지, [[reference_pfplay_web_local_dev_http_webpack]])
- `yarn build` — 빌드 성공
- E2E 로컬 1 spec 라운드 GREEN

### 9.4 Vercel 영향

- 추가 env 설정 불필요 (기존 사용 key 그대로)
- 단 미설정 시 빌드 실패 노출 (현재 stg/prod 모두 정상이라 영향 0 예상)
- 실패 시 zod 메시지로 누락 key 즉시 확인

### 9.5 prod ship

[[project_mobile_chunk4_merged]] 와 동일 — development 머지 후 사용자 명시 시까지 release/main 보류. chunk 1~4 묶음 + 본 PR 동시 ship 검토는 사용자 게이트.

### 9.6 Rollback

단일 PR revert. ESLint guard 만 revert 도 가능 (`eslint.config.js`).

### 9.7 이슈 닫기

`closes #372` PR 본문에 명시.

## 10. 위험 & 완화

| 위험                                              | 가능성 | 완화                                                               |
| ------------------------------------------------- | ------ | ------------------------------------------------------------------ |
| Vercel 누락 key 로 인한 빌드 실패                 | 낮음   | 미설정 key 없는 것 audit 으로 확인. 실패 시 zod 메시지로 즉시 파악 |
| vitest setup 에서 schema 위반                     | 중간   | vitest.setup.ts 에 stubEnv 추가, 1 회 fix                          |
| E2E_API_BASE 누락된 환경 (개발자 로컬)            | 중간   | `.env.local` 가이드 추가, schema 메시지 명확                       |
| Next.js NEXT*PUBLIC* inline 누락 (spread 사용 시) | 낮음   | 설계에서 키 명시 강제, 코드 review 명시                            |
| ESLint 가드의 false positive                      | 낮음   | 예외 path 명시, 위반 시 메시지에 우회법 안내                       |

## 11. 향후 가능한 확장 (out of scope)

- `NEXT_PUBLIC_API_HOST_NAME` 의 e2e 호환 alias 제거 (다음 series)
- lint-staged 에 pre-commit 강제
- env schema 를 `@t3-oss/env-nextjs` 같은 helper 로 추상화 (현재 yagni)

## 12. 참조

- pfplay-web#367, PR #370 (직전 사례)
- `reference_e2e_silent_env_fallback_pattern` (전이가능 진단 자산)
- `project_mobile_chunk31_ci_completed` (40일 잠복 root cause)
- `feedback_commit_consolidation_before_push` (push 전 squash)
- `reference_pfplay_web_local_dev_http_webpack` (로컬 부팅 정책)
