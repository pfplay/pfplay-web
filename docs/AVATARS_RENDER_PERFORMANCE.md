# Avatars 컴포넌트 렌더 성능 분석

> **작성일**: 2026-04-19
> **대상 파일**: `src/widgets/partyroom-avatars/ui/avatars.component.tsx` > **관련 파일**: `src/widgets/partyroom-avatars/lib/use-avatar-cluster.hook.ts`, `src/entities/avatar/ui/useAvatarDance.hook.ts`, `src/shared/lib/functions/pick.ts`

---

## 요약

파티룸의 `Avatars` 컴포넌트가 `crews`/`currentDj`와 **무관한 Zustand 상태 변경**(채팅, 공지, 재생, 리액션 집계 등)에도 전체 리렌더되고 있다. 근본 원인은 `pick()` 셀렉터가 매번 새 객체를 반환하면서 Zustand의 참조 동등성 비교를 통과하지 못하기 때문이다. 이 문제는 연쇄적으로 O(n) 재계산 체인과 자식 Avatar 컴포넌트의 불필요한 리렌더를 유발한다.

---

## 발견된 이슈 (5건)

### 이슈 1: `pick()` 셀렉터에 `shallow` 비교 없음 — CRITICAL

**파일**: `avatars.component.tsx:15`

```ts
const { crews, currentDj } = useCurrentPartyroom((state) => pick(state, ['crews', 'currentDj']));
```

**`pick()` 구현** (`shared/lib/functions/pick.ts`):

```ts
export function pick<T, K extends keyof T>(obj: T, keys: K[]): Pick<T, K> {
  const result: Pick<T, K> = {} as Pick<T, K>; // 매번 새 객체 리터럴
  keys.forEach((key) => {
    result[key] = obj[key];
  });
  return result;
}
```

**문제**: `pick()`은 호출될 때마다 새 `{}` 객체를 반환한다. Zustand의 기본 비교는 `Object.is()` (참조 동등성)이므로, 스토어의 **어떤 필드가 변경되든** 셀렉터 결과가 새 참조 → 컴포넌트 리렌더로 이어진다.

**검증**: 프로젝트 전체에 `useShallow`, `shallow` import **0건** (grep 확인).

**영향 범위**: `Avatars` 뿐만 아니라 같은 패턴을 쓰는 모든 컴포넌트에 동일 문제 발생. 확인된 곳:

- `video.component.tsx:55-56` — `pick(state, ['playback', 'currentDj', 'me', 'crews'])`

| 스토어 변경 이벤트                         | crews 변경? | Avatars 리렌더? | 판정     |
| ------------------------------------------ | ----------- | --------------- | -------- |
| 채팅 메시지 수신 (`appendChatMessage`)     | X           | O               | **낭비** |
| 공지 변경 (`updateNotice`)                 | X           | O               | **낭비** |
| 재생 변경 (`updatePlayback`)               | X           | O               | **낭비** |
| 재생 활성화 (`updatePlaybackActivated`)    | X           | O               | **낭비** |
| 리액션 집계 (`updateReaction`)             | X           | O               | **낭비** |
| 본인 정보 변경 (`updateMe`)                | X           | O               | **낭비** |
| 크루 입장/퇴장 (`updateCrews`)             | O           | O               | 정상     |
| 리액션/모션 (`updateCrews` via motionType) | O           | O               | 정상     |

---

### 이슈 2: `useAvatarCluster` 반환값이 매번 새 배열 — HIGH

**파일**: `use-avatar-cluster.hook.ts:346-349`

```ts
return {
  courtPositions: courtClustered.map(({ crewId, position }) => ({ crewId, position })),
  queuePositions: queueClustered.map(({ crewId, position }) => ({ crewId, position })),
};
```

**문제**: `.map()`이 `useMemo` 없이 훅 본문에 직접 위치. 호출될 때마다 새 배열 + 새 객체 생산. `courtClustered` 상태가 변경되지 않았어도 소비자 측에서는 새 참조를 받게 된다.

---

### 이슈 3: `djQueueCrewIds` 매 렌더마다 새 배열 — MEDIUM

**파일**: `avatars.component.tsx:20-22`

```ts
const djQueueCrewIds = djingQueue
  ? djingQueue.djs.filter((dj) => dj.orderNumber > 1).map((dj) => dj.crewId)
  : [];
```

**문제**: `useMemo` 없이 매 렌더마다 `filter().map()` 또는 새 `[]` 생성. 이 값이 `useAvatarCluster`의 `useEffect` 의존성에 들어가므로, 내용이 같아도 새 참조 → effect 본문 진입 → `JSON.stringify` + `sort()` 비교까지 매번 실행됨 (D3 시뮬레이션 자체는 내부 가드로 스킵).

