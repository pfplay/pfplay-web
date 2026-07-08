# WS 재연결 멤버십 resync Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** WS 재연결 시 멤버십을 재확립하고(CRW-001 차단), 멤버십이 실제 끊긴 경우만 상태를 재수화하여 흔한 블립에서 플레이어 remount를 피한다.

**Architecture:** 백엔드 `tryEnter`가 이미 계산하는 "재활성 여부"를 응답 `reactivated`로 노출. 프론트는 재연결(첫 연결 skip)마다 `tryEnter` 호출 후 `reactivated`로 분기 — true면 풀 재수화, false면 경량(DJ큐 invalidate만).

**Tech Stack:** platform(Spring/JUnit), web(Next.js/TanStack Query/Vitest). 스펙: `docs/superpowers/specs/2026-06-19-ws-reconnect-resync-design.md`.

---

## 파일 구조

**platform**

- Modify `app/.../party/application/service/PartyroomAccessCommandService.java` — `tryEnter` 반환을 `TryEnterResult(crew, reactivated)`로; 내부 `record TryEnterResult` 추가.
- Modify `app/.../party/adapter/in/web/PartyroomAccessCommandController.java` — `EnterPartyroomResponse.from(result.crew(), result.reactivated())`.
- Modify `app/.../party/adapter/in/web/payload/response/access/EnterPartyroomResponse.java` — `reactivated` 필드 + 오버로드.
- Modify `app/.../virtualdj/application/service/VirtualDjOrchestratorImpl.java` — 반환 무시라 무변경(컴파일만 확인).
- Test `app/.../party/application/service/PartyroomAccessCommandServiceTest.java` (또는 기존 IT).

**web**

- Modify `src/shared/api/http/types/partyrooms.ts` — `EnterResponse`에 `reactivated: boolean`.
- Modify `src/features/partyroom/enter/lib/use-enter-partyroom.ts` — 비-once resync 핸들러 + `firstConnect` useRef.
- Test `src/features/partyroom/enter/lib/use-enter-partyroom.test.ts` (기존 확장).

---

## Chunk 1: platform — `reactivated` 신호

### Task 1: `tryEnter`가 reactivated 반환

**Files:** Modify `PartyroomAccessCommandService.java`, `PartyroomAccessCommandController.java`, `EnterPartyroomResponse.java`; Test `PartyroomAccessCommandServiceTest.java`

- [ ] **Step 1: 실패 테스트** — 재활성 vs 유지 구분 (기존 테스트 하니스 패턴 따름; mock aggregatePort)

```java
@Test
@DisplayName("tryEnter — 이미 active(같은 룸 재입장)면 reactivated=false")
void tryEnterAlreadyActiveReactivatedFalse() {
    // given: 활성 crew 존재, autoExit helper가 같은 룸 active 반환하도록 셋업
    // (기존 PartyroomAccessCommandServiceTest 의 active-crew 셋업 패턴 재사용)
    // when
    var result = accessCommandService.tryEnter(partyroomId, countryCode);
    // then
    assertThat(result.reactivated()).isFalse();
}

@Test
@DisplayName("tryEnter — inactive crew 재활성이면 reactivated=true")
void tryEnterReactivatedTrue() {
    // given: inactive crew, activateCrew toggle 1 반환(transitioned=true)
    // when / then
    assertThat(accessCommandService.tryEnter(partyroomId, countryCode).reactivated()).isTrue();
}
```

- [ ] **Step 2: 실패 확인** — Run: `JAVA_HOME="C:/Users/Eisen/.jdks/ms-21.0.7" ./gradlew :app:test --tests "*PartyroomAccessCommandServiceTest"` · Expected: 컴파일 실패(메서드 시그니처) 또는 FAIL.

