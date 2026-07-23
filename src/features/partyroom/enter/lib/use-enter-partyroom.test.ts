vi.mock('@/entities/partyroom-client');
vi.mock('@/shared/lib/store/stores.context');
vi.mock('@/shared/lib/router/use-app-router.hook');
vi.mock('@/shared/ui/components/dialog');
vi.mock('@/shared/lib/localization/i18n.context');
vi.mock('../api/use-enter-partyroom.mutation');
vi.mock('@tanstack/react-query', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@tanstack/react-query')>();
  return {
    ...actual,
    useQueryClient: vi.fn(),
  };
});
vi.mock('@/shared/api/http/services', () => ({
  partyroomsService: { getSetupInfo: vi.fn(), getNotice: vi.fn(), getMyActiveRoom: vi.fn() },
}));
vi.mock('@/shared/lib/analytics/room-tracking', () => ({
  trackPartyroomEntered: vi.fn(),
}));

import { useQueryClient } from '@tanstack/react-query';
import { renderHook, act } from '@testing-library/react';
import {
  usePartyroomClient,
  useHandlePartyroomSubscriptionEvent,
} from '@/entities/partyroom-client';
import { QueryKeys } from '@/shared/api/http/query-keys';
import { partyroomsService } from '@/shared/api/http/services';
import { useI18n } from '@/shared/lib/localization/i18n.context';
import { useAppRouter } from '@/shared/lib/router/use-app-router.hook';
import { useStores } from '@/shared/lib/store/stores.context';
import { useDialog } from '@/shared/ui/components/dialog';
import { useEnterPartyroom } from './use-enter-partyroom';
import { useEnterPartyroom as useEnterPartyroomMutation } from '../api/use-enter-partyroom.mutation';

const mockOnConnect = vi.fn();
const mockSetRoomReconnectHandler = vi.fn();
const mockUnsubscribeCurrentRoom = vi.fn();
const mockMarkEnteredRoom = vi.fn();
const mockGetMyActiveRoom = partyroomsService.getMyActiveRoom as Mock;
const mockOpenConfirmDialog = vi.fn();
const mockMutate = vi.fn();
const mockInit = vi.fn();
const mockPush = vi.fn();
const mockInvalidateQueries = vi.fn();
const mockTrackerClear = vi.fn();
const mockSeedFromSetup = vi.fn();

// 이 탭이 들어갔던 방(#476 사전 컨펌 판별). 기본=미입장(fresh) → 활성 방 있으면 다른 세션으로 취급.
let myEnteredRoomId: number | undefined;

beforeEach(() => {
  vi.clearAllMocks();
  myEnteredRoomId = undefined;
  (usePartyroomClient as Mock).mockReturnValue({
    onConnect: mockOnConnect,
    setRoomReconnectHandler: mockSetRoomReconnectHandler,
    unsubscribeCurrentRoom: mockUnsubscribeCurrentRoom,
    markEnteredRoom: mockMarkEnteredRoom,
    get myEnteredRoomId() {
      return myEnteredRoomId;
    },
    subscribe: vi.fn(),
  });
  (useHandlePartyroomSubscriptionEvent as Mock).mockReturnValue(vi.fn());
  const state = {
    init: mockInit,
    playbackSummaryTracker: { clear: mockTrackerClear, seedFromSetup: mockSeedFromSetup },
  };
  (useStores as Mock).mockReturnValue({
    useCurrentPartyroom: Object.assign((selector: (...args: any[]) => any) => selector(state), {
      getState: () => state,
    }),
  });
  (useEnterPartyroomMutation as Mock).mockReturnValue({ mutate: mockMutate });
  (useAppRouter as Mock).mockReturnValue({ push: mockPush });
  (useQueryClient as Mock).mockReturnValue({ invalidateQueries: mockInvalidateQueries });
  (useDialog as Mock).mockReturnValue({ openConfirmDialog: mockOpenConfirmDialog });
  (useI18n as Mock).mockReturnValue({ party: { para: { supersede_confirm: '계속할까요?' } } });
  // 기본: 다른 활성 방 없음(사전 컨펌 미발동) + 컨펌 시 승인
  mockGetMyActiveRoom.mockResolvedValue(null);
  mockOpenConfirmDialog.mockResolvedValue(true);
});

/** once 핸들러까지 실행(= resync 등록 + 비동기 사전 컨펌/입장 시작). */
const triggerOnce = (partyroomId: number, opts?: { entrySource?: 'list' }) => {
  const { result } = renderHook(() => useEnterPartyroom(partyroomId, opts));
  act(() => result.current());
  mockOnConnect.mock.calls[0][0]();
  return result;
};

