# 모바일 반응형 — Chunk 3 (채팅 + 크루 탭 wiring) 구현 Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 모바일 반응형 5-chunk PR 시리즈의 **Chunk 3 (채팅 + 크루 탭 wiring)** — chunk 2 의 룸 shell 위에 (1) 모바일 채팅 패널 (`widgets-mobile/partyroom-chat-panel`) 사본 + (2) 탭 컨테이너 (채팅/크루/큐) + (3) 하단 탭바 + (4) URL hash 탭 sync 를 얹는다. 크루 탭은 chunk 2 의 `MobilePartyroomCrewsPanel` 을 그대로 사용 (탭 콘텐츠로 wiring). 큐 탭은 chunk 4 wiring 까지 "곧 출시" placeholder. 채팅은 게스트 허용 (§2.2 갱신). 데스크탑 동작은 그대로.

**Architecture:**

- 모바일 트리 `widgets-mobile/partyroom-chat-panel/` 신규 — 데스크탑 `widgets/partyroom-chat-panel` 의 모더레이션·호버 메뉴 OUT 사본. 모바일 ChatItem + AuthorityHeadset sibling 양쪽 모두 사본 (C3 격리 — `widgets/partyroom-chat-panel/ui/parts/*` cross-import 금지, chunk 2 ActionButton 사본 패턴 동일).
- 모바일 트리 `widgets-mobile/partyroom-room-tabs/` 신규 — 탭 상태 관리 + hash sync hook + 하단 탭바 + 활성 탭 콘텐츠 렌더. 탭 콘텐츠는 mount 채로 두고 `hidden` 토글 (채팅 스크롤 위치·송신 input 상태 보존, 메시지 끊김 회피).
- 데스크탑 트리 변경 0. `widgets/partyroom-chat-panel/` 미수정.
- `widgets-mobile/partyroom-page-mobile/room.component.tsx` 수정 — 직접 노출하던 `MobilePartyroomCrewsPanel` 을 탭 컨테이너로 wrap. 전광판 (display-board) 은 탭 컨테이너 위 sticky 그대로.
- 채팅 입력은 채팅 탭 내부 하단 sticky (탭바 위, `safe-area-inset-bottom` 위). hash (`#chat` · `#crew` · `#queue`) 는 클라이언트 mount 후 읽고, 미일치/없으면 채팅 default.

**Tech Stack:** Next.js 14 App Router (Client tree only — `room.component.tsx` 부터 'use client'), TypeScript, Vitest + RTL, Tailwind v3.

**선행 문서:**

- 아키텍처 스펙: `docs/superpowers/specs/2026-05-28-mobile-responsive-architecture-design.md` (§1.7 사본 인벤토리·§2.2 게스트 차단 매트릭스·§3.3 Chunk 3·§4.2 탭 3개·§4.3 크루 탭)
- 스코프 스펙: `docs/superpowers/specs/2026-05-22-mobile-responsive-scope-design.md`
- 선행 PR: #354 (chunk 1 Foundation `dcf0c89`) + #355 (chunk 1.1 polish `12cf87f`) + #356 (chunk 2 로비+청취 `c0ba2fec`, hotfix `95b19e8` 동봉)
- chunk 2 plan: `docs/superpowers/plans/2026-05-28-mobile-responsive-chunk2-lobby-room-listening.md` (참조 — C3 격리 사본 패턴 동일)
- GH 이슈: pfplay-web#340

**관련 메모리:** [[feedback_pr_series_workflow]] · [[feedback_commit_consolidation_before_push]] · [[feedback_korean_issue_commit_pr]] · [[feedback_elegant_no_code_dirtying]] · [[wait-all-ci-incl-e2e-before-merge]] · [[reference_pfplay_web_local_dev_http_webpack]] · [[project_mobile_responsive_chunk2_merged]]

---

## Baseline (정찰 완료, 본 plan 의 code block 에 반영됨)

본 plan 의 모든 code block 은 아래 baseline 을 확인한 후 작성되었습니다 (Phase 0 의 정찰 결과). 정찰 명령은 Phase 0 Task 0.1 에 있습니다.

### chunk 2 prod 상태 (본 chunk 가 그 위에 얹는 베이스)

`src/widgets-mobile/partyroom-page-mobile/room.component.tsx` (현 코드, c0ba2fec):

```tsx
'use client';
import { FC } from 'react';
import { MobilePartyroomCrewsPanel } from '@/widgets-mobile/partyroom-crews-panel';
import { MobilePartyroomDisplayBoard } from '@/widgets-mobile/partyroom-display-board';

interface Props {
  partyroomId: number;
}

const MobileRoom: FC<Props> = ({ partyroomId }) => {
  return (
    <main className='min-h-screen bg-black flex flex-col'>
      <MobilePartyroomDisplayBoard partyroomId={partyroomId} />
      <div className='flex-1 overflow-y-auto'>
        <MobilePartyroomCrewsPanel />
        {/* chunk 3: 탭바 + 채팅 패널 wiring */}
        {/* chunk 4: DJ 큐 패널 wiring */}
      </div>
    </main>
  );
};

export default MobileRoom;
```

→ chunk 3 가 손볼 곳: `<MobilePartyroomCrewsPanel />` 직접 노출을 **`<MobilePartyroomRoomTabs />` 탭 컨테이너로 교체**. display-board sticky 는 그대로 sibling 으로 위에. 두 주석 줄도 제거.

### 데스크탑 `widgets/partyroom-chat-panel` 의 의존성 인벤토리

`src/widgets/partyroom-chat-panel/ui/partyroom-chat-panel.component.tsx` 의 imports:

| import 경로                                                                      | 모바일 사본에서 처리                                                                  |
| -------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------- |
| `@/entities/current-partyroom` → `useCurrentPartyroomChat`                       | ✅ 그대로 재사용                                                                      |
| `@/entities/current-partyroom/lib/alerts/use-alert.hook`                         | ✅ 그대로 재사용 (chat-ban 30초 타이머)                                               |
| `@/features/partyroom/adjust-grade`                                              | ❌ OUT (모더레이션, §스코프 OUT)                                                      |
| `@/features/partyroom/block-crew`                                                | ❌ OUT                                                                                |
| `@/features/partyroom/impose-penalty` (4개 hook)                                 | ❌ OUT                                                                                |
| `@/features/partyroom/list-chat-messages` → 스크롤 매니저 hook                   | ✅ 그대로 재사용                                                                      |
| `@/features/partyroom/list-my-blocked-crews` → `useIsBlockedCrew`                | ✅ 그대로 재사용 (데스크탑에서 차단한 크루는 모바일에서도 메시지 숨김)                |
| `@/features/partyroom/send-chat-message` → `SendChatMessage`                     | ✅ 그대로 재사용 (render prop)                                                        |
| `@/shared/api/http/types/@enums` → `PenaltyType`                                 | ✅ `CHAT_BAN_30_SECONDS` 만 ban timer 가 사용                                         |
| `@/shared/config/time` → `ONE_MINUTE`                                            | ✅ 그대로                                                                             |
| `@/shared/lib/hooks/use-vertical-stretch.hook`                                   | ❌ OUT (모바일은 부모 flex layout 으로 stretch — 데스크탑 컨테이너 stretch hook 불요) |
| `@/shared/lib/localization/i18n.context` → `useI18n`                             | ✅ 그대로                                                                             |
| `@/shared/lib/store/stores.context` → `useStores` (데스크탑 `me?.crewId` 비교용) | ❌ OUT (모바일은 호버 메뉴 OUT 이라 `isMe` 게이트 자체 불요)                          |
| `@/shared/ui/components/button`·`input`·`tooltip`·`typography`                   | ✅ button·input·typography 만 (`tooltip` 은 모바일 비호환 → `aria-label` 로 대체)     |
| `@/shared/ui/components/display-option-menu-on-hover-listener`                   | ❌ OUT (호버 컨셉 자체 없음)                                                          |
| `@/shared/ui/icons` → `PFSend`                                                   | ✅ 그대로                                                                             |
| 내부 sibling `./chat-item.component`                                             | ❌ widget cross-import 금지 → **모바일 ChatItem 사본 신규**                           |

### 데스크탑 `widgets/partyroom-chat-panel/ui/chat-item.component.tsx` 패턴

```tsx
import { forwardRef } from 'react';
import { ChatMessage, Crew } from '@/entities/current-partyroom';
import { GRADE_TYPE_LABEL } from '@/entities/partyroom-client';
import { GradeType } from '@/shared/api/http/types/@enums';
import { cn } from '@/shared/lib/functions/cn';
import Profile from '@/shared/ui/components/profile/profile.component';
import { Typography } from '@/shared/ui/components/typography';
import { galmuriFont } from '@/shared/ui/foundation/fonts';
import AuthorityHeadset from './authority-headset.component';

type ChatItemProps = { message: Extract<ChatMessage.Model, { from: 'user' }> };

const ChatItem = forwardRef<HTMLDivElement, ChatItemProps>(({ message }, ref) => {
  const crew = message.crew;
  const myGradeComparator = Crew.GradeComparator.of(crew.gradeType);
  const showGradeLabel = myGradeComparator.isHigherThanOrEqualTo(GradeType.CLUBBER);
  const emphasisGradeLabel = myGradeComparator.isHigherThanOrEqualTo(GradeType.MODERATOR);
  // … Profile + AuthorityHeadset + nickname + content 렌더 (자세한 markup 은 desktop 코드 참조)
});

export default ChatItem;
```

→ **모바일 사본은 forwardRef 패턴 + 자체 sibling `./authority-headset.component` import** (widget 내부 sibling 은 허용, widget 외부 cross-import 만 금지).

