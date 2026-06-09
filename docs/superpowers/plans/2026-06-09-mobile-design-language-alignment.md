# 모바일 디자인 언어 통일 — 구현 계획

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** pfplay-web 모바일 웹 뷰의 시각 디자인 언어를 데스크탑(PF 아이콘·Galmuri·마퀴·패널 크롬·여백 리듬)으로 통일한다 — 레이아웃·데스크탑 렌더는 불변.

**Architecture:** 얇은 공용 프리미티브 2개(`TrackTitle`, `MobileSheetHeader`)를 먼저 추가/추출하고, 이를 화면(Room→Lobby→Sheets→Search)에 단계적으로 적용한다. 데스크탑 `VideoTitle`은 `TrackTitle`에 프레젠테이션을 위임하되 스토어/i18n 와이어링을 유지해 렌더 바이트 불변. 기존 단위 테스트가 회귀 가드.

**Tech Stack:** Next.js(App Router) · React · TypeScript · Tailwind · vitest + @testing-library/react · react-fast-marquee · Galmuri local font.

**스펙:** `docs/superpowers/specs/2026-06-09-mobile-design-language-alignment-design.md`
**브랜치:** `feature/mobile-design-language-alignment` (origin/development 분기)

---

## 공통 규약 (모든 Task)

- **JDK/도구 불필요** — 순수 프론트엔드. 명령은 레포 루트(`pfplay-web/`)에서 실행.
- **테스트:** `yarn test` (vitest run, co-located `*.test.tsx`). 단건: `yarn test src/<path>/<file>.test.tsx`.
- **타입:** `yarn test:type` (tsc --noEmit). **린트:** `yarn lint`.
- **아이콘 API:** PF 아이콘은 `SVGProps<SVGSVGElement>`, 기본 24×24, `fill='currentColor'`. 색은 부모 `text-*`, 크기는 `width`/`height` prop. import는 배럴 `@/shared/ui/icons`.
- **Typography:** `import { Typography } from '@/shared/ui/components/typography'`. `type` 토큰(`body3`/`detail2`/`caption1` 등). raw `<p>` 교체 시 동일 시각 토큰 선택.
- **여백 리듬(A5) 기준값:** 모바일 컨테이너 가로 = `px-5`(20px, `px-app` 모바일과 일치). 헤더 높이 = `h-14`(56px, fullscreen-sheet와 일치). 리스트 행 = `px-5 py-3`. 섹션 간 = `gap-3`/`pt-3`. **px 복사 아님 — 화면별 스크린샷으로 미세조정**(D5).
- **데스크탑 불변:** 데스크탑(`src/widgets/`, `src/features/`) 수정은 Task 1(VideoTitle 위임)뿐. 그 외 데스크탑 파일 0 수정.
- **커밋:** Task별 1커밋. 메시지 한글, 푸터 `Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>`. lint-staged(prettier+eslint) 자동 실행됨.
- **i18n 드리프트 금지:** 라벨을 raw→Typography로 옮길 때 텍스트/키 그대로. xlsx↔json 건드리지 말 것.

---

## Chunk 1: 공용 프리미티브 (Visual Kit)

### Task 1: `TrackTitle` 추출 (A2) + 데스크탑 `VideoTitle` 위임

데스크탑 `VideoTitle`의 프레젠테이션(Marquee + Typography + Galmuri)을 공용 `TrackTitle`로 추출. 데스크탑은 스토어/i18n을 유지한 채 위임 → 렌더 불변.

**Files:**

- Create: `src/shared/ui/components/track-title/track-title.component.tsx`
- Create: `src/shared/ui/components/track-title/index.ts`
- Create: `src/shared/ui/components/track-title/track-title.component.test.tsx`
- Modify: `src/widgets/partyroom-display-board/ui/parts/video-title.component.tsx`
- Guard(미수정 통과): `src/widgets/partyroom-display-board/ui/parts/video-title.component.test.tsx`

- [ ] **Step 1: TrackTitle 실패 테스트 작성**

`track-title.component.test.tsx`:

```tsx
import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, expect, test, vi } from 'vitest';

vi.mock('react-fast-marquee', () => ({
  __esModule: true,
  default: ({ children }: { children: React.ReactNode }) => (
    <div data-testid='marquee'>{children}</div>
  ),
}));
vi.mock('@/shared/ui/foundation/fonts', () => ({
  galmuriFont: { className: 'font-galmuri' },
}));

import TrackTitle from './track-title.component';

describe('TrackTitle', () => {
  test('name 있으면 Marquee 안에 곡명 + data-testid=video-title', () => {
    render(<TrackTitle name='Test Song' emptyText='없음' />);
    expect(screen.getByTestId('marquee')).toBeTruthy();
    const el = screen.getByTestId('video-title');
    expect(el.textContent).toBe('Test Song');
    expect(el.className).toMatch(/font-galmuri/);
  });

  test('name 없으면 emptyText + data-testid=video-title-empty (마퀴 없음)', () => {
    render(<TrackTitle emptyText='현재 DJ가 없습니다' />);
    expect(screen.queryByTestId('marquee')).toBeNull();
    const el = screen.getByTestId('video-title-empty');
    expect(el.textContent).toBe('현재 DJ가 없습니다');
    expect(el.className).toMatch(/font-galmuri/);
  });
});
```

