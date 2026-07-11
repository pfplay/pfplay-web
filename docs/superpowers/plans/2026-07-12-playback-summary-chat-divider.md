# 플레이백 종료 요약 채팅 구획 구현 플랜

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 곡이 끝날 때 채팅창에 footer형 구획(곡명·DJ·반응 3종, 스킵 표기)을 로컬 삽입한다 — 백엔드 무변경, pfplay-web 단독.

**Architecture:** hold-and-clear 스냅샷 추적기(순수 모듈)를 스토어 인스턴스 필드로 두고, WS 구독 콜백 4곳 + setup 하이드레이션 + 재연결 onConnect에서 배선한다. 채팅 discriminated union에 variant를 추가하고 두 채팅 패널이 렌더한다.

**Tech Stack:** Next.js 14 / Zustand / STOMP WS / vitest / Playwright

**승인 스펙:** `docs/superpowers/specs/2026-07-12-playback-summary-chat-divider-design.md` — **규칙표와 세칙 L1~L7이 본 플랜의 정답지**다. 플랜과 스펙이 어긋나 보이면 스펙이 우선.

**실행 전제:**

- 브랜치: `feat/playback-summary-divider` 를 origin/development에서 분기, 스펙/플랜 docs 커밋 2개를 cherry-pick 후 시작.
- 이슈: 착수 시 pfplay-web에 한글 이슈 먼저 등록(제목 예: "플레이백 종료 요약 채팅 구획 — 곡 단위 챕터 + 반응 통계 (로드맵 #4)"), 이하 커밋·PR에 `(#이슈번호)` 표기. 아래 커밋 메시지의 `(#N)`을 실번호로 치환.
- 유닛 실행: `yarn test` (vitest run). 특정 파일: `yarn test src/path/foo.test.ts`. 타입체크: **`yarn test:type`**(= tsc --noEmit, `yarn typecheck` 없음). ⚠️ tsconfig가 `**/*.test.ts`를 exclude하므로 tsc는 테스트 파일을 안 본다 — red 확인은 vitest로.
- L6 의도적 편차(승인됨): 스펙은 시드 시점 i18n 폴백, 플랜은 `djNickname: string | null` + **렌더 시점 폴백** — 로케일 전환에 우월해 채택. PR 본문에 명기.
- 로컬 e2e: 백엔드 docker 풀스택 + `npx next dev`(yarn dev 금지) + `E2E_BASE_URL="http://localhost:3000" E2E_API_BASE="http://localhost:8080/api/" npx playwright test ...`.

---

## Chunk 1: 순수 코어 (파서 승격 + 추적기)

### Task 1: `parseDurationToSeconds` shared 승격 (세칙 L7)

**Files:**

- Create: `src/shared/lib/functions/parse-duration.ts` (이동)
- Create: `src/shared/lib/functions/parse-duration.test.ts` (이동)
- Delete: `src/features/playlist/list-tracks/lib/parse-duration.ts`, 같은 위치 `.test.ts`
- Modify: 기존 소비자 import 경로 — `grep -rn "from.*parse-duration" src --include="*.ts*"` 로 전수 확인 후 `@/shared/lib/functions/parse-duration` 으로 치환 (list-tracks feature 내부 소비자 + 배럴 export가 있으면 그것도)

- [ ] **Step 1**: 파일 2개를 `git mv` 로 이동(내용 무변경 — 기존 구현이 이미 `[H:]M:SS`+fail-safe), import 경로 전수 치환
- [ ] **Step 2**: `yarn test src/shared/lib/functions/parse-duration.test.ts` PASS + `yarn tsc --noEmit`(스크립트 있으면 `yarn typecheck`) 통과 확인
- [ ] **Step 3**: 커밋 `refactor(shared): parse-duration을 shared로 승격 — 구획 스킵판정 재사용 (#N)`

### Task 2: PlaybackSummaryTracker 순수 모듈 (스펙 §4 규칙표 + L1~L7)

**Files:**

- Create: `src/entities/current-partyroom/model/playback-summary-tracker.ts`
- Test: `src/entities/current-partyroom/model/playback-summary-tracker.test.ts`

