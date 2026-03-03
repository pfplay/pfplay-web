# ADR-005: 3계층 에러 처리 전략 (EventEmitter + Decorator + Global Handler)

- **상태**: 채택됨
- **일자**: 2024-06

## 맥락

API 호출 실패 시 다양한 수준의 에러 처리가 필요하다:

1. **전역**: 인증 만료 시 로그인 페이지로 리다이렉트
2. **전역 UI**: 알 수 없는 에러 시 에러 다이얼로그 표시
3. **지역**: 특정 에러 코드에 대해 해당 컴포넌트가 직접 처리 (예: 파티룸 입장 실패 시 알림)

단순 try-catch나 React Query의 onError만으로는 전역/지역 처리를 분리하기 어렵고, 특정 에러만 전역 핸들링을 건너뛰는 조건부 로직이 산재한다.

## 결정

**3계층 에러 처리 시스템**을 구축한다.

### 계층 1: ErrorEmitter (이벤트 브로드캐스트)

axios 응답 인터셉터에서 에러 코드를 추출하여 `errorEmitter`로 브로드캐스트한다. 관심 있는 컴포넌트가 `useOnError` 훅으로 구독한다.

```
API 에러 발생 → response interceptor → errorEmitter.emit(errorCode)
                                            ↓
                              useOnError(ErrorCode.NOT_FOUND_ROOM, showAlert)
```

### 계층 2: @SkipGlobalErrorHandling (데코레이터)

서비스 메서드에 데코레이터를 적용하여 특정 조건에서 전역 에러 다이얼로그를 억제한다.

```ts
// 파티룸 입장 시 — 특정 에러 코드는 지역 핸들러가 처리
@SkipGlobalErrorHandling<AxiosError<APIError>>({
  when: (err) => [NOT_FOUND_ROOM, ALREADY_TERMINATED, EXCEEDED_LIMIT]
    .includes(err.response?.data?.errorCode)
})
async enter(partyroomId: number) { ... }
```

### 계층 3: React Query Global Error Handler

`QueryCache`/`MutationCache`의 `onError`에서 `shouldSkipGlobalErrorHandling` 플래그를 확인한 뒤, 건너뛰기 대상이 아닌 에러만 전역 에러 다이얼로그로 표시한다.

### 핵심 파일

- `src/shared/api/http/error/error-emitter.ts` — 싱글턴 EventEmitter
- `src/shared/api/http/error/use-on-error.hook.ts` — 지역 에러 구독 훅
- `src/shared/api/http/client/interceptors/response.ts` — 인터셉터에서 emit
- `src/shared/lib/decorators/skip-global-error-handling/` — 데코레이터
- `src/app/_providers/react-query.provider.tsx` — 전역 에러 핸들러

## 결과

- **(+)** 전역/지역 에러 처리가 명확히 분리
- **(+)** 데코레이터 한 줄로 전역 핸들링 억제 — 비즈니스 로직과 에러 정책 분리
- **(+)** 컴포넌트가 자신이 관심 있는 에러 코드만 구독
- **(-)** 에러 흐름을 이해하려면 3계층 구조를 모두 파악해야 함
- **(-)** 데코레이터가 에러 객체에 비열거형 프로퍼티를 주입하는 비표준 패턴
