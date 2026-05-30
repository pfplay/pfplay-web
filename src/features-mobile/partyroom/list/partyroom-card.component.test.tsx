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

// MainStageLabel 분기 (isMain=true 케이스) 전용 mock.
// 케이스 1·2·3·4 는 MainStageLabel 미마운트라 useI18n 호출 X — mock 영향 받지 않음을 단언으로 검증.
vi.mock('@/shared/lib/localization/i18n.context', () => ({
  useI18n: () => ({
    lobby: {
      para: {
        pfplay_main_stage: 'PFPlay Main Stage',
      },
    },
  }),
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
  test('제목·인원·now-playing 을 표시한다', () => {
    render(<MobilePartyroomCard roomId={baseSummary.partyroomId} summary={baseSummary} />);
    expect(screen.getByText('토요일밤 파티')).toBeTruthy();
    expect(screen.getByText(/12/)).toBeTruthy();
    expect(screen.getByText('Song Title')).toBeTruthy();
  });

  test('카드 전체가 /parties/{id}?source=list 로 이동한다', () => {
    render(<MobilePartyroomCard roomId={baseSummary.partyroomId} summary={baseSummary} />);
    expect(screen.getByRole('link').getAttribute('href')).toBe('/parties/1?source=list');
  });

  test('playbackActivated=false 일 때 now-playing 영역이 렌더되지 않는다', () => {
    render(
      <MobilePartyroomCard
        roomId={baseSummary.partyroomId}
        summary={{ ...baseSummary, playbackActivated: false, playback: undefined }}
      />
    );
    expect(screen.queryByText(/재생 중인 곡이 없어요/)).toBeNull();
    expect(screen.queryByAltText('playback thumbnail')).toBeNull();
  });

  test('primaryIcons 개수만큼 아바타가 렌더된다', () => {
    render(<MobilePartyroomCard roomId={baseSummary.partyroomId} summary={baseSummary} />);
    expect(screen.getAllByAltText('party crew').length).toBe(1);
  });

  test('isMain=true 일 때 "PFPlay Main Stage" 라벨이 표시된다', () => {
    render(<MobilePartyroomCard roomId={baseSummary.partyroomId} summary={baseSummary} isMain />);
    expect(screen.getByText('PFPlay Main Stage')).toBeTruthy();
  });

  test('isMain 이 falsy 일 때 "PFPlay Main Stage" 라벨이 표시되지 않는다', () => {
    render(<MobilePartyroomCard roomId={baseSummary.partyroomId} summary={baseSummary} />);
    expect(screen.queryByText('PFPlay Main Stage')).toBeNull();
  });
});