- [ ] **Step 1: 실패하는 테스트 작성** — 스펙 §6 유닛 케이스 전부. 핵심 케이스(전체 코드는 구현자가 확장):

```ts
import { describe, expect, it } from 'vitest';
import { SKIP_TOLERANCE_MS, createPlaybackSummaryTracker } from './playback-summary-tracker';

const start = (o = {}) => ({
  eventId: 'e1',
  trackName: 'Butter',
  trackIdentity: 'link-1',
  djNickname: '크릴린',
  durationText: '3:00',
  now: 1_000_000,
  ...o,
});

describe('PlaybackSummaryTracker', () => {
  it('시드① — expectedEnd = now + duration(로컬)', () => {
    /* seedFromStart 후 flushBoundary(now+180_000)로 skipped=false 확인 */
  });
  it('방출 — 다음 시작이 이전 스냅샷을 요약으로 반환', () => {
    const t = createPlaybackSummaryTracker();
    t.seedFromStart(start());
    t.updateCounts({ like: 3, dislike: 0, grab: 1 });
    const s = t.seedFromStart(
      start({ eventId: 'e2', trackIdentity: 'link-2', now: 1_000_000 + 180_000 })
    );
    expect(s).toMatchObject({
      trackName: 'Butter',
      counts: { like: 3, dislike: 0, grab: 1 },
      skipped: false,
    });
  });
  it('스킵 판정 — expectedEnd − 5s보다 이르면 skipped=true, 경계값은 false', () => {
    /* ±1ms 경계 */
  });
  it('L5 — 동일 eventId 재전달은 완전 무시(방출·재시드 없음)', () => {
    /* 반환 null + 이후 flush가 원래 스냅샷 방출 */
  });
  it('flushBoundary — 방출 후 clear되어 2번째 호출은 null (이중 DEACTIVATE)', () => {});
  it('빈 상태 flushBoundary는 null', () => {});
  it('L1/L2 — clear 후 flush는 null', () => {});
  it('시드② — endTime 기반 시드, 이후 boundary에서 정상 방출', () => {});
  it('시드② 불일치 — 보유 스냅샷 폐기(방출 없음) 후 재시드', () => {});
  it('시드② L3 동일 identity — counts만 덮고 expectedEndAtLocal은 기존 로컬 추정 유지', () => {});
  it('시드② L4 — endTime이 now보다 과거면 무시(보유 스냅샷 유지)', () => {});
  it('시드② playback 없음 — clear', () => {});
  it('L7 — durationText 파싱 실패 시 expectedEnd=null → skipped=false fail-safe', () => {
    /* 'abc' */
  });
  it('h:mm:ss — "1:02:03"은 3723초로 계산되어 조기 경계가 skipped=true', () => {});
});
```

- [ ] **Step 2**: `yarn test src/entities/current-partyroom/model/playback-summary-tracker.test.ts` → 컴파일 실패(red) 확인
- [ ] **Step 3: 구현**

