vi.mock('@/shared/lib/store/stores.context');

import { renderHook } from '@testing-library/react';
import { createCurrentPartyroomStore } from '@/entities/current-partyroom/model/current-partyroom.store';
import { GradeType, MotionType } from '@/shared/api/http/types/@enums';
import { useStores } from '@/shared/lib/store/stores.context';
import useCrews from './use-crews.hook';

let store: ReturnType<typeof createCurrentPartyroomStore>;

beforeEach(() => {
  vi.clearAllMocks();
  store = createCurrentPartyroomStore();
  (useStores as Mock).mockReturnValue({ useCurrentPartyroom: store });
});

const createCrew = (id: number) => ({
  crewId: id,
  nickname: `Crew${id}`,
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
});

describe('useCrews', () => {
  test('초기값은 빈 배열이다', () => {
    const { result } = renderHook(() => useCrews());
    expect(result.current).toEqual([]);
  });

  test('스토어에 crew가 있으면 해당 목록을 반환한다', () => {
    store.setState({ crews: [createCrew(1), createCrew(2)] });

    const { result } = renderHook(() => useCrews());
    expect(result.current).toHaveLength(2);
    expect(result.current[0].crewId).toBe(1);
    expect(result.current[1].crewId).toBe(2);
  });
});
