vi.mock('@/shared/lib/localization/i18n.context');
vi.mock('@/shared/ui/components/dialog');
vi.mock('../api/use-sign-out.mutation');

import { renderHook, act } from '@testing-library/react';
import { useI18n } from '@/shared/lib/localization/i18n.context';
import { useDialog } from '@/shared/ui/components/dialog';
import useSignOut from './use-sign-out.hook';
import useSignOutMutation from '../api/use-sign-out.mutation';

const mockSignOut = vi.fn();
const mockOpenConfirmDialog = vi.fn();

beforeEach(() => {
  vi.clearAllMocks();
  (useI18n as Mock).mockReturnValue({
    common: { btn: { logout: 'Logout' } },
    auth: { para: { logout_confirm: 'Are you sure?' } },
  });
  (useDialog as Mock).mockReturnValue({ openConfirmDialog: mockOpenConfirmDialog });
  (useSignOutMutation as Mock).mockReturnValue({ mutate: mockSignOut });
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