```ts
import { parseDurationToSeconds } from '@/shared/lib/functions/parse-duration';

export const SKIP_TOLERANCE_MS = 5_000;

export type SummaryCounts = { like: number; dislike: number; grab: number };

export type PlaybackSummary = {
  trackName: string;
  djNickname: string | null;
  counts: SummaryCounts;
  skipped: boolean;
};

type Snapshot = {
  trackName: string;
  djNickname: string | null;
  counts: SummaryCounts;
  /** null = duration 파싱 실패 → 스킵 판정 불가(fail-safe로 완주 취급, 세칙 L7) */
  expectedEndAtLocal: number | null;
  trackIdentity: string;
};

const ZERO: SummaryCounts = { like: 0, dislike: 0, grab: 0 };

/**
 * 곡 종료 요약 구획용 hold-and-clear 스냅샷 추적기 (스펙 §4).
 * - 스토어 리셋 타이밍과 무관하게 counts를 자체 보유한다.
 * - 방출은 스냅샷을 소비(clear)하므로 이중 DEACTIVATE에도 구획은 1회다.
 * - 순수 모듈: 시각은 전부 인자로 받는다(테스트 결정성).
 */
export function createPlaybackSummaryTracker() {
  let snapshot: Snapshot | null = null;
  let lastStartEventId: string | null = null;

  const toSummary = (s: Snapshot, now: number): PlaybackSummary => ({
    trackName: s.trackName,
    djNickname: s.djNickname,
    counts: s.counts,
    skipped: s.expectedEndAtLocal !== null && now < s.expectedEndAtLocal - SKIP_TOLERANCE_MS,
  });

  return {
    /** 시드① — PLAYBACK_STARTED. 이전 스냅샷이 있으면 요약을 반환(방출)하고 새 스냅샷으로 교체. L5: 동일 eventId 재전달은 완전 무시(null). */
    seedFromStart(input: {
      eventId: string;
      trackName: string;
      trackIdentity: string;
      djNickname: string | null;
      durationText: string;
      now: number;
    }): PlaybackSummary | null {
      if (input.eventId === lastStartEventId) return null;
      lastStartEventId = input.eventId;

      const emitted = snapshot ? toSummary(snapshot, input.now) : null;
      const seconds = parseDurationToSeconds(input.durationText);
      snapshot = {
        trackName: input.trackName,
        djNickname: input.djNickname,
        counts: ZERO,
        expectedEndAtLocal: seconds === null ? null : input.now + seconds * 1_000,
        trackIdentity: input.trackIdentity,
      };
      return emitted;
    },

    /** 시드② — setup 하이드레이션. L3(동일 identity=counts만 덮음)·L4(stale 무시)·불일치 폐기·playback 없음=clear. 방출하지 않는다. */
    seedFromSetup(input: {
      playback: { name: string; linkId: string; endTime: number } | undefined;
      counts: SummaryCounts | undefined;
      djNickname: string | null;
      now: number;
    }): void {
      if (!input.playback) {
        snapshot = null;
        return;
      }
      if (input.playback.endTime <= input.now) return; // L4: stale setup 무시

      if (snapshot && snapshot.trackIdentity === input.playback.linkId) {
        // L3: 서버가 권위 — counts만 보정, 로컬 expectedEnd 추정은 유지(skew 노출 endTime으로 덮지 않음)
        if (input.counts) snapshot = { ...snapshot, counts: input.counts };
        return;
      }
      // 불일치(또는 빈 상태): 놓친 경계는 기념하지 않음 — 방출 없이 교체
      snapshot = {
        trackName: input.playback.name,
        djNickname: input.djNickname,
        counts: input.counts ?? ZERO,
        expectedEndAtLocal: input.playback.endTime, // 시드②만 서버 epoch(5s 여유로 skew 흡수)
        trackIdentity: input.playback.linkId,
      };
    },

    updateCounts(counts: SummaryCounts): void {
      if (snapshot) snapshot = { ...snapshot, counts };
    },

    /** DEACTIVATE 계열 경계 — 있으면 방출 후 clear. */
    flushBoundary(now: number): PlaybackSummary | null {
      if (!snapshot) return null;
      const emitted = toSummary(snapshot, now);
      snapshot = null;
      return emitted;
    },

    /** L1(방 enter)·L2(재연결) — 놓친 경계는 기념하지 않음. */
    clear(): void {
      snapshot = null;
    },
  };
}

export type PlaybackSummaryTracker = ReturnType<typeof createPlaybackSummaryTracker>;
```

- [ ] **Step 4**: 유닛 전부 PASS 확인
- [ ] **Step 5**: 커밋 `feat(partyroom): 플레이백 요약 추적기 — hold-and-clear·스킵 휴리스틱 (#N)`

## Chunk 2: 모델·렌더

### Task 3: 채팅 모델 variant + 스토어 tracker 필드 + resetReaction drive-by fix

**Files:**

- Modify: `src/entities/current-partyroom/model/chat-message.model.ts` — `PlaybackSummaryChat` 추가
- Modify: `src/entities/current-partyroom/model/current-partyroom.model.ts` — 스토어 Model 타입에 `playbackSummaryTracker: PlaybackSummaryTracker` 추가
- Modify: `src/entities/current-partyroom/model/current-partyroom.store.ts` — ①`playbackSummaryTracker: createPlaybackSummaryTracker()` 필드(chat 인스턴스 필드 선례, init/reset에도 레퍼런스 유지됨 — 정리는 L1/L2 배선이 담당) ②**drive-by fix**: `resetReaction`이 crews motion을 리셋하는 복붙 버그(line 67-78) → reaction 필드를 초기값으로 되돌리도록 수정(스펙 §3 참고사항)