- [ ] **Step 2: 실패 확인**

Run: `yarn test src/shared/ui/components/track-title/track-title.component.test.tsx`
Expected: FAIL — `Cannot find module './track-title.component'`.

- [ ] **Step 3: TrackTitle 구현**

`track-title.component.tsx` (데스크탑 `VideoTitle`의 현재 프레젠테이션을 1:1 복제):

```tsx
'use client';
import Marquee from 'react-fast-marquee';
import { cn } from '@/shared/lib/functions/cn';
import { Typography } from '@/shared/ui/components/typography';
import { galmuriFont } from '@/shared/ui/foundation/fonts';

interface Props {
  /** 곡명. 없으면 emptyText 렌더 */
  name?: string;
  /** 곡 없을 때 표시 문구 */
  emptyText: string;
  className?: string;
}

/**
 * 곡 제목 — Galmuri + 마퀴 프레젠테이션 (데스크탑 VideoTitle에서 추출).
 * 스토어/i18n 와이어링은 호출자(VideoTitle/now-playing) 책임. 본 컴포넌트는 순수 표시.
 */
export default function TrackTitle({ name, emptyText, className }: Props) {
  const typoClassName = cn(galmuriFont.className, 'text-white leading-none', className);

  if (!name) {
    return (
      <Typography type='caption1' className={typoClassName} data-testid='video-title-empty'>
        {emptyText}
      </Typography>
    );
  }
  return (
    <Marquee delay={4} speed={20} gradientWidth={0} className='z-0'>
      <Typography type='body3' className={typoClassName} data-testid='video-title'>
        {name}
      </Typography>
    </Marquee>
  );
}
```

`index.ts`:

```ts
export { default as TrackTitle } from './track-title.component';
```

- [ ] **Step 4: 통과 확인**

Run: `yarn test src/shared/ui/components/track-title/track-title.component.test.tsx`
Expected: PASS (2 tests).

- [ ] **Step 5: 데스크탑 VideoTitle을 TrackTitle 위임으로 전환**

`video-title.component.tsx` 전체 교체 (스토어/i18n 유지, 표시는 위임):

```tsx
import { useI18n } from '@/shared/lib/localization/i18n.context';
import { useStores } from '@/shared/lib/store/stores.context';
import { TrackTitle } from '@/shared/ui/components/track-title';

export default function VideoTitle() {
  const t = useI18n();
  const { useCurrentPartyroom } = useStores();
  const playback = useCurrentPartyroom((state) => state.playback);

  return <TrackTitle name={playback?.name} emptyText={t.dj.para.empty_dj} />;
}
```

- [ ] **Step 6: 데스크탑 회귀 테스트(미수정) 통과 확인**

Run: `yarn test src/widgets/partyroom-display-board/ui/parts/video-title.component.test.tsx`
Expected: PASS — 기존 테스트(빈 DJ 메시지 / Marquee+곡명) 무수정 통과. 통과 = 렌더 불변 1차 증명.

- [ ] **Step 7: 타입 체크**

Run: `yarn test:type`
Expected: 에러 0.

- [ ] **Step 8: 커밋**

```bash
git add src/shared/ui/components/track-title src/widgets/partyroom-display-board/ui/parts/video-title.component.tsx
git commit -m "feat(ui): TrackTitle 공용 컴포넌트 추출 — 데스크탑 VideoTitle 위임(렌더 불변)"
```

---

### Task 2: `MobileSheetHeader` 추출 (A3) + fullscreen-sheet 채택

`fullscreen-sheet`의 헤더 패턴(leading 슬롯 + 중앙 타이틀 + trailing 스페이서)을 공용 `MobileSheetHeader`로 추출. fullscreen-sheet가 먼저 채택해 재사용 검증.

**Files:**

- Create: `src/shared/ui/components/mobile-sheet-header/mobile-sheet-header.component.tsx`
- Create: `src/shared/ui/components/mobile-sheet-header/index.ts`
- Create: `src/shared/ui/components/mobile-sheet-header/mobile-sheet-header.component.test.tsx`
- Modify: `src/widgets-mobile/partyroom-djing-sheet/ui/fullscreen-sheet.component.tsx`
- Guard: `src/widgets-mobile/partyroom-djing-sheet/ui/fullscreen-sheet.component.test.tsx` (있으면 무수정 통과; 없으면 Step 7에서 fullscreen-sheet 동작 테스트 확인)

