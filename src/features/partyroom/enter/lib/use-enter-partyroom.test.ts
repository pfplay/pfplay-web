vi.mock('@/entities/partyroom-client');
vi.mock('@/shared/lib/store/stores.context');
vi.mock('@/shared/lib/router/use-app-router.hook');
vi.mock('../api/use-enter-partyroom.mutation');
vi.mock('@tanstack/react-query', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@tanstack/react-query')>();
  return {
    ...actual,
    useQueryClient: vi.fn(),
  };
});
vi.mock('@/shared/api/http/services', () => ({
  partyroomsService: { getSetupInfo: vi.fn(), getNotice: vi.fn() },
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
import { useAppRouter } from '@/shared/lib/router/use-app-router.hook';
import { useStores } from '@/shared/lib/store/stores.context';
import { useEnterPartyroom } from './use-enter-partyroom';
import { useEnterPartyroom as useEnterPartyroomMutation } from '../api/use-enter-partyroom.mutation';

const mockOnConnect = vi.fn();
const mockSetRoomReconnectHandler = vi.fn();
const mockMutate = vi.fn();
const mockInit = vi.fn();
const mockPush = vi.fn();
const mockInvalidateQueries = vi.fn();
const mockTrackerClear = vi.fn();
const mockSeedFromSetup = vi.fn();

beforeEach(() => {
  vi.clearAllMocks();
  (usePartyroomClient as Mock).mockReturnValue({
    onConnect: mockOnConnect,
    setRoomReconnectHandler: mockSetRoomReconnectHandler,
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
});

describe('useEnterPartyroom', () => {
  test('반환된 함수를 호출하면 client.onConnect를 등록한다', () => {
    const { result } = renderHook(() => useEnterPartyroom(1));

    act(() => {
      result.current();
    });

    expect(mockOnConnect).toHaveBeenCalledWith(expect.any(Function), { once: true });
  });

  test('onConnect 콜백이 실행되면 enter mutation을 호출한다', () => {
    const { result } = renderHook(() => useEnterPartyroom(42));

    act(() => {
      result.current();
    });

    // onConnect의 첫 번째 인자인 콜백을 실행
    const onConnectCallback = mockOnConnect.mock.calls[0][0];
    onConnectCallback();

    expect(mockMutate).toHaveBeenCalledWith(
      expect.objectContaining({ partyroomId: 42 }),
      expect.objectContaining({
        onSuccess: expect.any(Function),
        onError: expect.any(Function),
      })
    );
  });

  test('enter 실패 시 로비로 이동한다 (백엔드 exit 워크어라운드 없음)', () => {
    const { result } = renderHook(() => useEnterPartyroom(1));

    act(() => {
      result.current();
    });

    const onConnectCallback = mockOnConnect.mock.calls[0][0];
    onConnectCallback();

    // enter mutation의 onError 콜백 실행
    const mutateOptions = mockMutate.mock.calls[0][1];
    mutateOptions.onError();

    // enter 자체가 실패했으므로 입장한 룸이 없다. 레이아웃 언마운트는 더 이상
    // 백엔드 exit을 호출하지 않으므로 별도의 억제 워크어라운드가 필요 없다.
    expect(mockPush).toHaveBeenCalledWith('/parties');
  });

  test('options.entrySource를 받아도 기존 enter 흐름은 변경되지 않는다 (PR-3 시그니처 회귀)', () => {
    const { result } = renderHook(() => useEnterPartyroom(7, { entrySource: 'list' }));

    act(() => {
      result.current();
    });

    expect(mockOnConnect).toHaveBeenCalledWith(expect.any(Function), { once: true });

    const onConnectCallback = mockOnConnect.mock.calls[0][0];
    onConnectCallback();

    expect(mockMutate).toHaveBeenCalledWith(
      expect.objectContaining({ partyroomId: 7 }),
      expect.objectContaining({ onSuccess: expect.any(Function), onError: expect.any(Function) })
    );
  });
});

describe('useEnterPartyroom 재연결 resync (#402/#469)', () => {
  // #469: onConnect 는 초기 enter(once) 1회만 등록되고, resync 는 그 once 핸들러 실행 시
  // setRoomReconnectHandler 로 단일 슬롯 등록된다(방마다 누적 X). 아래는 그 resync 콜백을 꺼내온다.
  const registerAndGetResync = (partyroomId: number) => {
    const { result } = renderHook(() => useEnterPartyroom(partyroomId));
    act(() => result.current());
    mockOnConnect.mock.calls[0][0](); // once 핸들러 → 초기 enter + resync 등록
    mockMutate.mockClear(); // 초기 enter 호출 제거 → 이후 resync enter 가 calls[0]
    return mockSetRoomReconnectHandler.mock.calls[0][0] as () => void;
  };

  test('#469 onConnect 는 once 1회만(재연결 핸들러 누적 없음), resync 는 setRoomReconnectHandler 로 등록', () => {
    const { result } = renderHook(() => useEnterPartyroom(1));
    act(() => result.current());

    expect(mockOnConnect).toHaveBeenCalledTimes(1);
    expect(mockOnConnect).toHaveBeenCalledWith(expect.any(Function), { once: true });
    expect(mockSetRoomReconnectHandler).not.toHaveBeenCalled();

    mockOnConnect.mock.calls[0][0](); // once 실행 시 resync 등록
    expect(mockSetRoomReconnectHandler).toHaveBeenCalledWith(expect.any(Function));
  });

  test('재연결 시 enter(tryEnter) 호출', () => {
    const resync = registerAndGetResync(7);
    resync();
    expect(mockMutate).toHaveBeenCalledWith(
      expect.objectContaining({ partyroomId: 7 }),
      expect.objectContaining({ onSuccess: expect.any(Function), onError: expect.any(Function) })
    );
  });

  test('reactivated=false → setup 미호출, DJ큐 invalidate', () => {
    const resync = registerAndGetResync(7);
    resync();
    mockMutate.mock.calls[0][1].onSuccess({ crewId: 1, gradeType: 'LISTENER', reactivated: false });
    expect(partyroomsService.getSetupInfo).not.toHaveBeenCalled();
    expect(mockInvalidateQueries).toHaveBeenCalledWith({ queryKey: [QueryKeys.DjingQueue, 7] });
  });

  test('reactivated=true → setup(재수화) 호출', () => {
    (partyroomsService.getSetupInfo as Mock).mockReturnValue(new Promise(() => {}));
    (partyroomsService.getNotice as Mock).mockReturnValue(new Promise(() => {}));
    const resync = registerAndGetResync(7);
    resync();
    mockMutate.mock.calls[0][1].onSuccess({ crewId: 1, gradeType: 'LISTENER', reactivated: true });
    expect(partyroomsService.getSetupInfo).toHaveBeenCalled();
  });

  test('enter onError → 로비', () => {
    const resync = registerAndGetResync(7);
    resync();
    mockMutate.mock.calls[0][1].onError();
    expect(mockPush).toHaveBeenCalledWith('/parties');
  });
});

describe('플레이백 요약 추적기 배선 (#444)', () => {
  const enterViaOnce = (
    partyroomId: number,
    enterResponse = { crewId: 1, gradeType: 'LISTENER' }
  ) => {
    const { result } = renderHook(() => useEnterPartyroom(partyroomId));
    act(() => result.current());
    mockOnConnect.mock.calls[0][0]();
    mockMutate.mock.calls[0][1].onSuccess(enterResponse);
  };

  test('L1: setup 시작 시 추적기를 즉시 clear한다 (await 이전)', () => {
    (partyroomsService.getSetupInfo as Mock).mockReturnValue(new Promise(() => {}));
    (partyroomsService.getNotice as Mock).mockReturnValue(new Promise(() => {}));

    enterViaOnce(7);

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
        // NOTE: motion 미포함 — crewIdToMotionTypeMap의 reduce 초기값이 {} as Map(Map 아님)이라
        // motion 배열이 존재하면 mock 경로에서 .set/.get 크래시. 선재 버그, #445로 추적.
        // 시드② 매핑 검증엔 불필요.
        reaction: {
          history: { isLiked: false, isDisliked: false, isGrabbed: false },
          aggregation: { likeCount: 1, dislikeCount: 2, grabCount: 3 },
        },
        currentDj: { crewId: 7 },
      },
    });
    (partyroomsService.getNotice as Mock).mockResolvedValue({ content: '공지' });

    enterViaOnce(7);

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

    enterViaOnce(7);

    await vi.waitFor(() => expect(mockSeedFromSetup).toHaveBeenCalled());
    expect(mockSeedFromSetup).toHaveBeenCalledWith({
      playback: undefined,
      counts: undefined,
      djNickname: null,
      now: expect.any(Number),
    });
  });

  test('L2: 재연결 resync 발화 시 추적기를 clear한다 (#469 setRoomReconnectHandler)', () => {
    const { result } = renderHook(() => useEnterPartyroom(7));
    act(() => result.current());
    mockOnConnect.mock.calls[0][0](); // once 핸들러 → resync 등록
    const resync = mockSetRoomReconnectHandler.mock.calls[0][0] as () => void;

    expect(mockTrackerClear).not.toHaveBeenCalled(); // 등록만으론 clear 안 함

    resync(); // 재연결 발화
    expect(mockTrackerClear).toHaveBeenCalledTimes(1);
  });
});
