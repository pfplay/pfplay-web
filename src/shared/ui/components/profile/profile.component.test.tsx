import { render, screen } from '@testing-library/react';
import Profile from './profile.component';

describe('Profile', () => {
  test('src가 없으면 빈 프로필 SVG가 렌더링된다', () => {
    render(<Profile size={48} />);
    const svg = screen.getAllByRole('presentation')[0];
    expect(svg.tagName).toBe('svg');
  });

  test('src가 있으면 div로 렌더링된다 (SVG가 아닌)', () => {
    render(<Profile size={48} src='https://example.com/avatar.png' />);
    const el = screen.getByRole('presentation');
    expect(el.tagName).toBe('DIV');
    expect(el.className).toContain('rounded-full');
  });

  test('size가 width/height에 반영된다', () => {
    render(<Profile size={64} src='https://example.com/avatar.png' />);
    const el = screen.getByRole('presentation');
    expect(el.style.width).toBe('64px');
    expect(el.style.height).toBe('64px');
  });
});