- [ ] **Step 1: MobileSheetHeader 실패 테스트 작성**

`mobile-sheet-header.component.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react';
import { describe, expect, test } from 'vitest';
import MobileSheetHeader from './mobile-sheet-header.component';

describe('MobileSheetHeader', () => {
  test('leading/title/trailing 슬롯 렌더 + title은 Typography', () => {
    render(
      <MobileSheetHeader
        leading={<button data-testid='lead'>L</button>}
        title='제목'
        trailing={<button data-testid='trail'>T</button>}
      />
    );
    expect(screen.getByTestId('lead')).toBeTruthy();
    expect(screen.getByTestId('trail')).toBeTruthy();
    expect(screen.getByText('제목')).toBeTruthy();
  });

  test('trailing 미지정 시에도 leading/title 정상 (대칭 스페이서 유지)', () => {
    const { container } = render(<MobileSheetHeader leading={<span>L</span>} title='T' />);
    expect(container.querySelector('header')).toBeTruthy();
    expect(screen.getByText('T')).toBeTruthy();
  });
});
```

- [ ] **Step 2: 실패 확인**

Run: `yarn test src/shared/ui/components/mobile-sheet-header/mobile-sheet-header.component.test.tsx`
Expected: FAIL — 모듈 없음.

- [ ] **Step 3: MobileSheetHeader 구현**

`mobile-sheet-header.component.tsx`:

```tsx
'use client';
import { FC, ReactNode, useId } from 'react';
import { cn } from '@/shared/lib/functions/cn';
import { Typography } from '@/shared/ui/components/typography';

interface Props {
  /** 좌측 액션 (뒤로/닫기 등). 없으면 대칭 스페이서로 폭 보존 */
  leading?: ReactNode;
  title?: string;
  /** 우측 액션 (메뉴 등). 없으면 대칭 스페이서 */
  trailing?: ReactNode;
  /** title element id 연결용 (dialog aria-labelledby) */
  titleId?: string;
  className?: string;
}

/**
 * 모바일 시트/룸 상단 표준 헤더 (spec A3).
 * 좌(leading) · 중앙 title(Typography) · 우(trailing) 3분할, 56px 높이, 하단 border-gray-800.
 * leading/trailing 미지정 측은 동일 폭 스페이서로 중앙 정렬 보존.
 */
const MobileSheetHeader: FC<Props> = ({ leading, title, trailing, titleId, className }) => {
  const autoId = useId();
  const id = titleId ?? autoId;
  return (
    <header
      className={cn(
        'shrink-0 flex items-center gap-3 px-3 h-14 border-b border-gray-800',
        className
      )}
    >
      <div className='w-10 flex items-center justify-start'>{leading}</div>
      {title && (
        <Typography id={id} type='body3' overflow='ellipsis' className='flex-1 text-center'>
          {title}
        </Typography>
      )}
      <div className='w-10 flex items-center justify-end'>{trailing}</div>
    </header>
  );
};

export default MobileSheetHeader;
```

`index.ts`:

```ts
export { default as MobileSheetHeader } from './mobile-sheet-header.component';
```

- [ ] **Step 4: 통과 확인**

Run: `yarn test src/shared/ui/components/mobile-sheet-header/mobile-sheet-header.component.test.tsx`
Expected: PASS (2 tests).

- [ ] **Step 5: fullscreen-sheet가 MobileSheetHeader 채택**

`fullscreen-sheet.component.tsx`의 `<header>...</header>` 블록(현 62~92행)을 교체. 기존 `data-testid`(`fullscreen-sheet-back`/`fullscreen-sheet-close`)·ref·focus·aria 동작 보존:

```tsx
import { MobileSheetHeader } from '@/shared/ui/components/mobile-sheet-header';
// ... (PFArrowLeft, PFClose import 유지)

// return JSX 내부, 기존 <header> 블록 대신:
<MobileSheetHeader
  titleId={title ? titleId : undefined}
  title={title}
  leading={
    onBack ? (
      <button
        ref={backRef}
        type='button'
        onClick={onBack}
        data-testid='fullscreen-sheet-back'
        aria-label='뒤로'
        className='p-2 -ml-2'
      >
        <PFArrowLeft width={24} height={24} />
      </button>
    ) : (
      <button
        ref={closeRef}
        type='button'
        onClick={onClose}
        data-testid='fullscreen-sheet-close'
        aria-label='닫기'
        className='p-2 -ml-2'
      >
        <PFClose width={24} height={24} />
      </button>
    )
  }
/>;
```

