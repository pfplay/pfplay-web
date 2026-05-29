import { render, screen } from '@testing-library/react';
import { describe, expect, test, vi } from 'vitest';
import QueueList from './queue-list.component';

const DJS = [
  { crewId: 1, nickname: 'A', playlistName: 'a', orderNumber: 0 },
  { crewId: 2, nickname: 'B', playlistName: 'b', orderNumber: 1 },
  { crewId: 3, nickname: 'C', playlistName: 'c', orderNumber: 2 },
];

describe('QueueList', () => {
  test('빈 큐 → "큐 비어있음" 메시지', () => {
    render(<QueueList djs={[]} myCrewId={undefined} onChangePlaylist={vi.fn()} />);
    expect(screen.getByText(/큐 비어있음/)).toBeInTheDocument();
  });

  test('정상 → orderNumber 정렬, 첫 항목(currentDj)은 큐 리스트에서 제외, 나머지 N-1개 렌더', () => {
    render(<QueueList djs={DJS as never} myCrewId={undefined} onChangePlaylist={vi.fn()} />);
    // currentDj (orderNumber=0) 제외 → B, C 만 큐 리스트에 노출
    expect(screen.queryByText('A')).not.toBeInTheDocument();
    expect(screen.getByText('B')).toBeInTheDocument();
    expect(screen.getByText('C')).toBeInTheDocument();
  });

  test('myCrewId === dj.crewId 시 (Me) 표시', () => {
    render(<QueueList djs={DJS as never} myCrewId={2} onChangePlaylist={vi.fn()} />);
    expect(screen.getByText(/B \(Me\)/)).toBeInTheDocument();
  });
});
