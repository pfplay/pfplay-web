jest.mock('@/shared/ui/components/profile/profile.component', () => ({
  __esModule: true,
  default: ({ src, size }: any) => <div data-testid='profile' data-src={src} data-size={size} />,
}));
jest.mock('./authority-headset.component', () => ({
  __esModule: true,
  default: ({ grade }: any) => <div data-testid='headset' data-grade={grade} />,
}));
jest.mock('@/shared/ui/foundation/fonts', () => ({
  galmuriFont: { className: 'galmuri' },
}));

import { render, screen } from '@testing-library/react';
import { GradeType } from '@/shared/api/http/types/@enums';
import ChatItem from './chat-item.component';

const makeMessage = (gradeType: GradeType, content = 'Hello') =>
  ({
    from: 'user',
    crew: {
      crewId: 1,
      nickname: 'TestUser',
      gradeType,
      avatarIconUri: 'https://example.com/icon.png',
    },
    message: { content },
  }) as any;

describe('ChatItem', () => {
  test('닉네임과 메시지를 렌더링한다', () => {
    render(<ChatItem message={makeMessage(GradeType.CLUBBER)} />);
    expect(screen.getByText('TestUser')).toBeTruthy();
    expect(screen.getByText('Hello')).toBeTruthy();
  });

  test('CLUBBER 이상이면 등급 라벨을 표시한다', () => {
    const { container } = render(<ChatItem message={makeMessage(GradeType.CLUBBER)} />);
    expect(container.querySelector('.galmuri')).toBeTruthy();
  });

  test('MODERATOR 이상이면 등급 라벨이 빨간색이다', () => {
    const { container } = render(<ChatItem message={makeMessage(GradeType.MODERATOR)} />);
    const label = container.querySelector('.galmuri');
    expect(label?.className).toContain('text-red-400');
  });

  test('프로필과 헤드셋 컴포넌트를 렌더링한다', () => {
    render(<ChatItem message={makeMessage(GradeType.HOST)} />);
    expect(screen.getByTestId('profile').getAttribute('data-src')).toBe(
      'https://example.com/icon.png'
    );
    expect(screen.getByTestId('headset').getAttribute('data-grade')).toBe(GradeType.HOST);
  });

  test('ref를 전달할 수 있다', () => {
    const ref = jest.fn();
    render(<ChatItem ref={ref} message={makeMessage(GradeType.CLUBBER)} />);
    expect(ref).toHaveBeenCalledWith(expect.any(HTMLDivElement));
  });
});
