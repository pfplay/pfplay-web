import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, test, vi } from 'vitest';
import DjRegistrationSearchListItem from './dj-registration-search-list-item.component';

const TRACK = {
  videoId: 'abc123',
  videoTitle: 'Song A',
  thumbnailUrl: 'https://example.com/thumb.jpg',
  runningTime: '3:30',
};

describe('DjRegistrationSearchListItem', () => {
  test('선택 상태를 접근성 상태로 노출한다', () => {
    render(<DjRegistrationSearchListItem music={TRACK as never} selected onSelect={vi.fn()} />);

    expect(screen.getByTestId('register-track-item-abc123')).toHaveAttribute(
      'aria-pressed',
      'true'
    );
  });

  test('곡 행을 클릭하면 onSelect(music)을 호출한다', async () => {
    const onSelect = vi.fn();
    render(<DjRegistrationSearchListItem music={TRACK as never} onSelect={onSelect} />);

    await userEvent.click(screen.getByTestId('register-track-item-abc123'));

    expect(onSelect).toHaveBeenCalledWith(TRACK);
  });
});
