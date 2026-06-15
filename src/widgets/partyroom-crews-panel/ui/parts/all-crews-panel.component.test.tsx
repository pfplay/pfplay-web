import { render, screen, within, fireEvent } from '@testing-library/react';
import { GradeType } from '@/shared/api/http/types/@enums';
import AllCrewsPanel from './all-crews-panel.component';

const mockUseCurrentPartyroomCrews = vi.fn();
const mockUseCurrentPartyroom = vi.fn();

vi.mock('@/features/partyroom/list-crews', async () => {
  const actual = await vi.importActual<typeof import('@/features/partyroom/list-crews')>(
    '@/features/partyroom/list-crews'
  );

  return {
    ...actual,
    useCurrentPartyroomCrews: () => mockUseCurrentPartyroomCrews(),
  };
});

vi.mock('@/features/partyroom/adjust-grade', () => ({
  useAdjustGrade: () => vi.fn(),
  useCanAdjustGrade: () => () => false,
}));

vi.mock('@/features/partyroom/block-crew', () => ({
  useBlockCrew: () => vi.fn(),
}));

vi.mock('@/features/partyroom/impose-penalty', () => ({
  useCanImposePenalty: () => () => false,
  useImposePenalty: () => vi.fn(),
}));

vi.mock('@/shared/lib/localization/i18n.context', () => ({
  useI18n: () => ({
    common: {
      btn: {
        authority: '권한',
        chat_mute: '채팅 금지',
        kick: '내보내기',
        ban: '차단',
        block: '차단하기',
      },
    },
  }),
}));

vi.mock('@/shared/lib/store/stores.context', () => ({
  useStores: () => ({
    useCurrentPartyroom: mockUseCurrentPartyroom,
  }),
}));

vi.mock('next/image', () => ({
  __esModule: true,
  default: ({ alt, ...props }: any) => <img alt={alt} {...props} />,
}));

describe('AllCrewsPanel', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseCurrentPartyroom.mockReturnValue([undefined, undefined]);
    mockUseCurrentPartyroomCrews.mockReturnValue([
      { crewId: 1, nickname: 'Host User', gradeType: GradeType.HOST },
      { crewId: 2, nickname: 'Moderator User', gradeType: GradeType.MODERATOR },
      { crewId: 3, nickname: 'Listener User', gradeType: GradeType.LISTENER },
    ]);
  });

  test('HOST와 LISTENER 그룹은 처음부터 펼쳐지고 다시 누르면 접힌다', () => {
    render(<AllCrewsPanel />);

    expect(screen.getByText('Host User')).toBeTruthy();
    expect(screen.getByText('Listener User')).toBeTruthy();
    expect(screen.queryByText('Moderator User')).toBeNull();

    fireEvent.click(screen.getByTestId(`all-crews-category-${GradeType.HOST}`));
    expect(screen.queryByText('Host User')).toBeNull();

    fireEvent.click(screen.getByTestId(`all-crews-category-${GradeType.LISTENER}`));
    expect(screen.queryByText('Listener User')).toBeNull();
  });

  test('다른 그룹은 기존처럼 접힌 상태로 시작하고 누르면 펼쳐진다', () => {
    render(<AllCrewsPanel />);

    const moderatorButton = screen.getByTestId(`all-crews-category-${GradeType.MODERATOR}`);

    expect(within(moderatorButton).getByText(GradeType.MODERATOR)).toBeTruthy();
    expect(screen.queryByText('Moderator User')).toBeNull();

    fireEvent.click(moderatorButton);
    expect(screen.getByText('Moderator User')).toBeTruthy();
  });
});
