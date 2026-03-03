# ADR-004: 통합 테스트에 MSW v2 + Custom Jest Environment 채택

- **상태**: 채택됨
- **일자**: 2026-02

## 맥락

API 통합 테스트에서 axios 호출 → 인터셉터(unwrapResponse) → React Query 캐시 갱신까지 전체 파이프라인을 검증해야 한다. `jest.mock('axios')`로는 인터셉터가 동작하지 않아 실제 코드 경로를 검증할 수 없다.

## 선택지

| 선택지                   | 장점                                   | 단점                            |
| ------------------------ | -------------------------------------- | ------------------------------- |
| `jest.mock('axios')`     | 간단, 빠름                             | 인터셉터 우회, 실제 경로 미검증 |
| nock                     | Node HTTP 가로채기                     | axios 어댑터와 호환 이슈        |
| **MSW v2 `setupServer`** | 네트워크 레벨 가로채기, 실제 경로 검증 | SWC import 제거 문제            |

## 결정

**MSW v2의 `setupServer`**를 채택한다.

단, SWC의 CommonJS 변환이 사용하지 않는 named import를 제거하는 문제가 있다:

```ts
// SWC가 server를 미사용으로 판단하여 import 자체를 제거함
import { server } from '@/shared/api/__test__/msw-server';
```

이를 해결하기 위해 **커스텀 Jest 환경**(`jest-msw-env.ts`)을 만들어 서버 lifecycle을 환경 레벨에서 관리한다. 테스트 파일에서는 bare import만 사용한다:

```ts
/**
 * @jest-environment <rootDir>/src/shared/api/__test__/jest-msw-env.ts
 */
import '@/shared/api/__test__/msw-server'; // side-effect import (SWC가 제거 불가)
```

### 핵심 파일

- `src/shared/api/__test__/jest-msw-env.ts` — 커스텀 Jest 환경
- `src/shared/api/__test__/msw-server.ts` — MSW 서버 설정
- `src/shared/api/__test__/handlers.ts` — 25+ 엔드포인트 핸들러
- `src/shared/api/__test__/test-utils.tsx` — renderWithClient 헬퍼

## 결과

- **(+)** axios → 인터셉터 → unwrap → React Query 전체 경로 검증
- **(+)** 핸들러 재사용으로 25+ 엔드포인트를 일관되게 모킹
- **(+)** `server.use()`로 테스트별 응답 오버라이드 가능
- **(-)** 커스텀 Jest 환경이라는 비표준 설정 — 새 팀원에게 설명 필요
- **(-)** 통합 테스트 파일마다 `@jest-environment` 주석 필요
