import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, test, vi } from 'vitest';
import SearchListItem from './search-list-item.component';

// 실제 Music 타입 (src/shared/api/http/types/playlists.ts):
//   videoId / videoTitle / thumbnailUrl / runningTime
// artist 필드는 도메인에 없음 — 제목 + 재생시간만 노출
const TRACK = {
  videoId: 'abc123',
  videoTitle: 'Song A',
  thumbnailUrl: 'https://example.com/thumb.jpg',
  runningTime: '3:30',
};

describe('SearchListItem', () => {
  test('곡 메타 (제목·재생시간) 노출', () => {
    render(
      <SearchListItem
        music={TRACK as never}
        onPreview={vi.fn()}
        onAdd={vi.fn()}
        addPending={false}
      />
    );
    expect(screen.getByText('Song A')).toBeInTheDocument();
    expect(screen.getByText(/3:30/)).toBeInTheDocument();
  });

  test('▶ 버튼 클릭 시 onPreview(music) 호출', async () => {
    const onPreview = vi.fn();
    render(
      <SearchListItem
        music={TRACK as never}
        onPreview={onPreview}
        onAdd={vi.fn()}
        addPending={false}
      />
    );
    await userEvent.click(screen.getByTestId('search-item-preview-abc123'));
    expect(onPreview).toHaveBeenCalledWith(TRACK);
  });

  test('[+] 클릭 시 onAdd(music) 호출', async () => {
    const onAdd = vi.fn();
    render(
      <SearchListItem music={TRACK as never} onPreview={vi.fn()} onAdd={onAdd} addPending={false} />
    );
    await userEvent.click(screen.getByTestId('search-item-add-abc123'));
    expect(onAdd).toHaveBeenCalledWith(TRACK);
  });

  test('addPending=true 시 [+] disabled', () => {
    render(
      <SearchListItem
        music={TRACK as never}
        onPreview={vi.fn()}
        onAdd={vi.fn()}
        addPending={true}
      />
    );
    expect(screen.getByTestId('search-item-add-abc123')).toBeDisabled();
  });
});