> 주: 기존 헤더의 `aria-labelledby={titleId}`는 dialog 컨테이너(`<div role='dialog'>`)에 그대로 두고, `MobileSheetHeader`에는 `titleId`를 넘겨 title element의 `id`만 연결한다. dialog div의 `aria-labelledby` 라인은 변경하지 않는다.

- [ ] **Step 6: fullscreen-sheet 회귀 확인**

Run: `yarn test src/widgets-mobile/partyroom-djing-sheet`
Expected: PASS — back/close testid·focus·scroll-lock 동작 유지. (해당 테스트가 없으면 Step 7로.)

- [ ] **Step 7: 타입 + 린트**

Run: `yarn test:type && yarn lint`
Expected: 에러 0.

- [ ] **Step 8: 커밋**

```bash
git add src/shared/ui/components/mobile-sheet-header src/widgets-mobile/partyroom-djing-sheet/ui/fullscreen-sheet.component.tsx
git commit -m "feat(ui): MobileSheetHeader 공용 컴포넌트 + fullscreen-sheet 채택(동작 보존)"
```

---

### Chunk 1 검증 게이트

- [ ] `yarn test` 전체 GREEN
- [ ] `yarn test:type` 클린
- [ ] `yarn lint` 클린
- [ ] **plan-document-reviewer 통과 후 다음 Chunk** (실행 시)

---

## Chunk 2: Room 적용 (전광판·탭바·채팅)

### Task 3: 룸 헤더 → MobileSheetHeader + PF 아이콘 (A1·A3)

`partyroom-display-board` 헤더(현 60~77행, ASCII ←/⋮ raw)를 `MobileSheetHeader` + `PFArrowLeft`/`PFMoreVert`로 교체.

**Files:**

- Modify: `src/widgets-mobile/partyroom-display-board/partyroom-display-board.component.tsx`
- Test: `src/widgets-mobile/partyroom-display-board/partyroom-display-board.component.test.tsx`

- [ ] **Step 1: 헤더 테스트 갱신/추가 (red)**

`partyroom-display-board.component.test.tsx`에 추가(또는 기존 헤더 단언 갱신). 뒤로 버튼은 `aria-label='뒤로'` 유지, 메뉴는 `aria-label='메뉴'` 유지. PF 아이콘 SVG 존재 단언:

```tsx
test('헤더: 뒤로 버튼 클릭 시 /parties 라우팅 + PF 아이콘 렌더', () => {
  const push = vi.fn();
  // 기존 next/navigation useRouter mock 의 push 를 캡처 (기존 패턴 따름)
  // ... render(<MobilePartyroomDisplayBoard partyroomId={1} />)
  const back = screen.getByRole('button', { name: '뒤로' });
  expect(back.querySelector('svg')).toBeTruthy(); // PFArrowLeft
  fireEvent.click(back);
  expect(push).toHaveBeenCalledWith('/parties');
  const menu = screen.getByRole('button', { name: '메뉴' });
  expect(menu.querySelector('svg')).toBeTruthy(); // PFMoreVert
});
```

> 기존 테스트 파일의 mock 셋업(react-player, next/navigation, stores)을 그대로 재사용. push mock 캡처 방식은 파일 상단 기존 패턴을 따른다.

- [ ] **Step 2: 실패 확인**

Run: `yarn test src/widgets-mobile/partyroom-display-board/partyroom-display-board.component.test.tsx`
Expected: FAIL — 현재 ASCII 텍스트라 `querySelector('svg')` null.

- [ ] **Step 3: 헤더 교체 구현**

import 추가: `import { MobileSheetHeader } from '@/shared/ui/components/mobile-sheet-header';` · `import { PFArrowLeft, PFMoreVert } from '@/shared/ui/icons';`

현 `<header className='flex items-center justify-between px-4 h-12'>...</header>` 블록 교체:

```tsx
<MobileSheetHeader
  title={partyroomTitle}
  leading={
    <button
      type='button'
      aria-label='뒤로'
      className='w-10 h-10 flex items-center justify-center text-gray-300'
      onClick={() => router.push('/parties')}
    >
      <PFArrowLeft width={24} height={24} />
    </button>
  }
  trailing={
    <button
      type='button'
      aria-label='메뉴'
      className='w-10 h-10 flex items-center justify-center text-gray-300'
    >
      <PFMoreVert width={24} height={24} />
    </button>
  }
/>
```

- [ ] **Step 4: 통과 확인**

Run: `yarn test src/widgets-mobile/partyroom-display-board/partyroom-display-board.component.test.tsx`
Expected: PASS.

- [ ] **Step 5: 커밋**

```bash
git add src/widgets-mobile/partyroom-display-board/partyroom-display-board.component.tsx src/widgets-mobile/partyroom-display-board/partyroom-display-board.component.test.tsx
git commit -m "feat(모바일): 룸 헤더 MobileSheetHeader + PF 아이콘(←/⋮ → PFArrowLeft/PFMoreVert)"
```