---

### 이슈 4: `registerAvatar` useCallback 부재 — MEDIUM

**파일**: `useAvatarDance.hook.ts:22`

```ts
const registerAvatar = (el: HTMLElement | null, motionType: MotionType) => { ... };
```

**문제**: `useCallback` 없이 매 렌더마다 새 함수 참조 생성. `Avatar` 컴포넌트는 `memo()`로 감싸져 있으나 (`avatar.component.tsx:38`), `avatarRef` prop이 새 참조이면 memo 비교 실패 → Avatar 리렌더 → `useEffect` 재실행 (`avatar.component.tsx:59-61`).

**완화 요소**: `registerAvatar` 내부에 `entry.el === el` 가드가 있어 중복 등록은 발생하지 않음. 기능적 문제는 없으나, `memo()`의 최적화 효과를 무효화하는 불필요한 리렌더 비용이 발생.

---

### 이슈 5: 크루 입장/퇴장 시 이중 렌더 — LOW

**파일**: `use-avatar-cluster.hook.ts:309-344`

**문제**: 크루 ID 목록이 변경되면 `useEffect` → `setCourtClustered` + `setQueueClustered` → 두 번째 렌더. 이 이중 렌더에서 이슈 2, 3의 재계산이 또 한 번 실행됨.

**완화 요소**: 크루 입장/퇴장은 빈도가 낮은 이벤트이므로 실질적 성능 영향은 미미. `useEffect` + `useState` 패턴의 구조적 한계.

---

## 최악 시나리오: 채팅 활발한 파티룸

50명 크루가 있는 파티룸에서 초당 10건 채팅 메시지 수신 시:

```
appendChatMessage()
  → Zustand set({ chat: ... })
  → pick() 새 객체 반환 (crews, currentDj 미변경)
  → Object.is() 실패 → Avatars 리렌더              ← 낭비 시작
    1. crews.find() for DJ                    O(n)   ← 낭비
    2. djQueueCrewIds = filter().map()        O(q)   ← 낭비
    3. useAvatarCluster 호출
       → return .map() 새 배열 2회            O(n)   ← 낭비
       → useEffect 진입 → JSON.stringify      O(n)   ← 낭비
       → 가드 통과 (D3 시뮬레이션 스킵)               OK
    4. new Map(crews.map(...))                O(n)   ← 낭비
    5. courtPositions.map().filter()          O(n)   ← 낭비
    6. queuePositions.map().filter()          O(q)   ← 낭비
    7. JSX reconciliation                    O(n)   ← 낭비
    8. registerAvatar 새 참조
       → 각 Avatar memo 비교 실패            O(n)   ← 낭비
       → useEffect 재실행 (재등록은 안 됨)    O(n)   ← 낭비

초당 10회 × O(n) 체인 = 초당 ~O(10n) 불필요 연산
n=50 기준: 초당 ~500회의 낭비 연산 + 500개의 불필요 Avatar 리렌더
```

**참고**: D3 시뮬레이션(O(n^2))은 가드에 의해 보호되고 있으므로, 성능 치명타는 아님. 그러나 대규모 파티룸 + 활발한 채팅 환경에서 UI 버벅임으로 이어질 수 있음.

---

## 해결 방안

### Fix 1: `pick()` 셀렉터에 `shallow` 비교 적용 — CRITICAL

Zustand v4의 `useShallow`를 사용하여 셀렉터 결과를 얕은 비교로 전환한다.

**Before:**

```ts
import { pick } from '@/shared/lib/functions/pick';

const { crews, currentDj } = useCurrentPartyroom((state) => pick(state, ['crews', 'currentDj']));
```

**After:**

```ts
import { useShallow } from 'zustand/react/shallow';

const { crews, currentDj } = useCurrentPartyroom(
  useShallow((state) => ({ crews: state.crews, currentDj: state.currentDj }))
);
```

또는 `pick()`을 유지하되 `useShallow`로 감싸기:

```ts
const { crews, currentDj } = useCurrentPartyroom(
  useShallow((state) => pick(state, ['crews', 'currentDj']))
);
```

**효과**: `crews`나 `currentDj`의 참조가 실제로 변경된 경우에만 리렌더. 채팅/공지/재생/리액션 집계 이벤트에서의 낭비 리렌더 **완전 제거**.

**적용 범위**: `pick(state, ...)` 패턴을 사용하는 모든 컴포넌트에 동일하게 적용 필요.

**리스크**: 낮음. 동작 변경 없이 비교 방식만 변경. `useShallow`는 Zustand v4.5+ 공식 API.

