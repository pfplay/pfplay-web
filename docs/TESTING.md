# 테스트 가이드

> Last Update (26.03.02)

## 1. 실행 방법

```bash
# 전체 테스트 실행
yarn test

# 커버리지 없이 실행 (빠름)
npx jest --no-coverage

# 특정 파일/패턴만 실행
npx jest src/shared/ui --no-coverage
npx jest --testPathPattern="integration" --no-coverage

# 타입 체크
yarn test:type
```

## 2. 테스트 기법

프로젝트에서 사용하는 테스트 기법은 6가지로 분류됩니다.

| 기법              | 도구                               | 대상                                  | 예시                                      |
| ----------------- | ---------------------------------- | ------------------------------------- | ----------------------------------------- |
| **유닛-함수**     | 직접 호출 → 반환값 단언            | 순수 함수, 유틸리티                   | `categorize.test.ts`                      |
| **유닛-모델**     | 직접 호출 → 상태/반환값 단언       | Zustand 스토어, 도메인 모델           | `current-partyroom.store.test.ts`         |
| **유닛-클래스**   | 인스턴스 생성 → 메서드 호출        | Singleton 서비스, 어댑터, 데코레이터  | `singleton.decorator.test.ts`             |
| **유닛-훅**       | `renderHook` → `act` → 반환값 단언 | 커스텀 훅 (상태, 부수효과)            | `use-can-adjust-grade.hook.test.ts`       |
| **유닛-컴포넌트** | RTL `render` → 이벤트 → DOM 단언   | React 컴포넌트 (props, 인터랙션)      | `button.component.test.tsx`               |
| **통합-MSW**      | MSW + `renderHook` / 서비스 호출   | API 훅 → 서비스 → 인터셉터 → 네트워크 | `use-enter-partyroom.integration.test.ts` |

## 3. 파일 네이밍 컨벤션

테스트 파일은 소스 파일과 **동일 디렉토리에 co-locate** 합니다.
서비스 통합 테스트만 `__test__/` 디렉토리를 사용합니다.

```
src/shared/ui/components/button/
├── button.component.tsx          # 소스
└── button.component.test.tsx     # 테스트 (co-locate)

src/shared/api/http/services/
├── playlists.ts                  # 소스
└── __test__/
    └── playlists.integration.test.ts  # 서비스 통합 테스트
```

### 네이밍 패턴

| 유형        | 파일명 패턴                                    | 확장자 |
| ----------- | ---------------------------------------------- | ------ |
| 순수 함수   | `{name}.test.ts`                               | `.ts`  |
| 모델/스토어 | `{name}.model.test.ts`, `{name}.store.test.ts` | `.ts`  |
| 훅          | `{name}.hook.test.ts`                          | `.ts`  |
| 컴포넌트    | `{name}.component.test.tsx`                    | `.tsx` |
| 통합 테스트 | `{name}.integration.test.ts`                   | `.ts`  |

## 4. MSW 통합 테스트 작성법

MSW(Mock Service Worker)를 사용하여 `jest.mock` 없이 실제 axios → 인터셉터 → 응답 처리 파이프라인을 검증합니다.

### 인프라 파일 구조

```
src/shared/api/__test__/
├── jest-msw-env.ts    # 커스텀 Jest 환경 (jsdom + Node.js fetch 글로벌)
├── msw-server.ts      # setupServer + beforeAll/afterEach/afterAll 라이프사이클
├── handlers.ts        # 25+ 엔드포인트 핸들러
└── test-utils.tsx     # createTestQueryClient, TestWrapper, renderWithClient
```

### 기본 패턴: 서비스 호출 테스트

```typescript
// src/shared/api/__test__/msw-server.ts 를 반드시 import
import '@/shared/api/__test__/msw-server';
import { playlistsService } from '@/shared/api/http/services';

describe('playlistsService', () => {
  test('플레이리스트 생성 성공', async () => {
    const result = await playlistsService.createPlaylist({ name: 'My List' });
    expect(result).toHaveProperty('playlistId');
  });
});
```

### 기본 패턴: React Query 훅 통합 테스트

```typescript
import { server } from '@/shared/api/__test__/msw-server';
import { renderWithClient } from '@/shared/api/__test__/test-utils';
import { http, HttpResponse } from 'msw';
import { act, waitFor } from '@testing-library/react';
import useCreatePlaylist from './use-create-playlist.mutation';

const API = process.env.NEXT_PUBLIC_API_HOST_NAME;

test('뮤테이션 성공 시 캐시를 무효화한다', async () => {
  const { result, queryClient } = renderWithClient(() => useCreatePlaylist());
  const invalidate = jest.spyOn(queryClient, 'invalidateQueries');

  await act(async () => {
    result.current.mutate({ name: 'Test' });
  });

  await waitFor(() => expect(result.current.isSuccess).toBe(true));
  expect(invalidate).toHaveBeenCalled();
});
```

### 에러 테스트 패턴

```typescript
import { server } from '@/shared/api/__test__/msw-server';
import { http, HttpResponse } from 'msw';
import { ErrorCode } from '@/shared/api/http/types/@shared';

test('API 에러 시 에러가 전파된다', async () => {
  // 핸들러 오버라이드
  server.use(
    http.post(`${API}v1/partyrooms/:id/enter`, () =>
      HttpResponse.json(
        { errorCode: ErrorCode.ACTIVE_ANOTHER_ROOM, reason: 'Already in room' },
        { status: 400 }
      )
    )
  );

  const { result } = renderWithClient(() => useEnterPartyroom());

  await act(async () => {
    result.current.mutate({ partyroomId: 1 });
  });

  await waitFor(() => expect(result.current.isError).toBe(true));
});
```