describe('useEnterPartyroom', () => {
  test('반환된 함수를 호출하면 client.onConnect를 등록한다', () => {
    const { result } = renderHook(() => useEnterPartyroom(1));

    act(() => {
      result.current();
    });

    expect(mockOnConnect).toHaveBeenCalledWith(expect.any(Function), { once: true });
  });

  test('onConnect 콜백이 실행되면 (사전 컨펌 통과 후) enter mutation을 호출한다', async () => {
    triggerOnce(42);

    await vi.waitFor(() =>
      expect(mockMutate).toHaveBeenCalledWith(
        expect.objectContaining({ partyroomId: 42 }),
        expect.objectContaining({
          onSuccess: expect.any(Function),
          onError: expect.any(Function),
        })
      )
    );
  });

  test('enter 실패 시 로비로 이동한다 (백엔드 exit 워크어라운드 없음)', async () => {
    triggerOnce(1);
    await vi.waitFor(() => expect(mockMutate).toHaveBeenCalled());

    // enter mutation의 onError 콜백 실행
    mockMutate.mock.calls[0][1].onError();

    expect(mockPush).toHaveBeenCalledWith('/parties');
  });

  test('enter 성공 시 이 탭의 입장 방을 기록한다 (#476 markEnteredRoom)', async () => {
    triggerOnce(42);
    await vi.waitFor(() => expect(mockMutate).toHaveBeenCalled());

    mockMutate.mock.calls[0][1].onSuccess({ crewId: 1, gradeType: 'LISTENER' });
    expect(mockMarkEnteredRoom).toHaveBeenCalledWith(42);
  });

  test('options.entrySource를 받아도 기존 enter 흐름은 변경되지 않는다 (PR-3 시그니처 회귀)', async () => {
    triggerOnce(7, { entrySource: 'list' });

    expect(mockOnConnect).toHaveBeenCalledWith(expect.any(Function), { once: true });
    await vi.waitFor(() =>
      expect(mockMutate).toHaveBeenCalledWith(
        expect.objectContaining({ partyroomId: 7 }),
        expect.objectContaining({ onSuccess: expect.any(Function), onError: expect.any(Function) })
      )
    );
  });
});

describe('useEnterPartyroom 사전 컨펌 — 다른 세션(탭/기기) 점유 (#476)', () => {
  test('다른 활성 방 없음 → 컨펌 없이 바로 입장', async () => {
    mockGetMyActiveRoom.mockResolvedValue(null);
    triggerOnce(7);
    await vi.waitFor(() => expect(mockMutate).toHaveBeenCalled());
    expect(mockOpenConfirmDialog).not.toHaveBeenCalled();
  });

  test('서버 활성 방 == 이 탭이 들어갔던 방 → 같은 세션 방 전환, 컨펌 없이 입장', async () => {
    myEnteredRoomId = 5; // 이 탭은 방 5에 있었음
    mockGetMyActiveRoom.mockResolvedValue({ partyroomId: 5, crewId: 1 }); // 서버도 5
    triggerOnce(7); // 방 7로 전환
    await vi.waitFor(() => expect(mockMutate).toHaveBeenCalled());
    expect(mockOpenConfirmDialog).not.toHaveBeenCalled();
  });

  test('서버 활성 방이 다른 세션(이 탭 미입장) → 컨펌 노출, 승인 시 입장', async () => {
    myEnteredRoomId = undefined; // fresh 탭/기기
    mockGetMyActiveRoom.mockResolvedValue({ partyroomId: 99, crewId: 2 }); // 다른 세션이 방 99 점유
    mockOpenConfirmDialog.mockResolvedValue(true);
    triggerOnce(7);
    await vi.waitFor(() => expect(mockOpenConfirmDialog).toHaveBeenCalledTimes(1));
    await vi.waitFor(() =>
      expect(mockMutate).toHaveBeenCalledWith(
        expect.objectContaining({ partyroomId: 7 }),
        expect.anything()
      )
    );
    expect(mockPush).not.toHaveBeenCalled();
  });

  test('다른 세션 점유 + 컨펌 취소 → 입장하지 않고 로비로', async () => {
    mockGetMyActiveRoom.mockResolvedValue({ partyroomId: 99, crewId: 2 });
    mockOpenConfirmDialog.mockResolvedValue(false);
    triggerOnce(7);
    await vi.waitFor(() => expect(mockPush).toHaveBeenCalledWith('/parties'));
    expect(mockMutate).not.toHaveBeenCalled();
  });

  test('이 탭이 같은 방 재입장(myEnteredRoomId===target) → 스냅샷 조회 생략', async () => {
    myEnteredRoomId = 7;
    triggerOnce(7);
    await vi.waitFor(() => expect(mockMutate).toHaveBeenCalled());
    expect(mockGetMyActiveRoom).not.toHaveBeenCalled();
    expect(mockOpenConfirmDialog).not.toHaveBeenCalled();
  });

  test('스냅샷 조회 실패 → 컨펌 없이 입장(advisory fail-open)', async () => {
    mockGetMyActiveRoom.mockRejectedValue(new Error('network'));
    triggerOnce(7);
    await vi.waitFor(() => expect(mockMutate).toHaveBeenCalled());
    expect(mockOpenConfirmDialog).not.toHaveBeenCalled();
  });
});

