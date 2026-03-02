jest.mock('../model/avatar-position.model', () => ({
  ...jest.requireActual('../model/avatar-position.model'),
  getRandomPoint: jest.fn(),
}));

import { renderHook } from '@testing-library/react';
import { GradeType, MotionType } from '@/shared/api/http/types/@enums';
import useAssignAvatarPositions from './use-assign-avatar-positions.hook';
import { getRandomPoint } from '../model/avatar-position.model';

const makeCrew = (crewId: number, overrides = {}) => ({
  crewId,
  nickname: `User${crewId}`,
  gradeType: GradeType.CLUBBER,
  avatarBodyUri: '',
  avatarFaceUri: '',
  avatarIconUri: '',
  combinePositionX: 0,
  combinePositionY: 0,
  offsetX: 0,
  offsetY: 0,
  scale: 1,
  motionType: MotionType.NONE,
  ...overrides,
});

const allowArea = { from: { x: 0, y: 0 }, to: { x: 100, y: 100 } };
const denyArea = { from: { x: 40, y: 40 }, to: { x: 60, y: 60 } };

let callCount = 0;
beforeEach(() => {
  callCount = 0;
  (getRandomPoint as jest.Mock).mockImplementation(() => {
    callCount++;
    return { x: callCount * 10, y: callCount * 10 };
  });
});

describe('useAssignAvatarPositions', () => {
  test('초기 크루에 포지션을 할당한다', () => {
    const crews = [makeCrew(1), makeCrew(2)];

    const { result } = renderHook(() =>
      useAssignAvatarPositions({ originCrews: crews, allowArea, denyArea })
    );

    expect(result.current).toHaveLength(2);
    expect(result.current[0]).toHaveProperty('position');
    expect(result.current[1]).toHaveProperty('position');
  });

  test('크루 추가 시 새 포지션을 할당한다', () => {
    const initial = [makeCrew(1)];
    const { result, rerender } = renderHook((props) => useAssignAvatarPositions(props), {
      initialProps: { originCrews: initial, allowArea, denyArea },
    });

    expect(result.current).toHaveLength(1);

    const updated = [makeCrew(1), makeCrew(2)];
    rerender({ originCrews: updated, allowArea, denyArea });

    expect(result.current).toHaveLength(2);
  });

  test('크루 제거 시 해당 포지션을 삭제한다', () => {
    const initial = [makeCrew(1), makeCrew(2), makeCrew(3)];
    const { result, rerender } = renderHook((props) => useAssignAvatarPositions(props), {
      initialProps: { originCrews: initial, allowArea, denyArea },
    });

    expect(result.current).toHaveLength(3);

    const updated = [makeCrew(1), makeCrew(3)];
    rerender({ originCrews: updated, allowArea, denyArea });

    expect(result.current).toHaveLength(2);
    expect(result.current.find((c) => c.crewId === 2)).toBeUndefined();
  });
});
