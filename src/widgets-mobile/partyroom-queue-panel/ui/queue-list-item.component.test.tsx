import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, test, vi } from 'vitest';
import QueueListItem from './queue-list-item.component';

describe('QueueListItem', () => {
  test('순서 + 닉네임 + 플레이리스트명', () => {
    render(
      <QueueListItem
        order={1}
        dj={{ crewId: 1, nickname: 'Alice', playlistName: 'P' } as never}
        isMe={false}
        onChangePlaylist={vi.fn()}
      />
    );
    expect(screen.getByText('Alice')).toBeInTheDocument();
    expect(screen.getByText(/P/)).toBeInTheDocument();
  });

  test('isMe=true 시 ChangePlaylist 트리거 노출 + 클릭 → onChangePlaylist', async () => {
    const onChangePlaylist = vi.fn();
    render(
      <QueueListItem
        order={1}
        dj={{ crewId: 1, nickname: 'Me', playlistName: 'p' } as never}
        isMe={true}
        onChangePlaylist={onChangePlaylist}
      />
    );
    await userEvent.click(screen.getByTestId('queue-item-change-playlist'));
    expect(onChangePlaylist).toHaveBeenCalledTimes(1);
  });

  test('isMe=false 시 ChangePlaylist 미렌더', () => {
    render(
      <QueueListItem
        order={1}
        dj={{ crewId: 2, nickname: 'A', playlistName: 'p' } as never}
        isMe={false}
        onChangePlaylist={vi.fn()}
      />
    );
    expect(screen.queryByTestId('queue-item-change-playlist')).not.toBeInTheDocument();
  });
});