### `widgets/partyroom-chat-panel/ui/authority-headset.component.tsx` 패턴

```tsx
import { GradeType } from '@/shared/api/http/types/@enums';
import { PFHeadsetGray, PFHeadsetRed } from '@/shared/ui/icons';

export default function AuthorityHeadset({ grade }: { grade: GradeType }) {
  if (grade === GradeType.LISTENER) return null;
  if (grade === GradeType.CLUBBER)
    return <PFHeadsetGray width={42} height={25} className='absolute -top-[2px] -left-[5px]' />;
  return <PFHeadsetRed width={42} height={25} className='absolute -top-[2px] -left-[5px]' />;
}
```

→ 데스크탑·모바일 markup 완전 동일하면 widget 내부 1:1 복사로 충분.

### `useTempChatBanTimer` (데스크탑 chat panel 본문 하단)

```tsx
function useTempChatBanTimer() {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [banned, setBanned] = useState(false);

  useAlert(
    useCallback((alert) => {
      if (alert.type === PenaltyType.CHAT_BAN_30_SECONDS) {
        setBanned(true);
        timerRef.current = setTimeout(() => setBanned(false), 30 * ONE_MINUTE);
      }
    }, [])
  );

  return banned;
}
```

⚠️ 데스크탑 본문 주석에 `FIXME: 임시로 채팅 금지 타이머 설정. 나중에 쌈뽕하게 수정 필요` 가 있음. **본 chunk 는 그 FIXME 를 건드리지 않음** — 데스크탑 동작 보존이 우선이고 모바일 사본도 동일 패턴 그대로. 본격 리팩토링은 별도 후속.

### barrel · i18n · store 정찰 결과

- `@/entities/current-partyroom` barrel: `useCurrentPartyroomChat`·`ChatMessage`·`Crew`·… ✅ 모두 noop import
- `@/features/partyroom/list-chat-messages` barrel: `useChatMessagesScrollManager` ✅
- `@/features/partyroom/send-chat-message` barrel: `SendChatMessage` ✅
- `@/features/partyroom/list-my-blocked-crews` barrel: `useIsBlockedCrew` ✅
- i18n 키 존재 확인 (`src/shared/lib/localization/dictionaries/ko.json`):
  - `chat.para.start_chat` = "무슨 얘기를 해볼까요?"
  - `chat.para.chat_banned_hint` = "관리자 제재로 30초 동안 채팅할 수 없어요."
- ⚠️ 탭바 라벨 ("채팅·크루·큐") 은 **inline 한글 하드코딩** — chunk 2 의 `{N}명 청취 중` 과 동일한 정책. v1 다국어화 안 함.

### 큐 탭 placeholder 정책

- spec §4.2.1 탭 그림: `[💬 채팅] [👥 12] [🎧 큐 3]`
- store 에 `djs` slice **없음**. DJ 큐 카운트는 `useFetchDjingQueue` 별도 API.
- chunk 3 시점: 큐 wiring (chunk 4) 까지 API 호출 안 함. **탭바 큐 라벨은 카운트 없이 `🎧 큐`** (chunk 4 에서 카운트 추가하는 forward-evolution).
- 큐 탭 콘텐츠는 "곧 큐잉 출시" 한 줄 안내 (spec §3.3 chunk 2↔3 prod 상태 "곧 채팅·큐 출시" 카드 패턴 — 채팅은 본 chunk 에서 채워지고 큐만 남음).

### 라우트 · entry 변경 없음 확인

- `/parties/(room)/[id]/page.tsx` 는 chunk 2 에서 이미 `<MobileRoom />` 분기 wired — chunk 3 손대지 않음.
- `(room)/[id]/layout.tsx` 의 enter/teardown 효과는 device 무관 — 본 chunk 영향 0.

---

## File Structure

### 생성

| 경로                                                                                    | 책임                                                                                  |
| --------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------- |
| `src/widgets-mobile/partyroom-chat-panel/partyroom-chat-panel.component.tsx`            | 모바일 채팅 패널 — 메시지 리스트 + 송신 input. 모더레이션·호버 OUT. ban timer 그대로. |
| `src/widgets-mobile/partyroom-chat-panel/ui/parts/chat-item.component.tsx`              | 모바일 ChatItem 사본 (forwardRef). 호버 메뉴 wrap 없음.                               |
| `src/widgets-mobile/partyroom-chat-panel/ui/parts/authority-headset.component.tsx`      | 모바일 AuthorityHeadset 사본 (widget cross-import 금지 → sibling 사본).               |
| `src/widgets-mobile/partyroom-chat-panel/ui/parts/chat-item.component.test.tsx`         | 단위 테스트                                                                           |
| `src/widgets-mobile/partyroom-chat-panel/ui/parts/authority-headset.component.test.tsx` | 단위 테스트                                                                           |
| `src/widgets-mobile/partyroom-chat-panel/partyroom-chat-panel.component.test.tsx`       | 통합 테스트 (스토어·hook mock 으로 ban / blocked / 송신 / 메시지 렌더)                |
| `src/widgets-mobile/partyroom-chat-panel/index.ts`                                      | barrel                                                                                |
| `src/widgets-mobile/partyroom-room-tabs/partyroom-room-tabs.component.tsx`              | 탭 컨테이너 — 활성 탭 state + hash sync + 세 탭 콘텐츠 mount + 탭바 sibling.          |
| `src/widgets-mobile/partyroom-room-tabs/ui/parts/tab-bar.component.tsx`                 | 하단 sticky 탭바 (3 버튼, 활성 강조).                                                 |
| `src/widgets-mobile/partyroom-room-tabs/ui/parts/queue-tab-placeholder.component.tsx`   | 큐 탭 자리 "곧 큐잉 출시" 카드 (chunk 4 까지 임시).                                   |
| `src/widgets-mobile/partyroom-room-tabs/lib/use-tab-hash.hook.ts`                       | hash ↔ activeTab sync. SSR 안전 (mount 후 hash 읽기, 미일치/없으면 'chat' 기본).     |
| `src/widgets-mobile/partyroom-room-tabs/lib/use-tab-hash.hook.test.ts`                  | 단위 테스트                                                                           |
| `src/widgets-mobile/partyroom-room-tabs/ui/parts/tab-bar.component.test.tsx`            | 단위 테스트                                                                           |
| `src/widgets-mobile/partyroom-room-tabs/partyroom-room-tabs.component.test.tsx`         | 통합 테스트 (탭 전환·hash 반영·활성 탭만 보임)                                        |
| `src/widgets-mobile/partyroom-room-tabs/index.ts`                                       | barrel                                                                                |

### 수정

| 경로                                                          | 변경                                                                                                                                                |
| ------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------- |
| `src/widgets-mobile/partyroom-page-mobile/room.component.tsx` | `MobilePartyroomCrewsPanel` 직접 노출 + flex-1 overflow wrapper 를 **`<MobilePartyroomRoomTabs />` 단일 렌더**로 교체. display-board sticky 그대로. |

### 보존 (chunk 5 제거)

| 경로                                | 사유                                               |
| ----------------------------------- | -------------------------------------------------- |
| (chunk 2 의 `mobile-fallback-card`) | chunk 5 catch-up 에서 일괄 제거 — 본 chunk 와 무관 |

---

## Phase 0: 정찰 재검증 (`Baseline` 섹션 정확성 재검증)

본 plan 의 Baseline 은 이미 정찰 완료. 단 plan 실행 시점에 baseline 이 변경됐을 가능성을 차단하기 위한 single-task verification.

### Task 0.1: Baseline 재검증

**Files:** 없음 (read-only 명령)

- [ ] **Step 1: chunk 2 결과물 정합 확인**

```bash
cd "C:/Users/Eisen/Desktop/Labs/[projects] pfplay/pfplay-web"
# chunk 2 의 room.component.tsx 가 plan Baseline 과 동일한지
cat src/widgets-mobile/partyroom-page-mobile/room.component.tsx
# 크루 패널 컴포넌트 export 명
cat src/widgets-mobile/partyroom-crews-panel/index.ts
# display-board export 명
cat src/widgets-mobile/partyroom-display-board/index.ts
```

Expected: Baseline 의 `MobileRoom` 코드 블록과 1:1 일치. 다를 시 본 plan 의 Baseline + Phase 7 의 wiring code block 갱신 후 진행.

- [ ] **Step 2: 데스크탑 chat-panel 의존성 인벤토리 재검증**

```bash
head -30 src/widgets/partyroom-chat-panel/ui/partyroom-chat-panel.component.tsx
cat src/entities/current-partyroom/index.ts
cat src/features/partyroom/list-chat-messages/index.ts
cat src/features/partyroom/send-chat-message/index.ts
cat src/features/partyroom/list-my-blocked-crews/index.ts
```

Expected: 본 plan Baseline 의 imports 표와 일치. barrel 에 `useCurrentPartyroomChat`·`useChatMessagesScrollManager`·`SendChatMessage`·`useIsBlockedCrew` 모두 export 존재.

- [ ] **Step 3: i18n 키 존재 확인**

```bash
grep -nE "start_chat|chat_banned_hint" src/shared/lib/localization/dictionaries/ko.json
grep -nE "start_chat|chat_banned_hint" src/shared/lib/localization/dictionaries/en.json
```

Expected: 두 키 모두 ko/en 양쪽 존재 (chunk 2 baseline 의 i18n drift 정책 [[feedback_pfplay_web_i18n_drift]] 대상 아님).

- [ ] **Step 4: store 슬라이스 정합 (me·title·playback)**

