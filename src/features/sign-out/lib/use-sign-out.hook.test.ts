jest.mock('@/shared/lib/localization/i18n.context');
jest.mock('@/shared/ui/components/dialog');
jest.mock('../api/use-sign-out.mutation');

import { renderHook, act } from '@testing-library/react';
import { useI18n } from '@/shared/lib/localization/i18n.context';
import { useDialog } from '@/shared/ui/components/dialog';
import useSignOut from './use-sign-out.hook';
import useSignOutMutation from '../api/use-sign-out.mutation';

const mockSignOut = jest.fn();
const mockOpenConfirmDialog = jest.fn();

beforeEach(() => {
  jest.clearAllMocks();
  (useI18n as jest.Mock).mockReturnValue({
    common: { btn: { logout: 'Logout' } },
    auth: { para: { logout_confirm: 'Are you sure?' } },
  });
  (useDialog as jest.Mock).mockReturnValue({ openConfirmDialog: mockOpenConfirmDialog });
  (useSignOutMutation as jest.Mock).mockReturnValue({ mutate: mockSignOut });
});

describe('useSignOut hook', () => {
  test('확인하면 signOut을 호출한다', async () => {
    mockOpenConfirmDialog.mockResolvedValue(true);
    const { result } = renderHook(() => useSignOut());

    await act(async () => {
      await result.current();
    });

    expect(mockOpenConfirmDialog).toHaveBeenCalledWith({
      title: 'Logout',
      content: 'Are you sure?',
      okText: 'Logout',
    });
    expect(mockSignOut).toHaveBeenCalled();
  });

  test('취소하면 signOut을 호출하지 않는다', async () => {
    mockOpenConfirmDialog.mockResolvedValue(false);
    const { result } = renderHook(() => useSignOut());

    await act(async () => {
      await result.current();
    });

    expect(mockSignOut).not.toHaveBeenCalled();
  });
});
