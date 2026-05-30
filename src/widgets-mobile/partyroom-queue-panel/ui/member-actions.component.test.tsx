import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, test, vi } from 'vitest';
import MemberActions from './member-actions.component';

vi.mock('@/shared/lib/localization/i18n.context', () => ({
  useI18n: () => ({
    partyroom: {
      queue: {
        member_action_register: '+ DJ 등록',
        member_action_unregister: '큐에서 나가기',
      },
    },
  }),
}));

describe('MemberActions', () => {
  test('isMeInQueue=false → [+ DJ 등록]', () => {
    render(<MemberActions isMeInQueue={false} onRegister={vi.fn()} onUnregister={vi.fn()} />);
    expect(screen.getByTestId('member-action-register')).toHaveTextContent(/DJ 등록/);
  });

  test('isMeInQueue=true → [큐에서 나가기]', () => {
    render(<MemberActions isMeInQueue={true} onRegister={vi.fn()} onUnregister={vi.fn()} />);
    expect(screen.getByTestId('member-action-unregister')).toHaveTextContent(/큐에서 나가기/);
  });

  test('[+ DJ 등록] 클릭 → onRegister', async () => {
    const onRegister = vi.fn();
    render(<MemberActions isMeInQueue={false} onRegister={onRegister} onUnregister={vi.fn()} />);
    await userEvent.click(screen.getByTestId('member-action-register'));
    expect(onRegister).toHaveBeenCalledTimes(1);
  });

  test('[큐에서 나가기] 클릭 → onUnregister', async () => {
    const onUnregister = vi.fn();
    render(<MemberActions isMeInQueue={true} onRegister={vi.fn()} onUnregister={onUnregister} />);
    await userEvent.click(screen.getByTestId('member-action-unregister'));
    expect(onUnregister).toHaveBeenCalledTimes(1);
  });
});