---

### Fix 2: `useAvatarCluster` 반환값 메모이제이션 — HIGH

**Before:**

```ts
return {
  courtPositions: courtClustered.map(({ crewId, position }) => ({ crewId, position })),
  queuePositions: queueClustered.map(({ crewId, position }) => ({ crewId, position })),
};
```

**After:**

```ts
const courtPositions = useMemo(
  () => courtClustered.map(({ crewId, position }) => ({ crewId, position })),
  [courtClustered]
);
const queuePositions = useMemo(
  () => queueClustered.map(({ crewId, position }) => ({ crewId, position })),
  [queueClustered]
);

return { courtPositions, queuePositions };
```

**효과**: `courtClustered`/`queueClustered` 상태가 변경되지 않으면 동일 참조 유지.

**리스크**: 낮음. 계산 로직 동일, 참조 안정성만 추가.

---

### Fix 3: `djQueueCrewIds` 메모이제이션 — MEDIUM

**Before:**

```ts
const djQueueCrewIds = djingQueue
  ? djingQueue.djs.filter((dj) => dj.orderNumber > 1).map((dj) => dj.crewId)
  : [];
```

**After:**

```ts
const djQueueCrewIds = useMemo(
  () =>
    djingQueue ? djingQueue.djs.filter((dj) => dj.orderNumber > 1).map((dj) => dj.crewId) : [],
  [djingQueue]
);
```

**효과**: `djingQueue` 데이터가 동일하면 동일 참조 유지 → `useAvatarCluster`의 `useEffect` 불필요 진입 방지.

**리스크**: 낮음.

---

### Fix 4: `registerAvatar`에 `useCallback` 적용 — MEDIUM

**Before:**

```ts
const registerAvatar = (el: HTMLElement | null, motionType: MotionType) => { ... };
```

**After:**

```ts
const registerAvatar = useCallback((el: HTMLElement | null, motionType: MotionType) => {
  if (!el) return;
  const existingEntry = avatarEntries.current.find((entry) => entry.el === el);
  if (existingEntry) {
    existingEntry.motionType = motionType;
  } else {
    avatarEntries.current.push({ el, motionType });
  }
}, []);
```

**효과**: 함수 참조가 컴포넌트 수명 동안 안정적으로 유지 → `Avatar`의 `memo()` 비교가 정상 작동 → 불필요한 Avatar 리렌더 및 useEffect 재실행 방지.

**리스크**: 낮음. 내부에서 `avatarEntries.current`(ref)만 접근하므로 의존성 배열 `[]`이 정확.

---

### Fix 5: `crewMap`/`positionedCrews` 메모이제이션 (Fix 1 적용 후 선택적)

Fix 1이 적용되면 무관한 이벤트의 낭비 리렌더가 제거되므로, 이 부분의 메모이제이션은 **선택적**이다. `crews` 변경 시(리액션/모션)의 재계산은 **정상 동작**이므로, `useMemo`를 걸어도 `crews` 의존성으로 인해 어차피 재실행된다. 다만 Fix 2~4 적용 후에도 다른 원인으로 리렌더가 발생하는 경우를 방어하고 싶다면 적용.

---

## 적용 우선순위

| 순서 | Fix                                    | 심각도   | 효과                       | 리스크 | 예상 공수 |
| ---- | -------------------------------------- | -------- | -------------------------- | ------ | --------- |
| 1    | Fix 1: `useShallow` 적용               | CRITICAL | 낭비 리렌더 전면 제거      | 낮음   | 1-2h      |
| 2    | Fix 4: `registerAvatar` useCallback    | MEDIUM   | Avatar 자식 리렌더 방지    | 낮음   | 15min     |
| 3    | Fix 2: cluster 반환값 useMemo          | HIGH     | 새 배열 생산 방지          | 낮음   | 15min     |
| 4    | Fix 3: djQueueCrewIds useMemo          | MEDIUM   | useEffect 불필요 진입 방지 | 낮음   | 15min     |
| 5    | Fix 5: crewMap/positionedCrews useMemo | LOW      | 방어적 메모이제이션        | 낮음   | 15min     |

**총 예상 공수**: 2-3시간 (테스트 포함)

---

## 참고: D3 시뮬레이션은 안전

`useAvatarCluster`의 `useEffect` 내부에 크루 ID 기반 문자열 비교 가드가 있어, 크루 목록 구성원이 변경되지 않으면 D3 시뮬레이션(O(n^2))이 스킵된다. 리액션/모션 이벤트에서는 크루 속성만 변경되고 ID 목록은 동일하므로, 무거운 연산은 보호되고 있다. 이 가드 로직은 변경하지 않는다.
