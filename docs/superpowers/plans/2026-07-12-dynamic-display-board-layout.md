# 전광판 동적 레이아웃 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 파티룸 데스크탑 비-cinema 모드에서 전광판이 오른쪽 400px 채팅 패널에 가려지지 않도록, 뷰포트 폭에 따라 위치·크기가 3단계로 연속 전환되게 한다 (GitHub Issue #448).

**Architecture:** 위치/폭 계산 로직을 순수 함수(`computeDisplayBoardLayout`)로 분리해 유닛 테스트로 검증하고, `room.component.tsx`의 기존 resize `useEffect`(현재 cinema 전용)를 확장해 비-cinema 모드에도 적용한다. 컨테이너 포지셔닝을 정적 `left-1/2 -translate-x-1/2`에서 동적 `right: <offset>px`로 교체한다.

**Tech Stack:** React 18 (Next.js App Router, client component), TypeScript, Vitest, Tailwind CSS (인라인 style과 병행).

## Global Constraints

- 설계 문서(`docs/superpowers/specs/2026-07-12-dynamic-display-board-layout-design.md`)의 상수를 그대로 사용한다: `RIGHT_PANEL_WIDTH=400`, `CONTAINER_MARGIN=40`, `LEFT_BOUND=40`, `DEFAULT_BOARD_WIDTH=512`, `MIN_BOARD_WIDTH=320`.
- cinema 모드의 기존 동작(`boardWidth = innerWidth - 400 - 80`, `right-[400px]` 고정)은 변경하지 않는다.
- `Video`/`DisplayBoard` 컴포넌트는 수정하지 않는다 (이미 `width` prop 기반으로 비율 계산을 지원함).
- 왼쪽 아이콘 사이드바 충돌(840px 미만 극단적 케이스)과 모바일 트리는 범위 밖 — 손대지 않는다.

---

### Task 1: 전광판 레이아웃 계산 순수 함수 작성

**Files:**

- Create: `src/widgets/partyroom-page-desktop/compute-display-board-layout.ts`
- Test: `src/widgets/partyroom-page-desktop/compute-display-board-layout.test.ts`

**Interfaces:**

- Consumes: 없음 (순수 함수, 외부 의존성 없음)
- Produces: `computeDisplayBoardLayout(viewportWidth: number): DisplayBoardLayout` — `DisplayBoardLayout = { boardWidth: number; rightOffset: number }`.이 함수와 타입을 Task 2(`room.component.tsx`)가 그대로 import해 사용한다. 상수 `RIGHT_PANEL_WIDTH`, `DEFAULT_BOARD_WIDTH`도 함께 export해 Task 2의 state 초기값으로 재사용한다.

- [ ] **Step 1: Write the failing test**

`src/widgets/partyroom-page-desktop/compute-display-board-layout.test.ts` 파일을 아래 내용으로 작성한다.

```typescript
import { describe, expect, test } from 'vitest';
import { computeDisplayBoardLayout } from './compute-display-board-layout';

describe('computeDisplayBoardLayout', () => {
  test('넓은 화면(1920px)에서는 기본 폭 512px, 중앙정렬에 해당하는 664px 오프셋', () => {
    expect(computeDisplayBoardLayout(1920)).toEqual({ boardWidth: 512, rightOffset: 664 });
  });

  test('1400px에서는 기본 폭 유지, 중앙정렬 오프셋 404px', () => {
    expect(computeDisplayBoardLayout(1400)).toEqual({ boardWidth: 512, rightOffset: 404 });
  });

  test('1단계→2단계 경계(1392px)에서 오프셋이 정확히 400px로 꺾인다', () => {
    expect(computeDisplayBoardLayout(1392)).toEqual({ boardWidth: 512, rightOffset: 400 });
  });

  test('경계 바로 아래(1391px)에서도 폭 512px 유지, 오프셋은 400px로 고정(우측 패널에 밀착)', () => {
    expect(computeDisplayBoardLayout(1391)).toEqual({ boardWidth: 512, rightOffset: 400 });
  });

  test('2단계 중간(1200px)에서도 폭 512px 유지, 오프셋 400px 고정', () => {
    expect(computeDisplayBoardLayout(1200)).toEqual({ boardWidth: 512, rightOffset: 400 });
  });

  test('2단계→3단계 경계(1032px)에서 폭이 아직 512px', () => {
    expect(computeDisplayBoardLayout(1032)).toEqual({ boardWidth: 512, rightOffset: 400 });
  });

  test('경계 바로 아래(1031px)부터 폭이 줄어들기 시작한다(511px)', () => {
    expect(computeDisplayBoardLayout(1031)).toEqual({ boardWidth: 511, rightOffset: 400 });
  });

  test('3단계 중간(900px)에서 폭이 비례해서 줄어든다(380px)', () => {
    expect(computeDisplayBoardLayout(900)).toEqual({ boardWidth: 380, rightOffset: 400 });
  });

  test('축소 하한 바로 위(841px)에서 폭 321px', () => {
    expect(computeDisplayBoardLayout(841)).toEqual({ boardWidth: 321, rightOffset: 400 });
  });

  test('축소 하한(840px)에서 폭이 최소값 320px에 도달한다', () => {
    expect(computeDisplayBoardLayout(840)).toEqual({ boardWidth: 320, rightOffset: 400 });
  });

  test('하한 아래(839px)에서도 폭은 320px 밑으로 내려가지 않는다', () => {
    expect(computeDisplayBoardLayout(839)).toEqual({ boardWidth: 320, rightOffset: 400 });
  });

  test('매우 좁은 화면(700px)에서도 폭은 320px로 고정된다(왼쪽 여백 침범은 범위 밖)', () => {
    expect(computeDisplayBoardLayout(700)).toEqual({ boardWidth: 320, rightOffset: 400 });
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/widgets/partyroom-page-desktop/compute-display-board-layout.test.ts`
Expected: FAIL — `Failed to resolve import "./compute-display-board-layout"` (파일이 아직 없음)

