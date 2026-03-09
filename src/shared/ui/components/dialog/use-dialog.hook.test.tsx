const mockOpenDialog = vi.fn();
const mockCloseDialog = vi.fn();

vi.mock('./dialog.context', () => ({
  useDialogContext: () => ({
    openDialog: mockOpenDialog,
    closeDialog: mockCloseDialog,
  }),
}));
vi.mock('@/shared/lib/localization/i18n.context', () => ({
  useI18n: () => ({
    common: { btn: { confirm: '확인', cancel: '취소' } },
  }),
}));

import { renderHook, act } from '@testing-library/react';
import { useDialog } from './use-dialog.hook';

beforeEach(() => {
  vi.clearAllMocks();
});

describe('useDialog', () => {
  test('openDialog와 closeDialog를 반환한다', () => {
    const { result } = renderHook(() => useDialog());
    expect(result.current.openDialog).toBe(mockOpenDialog);
    expect(result.current.closeDialog).toBe(mockCloseDialog);
  });

  test('openAlertDialog를 호출하면 openDialog가 factory와 함께 호출된다', async () => {
    mockOpenDialog.mockResolvedValue(undefined);
    const { result } = renderHook(() => useDialog());

    await act(async () => {
      await result.current.openAlertDialog({ title: '알림', content: '내용' });
    });

    expect(mockOpenDialog).toHaveBeenCalledTimes(1);
    expect(typeof mockOpenDialog.mock.calls[0][0]).toBe('function');
  });

  test('openConfirmDialog를 호출하면 openDialog가 factory와 함께 호출된다', async () => {
    mockOpenDialog.mockResolvedValue(true);
    const { result } = renderHook(() => useDialog());

    await act(async () => {
      await result.current.openConfirmDialog({ title: '확인', content: '진행?' });
    });

    expect(mockOpenDialog).toHaveBeenCalledTimes(1);
    expect(typeof mockOpenDialog.mock.calls[0][0]).toBe('function');
  });

  test('openErrorDialog를 호출하면 openDialog가 호출된다', async () => {
    mockOpenDialog.mockResolvedValue(undefined);
    const { result } = renderHook(() => useDialog());

    await act(async () => {
      await result.current.openErrorDialog(new Error('테스트 에러'));
    });

    expect(mockOpenDialog).toHaveBeenCalledTimes(1);
  });

  test('openAlertDialog factory는 title과 Body를 포함하는 객체를 반환한다', async () => {
    mockOpenDialog.mockImplementation(async (factory: (...args: any[]) => any) => {
      const config = factory(vi.fn(), vi.fn());
      expect(config.title).toBe('알림');
      expect(typeof config.Body).toBe('function');
    });

    const { result } = renderHook(() => useDialog());
    await act(async () => {
      await result.current.openAlertDialog({ title: '알림', content: '테스트' });
    });
  });

  test('openConfirmDialog factory의 Body에서 onOk(true)와 onOk(false)를 호출할 수 있다', async () => {
    const onOk = vi.fn();
    mockOpenDialog.mockImplementation(async (factory: (...args: any[]) => any) => {
      const config = factory(onOk, vi.fn());
      expect(typeof config.Body).toBe('function');
    });

    const { result } = renderHook(() => useDialog());
    await act(async () => {
      await result.current.openConfirmDialog({ title: '확인', content: '내용' });
    });

    expect(mockOpenDialog).toHaveBeenCalledTimes(1);
  });
});
