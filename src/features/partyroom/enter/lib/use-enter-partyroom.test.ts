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
const mockMutate = vi.fn();
const mockInit = vi.fn();
const mockPush = vi.fn();
const mockInvalidateQueries = vi.fn();

beforeEach(() => {
  vi.clearAllMocks();
  (usePartyroomClient as Mock).mockReturnValue({
    onConnect: mockOnConnect,
    subscribe: vi.fn(),
  });
  (useHandlePartyroomSubscriptionEvent as Mock).mockReturnValue(vi.fn());
  (useStores as Mock).mockReturnValue({
    useCurrentPartyroom: (selector: (...args: any[]) => any) => selector({ init: mockInit }),
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

describe('useEnterPartyroom resync (#402)', () => {
  // calls[0] = once enter, calls[1] = resync(non-once)
  const registerAndGetResync = (partyroomId: number) => {
    const { result } = renderHook(() => useEnterPartyroom(partyroomId));
    act(() => result.current());
    return mockOnConnect.mock.calls[1][0] as () => void;
  };

  test('resync 핸들러를 비-once 로 등록한다 (2번째 onConnect, options 없음)', () => {
    const { result } = renderHook(() => useEnterPartyroom(1));
    act(() => result.current());
    expect(mockOnConnect).toHaveBeenNthCalledWith(2, expect.any(Function));
  });

  test('첫 연결은 skip — mutate 미호출', () => {
    const resync = registerAndGetResync(7);
    resync(); // 첫 발화 = firstConnect skip
    expect(mockMutate).not.toHaveBeenCalled();
  });

  test('재연결 시 enter(tryEnter) 호출', () => {
    const resync = registerAndGetResync(7);
    resync(); // skip
    resync(); // 재연결
    expect(mockMutate).toHaveBeenCalledWith(
      expect.objectContaining({ partyroomId: 7 }),
      expect.objectContaining({ onSuccess: expect.any(Function), onError: expect.any(Function) })
    );
  });

  test('reactivated=false → setup 미호출, DJ큐 invalidate', () => {
    const resync = registerAndGetResync(7);
    resync();
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
    resync();
    mockMutate.mock.calls[0][1].onSuccess({ crewId: 1, gradeType: 'LISTENER', reactivated: true });
    expect(partyroomsService.getSetupInfo).toHaveBeenCalled();
  });

  test('enter onError → 로비', () => {
    const resync = registerAndGetResync(7);
    resync();
    resync();
    mockMutate.mock.calls[0][1].onError();
    expect(mockPush).toHaveBeenCalledWith('/parties');
  });
});
