vi.mock('../api/use-change-notice.mutation');
vi.mock('../api/use-can-change-notice.hook');
vi.mock('@/shared/lib/localization/i18n.context');
vi.mock('@/shared/ui/components/dialog');

import type { FC } from 'react';
import { renderHook, act, render, screen, fireEvent } from '@testing-library/react';
import { useI18n } from '@/shared/lib/localization/i18n.context';
import { useDialog } from '@/shared/ui/components/dialog';
import useChangeNotice from './use-change-notice.hook';
import useCanChangeNotice from '../api/use-can-change-notice.hook';
import useChangeNoticeMutation from '../api/use-change-notice.mutation';

const mockMutate = vi.fn();
const mockOpenDialog = vi.fn();
const mockOpenConfirmDialog = vi.fn();

beforeEach(() => {
  vi.clearAllMocks();
  (useChangeNoticeMutation as Mock).mockReturnValue({ mutate: mockMutate });
  (useI18n as Mock).mockReturnValue({
    ed: { btn: { regi_notice: 'Title' }, para: { noti_deleted: 'Sub', edit_only_admin: 'NoAuth' } },
    common: { btn: { cancel: 'Cancel', confirm: 'Confirm' }, ec: { char_up_to_50: 'Placeholder' } },
  });
  (useDialog as Mock).mockReturnValue({
    openDialog: mockOpenDialog,
    openConfirmDialog: mockOpenConfirmDialog,
  });
});

describe('useChangeNotice', () => {
  test('권한이 없으면 등급 안내를 띄우고 공지 등록은 열지 않는다', async () => {
    (useCanChangeNotice as Mock).mockReturnValue(false);

    const { result } = renderHook(() => useChangeNotice());
    await act(async () => {
      await result.current();
    });

    expect(mockOpenConfirmDialog).toHaveBeenCalled();
    expect(mockOpenDialog).not.toHaveBeenCalled();
    expect(mockMutate).not.toHaveBeenCalled();
  });

  test('입력 후 확인하면 그 내용으로 mutate를 호출한다', async () => {
    (useCanChangeNotice as Mock).mockReturnValue(true);
    mockOpenDialog.mockResolvedValue('오늘 파티 10시 시작');

    const { result } = renderHook(() => useChangeNotice());
    await act(async () => {
      await result.current();
    });

    expect(mockOpenConfirmDialog).not.toHaveBeenCalled();
    expect(mockMutate).toHaveBeenCalledWith('오늘 파티 10시 시작');
  });

  test('빈 값으로 확인하면 빈 문자열로 mutate 해 공지를 지운다', async () => {
    (useCanChangeNotice as Mock).mockReturnValue(true);
    mockOpenDialog.mockResolvedValue('');

    const { result } = renderHook(() => useChangeNotice());
    await act(async () => {
      await result.current();
    });

    expect(mockMutate).toHaveBeenCalledWith('');
  });

  test('취소하면 mutate를 호출하지 않는다', async () => {
    (useCanChangeNotice as Mock).mockReturnValue(true);
    mockOpenDialog.mockResolvedValue(undefined);

    const { result } = renderHook(() => useChangeNotice());
    await act(async () => {
      await result.current();
    });

    expect(mockMutate).not.toHaveBeenCalled();
  });
});

describe('공지 등록 다이얼로그', () => {
  const onOk = vi.fn();

  const renderBody = async () => {
    (useCanChangeNotice as Mock).mockReturnValue(true);

    let Body: FC = () => null;
    mockOpenDialog.mockImplementation((factory) => {
      Body = factory(onOk, vi.fn()).Body;
      return new Promise(() => {});
    });

    const { result } = renderHook(() => useChangeNotice());
    act(() => {
      result.current();
    });

    render(<Body />);
    return {
      input: screen.getByTestId('change-notice-input'),
      confirm: screen.getByTestId('change-notice-confirm-button') as HTMLButtonElement,
    };
  };

  test('50자 이하면 확인 버튼이 활성화된다', async () => {
    const { input, confirm } = await renderBody();

    fireEvent.change(input, { target: { value: 'ㄱ'.repeat(50) } });

    expect(confirm.disabled).toBe(false);
  });

  test('50자를 넘으면 확인 버튼이 비활성화된다', async () => {
    const { input, confirm } = await renderBody();

    fireEvent.change(input, { target: { value: 'ㄱ'.repeat(51) } });

    expect(confirm.disabled).toBe(true);
  });

  test('50자를 넘은 상태로 Enter 를 눌러도 등록되지 않는다', async () => {
    const { input } = await renderBody();

    fireEvent.change(input, { target: { value: 'ㄱ'.repeat(51) } });
    fireEvent.keyDown(input, { key: 'Enter' });

    expect(onOk).not.toHaveBeenCalled();
  });

  test('비어 있어도 확인 버튼은 활성화된다', async () => {
    const { confirm } = await renderBody();

    expect(confirm.disabled).toBe(false);
  });
});
