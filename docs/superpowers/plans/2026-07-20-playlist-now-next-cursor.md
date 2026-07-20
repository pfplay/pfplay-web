# 플레이리스트 NOW/NEXT 커서 시안 반영 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 플레이리스트의 현재곡·다음곡 표시를 Figma 시안대로 바꾸고, 재생 중인 곡에 썸네일 이퀄라이저와 타이틀 마퀴 모션을 넣는다.

**Architecture:** NOW/NEXT 배지 마크업이 데스크탑(`track.component.tsx`)과 모바일(`playlist-detail-sheet.component.tsx`) 두 곳에 복붙돼 있다(#453). 이를 `shared/ui/components/track-cursor/` 공용 컴포넌트로 추출해 한 번만 고치면 세 뷰가 함께 바뀌게 한다. 배지는 타이틀 위 인라인에서 행 우측으로 이동한다.

**Tech Stack:** React 18 · Next.js App Router · Tailwind(`shared/ui/foundation/theme.ts`의 keyframes 확장) · react-fast-marquee(이미 설치) · vitest + @testing-library/react

## Global Constraints

- 배지 문구는 양 언어 모두 `NOW` / `NEXT` 고정 (ko 사전의 "재생 중"·"다음 곡"을 교체)
- 배지는 데스크탑·시네마에서 ⋮ 메뉴 버튼을 **대체**한다. 모바일 시트에서는 ✕ 삭제 버튼 **왼쪽**에 둔다
- 마퀴는 NOW 곡에만, 제목 길이와 무관하게 항상 흐른다
- 어떤 곡이 NOW/NEXT인지 판정하는 규칙(`resolveNextTrackId`, `nowTrackId`)은 #453에서 확정 — **건드리지 않는다**
- 드래그 정렬·메뉴 구조는 건드리지 않는다
- 새 npm 의존성 금지. 애니메이션은 `theme.ts` keyframes로 정의한다
- `prefers-reduced-motion: reduce`에서 마퀴·이퀄라이저 모두 정지
- 기존 `data-testid` `track-badge-now` / `track-badge-next`는 유지 (모바일 테스트가 의존)

---

### Task 1: 배지 문구 교체 + 공용 CursorBadge 추출

배지 스타일을 한 곳으로 모으고 문구를 NOW/NEXT로 바꾼다. 위치 이동은 Task 3·4에서 한다 — 이 태스크는 "같은 자리에 같은 모양, 출처만 공용"이 목표라 독립 검증된다.

**Files:**

- Create: `src/shared/ui/components/track-cursor/cursor-badge.component.tsx`
- Create: `src/shared/ui/components/track-cursor/index.ts`
- Test: `src/shared/ui/components/track-cursor/cursor-badge.component.test.tsx`
- Modify: `src/shared/lib/localization/dictionaries/ko.json:311-312`
- Modify: `src/shared/lib/localization/dictionaries/en.json:311-312`
- Modify: `src/features/playlist/list-tracks/ui/track.component.tsx:78-88`
- Modify: `src/widgets-mobile/partyroom-djing-sheet/ui/playlist-detail-sheet.component.tsx:66-76`
- Modify: `src/features/playlist/list-tracks/ui/track.component.test.tsx:31-32`
- Modify: `src/widgets-mobile/partyroom-djing-sheet/ui/playlist-detail-sheet.component.test.tsx:100,110`

**Interfaces:**

- Consumes: 없음
- Produces: `CursorBadge` — `({ variant: 'now' | 'next', label: string, className?: string }) => JSX.Element`. Task 3·4가 이 시그니처로 호출한다. `label`은 호출자가 i18n에서 넣는다(컴포넌트는 순수 표시).

- [ ] **Step 1: 실패하는 테스트 작성**

`src/shared/ui/components/track-cursor/cursor-badge.component.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react';
import { describe, expect, test } from 'vitest';
import CursorBadge from './cursor-badge.component';

describe('CursorBadge', () => {
  test('variant=now 면 now testid 로 렌더하고 라벨을 표시한다', () => {
    render(<CursorBadge variant='now' label='NOW' />);
    const badge = screen.getByTestId('track-badge-now');
    expect(badge).toHaveTextContent('NOW');
    expect(screen.queryByTestId('track-badge-next')).not.toBeInTheDocument();
  });

  test('variant=next 면 next testid 로 렌더한다', () => {
    render(<CursorBadge variant='next' label='NEXT' />);
    expect(screen.getByTestId('track-badge-next')).toHaveTextContent('NEXT');
    expect(screen.queryByTestId('track-badge-now')).not.toBeInTheDocument();
  });

  test('now 와 next 의 배경색이 다르다', () => {
    const { unmount } = render(<CursorBadge variant='now' label='NOW' />);
    expect(screen.getByTestId('track-badge-now').className).toContain('bg-red-300');
    unmount();

    render(<CursorBadge variant='next' label='NEXT' />);
    expect(screen.getByTestId('track-badge-next').className).toContain('bg-gray-600');
  });

  test('className 을 덧붙일 수 있다', () => {
    render(<CursorBadge variant='now' label='NOW' className='ml-2' />);
    expect(screen.getByTestId('track-badge-now').className).toContain('ml-2');
  });
});
```

- [ ] **Step 2: 테스트 실패 확인**

Run: `yarn test src/shared/ui/components/track-cursor`
Expected: FAIL — `Failed to resolve import "./cursor-badge.component"`

- [ ] **Step 3: 컴포넌트 구현**

`src/shared/ui/components/track-cursor/cursor-badge.component.tsx`:

```tsx
import { cn } from '@/shared/lib/functions/cn';

type Props = {
  variant: 'now' | 'next';
  /** 표시 문구. i18n 조회는 호출자 책임 — 본 컴포넌트는 순수 표시. */
  label: string;
  className?: string;
};

/**
 * 현재곡·다음곡 커서 배지 (#462 시안).
 *
 * 데스크탑·시네마에서는 ⋮ 메뉴 자리를 대체하고, 모바일 시트에서는 ✕ 왼쪽에 붙는다.
 * 배치는 호출자가 className 으로 정한다.
 */
const CursorBadge = ({ variant, label, className }: Props) => (
  <span
    data-testid={variant === 'now' ? 'track-badge-now' : 'track-badge-next'}
    className={cn(
      'inline-flex shrink-0 items-center rounded-full px-2 py-[3px] text-[11px] font-bold leading-[14px]',
      variant === 'now' ? 'bg-red-300 text-white' : 'bg-gray-600 text-gray-100',
      className
    )}
  >
    {label}
  </span>
);

export default CursorBadge;
```

`src/shared/ui/components/track-cursor/index.ts`:

```ts
export { default as CursorBadge } from './cursor-badge.component';
```

- [ ] **Step 4: 테스트 통과 확인**

Run: `yarn test src/shared/ui/components/track-cursor`
Expected: PASS — 4 tests

- [ ] **Step 5: i18n 문구 교체**

`src/shared/lib/localization/dictionaries/ko.json` 311-312행:

```json
      "now_playing": "NOW",
      "next_up": "NEXT"
```

`src/shared/lib/localization/dictionaries/en.json` 311-312행:

```json
      "now_playing": "NOW",
      "next_up": "NEXT"
```

- [ ] **Step 6: 두 호출부를 CursorBadge 로 교체**

`src/features/playlist/list-tracks/ui/track.component.tsx` — 78-88행의 `<span>` 블록을 아래로 교체:

```tsx
{
  (isNow || isNext) && (
    <CursorBadge
      variant={isNow ? 'now' : 'next'}
      label={isNow ? t.playlist.para.now_playing : t.playlist.para.next_up}
      className='mb-0.5 w-fit'
    />
  );
}
```

import 추가 (기존 `Typography` import 아래):

```tsx
import { CursorBadge } from '@/shared/ui/components/track-cursor';
```

`src/widgets-mobile/partyroom-djing-sheet/ui/playlist-detail-sheet.component.tsx` — 66-76행의 `<span>` 블록을 아래로 교체:

```tsx
{
  (isNow || isNext) && (
    <CursorBadge
      variant={isNow ? 'now' : 'next'}
      label={isNow ? t.playlist.para.now_playing : t.playlist.para.next_up}
      className='mb-0.5 w-fit'
    />
  );
}
```

import 추가:

```tsx
import { CursorBadge } from '@/shared/ui/components/track-cursor';
```

- [ ] **Step 7: 기존 테스트의 라벨 상수 갱신**

`src/features/playlist/list-tracks/ui/track.component.test.tsx` 31-32행:

```tsx
const NOW_LABEL = 'NOW';
const NEXT_LABEL = 'NEXT';
```

`src/widgets-mobile/partyroom-djing-sheet/ui/playlist-detail-sheet.component.test.tsx` 는 **두 곳**을 고쳐야 한다. 이 파일은 i18n 을 인라인 팩토리로 mock 하므로, 사전 파일만 바꾸면 컴포넌트는 여전히 mock 값('재생 중')을 받아 테스트가 깨진다.

16행 — mock 값:

```tsx
    playlist: { para: { now_playing: 'NOW', next_up: 'NEXT' } },
```

100행·110행 — 기대 문자열:

```tsx
expect(screen.getByTestId('track-badge-now')).toHaveTextContent('NOW');
```

```tsx
expect(screen.getByTestId('track-badge-next')).toHaveTextContent('NEXT');
```

- [ ] **Step 8: 전체 테스트 통과 확인**

Run: `yarn test src/shared/ui/components/track-cursor src/features/playlist src/widgets-mobile/partyroom-djing-sheet`
Expected: PASS — 기존 배지 테스트가 새 문구로 통과

- [ ] **Step 9: 커밋**

```bash
git add src/shared/ui/components/track-cursor src/shared/lib/localization/dictionaries src/features/playlist/list-tracks/ui/track.component.tsx src/features/playlist/list-tracks/ui/track.component.test.tsx src/widgets-mobile/partyroom-djing-sheet/ui/playlist-detail-sheet.component.tsx src/widgets-mobile/partyroom-djing-sheet/ui/playlist-detail-sheet.component.test.tsx
git commit -m "refactor(playlist): NOW/NEXT 배지를 공용 컴포넌트로 추출하고 문구 통일 #462"
```

---

### Task 2: 이퀄라이저 인디케이터 (PlayingBars)

재생 중 썸네일 위에 올릴 막대 애니메이션. 새 의존성 없이 Tailwind keyframes로 만든다.

**Files:**

- Modify: `src/shared/ui/foundation/theme.ts:60-69`
- Create: `src/shared/ui/components/track-cursor/playing-bars.component.tsx`
- Modify: `src/shared/ui/components/track-cursor/index.ts`
- Modify: `src/shared/ui/foundation/globals.css`
- Test: `src/shared/ui/components/track-cursor/playing-bars.component.test.tsx`

**Interfaces:**

- Consumes: Task 1의 `track-cursor` 디렉터리
- Produces: `PlayingBars` — `({ className?: string }) => JSX.Element`. Task 3·4가 썸네일 래퍼 안에 `absolute inset-0`으로 얹는다. `aria-hidden='true'`가 컴포넌트 내부에 이미 붙어 있어 호출자가 신경 쓸 필요 없다.

- [ ] **Step 1: 실패하는 테스트 작성**

`src/shared/ui/components/track-cursor/playing-bars.component.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react';
import { describe, expect, test } from 'vitest';
import PlayingBars from './playing-bars.component';

describe('PlayingBars', () => {
  test('막대 4개를 렌더한다', () => {
    render(<PlayingBars />);
    expect(screen.getByTestId('playing-bars').children).toHaveLength(4);
  });

  test('스크린리더에서 감춘다 — 상태는 배지 텍스트가 전달한다', () => {
    render(<PlayingBars />);
    expect(screen.getByTestId('playing-bars')).toHaveAttribute('aria-hidden', 'true');
  });

  test('각 막대의 애니메이션 지연이 서로 달라 파형이 어긋난다', () => {
    render(<PlayingBars />);
    const delays = Array.from(screen.getByTestId('playing-bars').children).map(
      (bar) => (bar as HTMLElement).style.animationDelay
    );
    expect(new Set(delays).size).toBe(4);
  });

  test('reduced-motion 에서 애니메이션이 꺼지도록 motion-reduce 유틸을 단다', () => {
    render(<PlayingBars />);
    const firstBar = screen.getByTestId('playing-bars').children[0] as HTMLElement;
    expect(firstBar.className).toContain('motion-reduce:animate-none');
  });
});
```

- [ ] **Step 2: 테스트 실패 확인**

Run: `yarn test src/shared/ui/components/track-cursor/playing-bars`
Expected: FAIL — `Failed to resolve import "./playing-bars.component"`

- [ ] **Step 3: theme.ts 에 keyframes 추가**

`src/shared/ui/foundation/theme.ts` — 기존 `animation`·`keyframes` 블록(60-69행)을 아래로 교체:

```ts
  animation: {
    loading: 'loading 2s infinite',
    equalizer: 'equalizer 0.9s ease-in-out infinite alternate',
  },
  keyframes: {
    loading: {
      '0%': { transform: 'rotateZ(0deg)' },
      '50%': { transform: 'rotateZ(480deg)' },
      '100%': { transform: 'rotateZ(1080deg)' },
    },
    equalizer: {
      '0%': { transform: 'scaleY(0.3)' },
      '100%': { transform: 'scaleY(1)' },
    },
  },
```

- [ ] **Step 4: 컴포넌트 구현**

`src/shared/ui/components/track-cursor/playing-bars.component.tsx`:

```tsx
import { cn } from '@/shared/lib/functions/cn';

/** 막대별 시작 지연 — 전부 다르게 줘야 파형이 어긋나 살아 있어 보인다. */
const BAR_DELAYS = ['0ms', '150ms', '300ms', '450ms'];

type Props = {
  className?: string;
};

/**
 * 재생 중 썸네일 위에 얹는 이퀄라이저 (#462 시안).
 *
 * 썸네일을 어둡게 깔고 흰 막대가 위아래로 뛴다.
 * 상태 전달은 CursorBadge 텍스트가 하므로 여기선 aria-hidden.
 */
const PlayingBars = ({ className }: Props) => (
  <div
    data-testid='playing-bars'
    aria-hidden='true'
    className={cn('flexRowCenter gap-[3px] bg-black/50', className)}
  >
    {BAR_DELAYS.map((delay) => (
      <span
        key={delay}
        style={{ animationDelay: delay }}
        className='w-[3px] h-3 origin-center rounded-full bg-white animate-equalizer motion-reduce:animate-none'
      />
    ))}
  </div>
);

export default PlayingBars;
```

`src/shared/ui/components/track-cursor/index.ts` 를 아래로 교체:

```ts
export { default as CursorBadge } from './cursor-badge.component';
export { default as PlayingBars } from './playing-bars.component';
```

- [ ] **Step 5: 마퀴 reduced-motion 전역 규칙 추가**

react-fast-marquee는 내부 `.rfm-marquee` 에 CSS 애니메이션을 건다. JS 훅을 새로 만드는 대신 전역 CSS 한 블록으로 앱 전체 마퀴(전광판 포함)를 함께 처리한다.

`src/shared/ui/foundation/globals.css` 맨 끝에 추가:

```css
/* 모션 최소화 설정에서는 마퀴를 멈춘다. react-fast-marquee 내부 클래스 대상. */
@media (prefers-reduced-motion: reduce) {
  .rfm-marquee {
    animation: none !important;
  }
}
```

- [ ] **Step 6: 테스트 통과 확인**

Run: `yarn test src/shared/ui/components/track-cursor/playing-bars`
Expected: PASS — 4 tests

- [ ] **Step 7: 커밋**

```bash
git add src/shared/ui/foundation/theme.ts src/shared/ui/foundation/globals.css src/shared/ui/components/track-cursor
git commit -m "feat(playlist): 재생 중 이퀄라이저 인디케이터 추가 #462"
```

---

### Task 3: 데스크탑·시네마 행 배치 변경

배지를 ⋮ 자리로 옮기고, NOW 곡에 썸네일 오버레이와 타이틀 마퀴를 건다.

**Files:**

- Modify: `src/features/playlist/list-tracks/ui/track.component.tsx`
- Modify: `src/features/playlist/list-tracks/ui/track.component.test.tsx`

**Interfaces:**

- Consumes: Task 1의 `CursorBadge`, Task 2의 `PlayingBars`
- Produces: 없음 (`Track`의 props 시그니처는 그대로 — `isNow`·`isNext` 유지)

- [ ] **Step 1: 실패하는 테스트 작성**

`src/features/playlist/list-tracks/ui/track.component.test.tsx` 파일 상단 mock 블록에 마퀴 mock 추가 (기존 `vi.mock('@/shared/ui/components/icon-menu', ...)` 바로 아래):

```tsx
vi.mock('react-fast-marquee', () => ({
  default: ({ children }: { children: React.ReactNode }) => (
    <div data-testid='marquee'>{children}</div>
  ),
}));
```

파일 맨 끝에 describe 블록 추가:

```tsx
describe('Track NOW/NEXT 배치 (#462)', () => {
  test('isNow=true 면 ⋮ 메뉴 대신 배지가 자리를 차지한다', () => {
    render(<Track track={track} menuItems={[]} isNow />);
    expect(screen.getByTestId('track-badge-now')).toBeInTheDocument();
    expect(screen.queryByTestId('icon-menu')).not.toBeInTheDocument();
  });

  test('isNext=true 면 ⋮ 메뉴 대신 배지가 자리를 차지한다', () => {
    render(<Track track={track} menuItems={[]} isNext />);
    expect(screen.getByTestId('track-badge-next')).toBeInTheDocument();
    expect(screen.queryByTestId('icon-menu')).not.toBeInTheDocument();
  });

  test('일반 곡은 ⋮ 메뉴를 그대로 보여준다', () => {
    render(<Track track={track} menuItems={[]} />);
    expect(screen.getByTestId('icon-menu')).toBeInTheDocument();
  });

  test('isNow=true 면 타이틀이 마퀴로 흐르고 이퀄라이저가 뜬다', () => {
    render(<Track track={track} menuItems={[]} isNow />);
    expect(screen.getByTestId('marquee')).toBeInTheDocument();
    expect(screen.getByTestId('playing-bars')).toBeInTheDocument();
  });

  test('isNext=true 면 마퀴도 이퀄라이저도 없다 — NOW 전용 모션', () => {
    render(<Track track={track} menuItems={[]} isNext />);
    expect(screen.queryByTestId('marquee')).not.toBeInTheDocument();
    expect(screen.queryByTestId('playing-bars')).not.toBeInTheDocument();
  });

  test('일반 곡은 마퀴 없이 제목을 그대로 렌더한다', () => {
    render(<Track track={track} menuItems={[]} />);
    expect(screen.queryByTestId('marquee')).not.toBeInTheDocument();
    expect(screen.getByText('My Song')).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: 테스트 실패 확인**

Run: `yarn test src/features/playlist/list-tracks/ui/track.component`
Expected: FAIL — `isNow=true 면 ⋮ 메뉴 대신...`에서 `icon-menu`가 아직 렌더됨

- [ ] **Step 3: 컴포넌트 구현**

`src/features/playlist/list-tracks/ui/track.component.tsx` 전체를 아래로 교체:

```tsx
'use client';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import Marquee from 'react-fast-marquee';
import { convertPlaylistTrackToPreview } from '@/entities/music-preview';
import { ThumbnailWithPreview } from '@/entities/music-preview/index.ui';
import { usePlaylistLayerZIndex } from '@/entities/ui-state';
import { PlaylistTrack } from '@/shared/api/http/types/playlists';
import { cn } from '@/shared/lib/functions/cn';
import { useI18n } from '@/shared/lib/localization/i18n.context';
import { useStores } from '@/shared/lib/store/stores.context';
import { IconMenu } from '@/shared/ui/components/icon-menu';
import { MenuItem } from '@/shared/ui/components/menu';
import { CursorBadge, PlayingBars } from '@/shared/ui/components/track-cursor';
import { Typography } from '@/shared/ui/components/typography';
import { PFDragAndDrop, PFMoreVert } from '@/shared/ui/icons';

type TrackProps = {
  track: PlaylistTrack;
  menuItems: MenuItem[];
  isOverRoomLimit?: boolean;
  /** 지금 재생 중(CurrentDJ 본인 한정, 방 안). NOW 배지 + 모션. */
  isNow?: boolean;
  /** 내가 다음에 디제잉하면 시작될 곡. NEXT 배지. */
  isNext?: boolean;
};

const Track = ({
  track,
  menuItems,
  isOverRoomLimit = false,
  isNow = false,
  isNext = false,
}: TrackProps) => {
  const t = useI18n();
  const cinemaView = useStores().useUIState((s) => s.cinemaView);
  const layerZIndex = usePlaylistLayerZIndex();
  const menuZIndex = cinemaView ? layerZIndex + 1 : undefined;
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({
    id: track.linkId,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  // 미리보기용 트랙 데이터 변환
  const previewTrack = convertPlaylistTrackToPreview(track);

  // 커서가 붙은 행은 배지가 ⋮ 자리를 대체한다 (#462 시안).
  const hasCursor = isNow || isNext;

  return (
    <div
      ref={setNodeRef}
      className={cn(
        'relative grid grid-cols-[24px_1fr_auto] items-center gap-2 cursor-default',
        isOverRoomLimit && 'opacity-50'
      )}
      style={style}
      {...attributes}
    >
      <div className='flexRowCenter w-6 h-6 cursor-grab' {...listeners}>
        <PFDragAndDrop />
      </div>

      <div className='relative w-full flexRow justify-start rounded gap-[12px] overflow-hidden select-none'>
        {/* 미리보기 기능이 통합된 썸네일 */}
        <div className='relative shrink-0 pointer-events-auto'>
          <ThumbnailWithPreview
            previewTrack={previewTrack}
            thumbnailSrc={track.thumbnailImage ?? '/images/ETC/PlaylistThumbnail.png'}
            thumbnailAlt={track.name}
            width={80}
            height={44}
            className='w-[80px] h-[44px] bg-gray-600'
            imageClassName={cn('w-full h-full object-contain select-none')}
          />
          {isNow && <PlayingBars className='absolute inset-0 pointer-events-none' />}
        </div>

        <div className='flex-1 min-w-0 select-none flexCol overflow-hidden pointer-events-none'>
          {/* 배지가 우측에 떠 있어 흐르는 제목이 그 아래로 지나간다 → 우측 페이드로 가린다. */}
          <div
            className={cn(
              'min-w-0',
              hasCursor && '[mask-image:linear-gradient(to_right,black_70%,transparent)]'
            )}
          >
            {isNow ? (
              <Marquee delay={2} speed={20} gradientWidth={0}>
                <Typography type='caption1' className='text-gray-50 pr-8'>
                  {track.name}
                </Typography>
              </Marquee>
            ) : (
              <Typography type='caption1' overflow='ellipsis' className='text-gray-50'>
                {track.name}
              </Typography>
            )}
          </div>
          <Typography type='caption1' className='text-gray-400'>
            {track.duration}
          </Typography>
          {isOverRoomLimit && (
            <Typography type='caption1' overflow='ellipsis' className='text-red-300'>
              {t.dj.para.not_playable_in_room}
            </Typography>
          )}
        </div>
      </div>

      <div className='shrink-0'>
        {hasCursor ? (
          <CursorBadge
            variant={isNow ? 'now' : 'next'}
            label={isNow ? t.playlist.para.now_playing : t.playlist.para.next_up}
          />
        ) : (
          <IconMenu
            MenuButtonIcon={<PFMoreVert />}
            menuItemConfig={menuItems}
            menuZIndex={menuZIndex}
          />
        )}
      </div>
    </div>
  );
};

export default Track;
```

- [ ] **Step 4: 테스트 통과 확인**

Run: `yarn test src/features/playlist/list-tracks/ui/track.component`
Expected: PASS — 기존 배지 테스트 + 신규 6건

- [ ] **Step 5: 커밋**

```bash
git add src/features/playlist/list-tracks/ui/track.component.tsx src/features/playlist/list-tracks/ui/track.component.test.tsx
git commit -m "feat(playlist): 데스크탑·시네마 커서 배치를 시안대로 변경 #462"
```

---

### Task 4: 모바일 디제잉 시트 적용

모바일은 ⋮가 없고 ✕ 삭제 버튼이 있다. 배지를 ✕ 왼쪽으로 옮기고 같은 모션을 건다.

**Files:**

- Modify: `src/widgets-mobile/partyroom-djing-sheet/ui/playlist-detail-sheet.component.tsx:59-90`
- Modify: `src/widgets-mobile/partyroom-djing-sheet/ui/playlist-detail-sheet.component.test.tsx`

**Interfaces:**

- Consumes: Task 1의 `CursorBadge`, Task 2의 `PlayingBars`
- Produces: 없음

- [ ] **Step 1: 실패하는 테스트 작성**

`playlist-detail-sheet.component.test.tsx` 상단 mock 블록에 추가:

```tsx
vi.mock('react-fast-marquee', () => ({
  default: ({ children }: { children: React.ReactNode }) => (
    <div data-testid='marquee'>{children}</div>
  ),
}));
```

파일 맨 끝에 추가:

기존 커서 테스트(94-110행)와 같은 방식으로 상태를 주입한다 — `storeState` 로 CurrentDJ 여부를, `useFetchPlaylistTracksMock` 으로 커서를 준다. 새 헬퍼를 만들지 말 것. 이 describe 는 파일 맨 끝, 기존 `describe('PlaylistDetailSheet', ...)` **바깥**에 둔다.

```tsx
describe('모바일 시트 커서 배치 (#462)', () => {
  beforeEach(() => {
    storeState = {};
  });

  test('NOW 곡도 삭제 버튼을 유지한다 — 배지가 ✕ 를 밀어내지 않는다', () => {
    storeState = { me: { crewId: 5 }, currentDj: { crewId: 5 } };
    useFetchPlaylistTracksMock.mockReturnValue({
      data: { content: [TRACK], lastPlayedTrackId: 11 },
    });
    render(<PlaylistDetailSheet playlist={PL as never} />);

    expect(screen.getByTestId('track-badge-now')).toBeInTheDocument();
    expect(screen.getByTestId('detail-track-remove-11')).toBeInTheDocument();
  });

  test('NOW 곡에 마퀴와 이퀄라이저가 붙는다', () => {
    storeState = { me: { crewId: 5 }, currentDj: { crewId: 5 } };
    useFetchPlaylistTracksMock.mockReturnValue({
      data: { content: [TRACK], lastPlayedTrackId: 11 },
    });
    render(<PlaylistDetailSheet playlist={PL as never} />);

    expect(screen.getByTestId('marquee')).toBeInTheDocument();
    expect(screen.getByTestId('playing-bars')).toBeInTheDocument();
  });

  test('NEXT 곡에는 모션이 없다', () => {
    storeState = { me: { crewId: 5 }, currentDj: { crewId: 9 } };
    useFetchPlaylistTracksMock.mockReturnValue({
      data: { content: [TRACK], lastPlayedTrackId: 11 },
    });
    render(<PlaylistDetailSheet playlist={PL as never} />);

    expect(screen.getByTestId('track-badge-next')).toBeInTheDocument();
    expect(screen.queryByTestId('playing-bars')).not.toBeInTheDocument();
    expect(screen.queryByTestId('marquee')).not.toBeInTheDocument();
  });
});
```

- [ ] **Step 2: 테스트 실패 확인**

Run: `yarn test src/widgets-mobile/partyroom-djing-sheet`
Expected: FAIL — `playing-bars` 를 찾지 못함

- [ ] **Step 3: 구현**

`playlist-detail-sheet.component.tsx` 59-90행의 `<li>` 블록을 아래로 교체:

```tsx
<li key={track.trackId} className='flex items-center gap-3 px-5 py-3'>
  <div className='relative shrink-0'>
    <img
      src={track.thumbnailImage ?? '/images/ETC/PlaylistThumbnail.png'}
      alt={track.name}
      className='w-[64px] h-[36px] rounded object-cover bg-gray-700'
    />
    {isNow && <PlayingBars className='absolute inset-0 rounded' />}
  </div>
  <div className='flex-1 min-w-0 flex flex-col'>
    <div
      className={cn(
        'min-w-0',
        isNow && '[mask-image:linear-gradient(to_right,black_70%,transparent)]'
      )}
    >
      {isNow ? (
        <Marquee delay={2} speed={20} gradientWidth={0}>
          <Typography type='caption1' className='text-gray-50 pr-8'>
            {track.name}
          </Typography>
        </Marquee>
      ) : (
        <Typography type='caption1' className='min-w-0 truncate text-gray-50'>
          {track.name}
        </Typography>
      )}
    </div>
  </div>
  {(isNow || isNext) && (
    <CursorBadge
      variant={isNow ? 'now' : 'next'}
      label={isNow ? t.playlist.para.now_playing : t.playlist.para.next_up}
    />
  )}
  <button
    type='button'
    data-testid={`detail-track-remove-${track.trackId}`}
    onClick={() => removeTrack({ playlistId: playlist.id, trackId: track.trackId })}
    className='shrink-0 px-2 py-1 text-gray-400'
    aria-label={t.partyroom.queue.remove_track_label}
  >
    <PFClose width={20} height={20} aria-hidden='true' />
  </button>
</li>
```

import 추가 (Task 1에서 이미 `CursorBadge` 를 넣었으므로 그 줄을 확장):

```tsx
import Marquee from 'react-fast-marquee';
import { CursorBadge, PlayingBars } from '@/shared/ui/components/track-cursor';
```

- [ ] **Step 4: 테스트 통과 확인**

Run: `yarn test src/widgets-mobile/partyroom-djing-sheet`
Expected: PASS — 기존 배지 테스트 + 신규 3건

- [ ] **Step 5: 전체 검증**

Run: `yarn test && yarn test:type && yarn lint`
Expected: 전부 통과

- [ ] **Step 6: 커밋**

```bash
git add src/widgets-mobile/partyroom-djing-sheet
git commit -m "feat(playlist): 모바일 시트 커서 배치를 시안대로 변경 #462"
```

---

## 완료 후 수동 검증

자동 테스트는 마크업 구조만 본다. 아래는 사람이 눈으로 봐야 한다.

1. `yarn dev` → 데스크탑에서 방 입장 → 내 플레이리스트 열기
   - 재생 중인 곡: 썸네일 막대가 뛰는지, 제목이 흐르는지, 우측 NOW 배지가 ⋮ 자리에 있는지
   - 다음 곡: NEXT 배지만, 모션 없는지
2. 시네마 뷰 전환 → 같은 목록에서 레이아웃이 깨지지 않는지 (배지 z-index가 드로어에 가리지 않는지)
3. 모바일 뷰포트 → 디제잉 시트 → 배지와 ✕ 가 겹치지 않는지, 긴 제목에서 삭제 버튼이 밀리지 않는지
4. OS 설정에서 "동작 줄이기" 켜고 재확인 → 막대와 마퀴가 멈추는지