### 핸들러 확장

새 API 엔드포인트를 테스트하려면 `handlers.ts`에 핸들러를 추가합니다.

```typescript
// src/shared/api/__test__/handlers.ts
import { http, HttpResponse } from 'msw';

const BASE = 'http://localhost:8080/api/';

export const handlers = [
  // 기존 핸들러들...

  // 새 핸들러 추가
  http.get(`${BASE}v1/new-endpoint`, () => HttpResponse.json({ data: { items: [] } })),
];
```

> 응답은 실제 API 스펙 `{ data: { ... } }` 형태로 래핑해야 합니다.
> `unwrapResponse` 인터셉터가 `response.data.data`를 추출합니다.

## 5. 유닛 테스트 패턴

### Zustand 스토어 + 권한 훅

`useStores` 컨텍스트에 의존하는 훅 테스트 패턴입니다.

```typescript
jest.mock('@/shared/lib/store/stores.context');

import { renderHook } from '@testing-library/react';
import { createCurrentPartyroomStore } from '@/entities/current-partyroom/model/current-partyroom.store';
import { GradeType } from '@/shared/api/http/types/@enums';
import { useStores } from '@/shared/lib/store/stores.context';
import useCanClose from './use-can-close-current-partyroom.hook';

let store: ReturnType<typeof createCurrentPartyroomStore>;

beforeEach(() => {
  jest.clearAllMocks();
  store = createCurrentPartyroomStore();
  (useStores as jest.Mock).mockReturnValue({ useCurrentPartyroom: store });
});

test('HOST는 파티룸을 닫을 수 있다', () => {
  store.setState({ me: { gradeType: GradeType.HOST } as any });
  const { result } = renderHook(() => useCanClose());
  expect(result.current).toBe(true);
});
```

### React Query 캐시 모킹

```typescript
const mockGetQueryData = jest.fn();
jest.mock('@tanstack/react-query', () => ({
  useQueryClient: () => ({ getQueryData: mockGetQueryData }),
}));

import { renderHook } from '@testing-library/react';
import useIsNft from './use-is-nft.hook';

test('NFT 목록에 URI가 존재하면 true를 반환한다', () => {
  mockGetQueryData.mockReturnValue([
    { resourceUri: 'https://example.com/nft1.png', available: true },
  ]);
  const { result } = renderHook(() => useIsNft());
  expect(result.current('https://example.com/nft1.png')).toBe(true);
});
```

### 컴포넌트 테스트 (Headless UI 사용 시)

Headless UI 컴포넌트(`Select`, `Tab`, `Dialog` 등)를 사용하는 컴포넌트는 `ResizeObserver` mock이 필요합니다.

```typescript
global.ResizeObserver = class ResizeObserver {
  public observe() { /* noop */ }
  public unobserve() { /* noop */ }
  public disconnect() { /* noop */ }
} as any;

import { render, fireEvent } from '@testing-library/react';
import Button from './button.component';

test('클릭 이벤트가 발생한다', () => {
  const onClick = jest.fn();
  const { getByRole } = render(<Button onClick={onClick}>Click</Button>);
  fireEvent.click(getByRole('button'));
  expect(onClick).toHaveBeenCalledTimes(1);
});
```

## 6. 알려진 제약사항

| 제약                | 설명                                                            | 대응                                                                        |
| ------------------- | --------------------------------------------------------------- | --------------------------------------------------------------------------- |
| **jest-dom 미설정** | `toBeInTheDocument()` 사용 불가                                 | `toBeTruthy()` / `toBeFalsy()` 대체                                         |
| **ErrorCode 검증**  | `getErrorCode()`가 enum에 없는 코드를 무시하고 `undefined` 반환 | 테스트 시 반드시 `ErrorCode` enum 값 사용                                   |
| **MSW 서버 import** | `msw-server.ts`를 명시적 import 해야 라이프사이클 훅 실행됨     | `server.use()` 없는 파일도 `import '@/shared/api/__test__/msw-server'` 필수 |
| **useIsNft 반환값** | `nfts && nfts.find(...)` → 데이터 없으면 `undefined` 반환       | `toBe(false)` 대신 `toBeFalsy()` 사용                                       |
| **ResizeObserver**  | jsdom에 미구현 → Headless UI 컴포넌트 테스트 시 에러            | 테스트 상단에 글로벌 mock 추가                                              |

## 7. 환경 설정 요약

| 항목                       | 값                                              |
| -------------------------- | ----------------------------------------------- |
| 테스트 러너                | Jest 29                                         |
| 테스트 환경                | jsdom (`jest-msw-env.ts`로 fetch 글로벌 복원)   |
| 트랜스파일러               | @swc/jest                                       |
| 모듈 별칭                  | `@/` → `src/`                                   |
| MSW 버전                   | v2 (Node.js `setupServer`)                      |
| React Testing Library      | v16                                             |
| React Query                | TanStack Query v5                               |
| QueryClient 기본 staleTime | 5분 (300,000ms)                                 |
| QueryClient 기본 retry     | dev: 비활성화 / prod: 최대 3회 (인증 에러 제외) |