```ts
// chat-message.model.ts 추가
export type PlaybackSummaryChat = {
  from: 'playback-summary';
  trackName: string;
  djNickname: string | null;
  counts: { like: number; dislike: number; grab: number };
  skipped: boolean;
  receivedAt: number;
};
export type Model = SystemChat | UserChat | PlaybackSummaryChat;
```

```ts
// store — resetReaction 교정
resetReaction: () => {
  return set({
    reaction: {
      history: { isLiked: false, isDisliked: false, isGrabbed: false },
      aggregation: { likeCount: 0, dislikeCount: 0, grabCount: 0 },
      motion: [],
    },
  });
},
```

- [ ] **Step 1**: variant·필드 추가 → `yarn tsc --noEmit` — **두 채팅 패널에서 컴파일 에러가 나는 게 정상**(from 내로잉 후 `message.crew` 접근). 이 시점엔 패널에 임시 `if (message.from === 'playback-summary') return null;` 분기(Task 4에서 실렌더로 교체)로 통과시킴
- [ ] **Step 2**: resetReaction 수정 + 유닛 — `current-partyroom.store.test.ts`는 **이미 존재**(포괄적)하므로 기존 파일에 resetReaction describe 블록 추가: "reaction(history·aggregation·motion)을 초기화하고 crews는 건드리지 않는다". (확인됨: 기존 잠금 테스트 없음, use-playback-start-callback 테스트는 fix 후에도 통과)
- [ ] **Step 3**: `yarn test` 전량 PASS
- [ ] **Step 4**: 커밋 `feat(partyroom): 채팅 모델 playback-summary variant + 추적기 필드, resetReaction 복붙버그 수정 (#N)`

### Task 4: footer형 구획 컴포넌트 + i18n + 두 패널 렌더

**Files:**

- Create: `src/entities/current-partyroom/ui/playback-summary-divider.component.tsx` (entities에 ui 세그먼트 신설 — widgets/widgets-mobile 양쪽에서 import: FSD 계층상 합법, 중복 방지. `entities/current-partyroom/index.ts` 배럴에 export 추가)
- Modify: `src/widgets/partyroom-chat-panel/ui/partyroom-chat-panel.component.tsx:57-68` — system 분기 아래에 분기 추가
- Modify: `src/widgets-mobile/partyroom-chat-panel/partyroom-chat-panel.component.tsx:47-58` — 동일 분기(데스크탑 baseline 대조)
- Modify: `src/shared/lib/localization/dictionaries/ko.json`·`en.json` — `chat.para`에 키 추가 (**json 직접 수정** — UTF-8 인코딩 주의, xlsx 경유 금지)

컴포넌트(스펙 §2-6 footer 목업 — 요약 라인 먼저, 경계선이 아래):

```tsx
import { useI18n } from '@/shared/lib/localization/i18n.context';
import { Typography } from '@/shared/ui/components/typography';
import type * as ChatMessage from '../model/chat-message.model';

type Props = { message: Extract<ChatMessage.Model, { from: 'playback-summary' }> };

export default function PlaybackSummaryDivider({ message }: Props) {
  const t = useI18n();
  const dj = message.djNickname ?? t.chat.para.playback_summary_dj_fallback;

  return (
    <div className='px-4' data-testid='playback-summary-divider'>
      <Typography type='caption1' className='text-gray-300 text-center'>
        {'🎵 '}
        {message.trackName}
        {' — '}
        {dj}
        {' · 👍 '}
        {message.counts.like}
        {' · 👎 '}
        {message.counts.dislike}
        {' · 🎁 '}
        {message.counts.grab}
        {message.skipped && (
          <span data-testid='playback-summary-skipped'>
            {' ⏭ ' + t.chat.para.playback_summary_skipped}
          </span>
        )}
      </Typography>
      <hr className='mt-2 border-gray-600' />
    </div>
  );
}
```

(색·간격 토큰은 주변 채팅 패널의 기존 팔레트에 맞춰 조정 — 미리보기 게이트에서 확정.)

