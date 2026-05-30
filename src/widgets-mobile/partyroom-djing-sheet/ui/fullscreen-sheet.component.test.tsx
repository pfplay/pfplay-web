import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, test, vi } from 'vitest';
import FullscreenSheet from './fullscreen-sheet.component';

describe('FullscreenSheet', () => {
  test('open=false 시 미렌더', () => {
    const onClose = vi.fn();
    const { container } = render(
      <FullscreenSheet open={false} title='테스트' onClose={onClose}>
        body
      </FullscreenSheet>
    );
    expect(container.innerHTML).toBe('');
  });

  test('open=true 시 role=dialog + aria-modal + aria-labelledby', () => {
    const onClose = vi.fn();
    render(
      <FullscreenSheet open={true} title='플레이리스트 선택' onClose={onClose}>
        body
      </FullscreenSheet>
    );
    const dialog = screen.getByRole('dialog');
    expect(dialog).toHaveAttribute('aria-modal', 'true');
    const titleId = dialog.getAttribute('aria-labelledby');
    expect(titleId).toBeTruthy();
    const title = titleId ? document.getElementById(titleId) : null;
    expect(title?.textContent).toBe('플레이리스트 선택');
  });

  test('header 의 × 클릭 시 onClose 호출 (onBack 없을 때)', async () => {
    const onClose = vi.fn();
    render(
      <FullscreenSheet open={true} title='t' onClose={onClose}>
        body
      </FullscreenSheet>
    );
    await userEvent.click(screen.getByTestId('fullscreen-sheet-close'));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  test('onBack 있을 때 ← 버튼 노출, 클릭 시 onBack 호출', async () => {
    const onBack = vi.fn();
    const onClose = vi.fn();
    render(
      <FullscreenSheet open={true} title='t' onClose={onClose} onBack={onBack}>
        body
      </FullscreenSheet>
    );
    expect(screen.queryByTestId('fullscreen-sheet-close')).not.toBeInTheDocument();
    await userEvent.click(screen.getByTestId('fullscreen-sheet-back'));
    expect(onBack).toHaveBeenCalledTimes(1);
    expect(onClose).not.toHaveBeenCalled();
  });

  test('ESC 키 자체 처리 없음 (hook 단일 ESC 정책 — spec §5.2 잠금)', () => {
    const onBack = vi.fn();
    const onClose = vi.fn();
    render(
      <FullscreenSheet open={true} title='t' onClose={onClose} onBack={onBack}>
        body
      </FullscreenSheet>
    );
    fireEvent.keyDown(window, { key: 'Escape' });
    // FullscreenSheet 자체엔 ESC handler 없음 — onBack/onClose 미발화
    expect(onBack).not.toHaveBeenCalled();
    expect(onClose).not.toHaveBeenCalled();
  });

  test('body / footer slot 렌더', () => {
    const onClose = vi.fn();
    render(
      <FullscreenSheet
        open={true}
        title='t'
        onClose={onClose}
        footer={<div data-testid='ft'>FOOTER</div>}
      >
        <div data-testid='bd'>BODY</div>
      </FullscreenSheet>
    );
    expect(screen.getByTestId('bd')).toHaveTextContent('BODY');
    expect(screen.getByTestId('ft')).toHaveTextContent('FOOTER');
  });

  test('open=true 시 document.body 에 overflow:hidden (scroll lock)', () => {
    const onClose = vi.fn();
    const { unmount } = render(
      <FullscreenSheet open={true} title='t' onClose={onClose}>
        body
      </FullscreenSheet>
    );
    expect(document.body.style.overflow).toBe('hidden');
    unmount();
    expect(document.body.style.overflow).toBe('');
  });

  test('open=true 시 focus 가 sheet 안으로 (× 또는 ←)', () => {
    const onClose = vi.fn();
    render(
      <FullscreenSheet open={true} title='t' onClose={onClose}>
        body
      </FullscreenSheet>
    );
    expect(document.activeElement).toBe(screen.getByTestId('fullscreen-sheet-close'));
  });
});