describe('useEnterPartyroom 재연결 resync — 스냅샷 분기 (#477/#469/#402)', () => {
  // once 핸들러 실행 시 resync 가 setRoomReconnectHandler 로 동기 등록된다(사전 컨펌/입장은 비동기).
  // 초기 입장을 settle 시킨 뒤 mockMutate/getMyActiveRoom 을 clear 해 resync 만 격리 관찰한다.
  const registerAndGetResync = async (partyroomId: number) => {
    mockGetMyActiveRoom.mockResolvedValue(null); // 초기 입장: 다른 방 없음 → 바로 입장
    const { result } = renderHook(() => useEnterPartyroom(partyroomId));
    act(() => result.current());
    mockOnConnect.mock.calls[0][0]();
    await vi.waitFor(() => expect(mockMutate).toHaveBeenCalled()); // 초기 입장 settle
    mockMutate.mockClear();
    mockGetMyActiveRoom.mockClear();
    return mockSetRoomReconnectHandler.mock.calls[0][0] as () => void;
  };

  test('#469 onConnect 는 once 1회만(재연결 핸들러 누적 없음), resync 는 setRoomReconnectHandler 로 등록', () => {
    const { result } = renderHook(() => useEnterPartyroom(1));
    act(() => result.current());

    expect(mockOnConnect).toHaveBeenCalledTimes(1);
    expect(mockOnConnect).toHaveBeenCalledWith(expect.any(Function), { once: true });
    expect(mockSetRoomReconnectHandler).not.toHaveBeenCalled();

    mockOnConnect.mock.calls[0][0](); // once 실행 시 resync 동기 등록
    expect(mockSetRoomReconnectHandler).toHaveBeenCalledWith(expect.any(Function));
  });

  test('#477 재연결 resync 는 enter(tryEnter) 를 재주장하지 않고 내 활성 방 스냅샷을 조회한다 (되훔침 금지)', async () => {
    const resync = await registerAndGetResync(7);
    mockGetMyActiveRoom.mockResolvedValue({ partyroomId: 7, crewId: 1 });
    resync();
    await vi.waitFor(() => expect(mockGetMyActiveRoom).toHaveBeenCalledTimes(1));
    expect(mockMutate).not.toHaveBeenCalled(); // tryEnter 재주장 소멸
  });

  test('스냅샷 활성 방 == 현재 방 → 경량 resync (DJ큐 invalidate), 이탈/teardown 없음', async () => {
    const resync = await registerAndGetResync(7);
    mockInvalidateQueries.mockClear();
    mockGetMyActiveRoom.mockResolvedValue({ partyroomId: 7, crewId: 1 });
    resync();
    await vi.waitFor(() =>
      expect(mockInvalidateQueries).toHaveBeenCalledWith({ queryKey: [QueryKeys.DjingQueue, 7] })
    );
    expect(mockUnsubscribeCurrentRoom).not.toHaveBeenCalled();
    expect(mockPush).not.toHaveBeenCalled();
  });

  test('스냅샷 활성 방 != 현재 방(밀려남) → 구독 teardown + 로비, enter 미호출', async () => {
    const resync = await registerAndGetResync(7);
    mockGetMyActiveRoom.mockResolvedValue({ partyroomId: 99, crewId: 2 });
    resync();
    await vi.waitFor(() => expect(mockPush).toHaveBeenCalledWith('/parties'));
    expect(mockUnsubscribeCurrentRoom).toHaveBeenCalledTimes(1);
    expect(mockMutate).not.toHaveBeenCalled();
  });

  test('스냅샷 활성 방 없음(null) → 구독 teardown + 로비', async () => {
    const resync = await registerAndGetResync(7);
    mockGetMyActiveRoom.mockResolvedValue(null);
    resync();
    await vi.waitFor(() => expect(mockPush).toHaveBeenCalledWith('/parties'));
    expect(mockUnsubscribeCurrentRoom).toHaveBeenCalledTimes(1);
  });

  test('스냅샷 조회 실패 → 로비 이동 (fail-safe)', async () => {
    const resync = await registerAndGetResync(7);
    mockGetMyActiveRoom.mockRejectedValue(new Error('network'));
    resync();
    await vi.waitFor(() => expect(mockPush).toHaveBeenCalledWith('/parties'));
  });
});

