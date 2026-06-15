import { render, screen } from '@testing-library/react';
import theme from '@/shared/ui/foundation/theme';
import MailBounceSignal from './mail-bounce-signal.component';

describe('MailBounceSignal', () => {
  test('signalKey가 있으면 편지 이모지 3개를 순차 애니메이션 대상으로 렌더링한다', () => {
    render(<MailBounceSignal signalKey={123} />);

    const emojis = screen.getAllByText('✉️');
    const mailItems = screen.getAllByTestId('mail-bounce-item');
    expect(emojis).toHaveLength(3);
    expect(mailItems).toHaveLength(3);
    expect(mailItems[0]).toHaveAttribute('data-mail-index', '0');
    expect(mailItems[1]).toHaveAttribute('data-mail-index', '1');
    expect(mailItems[2]).toHaveAttribute('data-mail-index', '2');
    expect(emojis[0].className).toContain('animate-mail-bounce');
    expect(emojis[0].className).toContain('motion-reduce:animate-mail-bounce-reduced');
    expect(emojis[0].className).not.toContain('motion-reduce:hidden');
    expect(emojis[1].className).toContain('[animation-delay:120ms]');
    expect(emojis[1].className).toContain('motion-reduce:hidden');
    expect(emojis[2].className).toContain('[animation-delay:240ms]');
    expect(emojis[2].className).toContain('motion-reduce:hidden');
  });

  test('signalKey가 없으면 렌더링하지 않는다', () => {
    const { container } = render(<MailBounceSignal />);

    expect(container.firstChild).toBeNull();
  });

  test('아바타 위쪽 중앙에 signal 컨테이너를 배치한다', () => {
    render(<MailBounceSignal signalKey={123} />);

    const signal = screen.getByTestId('mail-bounce-signal');
    expect(signal.className).toContain('left-1/2');
    expect(signal.className).toContain('top-1');
    expect(signal.className).toContain('-translate-x-1/2');
    expect(signal.className).toContain('-translate-y-2/3');
    expect(signal.className).not.toContain('bottom-0');
  });

  test('이모지 묶음은 컨테이너 중앙선을 기준으로 좌우에 배치된다', () => {
    render(<MailBounceSignal signalKey={123} />);

    const mailItems = screen.getAllByTestId('mail-bounce-item');
    expect(mailItems[0].className).toContain('left-[calc(50%-24px)]');
    expect(mailItems[1].className).toContain('left-1/2');
    expect(mailItems[2].className).toContain('left-[calc(50%+24px)]');
    mailItems.forEach((item) => {
      expect(item.className).toContain('-translate-x-1/2');
    });
  });

  test('mail bounce 애니메이션 테마 설정이 디자인 범위를 만족한다', () => {
    expect(theme.animation['mail-bounce']).toContain('1100ms');
    expect(theme.animation['mail-bounce-reduced']).toContain('500ms');
    expect(theme.keyframes['mail-bounce']).toBeDefined();
    expect(theme.keyframes['mail-bounce-reduced']).toBeDefined();
    expect(theme.keyframes['mail-bounce-reduced']['0%'].opacity).toBe('0');
    expect(theme.keyframes['mail-bounce-reduced']['20%'].opacity).toBe('1');
    expect(theme.keyframes['mail-bounce-reduced']['100%'].opacity).toBe('0');
  });
});
