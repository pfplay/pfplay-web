vi.mock('@/shared/lib/store/stores.context');
vi.mock('@/entities/current-partyroom', () => ({
  useRemoveCurrentPartyroomCaches: vi.fn(),
}));
vi.mock('@/shared/lib/router/use-app-router.hook', () => ({
  useAppRouter: vi.fn(),
}));
vi.mock('@/shared/ui/components/dialog', () => ({
  useDialog: vi.fn(),
}));
vi.mock('@/shared/lib/localization/i18n.context', () => ({
  useI18n: () => ({
    party: { para: { closed: '파티룸이 닫혔습니다.' } },
  }),
}));

import { renderHook } from '@testing-library/react';
import { useRemoveCurrentPartyroomCaches } from '@/entities/current-partyroom';
import type * as Crew from '@/entities/current-partyroom/model/crew.model';
import { createCurrentPartyroomStore } from '@/entities/current-partyroom/model/current-partyroom.store';
import { GradeType, MotionType } from '@/shared/api/http/types/@enums';
import { PartyroomEventType } from '@/shared/api/websocket/types/partyroom';
import { useAppRouter } from '@/shared/lib/router/use-app-router.hook';
import { useStores } from '@/shared/lib/store/stores.context';
import { useDialog } from '@/shared/ui/components/dialog';
import usePartyroomCloseCallback from './use-partyroom-close-callback.hook';

let store: ReturnType<typeof createCurrentPartyroomStore>;
const mockReplace = vi.fn();
const mockRemoveCaches = vi.fn();
const mockOpenAlertDialog = vi.fn();

beforeEach(() => {
  vi.clearAllMocks();
  store = createCurrentPartyroomStore();
  (useStores as Mock).mockReturnValue({ useCurrentPartyroom: store });
  (useAppRouter as Mock).mockReturnValue({ replace: mockReplace });
  (useRemoveCurrentPartyroomCaches as Mock).mockReturnValue(mockRemoveCaches);
  (useDialog as Mock).mockReturnValue({ openAlertDialog: mockOpenAlertDialog });
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

describe('usePartyroomCloseCallback', () => {
  test("router.replace('/parties') 호출", () => {
    const { result } = renderHook(() => usePartyroomCloseCallback());
    const callback = result.current;

    callback({ eventType: PartyroomEventType.PARTYROOM_CLOSED });

    expect(mockReplace).toHaveBeenCalledWith('/parties');
  });

  test('reset 호출 → 상태 초기화', () => {
    store.getState().init({
      id: 99,
      me: { crewId: 1, gradeType: GradeType.HOST },
      playbackActivated: true,
      crews: [createCrew()],
      notice: '공지',
    });

    const { result } = renderHook(() => usePartyroomCloseCallback());
    const callback = result.current;

    callback({ eventType: PartyroomEventType.PARTYROOM_CLOSED });

    const state = store.getState();
    expect(state.id).toBeUndefined();
    expect(state.playbackActivated).toBe(false);
    expect(state.crews).toEqual([]);
  });

  test('removeCurrentPartyroomCaches 호출', () => {
    const { result } = renderHook(() => usePartyroomCloseCallback());
    const callback = result.current;

    callback({ eventType: PartyroomEventType.PARTYROOM_CLOSED });

    expect(mockRemoveCaches).toHaveBeenCalledTimes(1);
  });

  test('openAlertDialog 호출 (t.party.para.closed 내용)', () => {
    const { result } = renderHook(() => usePartyroomCloseCallback());
    const callback = result.current;

    callback({ eventType: PartyroomEventType.PARTYROOM_CLOSED });

    expect(mockOpenAlertDialog).toHaveBeenCalledWith({
      content: '파티룸이 닫혔습니다.',
    });
  });
});