- [ ] **Step 3: 구현**

  - `tryEnter` 반환 타입 `CrewData` → `TryEnterResult`:
    - 같은-룸 재입장 분기(L112): `return new TryEnterResult(saved, false);`
    - 말미(L129): `return new TryEnterResult(result.crew(), result.transitioned());`
  - 클래스 내부에 record 추가:
    ```java
    /** reactivated=true 는 신규 INSERT(최초 입장)에도 true. 재연결 소비자에게만 유의미(재연결은 INSERT 안 함). */
    public record TryEnterResult(CrewData crew, boolean reactivated) {}
    ```
  - `EnterPartyroomResponse`:
    ```java
    private long crewId;
    private GradeType gradeType;
    private boolean reactivated;
    public static EnterPartyroomResponse from(CrewData crew, boolean reactivated) {
        return new EnterPartyroomResponse(crew.getId(), crew.getGradeType(), reactivated);
    }
    ```
  - 컨트롤러 L44-45:
    ```java
    var result = partyroomAccessCommandService.tryEnter(new PartyroomId(partyroomId), countryCode);
    return ResponseEntity.status(HttpStatus.CREATED)
        .body(ApiCommonResponse.success(EnterPartyroomResponse.from(result.crew(), result.reactivated())));
    ```
  - 봇 `VirtualDjOrchestratorImpl:149`: `accessCommandService.tryEnter(partyroomId, null);` 그대로(반환 무시) — 컴파일 OK.

- [ ] **Step 4: 통과 확인** — Run: `… :app:test --tests "*PartyroomAccessCommandServiceTest"` · Expected: PASS.
- [ ] **Step 5: 회귀** — Run: `… :app:test` · Expected: 풀 GREEN(특히 컨트롤러/봇 경로).
- [ ] **Step 6: 커밋** — `git commit -m "feat(party): tryEnter 응답에 reactivated 노출 (web#402 신호)"`

---

## Chunk 2: web — 재연결 resync 핸들러

### Task 2: `EnterResponse`에 reactivated

**Files:** Modify `src/shared/api/http/types/partyrooms.ts`

- [ ] **Step 1: 구현** (타입 추가, 별도 테스트 불필요 — 타입체크가 게이트)

```ts
export type EnterResponse = {
  crewId: number;
  gradeType: GradeType;
  reactivated: boolean;
};
```

- [ ] **Step 2: 커밋** — `git commit -m "types(partyroom): EnterResponse.reactivated (#402)"`

### Task 3: 재연결 resync 핸들러

**Files:** Modify `src/features/partyroom/enter/lib/use-enter-partyroom.ts`; Test `…/use-enter-partyroom.test.ts`

- [ ] **Step 1: 실패 테스트** (기존 하니스 확장 — `mockOnConnect`/`mockMutate`/`mockInvalidateQueries`/`mockPush` + `partyroomsService` 목)

```ts
// 추가 목: partyroomsService.getSetupInfo/getNotice
vi.mock('@/shared/api/http/services', () => ({
  partyroomsService: { getSetupInfo: vi.fn(), getNotice: vi.fn() },
}));
// ... 기존 beforeEach 유지 (getSetupInfo는 never-resolve 기본; 호출 여부만 단언)

test('resync 핸들러를 비-once 로 등록한다', () => {
  const { result } = renderHook(() => useEnterPartyroom(1));
  act(() => result.current());
  // 0번째 = once enter, 1번째 = resync(non-once)
  expect(mockOnConnect).toHaveBeenNthCalledWith(2, expect.any(Function), undefined);
});

test('resync — 첫 연결은 skip (mutate 미호출)', () => {
  const { result } = renderHook(() => useEnterPartyroom(7));
  act(() => result.current());
  const resync = mockOnConnect.mock.calls[1][0];
  resync(); // 첫 발화 = firstConnect skip
  expect(mockMutate).not.toHaveBeenCalled();
});

test('resync — 재연결 시 enter(tryEnter) 호출', () => {
  const { result } = renderHook(() => useEnterPartyroom(7));
  act(() => result.current());
  const resync = mockOnConnect.mock.calls[1][0];
  resync(); // 첫 = skip
  resync(); // 재연결
  expect(mockMutate).toHaveBeenCalledWith(
    expect.objectContaining({ partyroomId: 7 }),
    expect.objectContaining({ onSuccess: expect.any(Function), onError: expect.any(Function) })
  );
});

test('resync — reactivated=false → setup 미호출, DJ큐 invalidate', () => {
  const { result } = renderHook(() => useEnterPartyroom(7));
  act(() => result.current());
  const resync = mockOnConnect.mock.calls[1][0];
  resync();
  resync();
  const onSuccess = mockMutate.mock.calls[0][1].onSuccess;
  onSuccess({ crewId: 1, gradeType: 'LISTENER', reactivated: false });
  expect(partyroomsService.getSetupInfo).not.toHaveBeenCalled();
  expect(mockInvalidateQueries).toHaveBeenCalledWith({ queryKey: [QueryKeys.DjingQueue, 7] });
});

test('resync — reactivated=true → setup 호출(재수화)', () => {
  (partyroomsService.getSetupInfo as Mock).mockReturnValue(new Promise(() => {}));
  (partyroomsService.getNotice as Mock).mockReturnValue(new Promise(() => {}));
  const { result } = renderHook(() => useEnterPartyroom(7));
  act(() => result.current());
  const resync = mockOnConnect.mock.calls[1][0];
  resync();
  resync();
  mockMutate.mock.calls[0][1].onSuccess({ crewId: 1, gradeType: 'LISTENER', reactivated: true });
  expect(partyroomsService.getSetupInfo).toHaveBeenCalled();
});

test('resync — enter onError → 로비', () => {
  const { result } = renderHook(() => useEnterPartyroom(7));
  act(() => result.current());
  const resync = mockOnConnect.mock.calls[1][0];
  resync();
  resync();
  mockMutate.mock.calls[0][1].onError();
  expect(mockPush).toHaveBeenCalledWith('/parties');
});
```

