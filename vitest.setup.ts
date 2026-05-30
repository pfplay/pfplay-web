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

afterEach(() => {
  cleanup();
});