i18n 키 (ko/en):

```json
"playback_summary_skipped": "스킵" / "skipped"
"playback_summary_dj_fallback": "DJ" / "DJ"
```

패널 분기(두 파일 동일, key 규칙 = 스펙 §4 렌더):

```tsx
if (message.from === 'playback-summary') {
  return <PlaybackSummaryDivider key={'playback-summary' + message.receivedAt} message={message} />;
}
```

- [ ] **Step 1**: 컴포넌트·i18n·두 패널 분기(Task 3의 임시 null 분기 교체) 구현
- [ ] **Step 2**: `yarn tsc --noEmit` + `yarn test` 전량 PASS, `yarn lint` 통과
- [ ] **Step 3**: 커밋 `feat(partyroom): footer형 플레이백 요약 구획 렌더 — 데스크탑·모바일 (#N)`

## Chunk 3: 배선

### Task 5: 구독 콜백 4곳 + setup + 재연결 배선

**Files:**

- Modify: `src/entities/partyroom-client/lib/subscription-callbacks/use-playback-start-callback.hook.ts`
- Modify: `.../use-playback-deactivated-callback.hook.ts`
- Modify: `.../use-dj-queue-changed-callback.hook.ts`
- Modify: `.../use-reaction-aggregation-callback.hook.ts`
- Modify: `src/features/partyroom/enter/lib/use-enter-partyroom.ts`
- Test: `src/entities/partyroom-client/lib/subscription-callbacks/playback-summary-wiring.test.ts` (신규 — 스토어+추적기 실인스턴스로 콜백 함수를 직접 호출하는 통합성 유닛. 기존 콜백 테스트 파일이 있으면 그 패턴을 따름 — 먼저 `ls src/entities/partyroom-client/lib/subscription-callbacks/*.test.ts` 확인)

공통 헬퍼(중복 방지 — 같은 디렉토리에 `emit-playback-summary.ts`):

```ts
import type { PlaybackSummary } from '@/entities/current-partyroom/model/playback-summary-tracker';

/** 추적기 방출 결과를 채팅 스트림에 구획으로 append */
export function appendSummaryToChat(
  summary: PlaybackSummary | null,
  appendChatMessage: (m: ChatMessage.Model) => void
) {
  if (!summary) return;
  appendChatMessage({ from: 'playback-summary', ...summary, receivedAt: Date.now() });
}
```

각 콜백 수정(스펙 §4 배선 순서 제약 — 방출/시드가 기존 로직보다 **앞**):

```ts
// use-playback-start-callback.hook.ts — return 함수 선두에 삽입
const { playbackSummaryTracker, appendChatMessage, crews } = useCurrentPartyroom.getState();
const djNickname = crews.find((c) => c.crewId === event.crewId)?.nickname ?? null; // L6 폴백은 렌더에서
appendSummaryToChat(
  playbackSummaryTracker.seedFromStart({
    eventId: event.id,
    trackName: event.playback.name,
    trackIdentity: event.playback.linkId,
    djNickname,
    durationText: event.playback.duration,
    now: Date.now(),
  }),
  appendChatMessage
);
// ...이하 기존 로직 무변경
```

```ts
// use-playback-deactivated-callback.hook.ts — 기존 클리어 로직 앞
const { playbackSummaryTracker, appendChatMessage } = useCurrentPartyroom.getState();
appendSummaryToChat(playbackSummaryTracker.flushBoundary(Date.now()), appendChatMessage);
```

```ts
// use-dj-queue-changed-callback.hook.ts — 콜백 선두
if (event.changeType === 'DEACTIVATE') {
  const { playbackSummaryTracker, appendChatMessage } = useCurrentPartyroom.getState();
  appendSummaryToChat(playbackSummaryTracker.flushBoundary(Date.now()), appendChatMessage);
}
```

```ts
// use-reaction-aggregation-callback.hook.ts — 기존 updateReaction 뒤에
useCurrentPartyroom.getState().playbackSummaryTracker.updateCounts({
  like: event.aggregation.likeCount,
  dislike: event.aggregation.dislikeCount,
  grab: event.aggregation.grabCount,
});
```

