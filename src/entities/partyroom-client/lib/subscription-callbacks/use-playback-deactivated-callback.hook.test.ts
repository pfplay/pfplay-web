vi.mock('@/shared/lib/store/stores.context');

import { renderHook } from '@testing-library/react';
import type * as Crew from '@/entities/current-partyroom/model/crew.model';
import { createCurrentPartyroomStore } from '@/entities/current-partyroom/model/current-partyroom.store';
import { GradeType, MotionType } from '@/shared/api/http/types/@enums';
import { PartyroomEventType } from '@/shared/api/websocket/types/partyroom';
import { useStores } from '@/shared/lib/store/stores.context';
import usePlaybackDeactivatedCallback from './use-playback-deactivated-callback.hook';

let store: ReturnType<typeof createCurrentPartyroomStore>;

beforeEach(() => {
  vi.clearAllMocks();
  store = createCurrentPartyroomStore();
  (useStores as Mock).mockReturnValue({ useCurrentPartyroom: store });
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

describe('usePlaybackDeactivatedCallback', () => {
  test('플레이백 관련 상태만 초기화되고, 파티룸 핵심 데이터는 유지됨', () => {
    store.getState().init({
      id: 99,
      me: { crewId: 1, gradeType: GradeType.HOST },
      playbackActivated: true,
      crews: [createCrew()],
      notice: '공지사항',
    });

    const { result } = renderHook(() => usePlaybackDeactivatedCallback());
    const callback = result.current;

    callback({ eventType: PartyroomEventType.PLAYBACK_DEACTIVATED });

    const state = store.getState();
    // 파티룸 핵심 데이터는 유지
    expect(state.id).toBe(99);
    expect(state.me).toEqual({ crewId: 1, gradeType: GradeType.HOST });
    expect(state.crews).toHaveLength(1);
    expect(state.notice).toBe('공지사항');
    // 플레이백 관련 상태만 초기화
    expect(state.playbackActivated).toBe(false);
    expect(state.playback).toBeUndefined();
    expect(state.currentDj).toBeUndefined();
  });
});
