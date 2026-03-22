import { render, screen, fireEvent } from '@testing-library/react';
import { Crew } from '@/entities/current-partyroom';
import { AvatarCompositionType } from '@/shared/api/http/types/@enums';
import { GradeType, MotionType } from '@/shared/api/http/types/@enums';
import CinemaFooter from './cinema-footer.component';

vi.mock('@/entities/avatar', () => ({
  Avatar: () => <div data-testid='avatar' />,
}));
vi.mock('@/shared/ui/icons', () => ({
  PFDefault: () => <svg data-testid='icon-default' />,
  PFFull: () => <svg data-testid='icon-full' />,
  PFTheater: () => <svg data-testid='icon-theater' />,
  PFChatOutlineOff: () => <svg data-testid='icon-chat-outline-off' />,
}));
vi.mock('./action-buttons.component', () => ({
  default: () => <div data-testid='action-buttons' />,
}));
vi.mock('./video-title.component', () => ({
  default: () => <div data-testid='video-title' />,
}));
vi.mock('./volume-control.component', () => ({
  default: () => <div data-testid='volume-control' />,
}));

const mockDjCrew: Crew.Model = {
  crewId: 1,
  nickname: 'TestDJ',
  gradeType: GradeType.CLUBBER,
  avatarCompositionType: AvatarCompositionType.SINGLE_BODY,
  avatarBodyUri: 'body.png',
  avatarFaceUri: '',
  avatarIconUri: 'icon.png',
  combinePositionX: 0,
  combinePositionY: 0,
  offsetX: 0,
  offsetY: 0,
  scale: 1,
  motionType: MotionType.NONE,
};

const defaultProps = {
  djCrew: undefined as Crew.Model | undefined,
  isFullscreen: false,
  cinemaChatOpen: false,
  onDefault: vi.fn(),
  onFull: vi.fn(),
  onToggleChat: vi.fn(),
};

beforeEach(() => {
  vi.clearAllMocks();
});

describe('DJ 아바타 카드', () => {
  test('djCrew가 없으면 아바타 카드를 렌더링하지 않는다', () => {
    render(<CinemaFooter {...defaultProps} djCrew={undefined} />);
    expect(screen.queryByTestId('avatar')).toBeNull();
  });

  test('djCrew가 있으면 아바타와 닉네임을 렌더링한다', () => {
    render(<CinemaFooter {...defaultProps} djCrew={mockDjCrew} />);
    expect(screen.getByTestId('avatar')).toBeTruthy();
    expect(screen.getByText('TestDJ')).toBeTruthy();
  });
});

describe('뷰 모드 버튼', () => {
  test('isFullscreen=false일 때 Full, Chat 버튼이 표시된다', () => {
    render(<CinemaFooter {...defaultProps} isFullscreen={false} />);
    expect(screen.getByTitle('Full')).toBeTruthy();
    expect(screen.getByTitle('Chat')).toBeTruthy();
    expect(screen.queryByTitle('Theater')).toBeNull();
  });

  test('isFullscreen=true일 때 Theater 버튼이 표시되고 Full, Chat 버튼은 숨겨진다', () => {
    render(<CinemaFooter {...defaultProps} isFullscreen={true} />);
    expect(screen.getByTitle('Theater')).toBeTruthy();
    expect(screen.queryByTitle('Full')).toBeNull();
    expect(screen.queryByTitle('Chat')).toBeNull();
  });

  test('Default 버튼은 항상 표시된다', () => {
    render(<CinemaFooter {...defaultProps} isFullscreen={false} />);
    expect(screen.getByTitle('Default')).toBeTruthy();

    render(<CinemaFooter {...defaultProps} isFullscreen={true} />);
    expect(screen.getAllByTitle('Default')).toHaveLength(2);
  });
});

describe('콜백', () => {
  test('Default 버튼 클릭 시 onDefault가 호출된다', () => {
    render(<CinemaFooter {...defaultProps} />);
    fireEvent.click(screen.getByTitle('Default'));
    expect(defaultProps.onDefault).toHaveBeenCalledTimes(1);
  });

  test('Full 버튼 클릭 시 onFull이 호출된다', () => {
    render(<CinemaFooter {...defaultProps} isFullscreen={false} />);
    fireEvent.click(screen.getByTitle('Full'));
    expect(defaultProps.onFull).toHaveBeenCalledTimes(1);
  });

  test('Chat 버튼 클릭 시 onToggleChat이 호출된다', () => {
    render(<CinemaFooter {...defaultProps} isFullscreen={false} />);
    fireEvent.click(screen.getByTitle('Chat'));
    expect(defaultProps.onToggleChat).toHaveBeenCalledTimes(1);
  });

  test('Theater 버튼 클릭 시 document.exitFullscreen이 호출된다', () => {
    const exitFullscreen = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(document, 'exitFullscreen', {
      value: exitFullscreen,
      configurable: true,
    });

    render(<CinemaFooter {...defaultProps} isFullscreen={true} />);
    fireEvent.click(screen.getByTitle('Theater'));
    expect(exitFullscreen).toHaveBeenCalledTimes(1);
  });
});

describe('채팅 아이콘', () => {
  test('cinemaChatOpen=false일 때 ChatOutlineOff 아이콘을 표시한다', () => {
    render(<CinemaFooter {...defaultProps} cinemaChatOpen={false} />);
    expect(screen.getByTestId('icon-chat-outline-off')).toBeTruthy();
  });

  test('cinemaChatOpen=true일 때 filled chat svg를 표시한다', () => {
    const { container } = render(<CinemaFooter {...defaultProps} cinemaChatOpen={true} />);
    expect(container.querySelector('svg path[fill="currentColor"]')).toBeTruthy();
    expect(screen.queryByTestId('icon-chat-outline-off')).toBeNull();
  });
});