- [ ] **Step 2: 실패 확인** — Run: `npx vitest run src/features/partyroom/enter/lib/use-enter-partyroom.test.ts` · Expected: FAIL(resync 미구현).

- [ ] **Step 3: 구현** — `use-enter-partyroom.ts`: hook 스코프에 `const firstConnect = useRef(true);` 추가, 반환 함수에 resync 등록

```ts
return () => {
  client.onConnect(
    /* 기존 once enter 그대로 */ () => {
      /* ... enter+setup ... */
    },
    { once: true }
  );

  // 재연결 resync (비-once). firstConnect ref 로 첫 연결 skip(이중 tryEnter 방지).
  client.onConnect(() => {
    if (firstConnect.current) {
      firstConnect.current = false;
      return;
    }
    enter(
      { partyroomId },
      {
        onSuccess: (enterResponse) => {
          const invalidateDjQueue = () =>
            queryClient.invalidateQueries({ queryKey: [QueryKeys.DjingQueue, partyroomId] });
          if (enterResponse.reactivated) {
            // 멤버십 상실 → 풀 재수화. 룸 재구독은 추가하지 않음(handleConnect가 이미 reconcile).
            silent(setup(enterResponse), {
              onSuccess: invalidateDjQueue,
              onError: () => router.push('/parties'),
            });
          } else {
            // 멤버십 유지 → 경량(플레이어/구독 무영향)
            invalidateDjQueue();
          }
        },
        onError: () => router.push('/parties'),
      }
    );
  });
};
```

- [ ] **Step 4: 통과 확인** — Run: `npx vitest run src/features/partyroom/enter/lib/use-enter-partyroom.test.ts` · Expected: PASS.
- [ ] **Step 5: 타입체크** — Run: `yarn test:type` · Expected: 0 에러.
- [ ] **Step 6: 커밋** — `git commit -m "fix(partyroom): WS 재연결 멤버십 resync — 감지-후-분기 (#402)"`

---

## 회귀/검증

- web: `yarn test`(전체) GREEN — 특히 enter 흐름·room layout 회귀.
- platform: `:app:test` 풀 GREEN.
- (머지 전, 게이트) 로컬 풀스택 + 수동 스모크: 백그라운드 탭 1분 방치→복귀(소프트 재연결) 시 (a) 액션 정상(CRW-001 없음) (b) 짧은 블립에선 플레이어 무중단.

## 범위 밖

백엔드 refresh(#306-①), WS inbound 만료검증(#306-②). 경량 경로 playback staleness가 가시적이면 selective merge 후속.
