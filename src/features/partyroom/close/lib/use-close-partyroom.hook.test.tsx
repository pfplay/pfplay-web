jest.mock('../api/use-close-partyroom.mutation');
jest.mock('../api/use-can-close-current-partyroom.hook');
jest.mock('@/shared/lib/localization/i18n.context');
jest.mock('@/shared/ui/components/dialog');

import { renderHook, act } from '@testing-library/react';
import { useI18n } from '@/shared/lib/localization/i18n.context';
import { useDialog } from '@/shared/ui/components/dialog';
import useClosePartyroom from './use-close-partyroom.hook';
import useCanCloseCurrentPartyroom from '../api/use-can-close-current-partyroom.hook';
import useClosePartyroomMutation from '../api/use-close-partyroom.mutation';

const mockMutate = jest.fn();
const mockOpenDialog = jest.fn();

beforeEach(() => {
  jest.clearAllMocks();
  (useClosePartyroomMutation as jest.Mock).mockReturnValue({ mutate: mockMutate });
  (useI18n as jest.Mock).mockReturnValue({
    party: { para: { match_for_close_party: 'CLOSE', close: 'Close' } },
    common: { btn: { cancel: 'Cancel' } },
  });
  (useDialog as jest.Mock).mockReturnValue({ openDialog: mockOpenDialog });
});

describe('useClosePartyroom', () => {
  test('canClose가 false면 다이얼로그를 열지 않는다', async () => {
    (useCanCloseCurrentPartyroom as jest.Mock).mockReturnValue(false);

    const { result } = renderHook(() => useClosePartyroom());
    await act(async () => {
      await result.current();
    });

    expect(mockOpenDialog).not.toHaveBeenCalled();
    expect(mockMutate).not.toHaveBeenCalled();
  });

  test('다이얼로그 확인 시 mutate를 호출한다', async () => {
    (useCanCloseCurrentPartyroom as jest.Mock).mockReturnValue(true);
    mockOpenDialog.mockResolvedValue(true);

    const { result } = renderHook(() => useClosePartyroom());
    await act(async () => {
      await result.current();
    });

    expect(mockOpenDialog).toHaveBeenCalled();
    expect(mockMutate).toHaveBeenCalled();
  });

  test('다이얼로그 취소 시 mutate를 호출하지 않는다', async () => {
    (useCanCloseCurrentPartyroom as jest.Mock).mockReturnValue(true);
    mockOpenDialog.mockResolvedValue(false);

    const { result } = renderHook(() => useClosePartyroom());
    await act(async () => {
      await result.current();
    });

    expect(mockOpenDialog).toHaveBeenCalled();
    expect(mockMutate).not.toHaveBeenCalled();
  });
});