describe('플레이백 요약 추적기 배선 (#444)', () => {
  const enterViaOnce = async (
    partyroomId: number,
    enterResponse = { crewId: 1, gradeType: 'LISTENER' }
  ) => {
    triggerOnce(partyroomId);
    await vi.waitFor(() => expect(mockMutate).toHaveBeenCalled());
    mockMutate.mock.calls[0][1].onSuccess(enterResponse);
  };

  test('L1: setup 시작 시 추적기를 즉시 clear한다 (setup await 이전)', async () => {
    (partyroomsService.getSetupInfo as Mock).mockReturnValue(new Promise(() => {}));
    (partyroomsService.getNotice as Mock).mockReturnValue(new Promise(() => {}));

    await enterViaOnce(7);

    expect(mockTrackerClear).toHaveBeenCalled();
    expect(mockSeedFromSetup).not.toHaveBeenCalled(); // setup 미완료 — 시드는 아직
  });

  test('시드②: initPartyroom 직후 setup 데이터를 매핑해 seedFromSetup 호출', async () => {
    (partyroomsService.getSetupInfo as Mock).mockResolvedValue({
      stageType: 'GENERAL',
      crews: [{ crewId: 7, nickname: '디제이', gradeType: 'CLUBBER' }],
      display: {
        playbackActivated: true,
        playback: {
          id: 1,
          name: '곡',
          linkId: 'yt-1',
          duration: '03:00',
          thumbnailImage: 't.jpg',
          endTime: 1_234_567,
        },
        reaction: {
          history: { isLiked: false, isDisliked: false, isGrabbed: false },
          aggregation: { likeCount: 1, dislikeCount: 2, grabCount: 3 },
        },
        currentDj: { crewId: 7 },
      },
    });
    (partyroomsService.getNotice as Mock).mockResolvedValue({ content: '공지' });

    await enterViaOnce(7);

    await vi.waitFor(() => expect(mockSeedFromSetup).toHaveBeenCalled());
    expect(mockSeedFromSetup).toHaveBeenCalledWith({
      playback: { name: '곡', linkId: 'yt-1', endTime: 1_234_567 },
      counts: { like: 1, dislike: 2, grab: 3 },
      djNickname: '디제이',
      now: expect.any(Number),
    });
    // 순서: initPartyroom → seedFromSetup
    expect(mockInit.mock.invocationCallOrder[0]).toBeLessThan(
      mockSeedFromSetup.mock.invocationCallOrder[0]
    );
  });

  test('시드②: playback 없는 방 — playback/counts undefined, djNickname null 매핑', async () => {
    (partyroomsService.getSetupInfo as Mock).mockResolvedValue({
      stageType: 'GENERAL',
      crews: [],
      display: { playbackActivated: false },
    });
    (partyroomsService.getNotice as Mock).mockResolvedValue({ content: null });

    await enterViaOnce(7);

    await vi.waitFor(() => expect(mockSeedFromSetup).toHaveBeenCalled());
    expect(mockSeedFromSetup).toHaveBeenCalledWith({
      playback: undefined,
      counts: undefined,
      djNickname: null,
      now: expect.any(Number),
    });
  });

  test('L2: 재연결 resync 발화 시 추적기를 clear한다 (#469 setRoomReconnectHandler)', async () => {
    mockGetMyActiveRoom.mockResolvedValue(null);
    const { result } = renderHook(() => useEnterPartyroom(7));
    act(() => result.current());
    mockOnConnect.mock.calls[0][0]();
    await vi.waitFor(() => expect(mockMutate).toHaveBeenCalled()); // 초기 입장 settle
    mockTrackerClear.mockClear();
    const resync = mockSetRoomReconnectHandler.mock.calls[0][0] as () => void;

    resync(); // 재연결 발화
    expect(mockTrackerClear).toHaveBeenCalledTimes(1);
  });
});
