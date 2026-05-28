import { render, screen } from '@testing-library/react';
import { describe, expect, test, vi } from 'vitest';
import { StageType } from '@/shared/api/http/types/@enums';
import { PartyroomSummary } from '@/shared/api/http/types/partyrooms';
import MobilePartyroomCard from './partyroom-card.component';

vi.mock('next/image', () => ({
  __esModule: true,
  default: (props: any) => <img {...props} alt={props.alt ?? ''} />,
}));
vi.mock('next/link', () => ({
  __esModule: true,
  default: ({ children, href, onClick }: any) => (
    <a href={href} onClick={onClick}>
      {children}
    </a>
  ),
}));

const baseSummary: PartyroomSummary = {
  partyroomId: 1,
  stageType: StageType.GENERAL,
  title: '토요일밤 파티',
  introduction: '같이 들어요',
  crewCount: 12,
  playbackActivated: true,
  playback: { name: 'Song Title', thumbnailImage: '/thumb.png', duration: '3:30' },
  primaryIcons: [{ avatarIconUri: '/avatar.png' }],
};

describe('MobilePartyroomCard', () => {
  test('룸 제목·인원·now-playing 을 표시한다', () => {
    render(<MobilePartyroomCard roomId={baseSummary.partyroomId} summary={baseSummary} />);
    expect(screen.getByText('토요일밤 파티')).toBeTruthy();
    expect(screen.getByText(/12/)).toBeTruthy();
    expect(screen.getByText('Song Title')).toBeTruthy();
  });

  test('카드 전체가 /parties/{id}?source=list 로 이동한다 (데스크탑 카드 패턴과 동일)', () => {
    render(<MobilePartyroomCard roomId={baseSummary.partyroomId} summary={baseSummary} />);
    expect(screen.getByRole('link').getAttribute('href')).toBe('/parties/1?source=list');
  });

  test('playbackActivated=false 일 때 now-playing 영역에 placeholder 를 표시한다', () => {
    render(
      <MobilePartyroomCard
        roomId={baseSummary.partyroomId}
        summary={{ ...baseSummary, playbackActivated: false, playback: undefined }}
      />
    );
    expect(screen.getByText(/재생 중인 곡이 없어요/)).toBeTruthy();
  });
});
