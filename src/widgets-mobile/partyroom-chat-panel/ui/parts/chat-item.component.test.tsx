import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, test, vi } from 'vitest';
import { GradeType } from '@/shared/api/http/types/@enums';

vi.mock('@/shared/lib/localization/i18n.context', () => ({
  useI18n: () => ({ common: { btn: { view_profile: '프로필 보기' } } }),
}));

const { openCrewProfileMock } = vi.hoisted(() => ({ openCrewProfileMock: vi.fn() }));
vi.mock('@/features/view-crew-profile', () => ({
  useOpenCrewProfile: () => openCrewProfileMock,
}));
vi.mock('@/shared/ui/components/profile/profile.component', () => ({
  __esModule: true,
  default: ({ src, size }: any) => <div data-testid='profile' data-src={src} data-size={size} />,
}));

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

describe('mobile ChatItem', () => {
  test('닉네임과 메시지를 렌더링한다', () => {
    render(<ChatItem message={makeMessage(GradeType.CLUBBER)} />);
    expect(screen.getByText('TestUser')).toBeTruthy();
    expect(screen.getByText('Hello')).toBeTruthy();
  });
  test('프로필을 누르면 해당 크루 프로필을 연다', () => {
    render(<ChatItem message={makeMessage(GradeType.HOST)} />);
    fireEvent.click(screen.getByRole('button', { name: 'TestUser 프로필 보기' }));
    expect(openCrewProfileMock).toHaveBeenCalledWith(1);
  });
  test('ref 를 전달할 수 있다 (scrollManager 의 lastItemRef 호환)', () => {
    const ref = vi.fn();
    render(<ChatItem ref={ref} message={makeMessage(GradeType.CLUBBER)} />);
    expect(ref).toHaveBeenCalledWith(expect.any(HTMLDivElement));
  });
});
