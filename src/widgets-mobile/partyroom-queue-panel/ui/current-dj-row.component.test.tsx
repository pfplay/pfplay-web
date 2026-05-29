import { render, screen } from '@testing-library/react';
import { describe, expect, test } from 'vitest';
import CurrentDjRow from './current-dj-row.component';

describe('CurrentDjRow', () => {
  test('현재 DJ 이름 + playback 트랙명 노출', () => {
    render(
      <CurrentDjRow
        dj={{ crewId: 1, nickname: 'Alice', playlistName: 'A' } as never}
        playback={{ name: 'Song X', duration: '3:30' } as never}
      />
    );
    expect(screen.getByText(/Alice/)).toBeInTheDocument();
    expect(screen.getByText(/Song X/)).toBeInTheDocument();
  });

  test('Skip 버튼 미렌더 (모더레이션 OUT)', () => {
    render(
      <CurrentDjRow
        dj={{ crewId: 1, nickname: 'A', playlistName: 'p' } as never}
        playback={{ name: 'X', duration: '0:00' } as never}
      />
    );
    expect(screen.queryByTestId('dj-skip-button')).not.toBeInTheDocument();
  });
});