---

### Task 4: now-playing-meta → TrackTitle + PFHeadset (A1·A2·A5)

트랙명 raw `<p>` → `TrackTitle`, DJ 🎧 이모지 → `PFHeadset`, duration `<p>` → `Typography`.

**Files:**

- Modify: `src/widgets-mobile/partyroom-display-board/ui/parts/now-playing-meta.component.tsx`
- Test: `src/widgets-mobile/partyroom-display-board/ui/parts/now-playing-meta.component.test.tsx`

- [ ] **Step 1: 테스트 갱신 (red)**

상단에 marquee 모킹 추가(TrackTitle 내부 Marquee 때문):

```tsx
vi.mock('react-fast-marquee', () => ({
  __esModule: true,
  default: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));
vi.mock('@/shared/ui/foundation/fonts', () => ({ galmuriFont: { className: 'font-galmuri' } }));
```

`djNickname=null` 테스트의 `queryByText(/🎧/)` 단언을 PFHeadset 아이콘 부재로 갱신, DJ 존재 시 헤드셋 아이콘 존재 단언 추가:

```tsx
test('djNickname 있으면 헤드셋 아이콘 + 닉네임', () => {
  const { container } = render(
    <NowPlayingMeta layout='column' trackName='T' djNickname='DJ Alpha' duration='3:45' />
  );
  expect(screen.getByText(/DJ Alpha/)).toBeTruthy();
  expect(container.querySelector('[data-testid="now-playing-dj"] svg')).toBeTruthy();
});

test('djNickname=null 시 DJ 라인(헤드셋 포함) 미렌더', () => {
  render(<NowPlayingMeta layout='column' trackName='T' djNickname={null} duration='1:00' />);
  expect(screen.queryByTestId('now-playing-dj')).toBeNull();
});
```

기존 트랙명/duration/flex-col·flex-row/parent-token-부재 테스트는 유지(통과해야 함).

- [ ] **Step 2: 실패 확인**

Run: `yarn test src/widgets-mobile/partyroom-display-board/ui/parts/now-playing-meta.component.test.tsx`
Expected: FAIL — `now-playing-dj` testid·svg 없음.

- [ ] **Step 3: 구현**

import: `import { TrackTitle } from '@/shared/ui/components/track-title';` · `import { PFHeadset } from '@/shared/ui/icons';` · `import { Typography } from '@/shared/ui/components/typography';`

본문 `<div className={cn('flex', ...)}>` 내부 교체:

```tsx
<TrackTitle name={trackName} emptyText='' />;
{
  djNickname && (
    <span data-testid='now-playing-dj' className='flex items-center gap-1 text-gray-500 min-w-0'>
      <PFHeadset width={14} height={14} />
      <Typography type='caption2' overflow='ellipsis' className='text-gray-500'>
        {djNickname}
      </Typography>
    </span>
  );
}
<Typography type='caption2' className='text-gray-600 shrink-0'>
  {duration}
</Typography>;
```

> `TrackTitle`은 항상 name이 있는 컨텍스트(부모가 `playback` 존재 시에만 렌더)이므로 `emptyText=''`. 트랙명 표시 = `getByText('T')` 그대로 통과(Marquee mock이 children 렌더).

- [ ] **Step 4: 통과 확인**

Run: `yarn test src/widgets-mobile/partyroom-display-board/ui/parts/now-playing-meta.component.test.tsx`
Expected: PASS (전체).

- [ ] **Step 5: 커밋**

```bash
git add src/widgets-mobile/partyroom-display-board/ui/parts/now-playing-meta.component.tsx src/widgets-mobile/partyroom-display-board/ui/parts/now-playing-meta.component.test.tsx
git commit -m "feat(모바일): now-playing 트랙명 TrackTitle(Galmuri+마퀴) + DJ PFHeadset"
```

---

### Task 5: 탭바 리스타일 (A1·A4)

이모지 라벨 → PF 아이콘 + `Typography`, 활성 = 레드 + 언더라인 결.

**Files:**

- Modify: `src/widgets-mobile/partyroom-room-tabs/ui/parts/tab-bar.component.tsx`
- Test: `src/widgets-mobile/partyroom-room-tabs/ui/parts/tab-bar.component.test.tsx`

- [ ] **Step 1: 테스트 갱신 (red)**

`큐 라벨 toMatch(/🎧/)` → 헤드셋 svg + 카운트로 갱신, 채팅/크루도 아이콘 단언 추가. 카운트 textContent 단언은 유지:

