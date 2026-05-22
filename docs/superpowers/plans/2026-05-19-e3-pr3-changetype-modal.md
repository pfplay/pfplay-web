# E/#3 PR-3 — web changeType별 self-removed 알림 (pfplay-web) 구현 계획

> **For agentic workers:** REQUIRED: superpowers:subagent-driven-development. Checkbox(`- [ ]`) steps.

**Goal:** PR-2(platform #240, merged)로 dj-queue-changed 메시지에 실린 `changeType`(+DEACTIVATE `playbackTimeLimitMinutes`)를 소비해, self 가 큐에서 빠질 때 changeType별로 사용자에게 안내(canonical `alert.notify`): DEACTIVATE="재생 시간 제한(N분) 초과로 중단", DEQUEUE_ADMIN="관리자에 의해 대기열에서 제외", DEQUEUE_EXIT=silent. analytics `reason` 하드코딩('admin') 제거→실제 changeType 반영.

**Architecture:** canonical `useCurrentPartyroom().alert.notify(AlertMessage.Model)` 확장 — `AlertMessage.Model` union 에 DJ-removal variant 추가(penalty/grade 와 동일 UX·additive), 렌더 consumer(`useAlert` 콜백)에 분기 추가. 미지 changeType/필드부재 = 기존 동작 보존(backward-compat). `use-playback-deactivated-callback` **무변경**(state-reset 유지; 모달 단일출처=DjQueueChanged DEACTIVATE).

**Tech Stack:** Next.js, TS, zustand store(`useCurrentPartyroom`), react-query, vitest. i18n = `useI18n()` 타입 dict(`dictionaries/{ko,en}.json`, Dictionary=typeof en.json) + `processI18nString(t.x.y,{var})`. ⚠ ko/en json **직접 편집**(`yarn i18n` 무지성 금지 — xlsx↔json drift, memory feedback_pfplay_web_i18n_drift). pfplay-web 2-tier `development`=stg.

**Spec:** `pfplay-platform/docs/superpowers/specs/2026-05-19-e3-track-skip-deactivate-cascade-design.md` §3-3 + limit-only 개정. **Scope:** PR-3=web UX only. 배지=PR-4. PR-1/2 동작 무변경.

---

## File Structure

- `src/shared/api/websocket/types/partyroom.ts` — `DjChangeType` 문자열 union 신설; `DjQueueChangedEvent` 에 optional `changeType?`, `playbackTimeLimitMinutes?: number | null`.
- `src/entities/current-partyroom/model/alert-message.model.ts` — `DjRemovedAlertMessage` variant(들) + `Model` union + type guard.
- `src/shared/lib/analytics/room-tracking.ts` — `trackDjAdminDeregisterDetected` 가 changeType 기반 reason 도출.
- `src/entities/partyroom-client/lib/subscription-callbacks/use-dj-queue-changed-callback.hook.ts` — self-removed 분기 changeType별 `alert.notify`/track.
- `src/entities/current-partyroom/lib/alerts/use-dj-removed-alert.hook.tsx` — **신규**(렌더). 아키텍처 정정: 단일 `useAlert(cb)` switch 없음 — variant별 전용 훅(`use-penalty-alert.hook.tsx`, `use-grade-adjusted-alert.hook.tsx`)이 각자 `useAlert(useCallback(...))`+단일 `if(isXxx)` 가드로 구성되고 `use-alerts.hook.tsx`(`useAlerts()`)가 모두 호출·집계. 따라서 `use-grade-adjusted-alert.hook.tsx` 를 모델로 `useDjRemovedAlert()` 신설(가드 `isDjRemovedAlertMessage` → `useDialog().openAlertDialog`).
- `src/entities/current-partyroom/lib/alerts/use-alerts.hook.tsx` — `useDjRemovedAlert()` 를 기존 `usePenaltyAlert()`/`useGradeAdjustedAlert()` 옆에 등록.
- `src/shared/lib/localization/dictionaries/{ko,en}.json` — 신규 키(en 먼저=Dictionary 타입 갱신, ko 미러). 변수는 **`{{minutes}}`(이중 중괄호, VariableProcessor 컨벤션)**. 기존 `dj.para.deleted_queue_by_admin` 는 ko/en 양쪽 이미 존재(재사용, 보강 불요).
- 테스트: `use-dj-queue-changed-callback.hook.test.ts`(확장), `alert-message.model.test.ts`(**기존 존재 → describe 블록 확장**, named-import 스타일 일치), `room-tracking.test.ts`(기존 존재 → 확장), `use-dj-removed-alert.hook.test.tsx`(신규, `use-penalty-alert`/grade 테스트의 renderHook+mock 패턴 복제).

---

## Chunk 1: changeType별 self-removed 알림

### Task 1: TS 타입 — DjChangeType + 이벤트/알림 모델 (additive)

**Files:** Modify `src/shared/api/websocket/types/partyroom.ts`, `src/entities/current-partyroom/model/alert-message.model.ts`; Test `alert-message.model.test.ts`(**기존 존재** — `isPenaltyAlertMessage`/`isGradeAdjustedAlertMessage` 커버 중. `describe('isDjRemovedAlertMessage')` 블록 **추가**, 기존 파일의 named-import 스타일 일치).

- [ ] **Step 1: 실패 테스트** (alert-message.model guard) — 신규 variant guard:

```ts
import * as AlertMessage from './alert-message.model';
test('dj-deactivated guard', () => {
  const m: AlertMessage.Model = { type: 'dj-deactivated', playbackTimeLimitMinutes: 5 };
  expect(AlertMessage.isDjRemovedAlertMessage(m)).toBe(true);
  expect(AlertMessage.isPenaltyAlertMessage(m)).toBe(false);
});
test('dj-admin-removed guard', () => {
  const m: AlertMessage.Model = { type: 'dj-admin-removed' };
  expect(AlertMessage.isDjRemovedAlertMessage(m)).toBe(true);
});
test('기존 grade/penalty guard 회귀', () => {
  expect(
    AlertMessage.isDjRemovedAlertMessage({ type: 'grade-adjusted', prev: 0 as any, next: 0 as any })
  ).toBe(false);
});
```

(GradeType import 등은 기존 model 테스트/파일 방식 따름.)

- [ ] **Step 2: 실패 확인** — `yarn vitest run src/entities/current-partyroom/model/alert-message.model.test.ts` → FAIL(guard/variant 부재).

- [ ] **Step 3: 구현**
      `partyroom.ts`: add

  ```ts
  export type DjChangeType =
    | 'ENQUEUE'
    | 'DEQUEUE'
    | 'DEQUEUE_ADMIN'
    | 'DEQUEUE_EXIT'
    | 'ROTATE'
    | 'DEACTIVATE';
  ```

  `DjQueueChangedEvent` 에 optional 필드 추가(기존 djs 등 유지):

  ```ts
  export type DjQueueChangedEvent = WebSocketEventBase & {
    eventType: PartyroomEventType.DJ_QUEUE_CHANGED;
    djs: Array<{ crewId: number; orderNumber: number; nickname: string; avatarIconUri: string }>;
    changeType?: DjChangeType; // PR-2 additive; 구 메시지엔 없음
    playbackTimeLimitMinutes?: number | null; // DEACTIVATE 한정(limit-only), 그 외 null/없음
  };
  ```

  `alert-message.model.ts`: union 확장 + guard:

  ```ts
  export type Model = PenaltyAlertMessage | GradeAdjustedAlertMessage | DjRemovedAlertMessage;

  type DjRemovedAlertMessage =
    | { type: 'dj-deactivated'; playbackTimeLimitMinutes: number | null }
    | { type: 'dj-admin-removed' };

  export const isDjRemovedAlertMessage = (m: Model): m is DjRemovedAlertMessage =>
    m.type === 'dj-deactivated' || m.type === 'dj-admin-removed';
  ```

  (기존 isPenaltyAlertMessage/isGradeAdjustedAlertMessage 무변경 — 새 type 들은 PenaltyType 값이 아니므로 자동 배제됨; 확인.)

- [ ] **Step 4: 통과** — Step2 cmd → PASS. `yarn tsc --noEmit` 0.
- [ ] **Step 5: 커밋** — `git add` 위 3파일 → `git commit -m "feat(E/#3): DjChangeType + DjQueueChangedEvent optional changeType/limit + AlertMessage dj-removal variant (additive)"`

---

### Task 2: room-tracking reason 를 changeType 기반으로

현재 `trackDjAdminDeregisterDetected(partyroomId)` 가 `reason:'admin'` 하드코딩. changeType 별 reason('admin'|'deactivated'|...) 매핑.

**Files:** Modify `src/shared/lib/analytics/room-tracking.ts`; Test `room-tracking.test.ts`(있으면 확장, 없으면 신설; `track` mock — 기존 analytics 테스트 패턴).

- [ ] **Step 1: 실패 테스트** — **함수명 변경 금지**(`trackDjAdminDeregisterDetected` 유지; rename 시 기존 3 테스트 + hook 테스트 mock(`vi.mock(... trackDjAdminDeregisterDetected)`) 깨짐). 기존 함수에 **optional `changeType?: DjChangeType` 인자만 추가**(무인자 호출 backward-compat). 테스트(기존 `room-tracking.test.ts` 의 `describe('DJ deregister attribution')` 확장): DEQUEUE_ADMIN→`reason:'admin'`, DEACTIVATE→`reason:'deactivated'`, 인자 없음(undefined)→`reason:'admin'`(**기존 3 테스트 그대로 green**), suppression 윈도우 동작 보존(self dequeue skip 우선). DEQUEUE_EXIT 는 이 함수 호출 자체를 안 함(호출지=Task3 에서 분기).

- [ ] **Step 2: 실패 확인** — `yarn vitest run <room-tracking.test>` → FAIL.

- [ ] **Step 3: 구현** — `trackDjAdminDeregisterDetected(partyroomId: number, changeType?: DjChangeType)` 로 확장(기존 호출 무인자 호환): suppression 소비 우선, 그다음 `track('DJ Deregistered', { partyroom_id, reason: mapReason(changeType) })` where `mapReason: DEACTIVATE→'deactivated', DEQUEUE_ADMIN|undefined→'admin'`. 함수명/주석은 'admin' 한정이 아니게 다듬되 export 시그니처 backward-compat(기존 호출지 무인자 그대로 컴파일). `suppressNextSelfDjDeregister`/`consumeSelfDjDeregisterSuppression` 무변경.

- [ ] **Step 4: 통과** — PASS, `tsc` 0.
- [ ] **Step 5: 커밋** — `feat(E/#3): DJ Deregistered reason 를 changeType 기반 매핑 (admin/deactivated, 무인자 호환)`

---

### Task 3: dj-queue-changed 콜백 — changeType별 알림 분기

**Files:** Modify `src/entities/partyroom-client/lib/subscription-callbacks/use-dj-queue-changed-callback.hook.ts`; Test 동 `.hook.test.ts`(확장).

현재 self-removed 검출(`wasInQueue && !stillInQueue`)은 무조건 `trackDjAdminDeregisterDetected(event.partyroomId)`. 변경: `event.changeType` 분기.

- [ ] **Step 1: 실패/회귀 테스트** (기존 test 파일 mock 패턴 재사용; `alert.notify` 검증 위해 store mock 에 `alert:{notify:vi.fn()}` 추가):

  - changeType=DEACTIVATE & self removed → `alert.notify({type:'dj-deactivated', playbackTimeLimitMinutes: <event 값>})` 호출 + `trackDjAdminDeregisterDetected(pid,'DEACTIVATE')`.
  - changeType=DEQUEUE_ADMIN & self removed → `alert.notify({type:'dj-admin-removed'})` + track(pid,'DEQUEUE_ADMIN').
  - changeType=DEQUEUE_EXIT & self removed → **silent**: alert.notify 미호출, track 미호출.
  - changeType undefined(구 메시지) & self removed → **기존 동작 보존**: track 호출(reason 'admin'), alert.notify 미호출(구 메시지엔 안내 신호 없음 — 무동작 안전).
  - self 여전히 큐/처음부터 없음/prev 없음/me 미설정 → 기존대로 아무것도 안 함(회귀 — 기존 5 테스트 보존).
  - playbackTimeLimitMinutes 가 0 또는 null/undefined(unlimited) → alert.notify 는 호출하되 playbackTimeLimitMinutes 그대로 전달(렌더에서 graceful — Task4).

- [ ] **Step 2: 실패 확인** — `yarn vitest run src/entities/partyroom-client/lib/subscription-callbacks/use-dj-queue-changed-callback.hook.test.ts` → FAIL.

- [ ] **Step 3: 구현** — hook 에서 `alert` 도 store 에서 취득(`useCurrentPartyroom((s)=>s.alert)`; penalty 콜백과 동일 접근). self-removed 블록을 changeType 분기로:

  ```ts
  if (wasInQueue && !stillInQueue) {
    const ct = event.changeType;
    if (ct === 'DEQUEUE_EXIT') {
      // 본인 이탈 → silent (자연스러움)
    } else if (ct === 'DEACTIVATE') {
      alert.notify({
        type: 'dj-deactivated',
        playbackTimeLimitMinutes: event.playbackTimeLimitMinutes ?? null,
      });
      trackDjAdminDeregisterDetected(event.partyroomId, ct);
    } else if (ct === 'DEQUEUE_ADMIN') {
      alert.notify({ type: 'dj-admin-removed' });
      trackDjAdminDeregisterDetected(event.partyroomId, ct);
    } else {
      // 구 메시지(changeType 없음) 등 → 기존 동작 보존(분류만, 안내 없음)
      trackDjAdminDeregisterDetected(event.partyroomId, ct);
    }
  }
  ```

  (DEQUEUE/ENQUEUE/ROTATE 는 self-removed 가 거의 안 나거나 자진/무관 — else 분기로 흡수, 안내 없음. suppression 윈도우는 trackDj... 내부에서 self dequeue 흡수.) 나머지 콜백 로직(currentDj 갱신·캐시 setQueryData) **무변경**.

- [ ] **Step 4: 통과** — PASS(신규+기존 5 회귀), `tsc` 0.
- [ ] **Step 5: 커밋** — `feat(E/#3): dj-queue-changed self-removed 를 changeType별 alert.notify/track 분기`

---

### Task 4: 알림 렌더 신규 훅 + 등록 + i18n (ko/en)

**아키텍처(정정)**: 단일 switch consumer 없음. variant별 전용 훅 — `src/entities/current-partyroom/lib/alerts/use-penalty-alert.hook.tsx`(가드 `isPenaltyAlertMessage` → `useDialog().openDialog`), `use-grade-adjusted-alert.hook.tsx`(`isGradeAdjustedAlertMessage` → `useDialog().openAlertDialog`). `use-alerts.hook.tsx`(`useAlerts()`)가 각 훅을 호출·집계. → **신규 `useDjRemovedAlert()` 훅**을 `use-grade-adjusted-alert.hook.tsx` 패턴으로 만들고 `use-alerts.hook.tsx` 에 등록.

**Files:** Create `src/entities/current-partyroom/lib/alerts/use-dj-removed-alert.hook.tsx` + `use-dj-removed-alert.hook.test.tsx`; Modify `src/entities/current-partyroom/lib/alerts/use-alerts.hook.tsx`, `src/shared/lib/localization/dictionaries/en.json`(먼저=Dictionary 타입), `src/shared/lib/localization/dictionaries/ko.json`(미러).

- [ ] **Step 1: i18n 키 추가** (en.json 먼저 → ko.json 동일 키). 기존 `dj.para` 섹션(ko L207/en L220 존재)에 추가. **변수는 이중 중괄호 `{{minutes}}`**(VariableProcessor 컨벤션 — `dj.title.time_limit` 등이 `{{minutes}}` 사용; 단일 `{}`면 치환 실패):
  - `dj.para.playback_stopped_time_limit` ko: `"재생 시간 제한({{minutes}}분)을 초과하는 곡으로 재생이 중단되었습니다"` / en: `"Playback stopped: a track exceeds this room's time limit ({{minutes}} min)."`
  - `dj.para.playback_stopped_no_limit` (graceful: minutes 0/null/undefined) ko: `"재생 가능한 곡이 없어 재생이 중단되었습니다"` / en: `"Playback stopped: no playable track."`
  - admin: 기존 `dj.para.deleted_queue_by_admin` ko/en **양쪽 이미 존재**(en L229 "You have been removed from the queue by the administrator") → **재사용**(신규 키 X·보강 불요).
- [ ] **Step 2: 실패 테스트** `use-dj-removed-alert.hook.test.tsx` — `use-penalty-alert`/`use-grade-adjusted-alert` 테스트의 renderHook + store/`useDialog` mock 패턴 복제. `alert.notify({type:'dj-deactivated', playbackTimeLimitMinutes:5})` → `openAlertDialog` 가 `processI18nString(t.dj.para.playback_stopped_time_limit,{minutes:'5'})` 내용으로 호출; `playbackTimeLimitMinutes:0|null` → `playback_stopped_no_limit`; `{type:'dj-admin-removed'}` → `deleted_queue_by_admin`; 비-DJ variant(penalty/grade)는 무시(가드).
- [ ] **Step 3: 실패 확인** — `yarn vitest run src/entities/current-partyroom/lib/alerts/use-dj-removed-alert.hook.test.tsx` → FAIL.
- [ ] **Step 4: 구현** — `use-dj-removed-alert.hook.tsx`: `use-grade-adjusted-alert.hook.tsx` 구조 그대로(`useAlert(useCallback(cb,[deps]))`, `useDialog().openAlertDialog`, `useI18n()`). 콜백: `if(!AlertMessage.isDjRemovedAlertMessage(message)) return;` 그다음 `message.type==='dj-deactivated'` 면 `const m = message.playbackTimeLimitMinutes; const content = (typeof m==='number' && m>0) ? processI18nString(t.dj.para.playback_stopped_time_limit, { minutes: String(m) }) : t.dj.para.playback_stopped_no_limit;` (★`processI18nString` 의 vars 는 `Record<string,string>` → 반드시 `String(m)`), `'dj-admin-removed'` 면 `t.dj.para.deleted_queue_by_admin`; `openAlertDialog` 로 표시(grade 훅과 동일 호출 형태). `use-alerts.hook.tsx` 에 `useDjRemovedAlert()` 추가(usePenaltyAlert/useGradeAdjustedAlert 옆, 동일 호출 컨벤션).
- [ ] **Step 5: 통과 + 전 회귀** — Step3 cmd PASS. `yarn vitest run` 전체 GREEN, `yarn tsc --noEmit` 0, `yarn eslint src/entities/current-partyroom src/entities/partyroom-client src/shared/api/websocket src/shared/lib/analytics --quiet` 0 error. `git diff origin/development..HEAD --stat` scope(Task1~4 파일+테스트+ko/en json+plan 만; `use-playback-deactivated-callback`·PR-1/2 코드·배지 무변경).
- [ ] **Step 6: 커밋** — `feat(E/#3): useDjRemovedAlert 신규 훅 + use-alerts 등록 + i18n(ko/en) — deactivate(limit-only·graceful)/admin`

---

## 완료 정의 (DoD)

- DEACTIVATE→"재생시간제한(N분) 초과 중단"(0/null→generic), DEQUEUE_ADMIN→"관리자 제외"(기존 키 재사용), DEQUEUE_EXIT→silent, 구 메시지(changeType 無)→기존 동작 보존(안내 無·track 'admin'). analytics reason changeType 매핑.
- additive·backward-compat(미지 changeType/필드부재 무동작). use-playback-deactivated-callback 무변경(모달 단일출처). PR-1/2·배지(PR-4) 무관.
- 전 vitest GREEN·tsc 0·scoped eslint 0. i18n ko/en 키 동기(yarn i18n 미사용). 스코프 경계 보존.
