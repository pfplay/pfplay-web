import { render, screen } from '@testing-library/react';
import ChatBubble from './chat-bubble.component';

describe('ChatBubble (#410)', () => {
  test('말풍선 컨테이너와 "..." 3점이 렌더된다', () => {
    const { container } = render(<ChatBubble />);

    expect(screen.getByTestId('avatar-chat-bubble')).toBeInTheDocument();
    // 타이핑 인디케이터 점 3개
    const dots = container.querySelectorAll('span');
    expect(dots).toHaveLength(3);
  });
});