```tsx
test('각 탭 PF 아이콘 + 카운트 렌더', () => {
  render(<TabBar activeTab='chat' crewCount={12} queueCount={4} onTabClick={vi.fn()} />);
  expect(screen.getByTestId('mobile-tab-chat').querySelector('svg')).toBeTruthy();
  const crew = screen.getByTestId('mobile-tab-crew');
  expect(crew.querySelector('svg')).toBeTruthy();
  expect(crew.textContent).toContain('12');
  const queue = screen.getByTestId('mobile-tab-queue');
  expect(queue.querySelector('svg')).toBeTruthy();
  expect(queue.textContent).toContain('4');
});

test('활성 탭은 레드 강조 클래스', () => {
  render(<TabBar activeTab='crew' crewCount={5} queueCount={0} onTabClick={vi.fn()} />);
  expect(screen.getByTestId('mobile-tab-crew').className).toMatch(/text-red-/);
});
```

기존 testid·aria-selected·onTabClick 테스트는 유지. `toMatch(/🎧/)` 단언은 제거(이모지 사라짐).

- [ ] **Step 2: 실패 확인**

Run: `yarn test src/widgets-mobile/partyroom-room-tabs/ui/parts/tab-bar.component.test.tsx`
Expected: FAIL — svg 없음 / text-red 없음.

- [ ] **Step 3: 구현**

import: `import { PFChatFilled, PFChatOutline, PFPersonFilled, PFPersonOutline, PFHeadset } from '@/shared/ui/icons';` · `import { Typography } from '@/shared/ui/components/typography';`

`TabButton`을 아이콘+카운트 구조로 변경. `label: string` prop → `icon: ReactNode` + `count?: number` + `text?: string`로 교체. 각 탭은 활성/비활성 아이콘 변형 사용:

```tsx
const TabBar: FC<Props> = ({ activeTab, crewCount, queueCount, onTabClick }) => (
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
      icon={
        activeTab === 'chat' ? (
          <PFChatFilled width={20} height={20} />
        ) : (
          <PFChatOutline width={20} height={20} />
        )
      }
      text='채팅'
      onClick={() => onTabClick('chat')}
    />
    <TabButton
      testId='mobile-tab-crew'
      active={activeTab === 'crew'}
      icon={
        activeTab === 'crew' ? (
          <PFPersonFilled width={20} height={20} />
        ) : (
          <PFPersonOutline width={20} height={20} />
        )
      }
      count={crewCount}
      onClick={() => onTabClick('crew')}
    />
    <TabButton
      testId='mobile-tab-queue'
      active={activeTab === 'queue'}
      icon={<PFHeadset width={20} height={20} />}
      count={queueCount}
      onClick={() => onTabClick('queue')}
    />
  </nav>
);

interface TabButtonProps {
  testId: string;
  active: boolean;
  icon: ReactNode;
  text?: string;
  count?: number;
  onClick: () => void;
}

const TabButton: FC<TabButtonProps> = ({ testId, active, icon, text, count, onClick }) => (
  <button
    type='button'
    data-testid={testId}
    role='tab'
    aria-selected={active}
    className={cn(
      'min-h-[44px] py-2 flex flex-col items-center justify-center gap-0.5',
      'border-t-2',
      active ? 'text-red-400 border-red-400' : 'text-gray-400 border-transparent'
    )}
    onClick={onClick}
  >
    {icon}
    <Typography type='caption2' className='leading-none'>
      {text ?? count}
    </Typography>
  </button>
);
```

(import `ReactNode` from 'react'. 활성 언더라인은 상단 border-t-2 레드로 구현 — 탭바가 하단 고정이라 상단 강조선이 자연스러움.)

- [ ] **Step 4: 통과 확인**

Run: `yarn test src/widgets-mobile/partyroom-room-tabs/ui/parts/tab-bar.component.test.tsx`
Expected: PASS (전체).

- [ ] **Step 5: 커밋**

```bash
git add src/widgets-mobile/partyroom-room-tabs/ui/parts/tab-bar.component.tsx src/widgets-mobile/partyroom-room-tabs/ui/parts/tab-bar.component.test.tsx
git commit -m "feat(모바일): 탭바 PF 아이콘 + Typography + 활성 레드 강조(이모지 제거)"
```

---

### Task 6: 채팅 패널 크롬/여백 정합 (A5)

채팅 패널은 이미 Typography·PFSend 사용. 여백 리듬만 기준값으로 정합(가로 `px-5`, 메시지 간격 일관).

**Files:**

- Modify: `src/widgets-mobile/partyroom-chat-panel/partyroom-chat-panel.component.tsx` (필요 시 `ui/parts/chat-item.component.tsx`)
- Test: 동일 디렉터리 기존 `*.test.tsx` (있으면)