```bash
# positive: 기대 슬라이스 enumerate
grep -nE "^\s+(id|playbackActivated|playback|currentDj|crews|me)\s*:" src/entities/current-partyroom/model/current-partyroom.store.ts
# negative: djs slice 부재 확인 (큐는 별도 API)
grep -nE "^\s+djs\s*:" src/entities/current-partyroom/model/current-partyroom.store.ts
```

Expected:

- positive grep → `me`·`currentDj`·`crews`·`playback`·`playbackActivated`·`id` 슬라이스 매칭
- negative grep → **0 match** (`djs` slice 부재 — 본 plan 의 큐 카운트 forward-evolution 가정의 근거). match 시 plan 의 큐 placeholder 정책 재검토 필요.

- [ ] **Step 5: 정찰 결과 노트**

plan 본문에 직접 수정이 필요한 항목 발견 시 commit 메시지에 기록. 변경 없으면 skip (다음 Phase 진행).

```bash
# 변경 사항 있으면만:
git add docs/superpowers/plans/2026-05-29-mobile-responsive-chunk3-chat-crews-tabs.md
git commit -m "docs(plan/chunk3): Phase 0 정찰 결과 반영"
```

---

## Phase 1: 모바일 AuthorityHeadset 사본 (가장 단순한 leaf)

### Task 1.1: 모바일 AuthorityHeadset

**Files:**

- Create: `src/widgets-mobile/partyroom-chat-panel/ui/parts/authority-headset.component.tsx`
- Create: `src/widgets-mobile/partyroom-chat-panel/ui/parts/authority-headset.component.test.tsx`

- [ ] **Step 1: failing 테스트 (데스크탑 테스트와 동일 구조 — markup 완전 동일이라 1:1 검증)**

```tsx
// src/widgets-mobile/partyroom-chat-panel/ui/parts/authority-headset.component.test.tsx
import React from 'react';
import { render } from '@testing-library/react';
import { describe, expect, test, vi } from 'vitest';
import { GradeType } from '@/shared/api/http/types/@enums';
import AuthorityHeadset from './authority-headset.component';

vi.mock('@/shared/ui/icons', () => ({
  PFHeadsetGray: (props: any) => <svg data-testid='headset-gray' {...props} />,
  PFHeadsetRed: (props: any) => <svg data-testid='headset-red' {...props} />,
}));

describe('mobile AuthorityHeadset', () => {
  test('LISTENER 는 아무것도 렌더링하지 않는다', () => {
    const { container } = render(<AuthorityHeadset grade={GradeType.LISTENER} />);
    expect(container.innerHTML).toBe('');
  });
  test('CLUBBER 는 회색 헤드셋', () => {
    const { getByTestId } = render(<AuthorityHeadset grade={GradeType.CLUBBER} />);
    expect(getByTestId('headset-gray')).toBeTruthy();
  });
  test('MODERATOR 는 빨간 헤드셋', () => {
    const { getByTestId } = render(<AuthorityHeadset grade={GradeType.MODERATOR} />);
    expect(getByTestId('headset-red')).toBeTruthy();
  });
  test('HOST 는 빨간 헤드셋', () => {
    const { getByTestId } = render(<AuthorityHeadset grade={GradeType.HOST} />);
    expect(getByTestId('headset-red')).toBeTruthy();
  });
});
```

- [ ] **Step 2: 실패 확인**

```bash
npx vitest run src/widgets-mobile/partyroom-chat-panel/ui/parts/authority-headset.component.test.tsx
```

Expected: FAIL — `Cannot find module './authority-headset.component'`.

- [ ] **Step 3: 구현 (데스크탑과 markup 동일, 단 widget tree 만 다름)**

```tsx
// src/widgets-mobile/partyroom-chat-panel/ui/parts/authority-headset.component.tsx
import { GradeType } from '@/shared/api/http/types/@enums';
import { PFHeadsetGray, PFHeadsetRed } from '@/shared/ui/icons';

type Props = {
  grade: GradeType;
};

export default function AuthorityHeadset({ grade }: Props) {
  if (grade === GradeType.LISTENER) return null;
  if (grade === GradeType.CLUBBER) {
    return <PFHeadsetGray width={42} height={25} className={commonHeadsetStyle} />;
  }
  return <PFHeadsetRed width={42} height={25} className={commonHeadsetStyle} />;
}

const commonHeadsetStyle = 'absolute -top-[2px] -left-[5px]';
```

- [ ] **Step 4: 통과 확인**

```bash
npx vitest run src/widgets-mobile/partyroom-chat-panel/ui/parts/authority-headset.component.test.tsx
```

Expected: PASS (4 tests).

- [ ] **Step 5: 커밋**

```bash
git add src/widgets-mobile/partyroom-chat-panel/ui/parts/authority-headset.component.tsx \
        src/widgets-mobile/partyroom-chat-panel/ui/parts/authority-headset.component.test.tsx
git commit -m "feat(widgets-mobile/partyroom-chat-panel): AuthorityHeadset 사본 (C3 격리, 데스크탑 markup 1:1)"
```

---

## Phase 2: 모바일 ChatItem 사본

### Task 2.1: 모바일 ChatItem

**Files:**

- Create: `src/widgets-mobile/partyroom-chat-panel/ui/parts/chat-item.component.tsx`
- Create: `src/widgets-mobile/partyroom-chat-panel/ui/parts/chat-item.component.test.tsx`

- [ ] **Step 1: failing 테스트 (데스크탑 테스트 패턴 그대로)**

```tsx
// src/widgets-mobile/partyroom-chat-panel/ui/parts/chat-item.component.test.tsx
vi.mock('@/shared/ui/components/profile/profile.component', () => ({
  __esModule: true,
  default: ({ src, size }: any) => <div data-testid='profile' data-src={src} data-size={size} />,
}));
vi.mock('./authority-headset.component', () => ({
  __esModule: true,
  default: ({ grade }: any) => <div data-testid='headset' data-grade={grade} />,
}));
vi.mock('@/shared/ui/foundation/fonts', () => ({
  galmuriFont: { className: 'galmuri' },
}));

import { render, screen } from '@testing-library/react';
import { describe, expect, test, vi } from 'vitest';
import { GradeType } from '@/shared/api/http/types/@enums';
import ChatItem from './chat-item.component';

const makeMessage = (gradeType: GradeType, content = 'Hello') =>
  ({
    from: 'user',
    crew: {
      crewId: 1,
      nickname: 'TestUser',
      gradeType,
      avatarIconUri: 'https://example.com/icon.png',
    },
    message: { content },
  }) as any;

describe('mobile ChatItem', () => {
  test('닉네임과 메시지를 렌더링한다', () => {
    render(<ChatItem message={makeMessage(GradeType.CLUBBER)} />);
    expect(screen.getByText('TestUser')).toBeTruthy();
    expect(screen.getByText('Hello')).toBeTruthy();
  });
  test('CLUBBER 이상이면 등급 라벨을 표시한다', () => {
    const { container } = render(<ChatItem message={makeMessage(GradeType.CLUBBER)} />);
    expect(container.querySelector('.galmuri')).toBeTruthy();
  });
  test('MODERATOR 이상이면 등급 라벨이 빨간색이다', () => {
    const { container } = render(<ChatItem message={makeMessage(GradeType.MODERATOR)} />);
    const label = container.querySelector('.galmuri');
    expect(label?.className).toContain('text-red-400');
  });
  test('프로필과 헤드셋 컴포넌트를 렌더링한다', () => {
    render(<ChatItem message={makeMessage(GradeType.HOST)} />);
    expect(screen.getByTestId('profile').getAttribute('data-src')).toBe(
      'https://example.com/icon.png'
    );
    expect(screen.getByTestId('headset').getAttribute('data-grade')).toBe(GradeType.HOST);
  });
  test('ref 를 전달할 수 있다 (scrollManager 의 lastItemRef 호환)', () => {
    const ref = vi.fn();
    render(<ChatItem ref={ref} message={makeMessage(GradeType.CLUBBER)} />);
    expect(ref).toHaveBeenCalledWith(expect.any(HTMLDivElement));
  });
});
```

- [ ] **Step 2: 실패 확인**

```bash
npx vitest run src/widgets-mobile/partyroom-chat-panel/ui/parts/chat-item.component.test.tsx
```

Expected: FAIL — module not found.

- [ ] **Step 3: 구현 (데스크탑 ChatItem 본문 1:1 사본 — sibling import 만 상대경로 유지)**

```tsx
// src/widgets-mobile/partyroom-chat-panel/ui/parts/chat-item.component.tsx
import { forwardRef } from 'react';
import { ChatMessage, Crew } from '@/entities/current-partyroom';
import { GRADE_TYPE_LABEL } from '@/entities/partyroom-client';
import { GradeType } from '@/shared/api/http/types/@enums';
import { cn } from '@/shared/lib/functions/cn';
import Profile from '@/shared/ui/components/profile/profile.component';
import { Typography } from '@/shared/ui/components/typography';
import { galmuriFont } from '@/shared/ui/foundation/fonts';
import AuthorityHeadset from './authority-headset.component';

type ChatItemProps = {
  message: Extract<ChatMessage.Model, { from: 'user' }>;
};

const ChatItem = forwardRef<HTMLDivElement, ChatItemProps>(({ message }, ref) => {
  const crew = message.crew;
  const myGradeComparator = Crew.GradeComparator.of(crew.gradeType);
  const showGradeLabel = myGradeComparator.isHigherThanOrEqualTo(GradeType.CLUBBER);
  const emphasisGradeLabel = myGradeComparator.isHigherThanOrEqualTo(GradeType.MODERATOR);

  return (
    <div
      ref={ref}
      className='flex justify-start items-start gap-[13px]'
      data-testid='chat-message-item'
    >
      <div className='flexCol items-center gap-2 px-[5px] pt-[2px]'>
        <div className='relative'>
          <Profile src={crew.avatarIconUri} size={32} />
          <AuthorityHeadset grade={crew.gradeType} />
        </div>

        {showGradeLabel && (
          <Typography
            type='body4'
            className={cn(
              galmuriFont.className,
              'text-center',
              emphasisGradeLabel ? 'text-red-400' : 'text-gray-200'
            )}
          >
            {GRADE_TYPE_LABEL[crew.gradeType]}
          </Typography>
        )}
      </div>

      <div className='flex-1 flexCol items-start gap-1'>
        <Typography type='detail2' data-testid='chat-message-nickname'>
          {crew.nickname}
        </Typography>

        <Typography
          type='caption1'
          className='bg-gray-900 p-2 rounded-sm text-white'
          style={{ wordBreak: 'break-word' }}
          data-testid='chat-message-content'
        >
          {message.message.content}
        </Typography>
      </div>
    </div>
  );
});

ChatItem.displayName = 'MobileChatItem';

export default ChatItem;
```

