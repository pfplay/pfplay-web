import { render, screen, act, waitFor } from '@testing-library/react';
import { useDialogContext } from './dialog.context';
import { DialogProvider } from './dialog.provider';

vi.mock('@/shared/lib/localization/i18n.context', () => ({
  useI18n: () => ({ common: { btn: { confirm: '확인', cancel: '취소' } } }),
}));

/**
 * #488: 다이얼로그가 닫히고 DOM 에서 제거될 때까지 창(제거 지연)이 있다. 그 사이에 사용자가
 * 바깥 입력창을 클릭해 포커스를 두면, 제거 시점의 포커스 복원이 그 포커스를 빼앗아
 * 이후 타이핑이 사라진다("커서는 깜빡이는데 글자가 안 써진다").
 */
const Harness = () => {
  const { openDialog } = useDialogContext();

  return (
    <div>
      <input data-testid='outside-input' />
      <button
        data-testid='open-trigger'
        onClick={() =>
          openDialog(() => ({
            Body: <div data-testid='dialog-body'>본문</div>,
          }))
        }
      >
        열기
      </button>
    </div>
  );
};

describe('DialogProvider — #488 포커스 보존', () => {
  test('닫히는 동안 사용자가 바깥 요소로 포커스를 옮기면, 제거 후에도 그 포커스가 유지된다', async () => {
    render(
      <DialogProvider>
        <Harness />
      </DialogProvider>
    );

    const trigger = screen.getByTestId('open-trigger');
    const outsideInput = screen.getByTestId('outside-input') as HTMLInputElement;

    // 다이얼로그 열기 (트리거가 포커스를 가진 상태 — 복원 대상이 된다)
    trigger.focus();
    await act(async () => {
      trigger.click();
    });
    expect(screen.getByTestId('dialog-body')).toBeTruthy();

    // 닫기 시작 — 제거까지는 지연이 있다
    const dialogRoot = document.querySelector('[data-testid="dialog-panel"]');
    await act(async () => {
      (dialogRoot?.parentElement ?? document.body).dispatchEvent(
        new MouseEvent('click', { bubbles: true })
      );
    });

    // 창 안에서 사용자가 바깥 입력창을 클릭해 포커스를 둔다(실제 클릭과 동일한 순서)
    await act(async () => {
      outsideInput.dispatchEvent(new Event('pointerdown', { bubbles: true }));
      outsideInput.focus();
    });
    expect(document.activeElement).toBe(outsideInput);

    // 제거가 끝난 뒤에도 사용자의 포커스가 유지되어야 한다
    await waitFor(
      () => {
        expect(screen.queryByTestId('dialog-body')).toBeNull();
      },
      { timeout: 3_000 }
    );
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 100));
    });

    expect(document.activeElement).toBe(outsideInput);
  });
});