- [ ] **Step 1: 현재 여백 확인** — `partyroom-chat-panel.component.tsx`의 `px-3`/`py-4` 등을 읽고 기준값(`px-5`)과의 차이 식별. (시각 변경만이라 테스트 단언 추가는 선택)
- [ ] **Step 2: 여백 클래스 정합** — 메시지 리스트/입력 영역 가로 패딩을 `px-5`로 통일. 색·구조 불변.
- [ ] **Step 3: 회귀 확인** — `yarn test src/widgets-mobile/partyroom-chat-panel` Expected: PASS (기존 동작 불변).
- [ ] **Step 4: 커밋**

```bash
git add src/widgets-mobile/partyroom-chat-panel
git commit -m "style(모바일): 채팅 패널 여백 리듬 정합(px-5)"
```

---

### Chunk 2 검증 게이트 (Room 단계)

- [ ] `yarn test` 전체 GREEN · `yarn test:type` · `yarn lint` 클린
- [ ] **로컬 풀스택 e2e 스크린샷 실측** — backend docker(:8080) + `npx next dev`(:3000) 기동 후
      `E2E_BASE_URL=http://localhost:3000 E2E_API_BASE=http://localhost:8080/api/ node scripts/capture-mobile-screens.mjs`
      로 룸 화면 캡처. 변경 전/후 비교(헤더·now-playing·탭바). 참조: `[[reference_pfplay_web_local_e2e_run]]`, `[[reference_pfplay_web_local_dev_http_webpack]]`(yarn dev 금지).
- [ ] **데스크탑 회귀 스크린샷** — 데스크탑 룸 화면 캡처해 VideoTitle 렌더 불변 육안 확인.
- [ ] plan-document-reviewer 통과 후 다음 Chunk (실행 시)

---

## Chunk 3: Lobby · Sheets · Search 적용

### Task 7: 로비 리스트/카드 여백·썸네일 정합 (A1·A5)

**Files:**

- Modify: `src/features-mobile/partyroom/list/partyroom-card.component.tsx`, `partyroom-list.component.tsx`, `src/features-mobile/partyroom/create/ui/card.component.tsx`
- Test: 동일 디렉터리 기존 `*.test.tsx`

- [ ] **Step 1: 현재 카드 구조/여백 확인** — partyroom-card는 이미 Typography·BackdropBlurContainer 사용(보존). 갭/패딩을 기준값으로 정합.
- [ ] **Step 2: 여백 리듬 정합** — 리스트 `gap`/카드 내부 패딩을 기준값(`px-5`/`gap-3`)으로 통일. 썸네일 비율은 스크린샷 보며 데스크탑 비례에 맞춤(예: 64×36→80×44, 화면 확인 후 확정).
- [ ] **Step 3: 회귀 확인** — `yarn test src/features-mobile/partyroom` Expected: PASS.
- [ ] **Step 4: 커밋**

```bash
git add src/features-mobile/partyroom
git commit -m "style(모바일): 로비 리스트/카드 여백 리듬·썸네일 비율 정합"
```

---

### Task 8: DJ/플레이리스트 시트 헤더·여백 정합 (A3·A5)

fullscreen-sheet는 Task 2에서 `MobileSheetHeader` 채택 완료. 시트 본문 리스트(playlists-management / playlist-detail)의 여백 리듬만 정합.

**Files:**

- Modify: `src/widgets-mobile/partyroom-djing-sheet/ui/playlists-management-sheet.component.tsx`, `playlist-detail-sheet.component.tsx`
- Test: 동일 디렉터리 기존 `*.test.tsx`

- [ ] **Step 1: 현재 리스트 여백 확인** — `px-4 py-4`/`divide-gray-800` 등 확인.
- [ ] **Step 2: 여백 정합** — 리스트 행 패딩을 기준값(`px-5 py-3`)으로 통일. divide/색 불변.
- [ ] **Step 3: 회귀 확인** — `yarn test src/widgets-mobile/partyroom-djing-sheet` Expected: PASS.
- [ ] **Step 4: 커밋**

```bash
git add src/widgets-mobile/partyroom-djing-sheet
git commit -m "style(모바일): DJ/플레이리스트 시트 리스트 여백 리듬 정합"
```

---

### Task 9: 검색 리스트 아이콘·여백 정합 (A1·A5)

ASCII ▶/+ → `PFPlayCircleFilled`/`PFAdd`.

**Files:**

- Modify: `src/features-mobile/playlist/add-tracks/ui/search-list-item.component.tsx` (필요 시 `music-search.component.tsx`)
- Test: `src/features-mobile/playlist/add-tracks/ui/search-list-item.component.test.tsx`

> ⚠️ 이 파일은 #394의 1차 수정(썸네일 추가, 커밋 `6694c6b`)도 건드림. **현 development 기준엔 썸네일 없음** — 최종 머지 시 충돌 가능(Chunk 4 게이트 R-merge 참조). 본 Task는 development 기준 현 구조(썸네일 없음)에 PF 아이콘 적용.

