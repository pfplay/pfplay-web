vi.mock('@/shared/lib/store/stores.context');
vi.mock('@/shared/lib/localization/i18n.context');
vi.mock('@/shared/ui/components/dialog');

import { renderHook, act } from '@testing-library/react';
import { useI18n } from '@/shared/lib/localization/i18n.context';
import { processI18nString } from '@/shared/lib/localization/renderer/processors/variable-processor-util';
import { useDialog } from '@/shared/ui/components/dialog';
import useDjRemovedAlert from './use-dj-removed-alert.hook';

const mockOpenAlertDialog = vi.fn();
let alertCallback: (...args: any[]) => void;

vi.mock('./use-alert.hook', () => ({
  __esModule: true,
  default: vi.fn((cb: (...args: any[]) => void) => {
    alertCallback = cb;
  }),
}));

const t = {
  dj: {
    title: {
      dj_queue: 'DJ Queue',
    },
    para: {
      playback_stopped_time_limit:
        "Playback stopped: a track exceeds this room's time limit ({{minutes}} min).",
      playback_stopped_no_limit: 'Playback stopped: no playable track.',
      deleted_queue_by_admin: 'You have been removed from the queue by the administrator',
    },
  },
};

beforeEach(() => {
  vi.clearAllMocks();
  (useI18n as Mock).mockReturnValue(t);
  (useDialog as Mock).mockReturnValue({ openAlertDialog: mockOpenAlertDialog });
});

describe('useDjRemovedAlert', () => {
  test('dj-deactivated + playbackTimeLimitMinutes=5 → 시간 제한 메시지로 다이얼로그를 연다', () => {
    renderHook(() => useDjRemovedAlert());

    act(() => {
      alertCallback({ type: 'dj-deactivated', playbackTimeLimitMinutes: 5 });
    });

    expect(mockOpenAlertDialog).toHaveBeenCalledWith(
      expect.objectContaining({
        content: processI18nString(t.dj.para.playback_stopped_time_limit, { minutes: '5' }),
      })
    );
  });

  test('dj-deactivated + playbackTimeLimitMinutes=0 → no_limit 메시지로 다이얼로그를 연다', () => {
    renderHook(() => useDjRemovedAlert());

    act(() => {
      alertCallback({ type: 'dj-deactivated', playbackTimeLimitMinutes: 0 });
    });

    expect(mockOpenAlertDialog).toHaveBeenCalledWith(
      expect.objectContaining({
        content: t.dj.para.playback_stopped_no_limit,
      })
    );
  });

  test('dj-deactivated + playbackTimeLimitMinutes=null → no_limit 메시지로 다이얼로그를 연다', () => {
    renderHook(() => useDjRemovedAlert());

    act(() => {
      alertCallback({ type: 'dj-deactivated', playbackTimeLimitMinutes: null });
    });

    expect(mockOpenAlertDialog).toHaveBeenCalledWith(
      expect.objectContaining({
        content: t.dj.para.playback_stopped_no_limit,
      })
    );
  });

  test('dj-admin-removed → deleted_queue_by_admin 메시지로 다이얼로그를 연다', () => {
    renderHook(() => useDjRemovedAlert());

    act(() => {
      alertCallback({ type: 'dj-admin-removed' });
    });

    expect(mockOpenAlertDialog).toHaveBeenCalledWith(
      expect.objectContaining({
        content: t.dj.para.deleted_queue_by_admin,
      })
    );
  });

  test('DJ 관련이 아닌 메시지는 무시한다 (다이얼로그 미호출)', () => {
    renderHook(() => useDjRemovedAlert());

    act(() => {
      alertCallback({ type: 'grade-adjusted', prev: 'CLUBBER', next: 'MODERATOR' });
    });

    expect(mockOpenAlertDialog).not.toHaveBeenCalled();
  });
});
