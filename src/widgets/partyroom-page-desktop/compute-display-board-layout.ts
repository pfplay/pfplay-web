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
