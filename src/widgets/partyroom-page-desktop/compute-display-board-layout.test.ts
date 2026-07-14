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