> ⚠️ 데스크탑 코드와 1:1 동일 (markup·import·forwardRef). 단 `displayName` 만 'MobileChatItem' 으로 — debug overlay 구분용.

- [ ] **Step 4: 통과 확인**

```bash
npx vitest run src/widgets-mobile/partyroom-chat-panel/ui/parts/chat-item.component.test.tsx
```

Expected: PASS (5 tests).

- [ ] **Step 5: 커밋**

```bash
git add src/widgets-mobile/partyroom-chat-panel/ui/parts/chat-item.component.tsx \
        src/widgets-mobile/partyroom-chat-panel/ui/parts/chat-item.component.test.tsx
git commit -m "feat(widgets-mobile/partyroom-chat-panel): ChatItem 사본 (forwardRef, sibling AuthorityHeadset import)"
```

---

## Phase 3: 모바일 PartyroomChatPanel

### Task 3.1: 모바일 채팅 패널 통합

**Files:**

- Create: `src/widgets-mobile/partyroom-chat-panel/partyroom-chat-panel.component.tsx`
- Create: `src/widgets-mobile/partyroom-chat-panel/partyroom-chat-panel.component.test.tsx`
- Create: `src/widgets-mobile/partyroom-chat-panel/index.ts`

- [ ] **Step 1: failing 테스트**

```tsx
// src/widgets-mobile/partyroom-chat-panel/partyroom-chat-panel.component.test.tsx
vi.mock('@/entities/current-partyroom', () => ({
  useCurrentPartyroomChat: vi.fn(() => mockChatMessages),
  // 타입 alias 들은 import-only 라 mock 필요 없음 — 사본 ChatItem 이 직접 사용
}));
vi.mock('@/features/partyroom/list-chat-messages', () => ({
  useChatMessagesScrollManager: () => ({
    scrollContainerRef: vi.fn(),
    lastItemRef: vi.fn(),
  }),
}));
vi.mock('@/features/partyroom/list-my-blocked-crews', () => ({
  useIsBlockedCrew: () => mockIsBlockedCrew,
}));
vi.mock('@/features/partyroom/send-chat-message', () => ({
  SendChatMessage: ({ children }: any) =>
    children({
      message: 'hi',
      setMessage: vi.fn(),
      send: mockSend,
      canSend: true,
    }),
}));
vi.mock('@/entities/current-partyroom/lib/alerts/use-alert.hook', () => ({
  __esModule: true,
  default: vi.fn(),
}));
vi.mock('@/shared/lib/localization/i18n.context', () => ({
  useI18n: () => ({
    chat: {
      para: {
        start_chat: '무슨 얘기를 해볼까요?',
        chat_banned_hint: '관리자 제재로 30초 동안 채팅할 수 없어요.',
      },
    },
  }),
}));
vi.mock('./ui/parts/chat-item.component', () => ({
  __esModule: true,
  default: ({ message }: any) => (
    <div data-testid='chat-item' data-crew-id={message.crew.crewId}>
      {message.message.content}
    </div>
  ),
}));

import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, test, vi, beforeEach } from 'vitest';
import MobilePartyroomChatPanel from './partyroom-chat-panel.component';

let mockChatMessages: any[] = [];
let mockIsBlockedCrew: (crewId: number) => boolean = () => false;
let mockSend = vi.fn();

beforeEach(() => {
  mockChatMessages = [];
  mockIsBlockedCrew = () => false;
  mockSend = vi.fn();
});

describe('MobilePartyroomChatPanel', () => {
  test('user 메시지를 ChatItem 으로 렌더링한다', () => {
    mockChatMessages = [
      {
        from: 'user',
        crew: { crewId: 1, nickname: 'A' },
        message: { content: 'hello', messageId: 'm1' },
        receivedAt: 1,
      },
    ];
    render(<MobilePartyroomChatPanel />);
    expect(screen.getByTestId('chat-item').textContent).toContain('hello');
  });

  test('system 메시지는 빨간 텍스트로 렌더링한다 (ChatItem 사용 안 함)', () => {
    mockChatMessages = [
      { from: 'system', content: '관리자에 의해 30초간 채팅이 금지됩니다.', receivedAt: 1 },
    ];
    render(<MobilePartyroomChatPanel />);
    expect(screen.getByText(/30초간 채팅이 금지/)).toBeTruthy();
    expect(screen.queryByTestId('chat-item')).toBeNull();
  });

  test('블록된 crew 메시지는 숨긴다', () => {
    mockChatMessages = [
      {
        from: 'user',
        crew: { crewId: 7, nickname: 'Blocked' },
        message: { content: 'spam', messageId: 'm2' },
        receivedAt: 2,
      },
    ];
    mockIsBlockedCrew = (crewId: number) => crewId === 7;
    render(<MobilePartyroomChatPanel />);
    expect(screen.queryByTestId('chat-item')).toBeNull();
  });

  test('입력부 placeholder 가 i18n 키로 표시된다', () => {
    render(<MobilePartyroomChatPanel />);
    expect(screen.getByPlaceholderText('무슨 얘기를 해볼까요?')).toBeTruthy();
  });

  test('전송 버튼 클릭 → SendChatMessage.send 호출', () => {
    render(<MobilePartyroomChatPanel />);
    fireEvent.click(screen.getByTestId('chat-message-send-button'));
    expect(mockSend).toHaveBeenCalled();
  });
});
```

- [ ] **Step 2: 실패 확인**

```bash
npx vitest run src/widgets-mobile/partyroom-chat-panel/partyroom-chat-panel.component.test.tsx
```

Expected: FAIL — module not found.

- [ ] **Step 3: 구현 (데스크탑 채팅 패널의 모더레이션 OUT 버전)**

```tsx
// src/widgets-mobile/partyroom-chat-panel/partyroom-chat-panel.component.tsx
'use client';
import { useCallback, useRef, useState } from 'react';
import { useCurrentPartyroomChat } from '@/entities/current-partyroom';
import useAlert from '@/entities/current-partyroom/lib/alerts/use-alert.hook';
import { useChatMessagesScrollManager } from '@/features/partyroom/list-chat-messages';
import { useIsBlockedCrew } from '@/features/partyroom/list-my-blocked-crews';
import { SendChatMessage } from '@/features/partyroom/send-chat-message';
import { PenaltyType } from '@/shared/api/http/types/@enums';
import { ONE_MINUTE } from '@/shared/config/time';
import { useI18n } from '@/shared/lib/localization/i18n.context';
import { Button } from '@/shared/ui/components/button';
import { Input } from '@/shared/ui/components/input';
import { Typography } from '@/shared/ui/components/typography';
import { PFSend } from '@/shared/ui/icons';
import ChatItem from './ui/parts/chat-item.component';

/**
 * 모바일 채팅 패널 (§4.2 채팅 탭 콘텐츠):
 * - 메시지 리스트 (overflow-y-auto, scroll manager bottom-pin)
 * - system 메시지 = 빨간 텍스트 (데스크탑 동일 톤)
 * - 블록된 crew 메시지 숨김 (데스크탑에서 블록한 정책 유지)
 * - 송신 input (하단 sticky, ban 시 disabled)
 * - 모더레이션·호버 메뉴 OUT (§스코프)
 *
 * 본 panel 은 부모 (탭 컨테이너) 가 flexCol h-full 안에 mount 한다는 전제.
 * 부모가 높이/스크롤 가시성을 보장하므로 데스크탑의 `useVerticalStretch` 는 불요.
 */
export default function MobilePartyroomChatPanel() {
  const t = useI18n();
  const chatMessages = useCurrentPartyroomChat();
  const isBlockedCrew = useIsBlockedCrew();
  const { scrollContainerRef, lastItemRef } = useChatMessagesScrollManager<
    HTMLDivElement,
    HTMLDivElement
  >({
    itemsGap: 16,
  });
  const banned = useTempChatBanTimer();

  return (
    <div className='flexCol h-full'>
      <div
        ref={scrollContainerRef}
        className='flex-[1_0_0] flexCol gap-4 overflow-y-auto py-4 px-3'
      >
        {chatMessages.map((message, i) => {
          if (message.from === 'system') {
            return (
              <Typography
                key={'system' + message.receivedAt}
                type='caption1'
                className='text-red-200 p-2 pl-[58px]'
              >
                {message.content}
              </Typography>
            );
          }
          if (isBlockedCrew(message.crew.crewId)) {
            return null;
          }
          const isLast = i === chatMessages.length - 1;
          return (
            <ChatItem
              key={message.message.messageId}
              message={message}
              ref={isLast ? lastItemRef : undefined}
            />
          );
        })}
      </div>

      <div className='shrink-0 px-3 pb-3 pt-2 bg-black border-t border-gray-900'>
        <SendChatMessage>
          {({ message, setMessage, send, canSend }) => (
            <Input
              data-testid='chat-message-input'
              size='lg'
              variant='outlined'
              disabled={banned}
              placeholder={t.chat.para.start_chat}
              aria-label={banned ? t.chat.para.chat_banned_hint : t.chat.para.start_chat}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onPressEnter={() => {
                if (canSend) send();
              }}
              Suffix={
                <Button
                  data-testid='chat-message-send-button'
                  color='secondary'
                  variant='fill'
                  Icon={<PFSend width={20} height={20} />}
                  size='sm'
                  className='text-gray-50'
                  onClick={send}
                  disabled={!canSend || banned}
                />
              }
            />
          )}
        </SendChatMessage>
      </div>
    </div>
  );
}

/**
 * FIXME: 데스크탑 chat-panel 의 동일 hook 본문 1:1 사본 (의도) — 데스크탑 FIXME 주석 그대로
 * 옮겨옴. 본격 리팩토링은 후속 chunk 가 아닌 별도 작업으로 (데스크탑·모바일 동시 정리).
 */
function useTempChatBanTimer() {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [banned, setBanned] = useState(false);

  useAlert(
    useCallback((alert) => {
      if (alert.type === PenaltyType.CHAT_BAN_30_SECONDS) {
        setBanned(true);
        timerRef.current = setTimeout(() => {
          setBanned(false);
        }, 30 * ONE_MINUTE);
      }
    }, [])
  );

  return banned;
}
```

