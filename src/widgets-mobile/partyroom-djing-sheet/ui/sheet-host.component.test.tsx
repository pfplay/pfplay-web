import { ReactNode } from 'react';
import { act, fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, test, vi } from 'vitest';
import SheetHost from './sheet-host.component';
import { FullscreenSheetProvider, useFullscreenSheet } from '../lib/use-fullscreen-sheet.hook';

const wrap = ({ children }: { children: ReactNode }) => (
  <FullscreenSheetProvider>
    {children}
    <SheetHost />
  </FullscreenSheetProvider>
);

type Api = ReturnType<typeof useFullscreenSheet>;

const Trigger = ({ onMount }: { onMount: (api: Api) => void }) => {
  const api = useFullscreenSheet();
  onMount(api);
  return null;
};

const captureApi = (): { get: () => Api; onMount: (api: Api) => void } => {
  let captured: Api | null = null;
  return {
    get: () => {
      if (!captured) throw new Error('api not captured yet');
      return captured;
    },
    onMount: (api: Api) => {
      captured = api;
    },
  };
};

describe('SheetHost', () => {
  test('스택 비어있으면 dialog 미렌더', () => {
    const cap = captureApi();
    render(<Trigger onMount={cap.onMount} />, { wrapper: wrap });
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  test('스택 1개 시 그 entry 의 node 가 sheet 안에 렌더 (title + × 노출)', () => {
    const cap = captureApi();
    render(<Trigger onMount={cap.onMount} />, { wrapper: wrap });
    act(() => {
      cap.get().push({
        key: 'select-playlist',
        title: '플레이리스트 선택',
        node: <div data-testid='inner'>INNER</div>,
      });
    });
    expect(screen.getByTestId('inner')).toHaveTextContent('INNER');
    expect(screen.getByRole('dialog')).toHaveAttribute('aria-modal', 'true');
    expect(screen.getByTestId('fullscreen-sheet-close')).toBeInTheDocument();
    expect(screen.queryByTestId('fullscreen-sheet-back')).not.toBeInTheDocument();
  });

  test('스택 2개 시 최상단만 시각 렌더 (가장 위 entry 의 node 활성, ← 버튼 노출)', () => {
    const cap = captureApi();
    render(<Trigger onMount={cap.onMount} />, { wrapper: wrap });
    act(() => {
      cap
        .get()
        .push({
          key: 'select-playlist',
          title: '플레이리스트',
          node: <div data-testid='a'>A</div>,
        });
      cap.get().push({ key: 'add-tracks', title: '곡 추가', node: <div data-testid='b'>B</div> });
    });
    expect(screen.getByTestId('b')).toBeInTheDocument();
    expect(screen.queryByTestId('a')).not.toBeInTheDocument();
    expect(screen.getByTestId('fullscreen-sheet-back')).toBeInTheDocument();
    expect(screen.queryByTestId('fullscreen-sheet-close')).not.toBeInTheDocument();
  });

  test('ESC 통합 시나리오 — 스택 1개 시 entry.onClose 1번만 발화 (double pop 없음)', () => {
    const cap = captureApi();
    const onClose = vi.fn();
    const backSpy = vi.spyOn(window.history, 'back');
    render(<Trigger onMount={cap.onMount} />, { wrapper: wrap });
    act(() => {
      cap.get().push({ key: 'select-playlist', node: <div />, onClose });
    });
    act(() => {
      fireEvent.keyDown(window, { key: 'Escape' });
    });
    expect(backSpy).toHaveBeenCalledTimes(1);
    act(() => {
      fireEvent.popState(window);
    });
    expect(onClose).toHaveBeenCalledTimes(1);
    backSpy.mockRestore();
  });
});
