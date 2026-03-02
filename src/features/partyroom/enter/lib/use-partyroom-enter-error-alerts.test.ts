jest.mock('@/shared/lib/localization/i18n.context');
jest.mock('@/shared/ui/components/dialog');
jest.mock('@/shared/api/http/error/use-on-error.hook');

import { renderHook } from '@testing-library/react';
import useOnError from '@/shared/api/http/error/use-on-error.hook';
import { ErrorCode } from '@/shared/api/http/types/@shared';
import { useI18n } from '@/shared/lib/localization/i18n.context';
import { useDialog } from '@/shared/ui/components/dialog';
import usePartyroomEnterErrorAlerts from './use-partyroom-enter-error-alerts';

const mockOpenAlertDialog = jest.fn();

beforeEach(() => {
  jest.clearAllMocks();
  (useI18n as jest.Mock).mockReturnValue({
    partyroom: { ec: { shut_down: 'Room closed' } },
    auth: { para: { auth_quota_exceeded: 'Limit exceeded' } },
  });
  (useDialog as jest.Mock).mockReturnValue({ openAlertDialog: mockOpenAlertDialog });
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  (useOnError as jest.Mock).mockImplementation(() => {});
});

describe('usePartyroomEnterErrorAlerts', () => {
  test('3개의 에러 코드에 대해 useOnError를 등록한다', () => {
    renderHook(() => usePartyroomEnterErrorAlerts());

    expect(useOnError).toHaveBeenCalledTimes(3);
    expect(useOnError).toHaveBeenCalledWith(ErrorCode.NOT_FOUND_ROOM, expect.any(Function));
    expect(useOnError).toHaveBeenCalledWith(ErrorCode.ALREADY_TERMINATED, expect.any(Function));
    expect(useOnError).toHaveBeenCalledWith(ErrorCode.EXCEEDED_LIMIT, expect.any(Function));
  });

  test('NOT_FOUND_ROOM 콜백이 shut_down 메시지로 alert를 연다', () => {
    (useOnError as jest.Mock).mockImplementation(
      (code: ErrorCode, cb: (...args: any[]) => void) => {
        if (code === ErrorCode.NOT_FOUND_ROOM) cb();
      }
    );

    renderHook(() => usePartyroomEnterErrorAlerts());
    expect(mockOpenAlertDialog).toHaveBeenCalledWith({ content: 'Room closed' });
  });

  test('EXCEEDED_LIMIT 콜백이 auth_quota_exceeded 메시지로 alert를 연다', () => {
    (useOnError as jest.Mock).mockImplementation(
      (code: ErrorCode, cb: (...args: any[]) => void) => {
        if (code === ErrorCode.EXCEEDED_LIMIT) cb();
      }
    );

    renderHook(() => usePartyroomEnterErrorAlerts());
    expect(mockOpenAlertDialog).toHaveBeenCalledWith({ content: 'Limit exceeded' });
  });
});