> ⚠️ 데스크탑 chat-panel 의 `const isMe = message.crew.crewId === me?.crewId` 는 호버 메뉴의 본인 메시지 게이트(자기 메시지엔 메뉴 비활성)용. 모바일은 호버 메뉴 OUT 이라 그 라인 자체와 `me` selector·`useStores` import 모두 제거 ([[feedback_elegant_no_code_dirtying]]).

- [ ] **Step 4: barrel 작성**

```ts
// src/widgets-mobile/partyroom-chat-panel/index.ts
export { default as MobilePartyroomChatPanel } from './partyroom-chat-panel.component';
```

- [ ] **Step 5: 통과 확인 + tsc**

```bash
npx vitest run src/widgets-mobile/partyroom-chat-panel/partyroom-chat-panel.component.test.tsx
npx tsc --noEmit
```

Expected: PASS (5 tests) + tsc 0 error.

- [ ] **Step 6: 커밋**

```bash
git add src/widgets-mobile/partyroom-chat-panel/partyroom-chat-panel.component.tsx \
        src/widgets-mobile/partyroom-chat-panel/partyroom-chat-panel.component.test.tsx \
        src/widgets-mobile/partyroom-chat-panel/index.ts
git commit -m "feat(widgets-mobile/partyroom-chat-panel): 모바일 채팅 패널 (게스트 허용, 모더레이션 OUT)

- 데스크탑 chat-panel 의 메시지 리스트 + 송신 + ban timer 그대로
- 호버 메뉴 / adjust-grade / impose-penalty / block-crew imports 모두 OUT (§스코프 OUT)
- useVerticalStretch 불요 (부모 flexCol h-full 가 stretch 보장)
- 데스크탑 widgets/partyroom-chat-panel/* cross-import 없음 (C3 격리)"
```

---

## Phase 4: 탭 hash hook

### Task 4.1: `useTabHash` hook

**Files:**

- Create: `src/widgets-mobile/partyroom-room-tabs/lib/use-tab-hash.hook.ts`
- Create: `src/widgets-mobile/partyroom-room-tabs/lib/use-tab-hash.hook.test.ts`

- [ ] **Step 1: failing 테스트**

```ts
// src/widgets-mobile/partyroom-room-tabs/lib/use-tab-hash.hook.test.ts
/**
 * @vitest-environment jsdom
 */
import { act, renderHook } from '@testing-library/react';
import { describe, expect, test, beforeEach } from 'vitest';
import useTabHash, { TabKey } from './use-tab-hash.hook';

beforeEach(() => {
  window.history.replaceState(null, '', '/parties/1');
});

describe('useTabHash', () => {
  test('초기값은 hash 없으면 chat (default)', () => {
    const { result } = renderHook(() => useTabHash());
    expect(result.current.activeTab).toBe<TabKey>('chat');
  });

  test('mount 시점 hash = #crew 면 crew 로 초기화', () => {
    window.history.replaceState(null, '', '/parties/1#crew');
    const { result } = renderHook(() => useTabHash());
    expect(result.current.activeTab).toBe<TabKey>('crew');
  });

  test('mount 시점 hash = #queue 면 queue', () => {
    window.history.replaceState(null, '', '/parties/1#queue');
    const { result } = renderHook(() => useTabHash());
    expect(result.current.activeTab).toBe<TabKey>('queue');
  });

  test('알 수 없는 hash 는 chat 으로 fallback', () => {
    window.history.replaceState(null, '', '/parties/1#bogus');
    const { result } = renderHook(() => useTabHash());
    expect(result.current.activeTab).toBe<TabKey>('chat');
  });

  test('setActiveTab 호출 시 hash 가 갱신된다', () => {
    const { result } = renderHook(() => useTabHash());
    act(() => result.current.setActiveTab('crew'));
    expect(window.location.hash).toBe('#crew');
    expect(result.current.activeTab).toBe('crew');
  });

  test('chat 으로 돌아가면 hash 제거', () => {
    window.history.replaceState(null, '', '/parties/1#crew');
    const { result } = renderHook(() => useTabHash());
    act(() => result.current.setActiveTab('chat'));
    expect(window.location.hash).toBe('');
    expect(result.current.activeTab).toBe('chat');
  });

  test('hashchange 이벤트 (뒤로/앞으로) 발생 시 state 동기화', () => {
    const { result } = renderHook(() => useTabHash());
    act(() => {
      window.history.pushState(null, '', '/parties/1#queue');
      window.dispatchEvent(new HashChangeEvent('hashchange'));
    });
    expect(result.current.activeTab).toBe('queue');
  });

  test('동일 탭 재클릭은 history 항목을 추가하지 않는다 (idempotence guard)', () => {
    const { result } = renderHook(() => useTabHash());
    act(() => result.current.setActiveTab('crew'));
    const lengthAfterFirst = window.history.length;
    act(() => result.current.setActiveTab('crew'));
    act(() => result.current.setActiveTab('crew'));
    expect(window.history.length).toBe(lengthAfterFirst);
    expect(result.current.activeTab).toBe('crew');
  });

  test('invalid hash 진입 후 chat 탭 클릭 → URL 정규화 (#bogus 제거)', () => {
    window.history.replaceState(null, '', '/parties/1#bogus');
    const { result } = renderHook(() => useTabHash());
    // mount 후 readHashAsTab fallback 으로 'chat' state 정착, URL 은 여전히 #bogus
    expect(result.current.activeTab).toBe('chat');
    expect(window.location.hash).toBe('#bogus');
    // chat 탭 명시적 클릭 → 정규화 발동
    act(() => result.current.setActiveTab('chat'));
    expect(window.location.hash).toBe('');
    expect(result.current.activeTab).toBe('chat');
  });
});
```

- [ ] **Step 2: 실패 확인**

```bash
npx vitest run src/widgets-mobile/partyroom-room-tabs/lib/use-tab-hash.hook.test.ts
```

Expected: FAIL — module not found.

- [ ] **Step 3: 구현**

```ts
// src/widgets-mobile/partyroom-room-tabs/lib/use-tab-hash.hook.ts
import { useCallback, useEffect, useState } from 'react';

export type TabKey = 'chat' | 'crew' | 'queue';

const VALID_TABS: TabKey[] = ['chat', 'crew', 'queue'];

function readHashAsTab(): TabKey {
  if (typeof window === 'undefined') return 'chat';
  const raw = window.location.hash.replace('#', '');
  return (VALID_TABS as string[]).includes(raw) ? (raw as TabKey) : 'chat';
}

/**
 * 모바일 룸 탭 ↔ URL hash 양방향 sync.
 *
 * - SSR 안전: 초기 state 는 'chat'. mount 후 hash 읽어 정정.
 *   (SSR 시점에 window 없음 → 깜빡임 1프레임 수용. spec §4.2.1 결정.)
 * - 사용자 탭 클릭 → history 갱신 (chat = hash 제거, 그 외 = #<tab>).
 * - 뒤로/앞으로 (hashchange) → state 동기화.
 * - middleware 의 x-pf-device 헤더는 path 기반이라 hash 와 무충돌.
 */
export default function useTabHash() {
  const [activeTab, setActiveTabState] = useState<TabKey>('chat');

  useEffect(() => {
    setActiveTabState(readHashAsTab());
    const onHashChange = () => setActiveTabState(readHashAsTab());
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

  const setActiveTab = useCallback((tab: TabKey) => {
    if (typeof window === 'undefined') return;
    // idempotence guard: URL 의 hash 가 이미 target 과 일치하면 pushState skip.
    // (invalid hash 'bogus' 는 readHashAsTab()=='chat' 이라도 URL hash 자체와 다르므로 정규화 발동)
    const currentHash = window.location.hash.replace('#', '');
    const targetHash = tab === 'chat' ? '' : tab;
    if (currentHash === targetHash) {
      setActiveTabState(tab);
      return;
    }
    if (tab === 'chat') {
      // 기본 탭은 hash 없는 상태로 정규화 (공유 링크 정합)
      const cleanPath = window.location.pathname + window.location.search;
      window.history.pushState(null, '', cleanPath);
    } else {
      window.history.pushState(null, '', `#${tab}`);
    }
    setActiveTabState(tab);
  }, []);

  return { activeTab, setActiveTab };
}
```

- [ ] **Step 4: 통과 확인**

```bash
npx vitest run src/widgets-mobile/partyroom-room-tabs/lib/use-tab-hash.hook.test.ts
```

Expected: PASS (9 tests).

- [ ] **Step 5: 커밋**

```bash
git add src/widgets-mobile/partyroom-room-tabs/lib/use-tab-hash.hook.ts \
        src/widgets-mobile/partyroom-room-tabs/lib/use-tab-hash.hook.test.ts