```ts
// use-enter-partyroom.ts
// ① setup() 함수 첫 줄 (await 이전) — L1: 방 enter/재수화 시작 시 무조건 clear
useCurrentPartyroom.getState().playbackSummaryTracker.clear();
// ② setup()의 initPartyroom(...) 직후 — 시드② (L3/L4는 추적기 내부 규칙: setup await 중
//    새 곡 PLAYBACK_STARTED가 먼저 시드된 레이스에서 stale setup으로부터 신선한 스냅샷 보호)
const { playbackSummaryTracker, crews } = useCurrentPartyroom.getState();
const dj = setUpInfo.display.currentDj
  ? setUpInfo.crews.find((c) => c.crewId === setUpInfo.display.currentDj!.crewId)?.nickname ?? null
  : null;
playbackSummaryTracker.seedFromSetup({
  playback: setUpInfo.display.playback
    ? { name: ..., linkId: ..., endTime: setUpInfo.display.playback.endTime }
    : undefined,
  counts: setUpInfo.display.reaction
    ? { like: ...likeCount, dislike: ...dislikeCount, grab: ...grabCount }
    : undefined,
  djNickname: dj,
  now: Date.now(),
});
// ③ 비-once onConnect(line 104~)의 firstConnect skip 직후 — L2: 재연결마다 clear
//    (disconnect 콜백 미공개 → 재연결 시점 clear가 의미상 등가, 스펙 L2 구현 힌트)
useCurrentPartyroom.getState().playbackSummaryTracker.clear();
```

주의: `useCurrentPartyroom`은 훅 컨텍스트(`useStores()`)에서 가져오는 스토어 — 각 파일의 기존 획득 방식을 그대로 따르고 `getState()`로 이벤트 시점 스냅샷을 읽는다(stale closure 방지 — `use-playback-start-callback:39-41` 주석 선례).

- [ ] **Step 1: 실패하는 배선 테스트 작성** — 기존 콜백 테스트 8개의 패턴(renderHook + `vi.mock('@/shared/lib/store/stores.context')` + 실스토어)을 그대로 따르면 훅 레벨 검증 가능. 시나리오: 시작A→반응 갱신→시작B ⇒ chat에 A 구획 1개(counts 반영)·skipped 판정 / 시작→DEACTIVATED+DJ_QUEUE_CHANGED(DEACTIVATE) ⇒ 구획 1개 / setup 시드→시작 ⇒ setup 곡 구획. ⚠️ **함정: 기존 `createPlaybackEvent()` 픽스처엔 base `id`가 없다** — 그대로 복사하면 `undefined === undefined`로 L5 dedup이 두 번째 시작을 삼켜 미스터리 실패. 배선 테스트 이벤트마다 고유 `id`('uuid-1'/'uuid-2'…) 필수.
- [ ] **Step 2**: red 확인 → 배선 구현 → green
- [ ] **Step 3**: `yarn test` 전량 + `yarn tsc --noEmit` + `yarn lint`
- [ ] **Step 4**: 커밋 `feat(partyroom): 요약 구획 배선 — WS 콜백·setup 시드·재연결 clear (#N)`

## Chunk 4: 검증 게이트

### Task 6: 🔴 로컬 미리보기 게이트 (BLOCKING — 사용자 컨펌 필수)

- [ ] **Step 1**: 백엔드 로컬 풀스택 기동 확인(`curl :8080/api/v1/members/me` → 401) + `npx next dev`
- [ ] **Step 2**: 방 생성 → 짧은 곡 등록·재생 → ①자연 완료 ②스킵(DJ 다이얼로그 `dj-skip-button`+confirm) 두 케이스에서 구획 렌더 확인. 추가 확인 2건: ⓐ구획이 마지막 메시지일 때(대기열 소진) bottom-pin 스크롤이 따라오는지(lastItemRef가 ChatItem에만 부착된 기존 구조 — 기존 system 메시지와 동일 거동이면 수용, 어색하면 조정) ⓑresetReaction fix로 곡 전환 시 반응 버튼 하이라이트가 꺼지는지(원의도 복원 확인)
- [ ] **Step 3**: headed Playwright(또는 브라우저)로 **완료·스킵 × 데스크탑·모바일(뷰포트) 4장 스크린샷** 캡처
- [ ] **Step 4**: 사용자에게 스크린샷 공유 → **디자인 컨펌 대기. 컨펌 전 PR 금지**(스펙 확정 결정 7). 피드백 있으면 스타일 조정 후 재공유

