import { render, screen } from '@testing-library/react';
import { Mock } from 'vitest';
import { ActivityType } from '@/shared/api/http/types/@enums';
import CrewProfileCard from './crew-profile-card.component';
import { useViewCrewProfile } from '../api/use-view-crew-profile.query';

vi.mock('../api/use-view-crew-profile.query');
vi.mock('@/entities/avatar/ui/avatar.component', () => ({
  default: () => <div data-testid='avatar' />,
}));

const baseProfile = {
  crewId: 1,
  nickname: '디제이마스터',
  introduction: '음악 좋아요',
  avatarBodyUri: 'body.png',
  avatarFaceUri: 'face.png',
  combinePositionX: 0,
  combinePositionY: 0,
  activitySummaries: [{ activityType: ActivityType.DJ_PNT, score: 150 }],
};

describe('CrewProfileCard (#409)', () => {
  test('닉네임·소개·DJ 점수를 표시한다', () => {
    (useViewCrewProfile as Mock).mockReturnValue({ data: baseProfile, isLoading: false });

    render(<CrewProfileCard crewId={1} />);

    expect(screen.getByText('디제이마스터')).toBeInTheDocument();
    expect(screen.getByText('음악 좋아요')).toBeInTheDocument();
    expect(screen.getByText('150p')).toBeInTheDocument();
  });

  test('DJ 점수가 없으면 0p 로 표시한다', () => {
    (useViewCrewProfile as Mock).mockReturnValue({
      data: { ...baseProfile, activitySummaries: [] },
      isLoading: false,
    });

    render(<CrewProfileCard crewId={1} />);

    expect(screen.getByText('0p')).toBeInTheDocument();
  });

  test('로딩 중에는 안내 문구를 표시한다', () => {
    (useViewCrewProfile as Mock).mockReturnValue({ data: undefined, isLoading: true });

    render(<CrewProfileCard crewId={1} />);

    expect(screen.getByText('불러오는 중...')).toBeInTheDocument();
  });
});
