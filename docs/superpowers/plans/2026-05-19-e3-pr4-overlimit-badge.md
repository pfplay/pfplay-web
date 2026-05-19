# E/#3 PR-4 — 플레이리스트 over-limit 반응형 배지 (web, 마지막) 구현 계획

> **For agentic workers:** REQUIRED: superpowers:subagent-driven-development. Checkbox(`- [ ]`) steps.

**Goal:** 플레이리스트 트랙 UI 에서 트랙 길이가 **현재 방 `playbackTimeLimit`** 초과면 "이 방에선 재생 안 됨" 배지/디밍 표시. 방 limit 기준 **반응형**(react-query), **비차단**(추가/메뉴 동작 무변경). over-limit 곡이 조용히 안 나오던 잔여 UX 갭(E/#3) 해소. E/#3 시리즈 **마지막 PR**.

**Architecture:** 신규 데이터 플럼 발명 금지 — 기존 `useFetchPartyroomDetailSummary(partyroomId, enabled)`(→ `PartyroomDetailSummary.playbackTimeLimit: number`, **분 단위**) 재사용(이미 `widgets/partyroom-detail/main-panel` 에서 `Number(params.id)` 로 사용; react-query 캐시 `[QueryKeys.PartyroomDetailSummary, id]` 로 dedupe·반응형). `PlaylistTrack.duration` 은 표시 **문자열**("[H:]M:SS") — 숫자 필드 없음 → 관용 파서로 초 변환(파싱 실패=배지 없음, fail-safe). 비교: `durationSec > limitMin*60`. `TracksInPlaylist`(리스트)가 limit 1회 계산→`Track` 에 파생 `isOverRoomLimit:boolean` prop 전달(트랙별 쿼리 N회 회피).

**Tech Stack:** Next.js/TS, react-query, vitest, i18n(`useI18n()` 타입 dict, ko/en json 직접·`yarn i18n` 금지). pfplay-web 2-tier `development`=stg.

**Spec:** `pfplay-platform/docs/superpowers/specs/2026-05-19-e3-track-skip-deactivate-cascade-design.md` §3-4. **Scope:** PR-4=web 배지 only. PR-1/2/3 코드 무변경. 트랙 추가 차단/검증 **안 함**(비차단).

---

## File Structure

- `src/features/playlist/list-tracks/lib/parse-duration.ts` — 신규 `parseDurationToSeconds(duration:string): number | null` (관용 split, 실패 null).
- `src/features/playlist/list-tracks/ui/tracks.component.tsx` — 현재 방 partyroomId(route)·`useFetchPartyroomDetailSummary` 로 limitMin 취득, `Track` 에 `isOverRoomLimit` 전달.
- `src/features/playlist/list-tracks/ui/track.component.tsx` — `isOverRoomLimit` prop, true 시 배지/디밍 렌더(비차단·기존 메뉴/DnD 무변경).
- `src/shared/lib/localization/dictionaries/{en,ko}.json` — `dj.para.not_playable_in_room` (en 먼저=Dictionary 타입, ko 미러, parity).
- 테스트: `parse-duration.test.ts`(신규), `track.component.test.tsx`/`tracks.component.test.tsx`(있으면 확장, 없으면 신설; 기존 컴포넌트 테스트 컨벤션).

---

## Chunk 1: over-limit 반응형 배지

### Task 1: duration 파서 + i18n 키

**Files:** Create `src/features/playlist/list-tracks/lib/parse-duration.ts` + `parse-duration.test.ts`; Modify `dictionaries/en.json` 먼저 → `ko.json`.

기존 참고: `src/features/playlist/add-tracks/ui/search-list-item.component.tsx:43` `formatDuration(duration)` 가 `duration.split(':')` (times 배열) 패턴 사용 — 동일 split 관용 채택.

- [ ] **Step 1: 실패 테스트** `parse-duration.test.ts`:

  - `'3:45'` → 225, `'0:00'` → 0, `'1:02:03'` → 3723, `'12:34'` → 754.
  - 무효: `''`, `'abc'`, `'1:2:3:4'`, `undefined as any`, `'1:60'`(분/초 비정상은 허용 or null — **정책: 숫자 파싱 가능하면 산술 그대로**(`1:60`→120) `parseInt` 기반, 토큰 비숫자/빈 → `null`). null 케이스: `'abc'`,`''`,`'1:'`(빈 토큰 NaN)→`null`.
  - (테스트는 위 계약을 명시 assert.)

- [ ] **Step 2: 실패 확인** — `yarn vitest run src/features/playlist/list-tracks/lib/parse-duration.test.ts` → FAIL(모듈 없음).

- [ ] **Step 3: 구현** `parse-duration.ts`:
  ```ts
  /** "[H:]M:SS" 표시 문자열 → 총 초. 토큰이 비숫자/빈값이거나 형식 불명이면 null(배지 미표시 fail-safe). */
  export function parseDurationToSeconds(duration: string): number | null {
    if (typeof duration !== 'string') return null;
    const parts = duration.trim().split(':');
    if (parts.length < 2 || parts.length > 3) return null;
    const nums = parts.map((p) => (/^\d+$/.test(p.trim()) ? Number(p.trim()) : NaN));
    if (nums.some((n) => Number.isNaN(n))) return null;
    return nums.reduce((acc, n) => acc * 60 + n, 0);
  }
  ```
- [ ] **Step 4: 통과** — Step2 cmd → PASS. `yarn tsc --noEmit` 0.
- [ ] **Step 5: i18n** — `en.json` 먼저 → `ko.json` 동일 키. `dj.para` 섹션(기존 playback*stopped*\* 인근):
  - `dj.para.not_playable_in_room` en: `"Not playable here (exceeds this room's time limit)"` ko: `"이 방에선 재생 안 돼요 (재생 시간 제한 초과)"`
    (변수 없음. JSON 스타일/순서 sibling 일치. parity 확인.)
- [ ] **Step 6: 커밋** — `git add` parse-duration(.ts/.test.ts) en.json ko.json → `git commit -m "feat(E/#3): parseDurationToSeconds 유틸 + not_playable_in_room i18n(ko/en)"`

---

### Task 2: TracksInPlaylist 가 방 limit 계산 → Track 배지

**Files:** Modify `tracks.component.tsx`, `track.component.tsx`; Test: `track.component.test.tsx`/`tracks.component.test.tsx`(기존 있으면 확장, 없으면 신설 — 기존 RTL/vitest 컴포넌트 테스트 컨벤션 따름).

- [ ] **Step 1: 실패/회귀 테스트**

  - `Track`: prop `isOverRoomLimit=true` → `t.dj.para.not_playable_in_room` 텍스트(배지) 렌더 + 디밍 class 적용; `false`/미전달 → 배지 없음, 기존 렌더(name/duration/menu/DnD) 무변경. (mock `useI18n` 기존 컴포넌트 테스트 패턴.)
  - `TracksInPlaylist`: `useFetchPartyroomDetailSummary` mock 으로 `playbackTimeLimit=5`(분), 트랙들 duration 문자열 — `'6:00'`(>5분)→ 그 Track 에 `isOverRoomLimit=true`, `'3:00'`→false; summary 없음/limit 0/파싱 불가 → 전부 false(비차단·fail-safe); partyroomId 없을 때 query `enabled=false` → 배지 없음. (route param mock 은 `main-panel` 테스트나 기존 라우트 mock 패턴 따름.)

- [ ] **Step 2: 실패 확인** — `yarn vitest run src/features/playlist/list-tracks` → FAIL.

- [ ] **Step 3: 구현**

  - `tracks.component.tsx`: 현재 방 id 취득 — `main-panel.component.tsx` 와 동일 패턴(`useParams`→`Number(params.id)`; import 위치/방식 그 파일 참조). `const { data: summary } = useFetchPartyroomDetailSummary(partyroomId, !!partyroomId);` `const limitMin = summary?.playbackTimeLimit ?? 0;` 각 트랙 렌더 시 `const sec = parseDurationToSeconds(track.duration); const isOverRoomLimit = limitMin > 0 && sec !== null && sec > limitMin * 60;` → `<Track ... isOverRoomLimit={isOverRoomLimit} />`. (DnD/SortableContext/items/menuItems 로직 무변경 — prop 1개 추가만.)
  - `track.component.tsx`: `TrackProps` 에 `isOverRoomLimit?: boolean` 추가. true 시: duration Typography 인근(또는 트랙 행)에 작은 배지 — 기존 `Typography`(type='caption1') + `cn` 으로 경고색/디밍(예: 트랙 행 `opacity-50` + duration 옆 `t.dj.para.not_playable_in_room` 작은 텍스트). 신규 UI 컴포넌트 발명 금지 — 기존 Typography/색 토큰/cn 재사용. `useI18n()` 추가(컴포넌트 'use client'). 기존 thumbnail/menu/DnD/attributes **무변경**.

- [ ] **Step 4: 통과 + 전 회귀** — Step2 cmd PASS. `yarn vitest run` 전체 GREEN. `yarn tsc --noEmit` 0. `yarn eslint src/features/playlist/list-tracks src/shared/lib/localization --quiet` 0 error.
- [ ] **Step 5: 커밋** — `git add` tracks/track(.tsx/.test) → `git commit -m "feat(E/#3): 플레이리스트 트랙 over-limit 반응형 배지 (방 limit 기준·비차단)"`

---

### Task 3: 전 회귀 + scope 확인

- [ ] **Step 1:** `yarn vitest run` 전체 GREEN · `yarn tsc --noEmit` 0 · `yarn eslint src/features/playlist src/shared/lib/localization --quiet` 0 error.
- [ ] **Step 2:** `git diff origin/development..HEAD --stat` — 변경 = parse-duration(.ts/.test), tracks/track(.tsx/+test), en/ko json, plan 만. PR-1/2/3 코드·alert·dj-queue-changed·partyroom summary 쿼리 자체·트랙 추가/메뉴 로직 **무변경**. `git log --oneline origin/develop..HEAD`(=development).

---

## 완료 정의 (DoD)

- 방 안에서 트랙 duration > 방 playbackTimeLimit(분)→ "이 방에선 재생 안 돼요" 배지+디밍. 방/limit/파싱 불가 시 배지 없음(비차단·fail-safe). 추가/메뉴/DnD 동작 무변경. react-query 기반 반응형(limit 변경 시 갱신).
- 신규 파서 단위테스트 + 컴포넌트 테스트 GREEN, 전 vitest·tsc 0·scoped eslint 0. i18n ko/en parity(yarn i18n 미사용). 스코프=web 배지 only. **E/#3 시리즈 완결**(PR-1·IT#239·PR-2·PR-3 머지됨; 본 PR 머지 후 로드맵 LIVE·메모리 E/#3 종결 갱신).