### Task 7: e2e + 풀 회귀

**Files:**

- Modify or Create: `e2e/e2e-b.dj-state-machine.spec.ts` 에 시나리오 추가(기존 DJ 플로우 재사용) 또는 신규 `e2e/e2e-b2.playback-summary.spec.ts` — 기존 e2e-b의 헬퍼·픽스처 패턴 준수

- [ ] **Step 1**: e2e 작성 — 짧은 곡 등록→재생 시작 확인→`dj-skip-button`+confirm 수락→`[data-testid=playback-summary-divider]` 노출 + `[data-testid=playback-summary-skipped]` 존재 assert. 기존 e2e-b 헬퍼(`selectShortTracks`/`createPlaylistWithTracks`/`registerAsDj`) 재사용 — 스킵 플로우 자체는 e2e 최초 작성. (⚠️ e2e UI는 영어 렌더 — 텍스트 대신 testid 단언. RQ Devtools 오버레이가 하단 클릭을 가로채면 addStyleTag 숨김 선례. **#443 함정: `closeDjQueueDrawer` force-click 플래키 ~50% — 드로어 닫기 스텝을 피하는 동선으로 설계하거나 상태 읽고 조건부 클릭**)
- [ ] **Step 2**: 신규 spec 단독 로컬 실행 green (cold flake 시 warm 재실행 판별)
- [ ] **Step 3**: **풀 e2e 매트릭스**(무인자 전체: e2e-a/b/c/d+mobile) 로컬 실행 — 기존 스위트 무회귀 확인
- [ ] **Step 4**: `yarn test` + `yarn lint` + `yarn tsc --noEmit` 최종 전량
- [ ] **Step 5**: 커밋 `test(e2e): 플레이백 요약 구획 — 스킵 시나리오 잠금 (#N)`

### Task 8: PR

- [ ] **Step 1**: 커밋 논리단위 점검(필요시 squash — 파괴적 rebase 전 사용자 확인), push
- [ ] **Step 2**: 한글 PR 생성(base=development): 배경(로드맵 #4)·재정의(백엔드 무변경) 근거·스펙/플랜 링크·규칙 요약(L1~L7)·검증 증거(유닛/e2e/미리보기 스크린샷 첨부)·resetReaction drive-by fix 명시. `Closes #N`(단, 기본브랜치=main이라 자동종결 안 됨 — 머지 후 수동 종결)
- [ ] **Step 3**: CI(preview deploy and e2e) 그린 확인 후 사용자에게 머지 여부 보고

---

## 회귀 가드 요약 (리뷰어 체크리스트)

1. 기존 콜백들의 스토어 갱신 로직은 **무변경** — 추적기 호출이 앞에 삽입될 뿐.
2. `resetReaction` fix는 행동 변화가 있는 유일한 기존 코드 수정 — reaction이 이제 실제로 리셋됨(원래 의도 복원). ⚠️ 정확한 영향: aggregation은 PLAYBACK_STARTED 콜백이 별도로 0을 덮어 차이 없지만, **`reaction.history`(내 좋아요/싫어요/그랩 토글)와 `motion`은 fix 전엔 곡을 넘어 잔존하던 선재 라이브 버그** — fix 후 곡 시작마다 리셋되어 반응 버튼 하이라이트가 곡 전환 시 꺼진다(원의도). 미리보기 게이트 확인 항목에 포함하고 PR 본문에 명시.
3. 구획은 로컬 삽입 — 서버 전송 없음, 다른 클라이언트에 영향 없음.
4. FSD 계층: entities(ui 신설)←widgets/widgets-mobile ✓, shared←entities ✓. features(list-tracks)의 parse-duration 소비는 shared로 상향 ✓.
5. 추적기 인스턴스는 store 필드지만 init/reset에도 레퍼런스 유지(chat 선례) — 정리는 L1(setup 선두 clear)·L2(재연결 clear)가 담당.