git commit -m "feat(widgets-mobile/partyroom-room-tabs): useTabHash — URL hash ↔ activeTab 양방향 sync

- chat = hash 제거 (정규화), crew/queue = #<key>
- SSR 안전 (mount 후 hash 읽기, default chat)
- hashchange (뒤로/앞으로) 이벤트 listen"
```

---

## Phase 5: 탭바 + 큐 placeholder leaf 컴포넌트

### Task 5.1: 탭바 컴포넌트

**Files:**

- Create: `src/widgets-mobile/partyroom-room-tabs/ui/parts/tab-bar.component.tsx`
- Create: `src/widgets-mobile/partyroom-room-tabs/ui/parts/tab-bar.component.test.tsx`

- [ ] **Step 1: failing 테스트**

```tsx
// src/widgets-mobile/partyroom-room-tabs/ui/parts/tab-bar.component.test.tsx
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, test, vi } from 'vitest';
import TabBar from './tab-bar.component';

describe('mobile TabBar', () => {
  test('3 버튼 (채팅·크루·큐) 렌더', () => {
    render(<TabBar activeTab='chat' crewCount={5} onTabClick={vi.fn()} />);
    expect(screen.getByTestId('mobile-tab-chat')).toBeTruthy();
    expect(screen.getByTestId('mobile-tab-crew')).toBeTruthy();
    expect(screen.getByTestId('mobile-tab-queue')).toBeTruthy();
  });

  test('크루 라벨에 인원 카운트 표시', () => {
    render(<TabBar activeTab='chat' crewCount={12} onTabClick={vi.fn()} />);
    expect(screen.getByTestId('mobile-tab-crew').textContent).toContain('12');
  });

  test('큐 탭은 chunk 3 시점 카운트 없이 라벨만 (chunk 4 wiring 까지 forward-evolution)', () => {
    render(<TabBar activeTab='chat' crewCount={5} onTabClick={vi.fn()} />);
    const queueBtn = screen.getByTestId('mobile-tab-queue');
    expect(queueBtn.textContent).toMatch(/큐/);
    // 숫자 카운트 없음 (chunk 4 까지)
    expect(queueBtn.textContent).not.toMatch(/\d/);
  });

  test('활성 탭은 aria-selected=true', () => {
    render(<TabBar activeTab='crew' crewCount={5} onTabClick={vi.fn()} />);
    expect(screen.getByTestId('mobile-tab-crew').getAttribute('aria-selected')).toBe('true');
    expect(screen.getByTestId('mobile-tab-chat').getAttribute('aria-selected')).toBe('false');
  });

  test('탭 클릭 → onTabClick 콜백 호출 (해당 TabKey 인자)', () => {
    const onTabClick = vi.fn();
    render(<TabBar activeTab='chat' crewCount={5} onTabClick={onTabClick} />);
    fireEvent.click(screen.getByTestId('mobile-tab-crew'));
    expect(onTabClick).toHaveBeenCalledWith('crew');
  });
});
```

- [ ] **Step 2: 실패 확인**

```bash
npx vitest run src/widgets-mobile/partyroom-room-tabs/ui/parts/tab-bar.component.test.tsx
```

Expected: FAIL — module not found.

- [ ] **Step 3: 구현**

```tsx
// src/widgets-mobile/partyroom-room-tabs/ui/parts/tab-bar.component.tsx
'use client';
import { FC } from 'react';
import { cn } from '@/shared/lib/functions/cn';
import { TabKey } from '../../lib/use-tab-hash.hook';

interface Props {
  activeTab: TabKey;
  crewCount: number;
  onTabClick: (tab: TabKey) => void;
}

/**
 * 모바일 룸 탭바 (§4.2 ASCII 디자인 56px 높이).
 *
 * - 3 버튼: 💬 채팅 · 👥 N · 🎧 큐 (chunk 4 에서 큐 카운트 추가, 본 chunk 는 라벨만)
 * - 활성 탭 = bg-gray-900 + text-white, 비활성 = text-gray-400
 * - 터치 타겟 min-h-[44px] (iOS HIG, spec §4.1)
 * - safe-area-inset-bottom 은 본 탭바 자체 padding 으로 흡수
 * - 라벨은 inline 한글 (chunk 2 의 "{N}명 청취 중" 과 동일 정책, v1 다국어화 OUT)
 */
const TabBar: FC<Props> = ({ activeTab, crewCount, onTabClick }) => {
  return (
    <nav
      className={cn(
        'shrink-0 grid grid-cols-3 bg-black border-t border-gray-800',
        'pb-[env(safe-area-inset-bottom)]'
      )}
      role='tablist'
      aria-label='파티룸 탭'
    >
      <TabButton
        testId='mobile-tab-chat'
        active={activeTab === 'chat'}
        label='💬 채팅'
        onClick={() => onTabClick('chat')}
      />
      <TabButton
        testId='mobile-tab-crew'
        active={activeTab === 'crew'}
        label={`👥 ${crewCount}`}
        onClick={() => onTabClick('crew')}
      />
      <TabButton
        testId='mobile-tab-queue'
        active={activeTab === 'queue'}
        label='🎧 큐'
        onClick={() => onTabClick('queue')}
      />
    </nav>
  );
};

interface TabButtonProps {
  testId: string;
  active: boolean;
  label: string;
  onClick: () => void;
}

const TabButton: FC<TabButtonProps> = ({ testId, active, label, onClick }) => (
  <button
    type='button'
    data-testid={testId}
    role='tab'
    aria-selected={active}
    className={cn(
      'min-h-[44px] py-3 text-sm font-medium',
      active ? 'bg-gray-900 text-white' : 'text-gray-400'
    )}
    onClick={onClick}
  >
    {label}
  </button>
);

export default TabBar;
```

- [ ] **Step 4: 통과 확인**

```bash
npx vitest run src/widgets-mobile/partyroom-room-tabs/ui/parts/tab-bar.component.test.tsx
```

Expected: PASS (5 tests).

- [ ] **Step 5: 커밋**

```bash
git add src/widgets-mobile/partyroom-room-tabs/ui/parts/tab-bar.component.tsx \
        src/widgets-mobile/partyroom-room-tabs/ui/parts/tab-bar.component.test.tsx
git commit -m "feat(widgets-mobile/partyroom-room-tabs): TabBar — 3 버튼 (채팅·크루·큐), 큐는 chunk 4 까지 카운트 미표시"
```

---

### Task 5.2: 큐 탭 placeholder

**Files:**

- Create: `src/widgets-mobile/partyroom-room-tabs/ui/parts/queue-tab-placeholder.component.tsx`

placeholder 단순 컴포넌트 — 단위 테스트 skip (Phase 6 통합 테스트가 렌더 확인).

- [ ] **Step 1: 구현**

```tsx
// src/widgets-mobile/partyroom-room-tabs/ui/parts/queue-tab-placeholder.component.tsx
import { FC } from 'react';

/**
 * 큐 탭 placeholder (chunk 4 wiring 까지).
 * spec §3.3 chunk 2↔3 "곧 출시" 카드 패턴.
 */
const QueueTabPlaceholder: FC = () => {
  return (
    <div className='flex flex-col items-center justify-center h-full text-center px-6 gap-2'>
      <span className='text-3xl' aria-hidden='true'>
        🎧
      </span>
      <p className='text-sm text-gray-400'>곧 큐잉 기능을 만나보세요</p>
      <p className='text-xs text-gray-600'>지금은 데스크탑에서 사용할 수 있어요</p>
    </div>
  );
};

export default QueueTabPlaceholder;
```

- [ ] **Step 2: tsc**

```bash
npx tsc --noEmit
```

Expected: 0 error.

- [ ] **Step 3: 커밋**

```bash
git add src/widgets-mobile/partyroom-room-tabs/ui/parts/queue-tab-placeholder.component.tsx
git commit -m "feat(widgets-mobile/partyroom-room-tabs): 큐 탭 placeholder (chunk 4 까지)"
```

---

## Phase 6: 탭 컨테이너 (PartyroomRoomTabs)

### Task 6.1: 통합 컨테이너 + 통합 테스트

**Files:**

- Create: `src/widgets-mobile/partyroom-room-tabs/partyroom-room-tabs.component.tsx`
- Create: `src/widgets-mobile/partyroom-room-tabs/partyroom-room-tabs.component.test.tsx`
- Create: `src/widgets-mobile/partyroom-room-tabs/index.ts`

- [ ] **Step 1: failing 테스트**

```tsx
// src/widgets-mobile/partyroom-room-tabs/partyroom-room-tabs.component.test.tsx
/**
 * @vitest-environment jsdom
 */
vi.mock('@/widgets-mobile/partyroom-chat-panel', () => ({
  MobilePartyroomChatPanel: () => <div data-testid='chat-panel-stub' />,
}));
vi.mock('@/widgets-mobile/partyroom-crews-panel', () => ({
  MobilePartyroomCrewsPanel: () => <div data-testid='crews-panel-stub' />,
}));
vi.mock('@/features/partyroom/list-crews', () => ({
  useCurrentPartyroomCrews: () => mockCrews,
}));