- [ ] **Step 1: 테스트 갱신 (red)** — 기존 testid(`search-item-preview-*`/`search-item-add-*`)·onPreview/onAdd/disabled 콜백 테스트는 유지. ▶/+ 텍스트 대신 아이콘 svg 존재 단언 추가:

```tsx
test('미리듣기/추가 버튼에 PF 아이콘 렌더', () => {
  render(
    <SearchListItem music={TRACK as never} onPreview={vi.fn()} onAdd={vi.fn()} addPending={false} />
  );
  expect(screen.getByTestId('search-item-preview-abc123').querySelector('svg')).toBeTruthy();
  expect(screen.getByTestId('search-item-add-abc123').querySelector('svg')).toBeTruthy();
});
```

- [ ] **Step 2: 실패 확인** — `yarn test src/features-mobile/playlist/add-tracks/ui/search-list-item.component.test.tsx` Expected: FAIL(svg 없음).
- [ ] **Step 3: 구현** — import `{ PFPlayCircleFilled, PFAdd } from '@/shared/ui/icons'`. `TextButton` children `▶`→`<PFPlayCircleFilled width={20} height={20} />`, `+`→`<PFAdd width={20} height={20} />`. aria-label·testid·disabled 유지. 행 패딩 `px-5`로.
- [ ] **Step 4: 통과 확인** — Expected: PASS.
- [ ] **Step 5: 커밋**

```bash
git add src/features-mobile/playlist/add-tracks/ui/search-list-item.component.tsx src/features-mobile/playlist/add-tracks/ui/search-list-item.component.test.tsx
git commit -m "feat(모바일): 검색 리스트 ASCII ▶/+ → PFPlayCircleFilled/PFAdd + 여백 정합"
```

---

### Chunk 3 검증 게이트

- [ ] `yarn test` 전체 GREEN · `yarn test:type` · `yarn lint` 클린
- [ ] 로컬 풀스택 e2e 스크린샷(로비·시트·검색) 변경 전/후 비교
- [ ] plan-document-reviewer 통과 후 마감 (실행 시)

---

## Chunk 4: 마감 & 최종 검증

### Task 10: 전체 회귀 + 스크린샷 일괄 + 정리

- [ ] **Step 1: 전체 단위 테스트** — `yarn test` Expected: 전체 GREEN.
- [ ] **Step 2: 타입** — `yarn test:type` Expected: 0.
- [ ] **Step 3: 린트** — `yarn lint` Expected: 0.
- [ ] **Step 4: 모바일 전체 스크린샷 재캡처** — `node scripts/capture-mobile-screens.mjs`(풀스택 기동 상태). 전 화면(룸·로비·시트·검색) 데스크탑 디자인 언어 정합 육안 확인.
- [ ] **Step 5: 데스크탑 회귀 육안** — 데스크탑 룸 전광판(VideoTitle) 렌더 불변 확인(Task 1 위임의 최종 증명).
- [ ] **Step 6: 스크린샷/스크립트 산출물 처리** — `mobile-screenshots/`·`.zip`은 .gitignore 추가(대용량 바이너리, 외주용). `scripts/capture-*.mjs`는 검증 도구로 커밋:

```bash
# .gitignore 에 mobile-screenshots/ 및 mobile-screenshots.zip 추가
git add .gitignore scripts/capture-mobile-screens.mjs scripts/capture-fixes.mjs scripts/capture-supplement.mjs
git commit -m "chore(모바일): 모바일 캡처 스크립트 추가 + 스크린샷 산출물 gitignore"
```

- [ ] **Step 7: 최종 커밋/정리** — 잔여 미커밋 없는지 `git status` 확인.

---

## 미해결 → 후속 (스펙 R 항목)

- **R-merge (search-list-item·partyroom-display-board 충돌):** #394와 본 브랜치가 같은 파일 일부를 건드림. **#394 머지 후** 본 브랜치를 development(머지 반영) 위로 rebase하고 겹치는 파일 충돌을 양쪽 보존으로 해소(썸네일 + PF 아이콘 둘 다). dev 머지 = 사용자 게이트.
- **프로필 폼 A5 (R1):** `features-mobile/profile/mobile-profile-edit-form`은 #394에서 생기는 파일 → #394 머지 후 후속 작업으로 라벨 Typography·여백 정합.
- **prod 배포 안 함** — dev 머지조차 사용자 게이트.

---

## 실행 핸드오프

저장 위치: `docs/superpowers/plans/2026-06-09-mobile-design-language-alignment.md`

**실행:** subagent 사용 가능 환경이면 superpowers:subagent-driven-development (Task별 fresh subagent + 2단계 리뷰). 각 Chunk 경계에서 검증 게이트 통과 후 다음 진행.
