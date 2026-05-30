import '@testing-library/jest-dom';
import { cleanup } from '@testing-library/react';
import { afterEach, vi } from 'vitest';

// issue #372: clientEnv 가 module top-level parse 라 vitest 가 client-env 모듈을 import 하기 전에
// stub 필요. .env.local 자동 로딩에 의존하지 않고 명시 (CI / 로컬 / 다른 환경 모두 결정적).
// 필수 4 key 만 stub — optional 은 schema default 가 알아서 처리.
// setupFiles 는 test 파일 import 전에 실행되므로 본 위치에서 stub 으로 충분.
vi.stubEnv('NEXT_PUBLIC_API_HOST_NAME', 'http://localhost:8080/api/');
vi.stubEnv('NEXT_PUBLIC_API_WS_HOST_NAME', 'ws://localhost:8080/ws');
vi.stubEnv('NEXT_PUBLIC_WAGMI_PROJECT_ID', 'test-wagmi-project-id');
vi.stubEnv('NEXT_PUBLIC_ALCHEMY_PUBLIC_API_KEY', 'test-alchemy-key');

// issue #372: clientEnv / serverEnv 는 production 코드에서 module top-level parse 라
// import 시점 fail-fast 보장. 그러나 vitest 안에서는 기존 test 가 vi.stubEnv 로 runtime mutate
// 하는 패턴 (8 file) 이 있어 module-level cache 와 충돌. 본 vi.mock 은 test runtime 한정으로
// clientEnv/serverEnv 를 process.env Proxy 로 대체 — stubEnv 가 flow through 가능.
// 단위 테스트는 schema 가 아닌 consumer 의 behavior 를 검증하므로 zod coerce/default 우회 OK.
// '' (empty string) → undefined 로 정규화: Vercel 은 unset 변수를 inject 하지 않으므로
// 프로덕션에선 항상 undefined. test 는 vi.stubEnv 로 '' 를 넣어 "absent" 를 표현하는 패턴이라
// `?? fallback` 분기와 호환되도록 맞춰줌. importOriginal 로 parseClientEnv/parseServerEnv 등
// schema 자체를 직접 검증하는 test 는 그대로 동작.
const envProxy = new Proxy({} as Record<string, string | undefined>, {
  get(_, key: string) {
    const raw = process.env[key];
    return raw === '' ? undefined : raw;
  },
});

vi.mock('@/shared/config', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/shared/config')>();
  return { ...actual, clientEnv: envProxy };
});

vi.mock('@/shared/config/server-env', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/shared/config/server-env')>();
  return { ...actual, serverEnv: envProxy };
});

afterEach(() => {
  cleanup();
});
