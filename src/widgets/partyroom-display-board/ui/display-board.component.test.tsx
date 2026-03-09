vi.mock('./parts/action-buttons.component', () => ({
  __esModule: true,
  default: () => <div data-testid='action-buttons' />,
}));
vi.mock('./parts/add-tracks-button.component', () => ({
  __esModule: true,
  default: () => <div data-testid='add-tracks-button' />,
}));
vi.mock('./parts/notice.component', () => ({
  __esModule: true,
  default: () => <div data-testid='notice' />,
}));
vi.mock('./parts/video-title.component', () => ({
  __esModule: true,
  default: () => <div data-testid='video-title' />,
}));
vi.mock('./parts/video.component', () => ({
  __esModule: true,
  default: ({ width }: any) => <div data-testid='video' data-width={width} />,
}));

import { render, screen } from '@testing-library/react';
import DisplayBoard from './display-board.component';

describe('DisplayBoard', () => {
  test('모든 서브 컴포넌트를 렌더링한다', () => {
    render(<DisplayBoard width={800} />);
    expect(screen.getByTestId('action-buttons')).toBeTruthy();
    expect(screen.getByTestId('add-tracks-button')).toBeTruthy();
    expect(screen.getByTestId('notice')).toBeTruthy();
    expect(screen.getByTestId('video-title')).toBeTruthy();
    expect(screen.getByTestId('video')).toBeTruthy();
  });

  test('width를 Video에 전달한다', () => {
    render(<DisplayBoard width={600} />);
    expect(screen.getByTestId('video').getAttribute('data-width')).toBe('600');
  });

  test('width를 컨테이너 스타일에 적용한다', () => {
    const { container } = render(<DisplayBoard width={750} />);
    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper.style.width).toBe('750px');
  });
});