import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, test, vi, beforeEach } from 'vitest';
import MobilePartyroomRoomTabs from './partyroom-room-tabs.component';

let mockCrews: any[] = [];

beforeEach(() => {
  mockCrews = [
    { crewId: 1, nickname: 'A' },
    { crewId: 2, nickname: 'B' },
  ];
  window.history.replaceState(null, '', '/parties/1');
});

describe('MobilePartyroomRoomTabs', () => {
  test('초기 진입 시 채팅 탭이 활성', () => {
    render(<MobilePartyroomRoomTabs />);
    expect(screen.getByTestId('mobile-tab-chat').getAttribute('aria-selected')).toBe('true');
  });

  test('크루 탭 클릭 → aria-selected + crews-panel 가시 (mount 유지, hidden 토글)', () => {
    render(<MobilePartyroomRoomTabs />);
    fireEvent.click(screen.getByTestId('mobile-tab-crew'));
    expect(screen.getByTestId('mobile-tab-crew').getAttribute('aria-selected')).toBe('true');
    // .hidden boolean property 로 단언 (jsdom attribute 직렬화 edge 회피)
    const crewSection = screen
      .getByTestId('crews-panel-stub')
      .closest('[data-tab-content="crew"]') as HTMLElement;
    const chatSection = screen
      .getByTestId('chat-panel-stub')
      .closest('[data-tab-content="chat"]') as HTMLElement;
    expect(crewSection.hidden).toBe(false);
    expect(chatSection.hidden).toBe(true);
  });

  test('큐 탭 클릭 → placeholder 가시', () => {
    render(<MobilePartyroomRoomTabs />);
    fireEvent.click(screen.getByTestId('mobile-tab-queue'));
    expect(screen.getByText(/곧 큐잉/)).toBeTruthy();
  });

  test('탭바에 크루 카운트 = useCurrentPartyroomCrews().length', () => {
    mockCrews = [
      { crewId: 1, nickname: 'A' },
      { crewId: 2, nickname: 'B' },
      { crewId: 3, nickname: 'C' },
    ];
    render(<MobilePartyroomRoomTabs />);
    expect(screen.getByTestId('mobile-tab-crew').textContent).toContain('3');
  });

  test('mount 시 hash=#queue → 큐 탭 활성', async () => {
    window.history.replaceState(null, '', '/parties/1#queue');
    render(<MobilePartyroomRoomTabs />);
    // useEffect mount 후 hash 읽어 정정
    await Promise.resolve();
    expect(screen.getByTestId('mobile-tab-queue').getAttribute('aria-selected')).toBe('true');
  });
});
```

- [ ] **Step 2: 실패 확인**

```bash
npx vitest run src/widgets-mobile/partyroom-room-tabs/partyroom-room-tabs.component.test.tsx
```

Expected: FAIL — module not found.

- [ ] **Step 3: 구현**

```tsx
// src/widgets-mobile/partyroom-room-tabs/partyroom-room-tabs.component.tsx
'use client';
import { FC } from 'react';
import { useCurrentPartyroomCrews } from '@/features/partyroom/list-crews';
import { MobilePartyroomChatPanel } from '@/widgets-mobile/partyroom-chat-panel';
import { MobilePartyroomCrewsPanel } from '@/widgets-mobile/partyroom-crews-panel';
import useTabHash from './lib/use-tab-hash.hook';
import QueueTabPlaceholder from './ui/parts/queue-tab-placeholder.component';
import TabBar from './ui/parts/tab-bar.component';

/**
 * 모바일 룸 탭 컨테이너 (§4.2 채팅/크루/큐).
 *
 * 레이아웃:
 * - flex-1 (부모 main 의 1차 grow target)
 * - 세 탭 모두 mount 유지하고 `hidden` 토글 (탭 전환 시 채팅 스크롤·input·메시지 누락 회피)
 * - 활성 탭만 visible + flex layout 작동 (hidden 은 display:none → flex 무효)
 * - 탭바는 nav sibling (sticky bottom 안 함 — 부모가 flex 라 자연스럽게 bottom)
 */
const MobilePartyroomRoomTabs: FC = () => {
  const { activeTab, setActiveTab } = useTabHash();
  const crews = useCurrentPartyroomCrews();

  return (
    <div className='flex-1 flex flex-col min-h-0'>
      <div className='flex-1 min-h-0 relative'>
        <div
          data-tab-content='chat'
          hidden={activeTab !== 'chat'}
          className='absolute inset-0 flex flex-col'
        >
          <MobilePartyroomChatPanel />
        </div>
        <div
          data-tab-content='crew'
          hidden={activeTab !== 'crew'}
          className='absolute inset-0 overflow-y-auto'
        >
          <MobilePartyroomCrewsPanel />
        </div>
        <div data-tab-content='queue' hidden={activeTab !== 'queue'} className='absolute inset-0'>
          <QueueTabPlaceholder />
        </div>
      </div>
      <TabBar activeTab={activeTab} crewCount={crews.length} onTabClick={setActiveTab} />
    </div>
  );
};

export default MobilePartyroomRoomTabs;
```

> ⚠️ `absolute inset-0` 패턴 사유 — 세 탭 mount 유지하면서 활성만 보여야 하는데, flex 안에서 `hidden` 토글이 flex item 배치를 망가뜨림 (다른 탭의 0px 잔존 마진 등). `relative` 부모 + 세 자식 `absolute inset-0` 로 stacking, `hidden` 으로 visibility 만 토글 = flex layout 무관하게 안전.

- [ ] **Step 4: barrel**

```ts
// src/widgets-mobile/partyroom-room-tabs/index.ts
export { default as MobilePartyroomRoomTabs } from './partyroom-room-tabs.component';
```

- [ ] **Step 5: 통과 확인 + tsc**

```bash
npx vitest run src/widgets-mobile/partyroom-room-tabs/partyroom-room-tabs.component.test.tsx
npx tsc --noEmit
```

Expected: PASS (5 tests) + tsc 0 error.

- [ ] **Step 6: 커밋**

```bash
git add src/widgets-mobile/partyroom-room-tabs/partyroom-room-tabs.component.tsx \
        src/widgets-mobile/partyroom-room-tabs/partyroom-room-tabs.component.test.tsx \
        src/widgets-mobile/partyroom-room-tabs/index.ts
git commit -m "feat(widgets-mobile/partyroom-room-tabs): 탭 컨테이너 (채팅/크루/큐)

- 세 탭 mount 유지 + hidden 토글 (채팅 스크롤·input 보존)
- relative + 세 자식 absolute inset-0 stacking (flex layout 충돌 회피)
- 크루 카운트 = useCurrentPartyroomCrews().length"
```

---

## Phase 7: room.component.tsx wiring

### Task 7.1: 모바일 룸 shell 에 탭 컨테이너 채택

**Files:**

- Modify: `src/widgets-mobile/partyroom-page-mobile/room.component.tsx`

- [ ] **Step 1: failing 으로 갈 단계가 없음 — 기존 `MobileRoom` 의 wrapper 교체. 통합 회귀는 Phase 8 의 vitest 전체 + 로컬 헤드드.**

> 본 task 는 wiring 이라 단위 테스트 신규 작성 X. `room.component.tsx` 는 단순 composition 이라 기존 chunk 2 에서도 단위 테스트 부재.

- [ ] **Step 2: 본문 교체**

```tsx
// src/widgets-mobile/partyroom-page-mobile/room.component.tsx
'use client';

import { FC } from 'react';
import { MobilePartyroomDisplayBoard } from '@/widgets-mobile/partyroom-display-board';
import { MobilePartyroomRoomTabs } from '@/widgets-mobile/partyroom-room-tabs';

interface Props {
  partyroomId: number;
}

/**
 * 모바일 룸 page-level shell (§4.2 베이스 + 채팅·크루 탭).
 *
 * 본 chunk 3 의 prod 상태:
 * - display-board (sticky now-playing + YoutubePlayer + 리액션 + 헤더) 그대로
 * - 탭 컨테이너 (채팅 / 크루 / 큐 placeholder) 로 chunk 2 의 `MobilePartyroomCrewsPanel`
 *   직접 노출을 교체. 크루 탭이 그 컴포넌트를 mount.
 *
 * Deferred (chunk 4):
 * - 큐 탭 placeholder 를 실 DJ 큐 콘텐츠로 교체 + 탭바 큐 카운트 활성화
 *
 * enter/teardown 효과는 `(room)/[id]/layout.tsx` 가 device 무관 처리.
 */
const MobileRoom: FC<Props> = ({ partyroomId }) => {
  return (
    <main className='min-h-screen bg-black flex flex-col'>
      <MobilePartyroomDisplayBoard partyroomId={partyroomId} />
      <MobilePartyroomRoomTabs />
    </main>
  );
};

export default MobileRoom;
```

> 변경 요약:
>
> - `<div className='flex-1 overflow-y-auto'>` wrapper 제거 (탭 컨테이너가 flex-1 + min-h-0 + 자체 스크롤 영역 관리)
> - `<MobilePartyroomCrewsPanel />` 직접 사용 제거 (탭 컨테이너 내부에서 mount)
> - "chunk 3·4 wiring" 주석 줄 → 헤더 docstring 으로 통합

- [ ] **Step 3: tsc + 전체 vitest**

```bash
npx tsc --noEmit
npx vitest run
```

Expected: tsc 0 error. vitest 전체 PASS (chunk 2 회귀 0).

- [ ] **Step 4: 커밋**

```bash
git add src/widgets-mobile/partyroom-page-mobile/room.component.tsx
git commit -m "feat(widgets-mobile/partyroom-page-mobile): room shell 에 탭 컨테이너 채택

