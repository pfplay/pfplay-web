import React from 'react';
import { render, fireEvent } from '@testing-library/react';
import PreviewOverlay from './preview-overlay.component';

jest.mock('react', () => {
  const actual = jest.requireActual('react');
  globalThis.React = actual;
  return actual;
});

describe('PreviewOverlay', () => {
  const defaultProps = {
    isPlaying: false,
    onPlay: jest.fn(),
    onStop: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('초기 상태에서 오버레이 내부 컨텐츠가 숨겨져 있다', () => {
    const { container } = render(<PreviewOverlay {...defaultProps} />);

    const root = container.firstElementChild as HTMLElement;
    expect(root.querySelector('.bg-white')).toBeNull();
  });

  test('hover 시 오버레이 내부가 표시된다', () => {
    const { container } = render(<PreviewOverlay {...defaultProps} />);

    const root = container.firstElementChild as HTMLElement;
    fireEvent.mouseEnter(root);

    expect(root.querySelector('.bg-white')).not.toBeNull();
  });

  test('unhover 시 오버레이 내부가 다시 숨겨진다', () => {
    const { container } = render(<PreviewOverlay {...defaultProps} />);

    const root = container.firstElementChild as HTMLElement;
    fireEvent.mouseEnter(root);
    expect(root.querySelector('.bg-white')).not.toBeNull();

    fireEvent.mouseLeave(root);
    expect(root.querySelector('.bg-white')).toBeNull();
  });

  test('isPlaying=false 상태에서 클릭하면 onPlay 콜백이 호출된다', () => {
    const onPlay = jest.fn();
    const { container } = render(
      <PreviewOverlay isPlaying={false} onPlay={onPlay} onStop={jest.fn()} />
    );

    const root = container.firstElementChild as HTMLElement;
    fireEvent.click(root);

    expect(onPlay).toHaveBeenCalledTimes(1);
  });

  test('isPlaying=true 상태에서 클릭하면 onStop 콜백이 호출된다', () => {
    const onStop = jest.fn();
    const { container } = render(
      <PreviewOverlay isPlaying={true} onPlay={jest.fn()} onStop={onStop} />
    );

    const root = container.firstElementChild as HTMLElement;
    fireEvent.click(root);

    expect(onStop).toHaveBeenCalledTimes(1);
  });

  test('클릭 시 이벤트 전파가 차단된다 (stopPropagation)', () => {
    const outerHandler = jest.fn();
    const { container } = render(
      <div onClick={outerHandler}>
        <PreviewOverlay {...defaultProps} />
      </div>
    );

    const overlay = container.querySelector('.cursor-pointer') as HTMLElement;
    fireEvent.click(overlay);

    expect(outerHandler).not.toHaveBeenCalled();
  });
});