- [ ] **Step 3: Write minimal implementation**

`src/widgets/partyroom-page-desktop/compute-display-board-layout.ts` 파일을 아래 내용으로 작성한다.

```typescript
/**
 * 파티룸 데스크탑 비-cinema 모드 전광판의 폭·위치를 뷰포트 폭에 따라 계산한다.
 * 설계 근거: docs/superpowers/specs/2026-07-12-dynamic-display-board-layout-design.md
 *
 * 3단계로 연속 전환된다 (경계값은 아래 상수에서 대수적으로 유도됨, 임의 상수 아님):
 *   1. vp >= 1392: 기본 폭(512px) 유지, 뷰포트 정중앙 (rightOffset이 중앙정렬 값)
 *   2. 1032 <= vp < 1392: 기본 폭(512px) 유지, 오른쪽 패널에 밀착(rightOffset=400 고정)
 *   3. vp < 1032: 폭이 최소 320px까지 축소, 계속 오른쪽 패널에 밀착
 */
export const RIGHT_PANEL_WIDTH = 400;
export const CONTAINER_MARGIN = 40;
export const LEFT_BOUND = 40;
export const DEFAULT_BOARD_WIDTH = 512;
export const MIN_BOARD_WIDTH = 320;

export type DisplayBoardLayout = {
  boardWidth: number;
  rightOffset: number;
};

export const computeDisplayBoardLayout = (viewportWidth: number): DisplayBoardLayout => {
  const defaultContainerWidth = DEFAULT_BOARD_WIDTH + CONTAINER_MARGIN * 2;
  const minContainerWidth = MIN_BOARD_WIDTH + CONTAINER_MARGIN * 2;
  const shrinkThreshold = RIGHT_PANEL_WIDTH + LEFT_BOUND;
  const widthLockThreshold = defaultContainerWidth + shrinkThreshold;

  const containerWidth =
    viewportWidth >= widthLockThreshold
      ? defaultContainerWidth
      : Math.max(minContainerWidth, viewportWidth - shrinkThreshold);

  const rightOffset = Math.max(RIGHT_PANEL_WIDTH, (viewportWidth - containerWidth) / 2);

  return {
    boardWidth: containerWidth - CONTAINER_MARGIN * 2,
    rightOffset,
  };
};
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/widgets/partyroom-page-desktop/compute-display-board-layout.test.ts`
Expected: PASS — 12개 테스트 모두 통과

- [ ] **Step 5: Commit**

```bash
git add src/widgets/partyroom-page-desktop/compute-display-board-layout.ts src/widgets/partyroom-page-desktop/compute-display-board-layout.test.ts
git commit -m "feat(partyroom): 전광판 동적 레이아웃 계산 함수 추가 #448"
```

---

### Task 2: `room.component.tsx`에 배선 — 비-cinema 모드 resize 대응

**Files:**

- Modify: `src/widgets/partyroom-page-desktop/room.component.tsx:1-3` (import 추가), `:68-81` (state/useEffect), `:197-213` (JSX)

**Interfaces:**

- Consumes: Task 1의 `computeDisplayBoardLayout`, `DisplayBoardLayout`, `RIGHT_PANEL_WIDTH`, `DEFAULT_BOARD_WIDTH` (모두 `./compute-display-board-layout`에서 import)
- Produces: 없음 (최종 UI 배선, 이 이후 태스크 없음)

- [ ] **Step 1: import 추가**

`room.component.tsx` 3번째 줄(`import { useEffect, useState } from 'react';`) 아래, 다른 로컬 import들 사이에 추가한다 (알파벳/경로 순서는 기존 import 블록의 상대 경로 그룹 규칙을 따라 파일 하단 `./desktop-overlays.component` 근처, 상대경로 import끼리 묶는다):

```typescript
import {
  computeDisplayBoardLayout,
  DEFAULT_BOARD_WIDTH,
  RIGHT_PANEL_WIDTH,
} from './compute-display-board-layout';
import { DesktopOverlays } from './desktop-overlays.component';
```

(기존 `import { DesktopOverlays } from './desktop-overlays.component';` 줄 바로 위에 추가하면 된다.)

- [ ] **Step 2: state·useEffect 교체**

`room.component.tsx:68-81`의 아래 블록을 찾는다:

```typescript
const [boardWidth, setBoardWidth] = useState(512);

useEffect(() => {
  if (!cinemaView) {
    setBoardWidth(512);
    return;
  }
  const computeWidth = () => {
    setBoardWidth(window.innerWidth - 400 - 80);
  };
  computeWidth();
  window.addEventListener('resize', computeWidth);
  return () => window.removeEventListener('resize', computeWidth);
}, [cinemaView]);
```

아래로 교체한다:

```typescript
const [boardWidth, setBoardWidth] = useState(DEFAULT_BOARD_WIDTH);
const [boardRightOffset, setBoardRightOffset] = useState(RIGHT_PANEL_WIDTH);

useEffect(() => {
  const computeLayout = () => {
    if (cinemaView) {
      setBoardWidth(window.innerWidth - 400 - 80);
      return;
    }
    const layout = computeDisplayBoardLayout(window.innerWidth);
    setBoardWidth(layout.boardWidth);
    setBoardRightOffset(layout.rightOffset);
  };
  computeLayout();
  window.addEventListener('resize', computeLayout);
  return () => window.removeEventListener('resize', computeLayout);
}, [cinemaView]);
```

- [ ] **Step 3: JSX 컨테이너 포지셔닝 교체**

`room.component.tsx:197-213`의 아래 블록을 찾는다:

```tsx
{
  /* 가운데 전광판 */
}
<div
  className={
    cinemaView
      ? 'absolute top-[44px] left-0 right-[400px] px-[40px]'
      : 'absolute top-[44px] left-1/2 transform -translate-x-1/2 max-w-full w-[calc(512px+(40px*2))] px-[40px]'
  }
>
  <PartyroomDisplayBoard
    width={boardWidth}
    cinemaView={cinemaView}
    headerActions={headerActions}
    sidebarActions={sidebarActions}
    sidePanelContent={sidePanelContent}
    chatPanelContent={chatPanelContent}
  />
</div>;
```

아래로 교체한다 (cinema 모드는 그대로, 비-cinema 모드만 `right` 동적 스타일로 교체 — `left-1/2`/`transform`/`w-[calc(...)]` 클래스는 제거):

```tsx
{
  /* 가운데 전광판 */
}
<div
  className={
    cinemaView
      ? 'absolute top-[44px] left-0 right-[400px] px-[40px]'
      : 'absolute top-[44px] px-[40px]'
  }
  style={cinemaView ? undefined : { right: boardRightOffset }}
>
  <PartyroomDisplayBoard
    width={boardWidth}
    cinemaView={cinemaView}
    headerActions={headerActions}
    sidebarActions={sidebarActions}
    sidePanelContent={sidePanelContent}
    chatPanelContent={chatPanelContent}
  />
</div>;
```

- [ ] **Step 4: 타입체크·린트 확인**

Run: `npx tsc --noEmit`
Expected: 에러 없음 (특히 `room.component.tsx`, `compute-display-board-layout.ts` 관련 에러 없어야 함)

Run: `npx eslint src/widgets/partyroom-page-desktop --quiet`
Expected: 에러 없음

- [ ] **Step 5: 전체 테스트 스위트로 회귀 확인**

Run: `npx vitest run`
Expected: 기존 실패 목록과 동일(신규 실패 없음), Task 1에서 추가한 12개 테스트 포함 전체 통과

- [ ] **Step 6: 수동 브라우저 검증**

`yarn dev`로 로컬 서버 실행 후 파티룸 페이지(비-cinema 모드)에서 브라우저 창 폭을 1920 → 1400 → 1392 → 1200 → 1032 → 900px로 단계적으로 줄이며:

- 전광판이 오른쪽 채팅 패널과 절대 겹치지 않는지
- 1392px, 1032px 부근에서 전광판이 갑자기 튀지 않고 부드럽게 움직이는지
- cinema 모드(극장 모드 버튼 클릭)로 전환해도 기존과 동일하게 동작하는지(회귀 없음)

확인되면 다음 단계로 진행한다.

- [ ] **Step 7: Commit**

```bash
git add src/widgets/partyroom-page-desktop/room.component.tsx
git commit -m "feat(partyroom): 비-cinema 모드 전광판이 우측 패널에 가려지지 않도록 동적 배치 #448"
```

---

## Self-Review

- **Spec coverage**: 설계 문서의 3단계 동작 사양(정중앙 → 우측 밀착 이동 → 폭 축소) 전부 Task 1의 순수 함수로 구현되고 Task 2에서 배선됨. "범위 밖" 항목(왼쪽 사이드바, cinema 모드, 모바일)은 코드 변경 없이 그대로 유지됨 — 커버리지 갭 없음.
- **Placeholder scan**: 모든 스텝에 실제 코드/명령어가 포함되어 있음. "TODO"/"나중에" 등 표현 없음.
- **Type consistency**: `DisplayBoardLayout`, `computeDisplayBoardLayout`, `RIGHT_PANEL_WIDTH`, `DEFAULT_BOARD_WIDTH` 이름이 Task 1(생성)과 Task 2(소비) 간에 정확히 일치함.
