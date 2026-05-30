export { clientEnv, parseClientEnv, type ClientEnv } from './client-env';
// server-env 는 'server-only' import 가 있어 barrel 에서 re-export 시 client 측 사고 위험.
// 명시적으로 server 측 코드는 `@/shared/config/server-env` 직접 import 권장.
// (필요 시 별도 server-barrel 생성)
