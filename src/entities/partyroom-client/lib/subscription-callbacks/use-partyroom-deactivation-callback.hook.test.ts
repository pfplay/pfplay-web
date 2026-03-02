jest.mock('@/shared/lib/store/stores.context');
jest.mock('./utils/use-invalidate-djing-queue.hook');

import { renderHook } from '@testing-library/react';
import type * as Crew from '@/entities/current-partyroom/model/crew.model';
import { createCurrentPartyroomStore } from '@/entities/current-partyroom/model/current-partyroom.store';
import { GradeType, MotionType } from '@/shared/api/http/types/@enums';
import { PartyroomEventType } from '@/shared/api/websocket/types/partyroom';
import { useStores } from '@/shared/lib/store/stores.context';
import usePartyroomDeactivationCallback from './use-partyroom-deactivation-callback.hook';
import useInvalidateDjingQueue from './utils/use-invalidate-djing-queue.hook';

let store: ReturnType<typeof createCurrentPartyroomStore>;
const mockInvalidateDjingQueue = jest.fn();

beforeEach(() => {
  jest.clearAllMocks();
  store = createCurrentPartyroomStore();
  (useStores as jest.Mock).mockReturnValue({ useCurrentPartyroom: store });
  (useInvalidateDjingQueue as jest.Mock).mockReturnValue(mockInvalidateDjingQueue);
});

const createCrew = (overrides: Partial<Crew.Model> = {}): Crew.Model => ({
  crewId: 1,
  nickname: '테스트유저',
  gradeType: GradeType.CLUBBER,
  avatarBodyUri: 'body.png',
  avatarFaceUri: 'face.png',
  avatarIconUri: 'icon.png',
  combinePositionX: 0,
  combinePositionY: 0,
  offsetX: 0,
  offsetY: 0,
  scale: 1,
  motionType: MotionType.NONE,
  ...overrides,
});

describe('usePartyroomDeactivationCallback', () => {
  test('reset 호출 → 상태 초기화됨', () => {
    // 상태를 변경해둠
    store.getState().init({
      id: 99,
      me: { crewId: 1, gradeType: GradeType.HOST },
      playbackActivated: true,
      crews: [createCrew()],
      notice: '공지사항',
    });

    const { result } = renderHook(() => usePartyroomDeactivationCallback());
    const callback = result.current;

    callback({ eventType: PartyroomEventType.PARTYROOM_DEACTIVATION });

    const state = store.getState();
    expect(state.id).toBeUndefined();
    expect(state.me).toBeUndefined();
    expect(state.playbackActivated).toBe(false);
    expect(state.crews).toEqual([]);
    expect(state.notice).toBe('');
  });

  test('invalidateDjingQueue 호출됨', () => {
    const { result } = renderHook(() => usePartyroomDeactivationCallback());
    const callback = result.current;

    callback({ eventType: PartyroomEventType.PARTYROOM_DEACTIVATION });

    expect(mockInvalidateDjingQueue).toHaveBeenCalledTimes(1);
  });
});