- chunk 2 의 MobilePartyroomCrewsPanel 직접 노출 → MobilePartyroomRoomTabs 로 교체
- 채팅·크루 탭 wiring. 큐 탭은 chunk 4 까지 placeholder.
- display-board sticky 와 탭바 sticky bottom 무충돌 (탭 컨테이너 flex-1 min-h-0)"
```

---

## Phase 8: 검증 + GH 코멘트 + 마무리

### Task 8.1: 전체 스위트 검증

- [ ] **Step 1: vitest 전체 + tsc + eslint**

```bash
cd "C:/Users/Eisen/Desktop/Labs/[projects] pfplay/pfplay-web"
npx vitest run
npx tsc --noEmit
npx eslint src/
```

Expected: 전체 PASS, 회귀 0. 데스크탑 `widgets/partyroom-chat-panel/*` 테스트는 그대로 PASS (본 chunk 가 그 코드 미수정).

- [ ] **Step 2: next build**

```bash
npx next build
```

Expected:

- 빌드 성공
- chunk 2 build 결과와 동일 routing (`/parties` · `/parties/[id]` 모두 `ƒ (Dynamic)`)
- 새 mobile 트리 (`widgets-mobile/partyroom-chat-panel/*`·`widgets-mobile/partyroom-room-tabs/*`) 가 모바일 분기로만 들어와 데스크탑 bundle 영향 0 ([[reference_pfplay_web_local_dev_http_webpack]] 환경)

- [ ] **Step 3: 데스크탑 헤드드 수동 확인 (회귀 0)**

```bash
npx next dev -p 3000
```

브라우저:

1. 데스크탑 viewport (>= 1024px): `/parties/1` (기존 룸). 채팅 패널 (`widgets/partyroom-chat-panel`) 변경 0, 호버 메뉴 동작, 모더레이션 동작 전부 변경 0
2. DevTools Console hydration mismatch / hook warning 없음 확인

- [ ] **Step 4: 모바일 헤드드 수동 확인 (DevTools iPhone 13 emulation)**

UA emulation 으로 middleware 분기 → mobile tree mount 확인:

1. `/parties/1` 진입:
   - sticky 전광판 (헤더·뒤로·⋮·now-playing·리액션·YouTube 오디오) — chunk 2 유지
   - 탭바 (💬 채팅 · 👥 N · 🎧 큐) 하단 sticky
   - 기본 탭 = 채팅 (`aria-selected=true`)
   - 채팅 메시지 도착하면 자동 스크롤 bottom-pin
   - 메시지 입력 → 송신 → 새 메시지 표시 + 입력 초기화
   - **게스트로 진입해서 메시지 송신 성공** (§2.2 갱신 검증 — backend 가 게스트 채팅 허용하는지 직전 확인 필요. 현재 prod 검증 부재 — chunk 5 의 회귀 가드 PR 5b 가 그 backend 검증을 동반함. 본 chunk 는 frontend 게이트 부재만 보장)
2. 크루 탭 클릭:
   - hash → `#crew`, 탭바 활성 강조 이동
   - 크루 리스트 렌더 (chunk 2 의 `MobilePartyroomCrewsPanel`)
   - 다시 채팅 탭으로 돌아갔을 때 **이전 스크롤 위치 보존** (mount 유지 → hidden 토글)
3. 큐 탭 클릭:
   - hash → `#queue`, "곧 큐잉 출시" placeholder
4. 브라우저 뒤로 → hash 사라짐 → 채팅 탭 복귀
5. 직접 URL 에 `#crew` 입력 후 새로고침 → mount 후 크루 탭 활성 (깜빡임 1프레임 수용)

- [ ] **Step 5: 게스트 채팅 backend 게이트 확인 (frontend 게이트 부재 보장 후 backend 회귀)**

> ⚠️ §2.2 갱신 "게스트 채팅 허용" 의 backend 게이트 부재는 chunk 5 의 회귀 가드 PR 5b 가 명시적으로 검증. 본 chunk 가 머지되면 게스트가 모바일에서 채팅 시도 → backend 가 403 거부하는 케이스 = 회귀. 그러나 데스크탑 게스트 채팅이 이미 prod 동작 중이라면 backend 는 이미 허용 상태 — 가장 빠른 확인:

```bash
# 데스크탑 게스트 로그인 (또는 게스트 자동 생성) 으로 /parties/1 진입 후 채팅 송신 → 200/메시지 표시되는지
# 안 되면 backend 회귀 가드 우선 작업이 chunk 3 전제조건 (사용자 결정)
```

- [ ] **Step 6: 사용자에게 헤드드 결과 보고**

데스크탑 회귀 0 + 모바일 5 시나리오 통과 + 게스트 채팅 backend 허용 확인을 사용자에게 보고. 추가 발견 시 follow-up commit.

---

### Task 8.2: GH 이슈 #340 진행 코멘트

- [ ] **Step 1: 코멘트**

```bash
gh issue comment 340 --body '## chunk 3 (채팅 + 크루 탭 wiring) 완료

- 모바일 룸에 탭바 (채팅/크루/큐) + 채팅 패널 + 크루 탭 wiring 출시
- /parties/{id} 모바일 = 전광판 sticky + 탭 콘텐츠 (채팅 default) + 하단 탭바
- 채팅 탭: 메시지 리스트 + 송신 + 블록된 crew 숨김 + chat-ban 30초 타이머. 모더레이션·호버 메뉴 OUT.
- 크루 탭: chunk 2 의 MobilePartyroomCrewsPanel 그대로 (탭 구조에서 mount)
- 큐 탭: "곧 큐잉 출시" placeholder (chunk 4 wiring 까지)
- 게스트 채팅 허용 (§확정결정 5번 갱신 반영, frontend 게이트 부재)
- URL hash (#crew · #queue) 로 탭 상태 보존 (공유 링크는 hash 없으면 채팅 default)

데스크탑 chat-panel 동작은 그대로. 다음 = chunk 4 (DJ + 큐잉).'
```

---

### Task 8.3: 커밋 정리 + push 게이트

- [ ] **Step 1: 커밋 시리즈 확인**

```bash
git log --oneline origin/development..HEAD
```

본 chunk 의 task 단위 = 논리 단위. squash 불요 ([[feedback_commit_consolidation_before_push]]). 예상 커밋 시리즈 (Phase 0 정찰 결과 변경 없으면):

```
feat(widgets-mobile/partyroom-chat-panel): AuthorityHeadset 사본
feat(widgets-mobile/partyroom-chat-panel): ChatItem 사본
feat(widgets-mobile/partyroom-chat-panel): 모바일 채팅 패널 (게스트 허용, 모더레이션 OUT)
feat(widgets-mobile/partyroom-room-tabs): useTabHash
feat(widgets-mobile/partyroom-room-tabs): TabBar
feat(widgets-mobile/partyroom-room-tabs): 큐 탭 placeholder
feat(widgets-mobile/partyroom-room-tabs): 탭 컨테이너
feat(widgets-mobile/partyroom-page-mobile): room shell 에 탭 컨테이너 채택
```

총 8 commit 예상 (chunk 1·2 와 비교: chunk 1=14 / chunk 2=13. chunk 3 는 작업 범위가 더 좁아 8~10 적정).

- [ ] **Step 2: push (사용자 트리거)**

```bash
git push -u origin feature/mobile-responsive-spec-3
gh pr create -B development -H feature/mobile-responsive-spec-3 \
  --title "feat(mobile-responsive): chunk 3 — 채팅 + 크루 탭 wiring" \
  --body "..." # 한글, spec/plan/이슈 reference, atomic PR caveat, 게스트 채팅 backend 허용 가정 명시
```

PR body 핵심 포인트 (한글, [[feedback_korean_issue_commit_pr]]):

- chunk 3 스코프 (spec §3.3 인용)
- 데스크탑 회귀 0 (`widgets/partyroom-chat-panel/*` 미수정)
- 게스트 채팅 frontend 게이트 부재 + backend 허용 가정 (chunk 5 PR 5b 가 회귀 가드)
- URL hash 탭 sync 동작
- next chunk = chunk 4 (DJ + 큐잉)

---

## 마무리 체크리스트

- [ ] Phase 0~8 의 task step 전부 완료 + 체크
- [ ] `git log --oneline origin/development..HEAD` 가 의도된 8 commit 시리즈와 일치
- [ ] vitest · tsc · eslint · next build 모두 green
- [ ] 데스크탑 헤드드 smoke 통과 (변경 없음 확인)
- [ ] 모바일 헤드드 smoke 통과 (탭바·채팅 송신·크루 탭·큐 placeholder·hash sync 동작)
- [ ] 게스트 채팅 backend 허용 확인 (데스크탑 게스트 송신 200)
- [ ] GH 이슈 #340 진행 상황 코멘트
- [ ] 사용자에게 push/PR 트리거 요청

## 롤백

본 chunk 3 의 모든 commit 은 단일 PR 로 머지. 데스크탑 회귀 발견 시 전체 revert (partial revert 금지). 로컬 단계라면 `git reset --hard origin/development`.

## 다음 chunk

본 chunk 3 PR 머지 + dev/stg 안정화 후 chunk 4 (DJ + 큐잉) plan 작성. chunk 3 의 `TabBar` 큐 카운트 forward-evolution (chunk 4 에서 `useFetchDjingQueue` 결과 length 주입) 까지 chunk 4 가 책임.
