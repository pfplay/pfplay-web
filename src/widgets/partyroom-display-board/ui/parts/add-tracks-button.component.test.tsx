const mockExecute = vi.fn();

vi.mock('@/entities/me', () => ({
  useIsGuest: vi.fn(),
}));
vi.mock('@/features/sign-in/by-social', () => ({
  useInformSocialType: vi.fn(() => vi.fn()),
}));
vi.mock('@/features/playlist/add-tracks', () => ({
  AddTracksToPlaylist: ({ children }: { children: (props: any) => React.ReactNode }) =>
    children({ text: 'Add Tracks', execute: mockExecute }),
}));
vi.mock('@/shared/ui/icons', () => ({
  PFAddPlaylist: () => <svg data-testid='add-icon' />,
}));

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { useIsGuest } from '@/entities/me';
import { useInformSocialType } from '@/features/sign-in/by-social';
import AddTracksButton from './add-tracks-button.component';

beforeEach(() => {
  vi.clearAllMocks();
  (useIsGuest as Mock).mockReturnValue(vi.fn().mockResolvedValue(false));
});

describe('AddTracksButton', () => {
  test('Add Tracks 텍스트를 렌더링한다', () => {
    render(<AddTracksButton />);
    expect(screen.getByText('Add Tracks')).toBeTruthy();
  });

  test('아이콘을 렌더링한다', () => {
    render(<AddTracksButton />);
    expect(screen.getByTestId('add-icon')).toBeTruthy();
  });

  test('멤버가 클릭하면 트랙 추가(execute)를 실행한다', async () => {
    render(<AddTracksButton />);
    fireEvent.click(screen.getByText('Add Tracks'));
    await waitFor(() => expect(mockExecute).toHaveBeenCalled());
  });

  test('게스트가 클릭하면 소셜 모달 유도 + execute 미실행', async () => {
    const mockInform = vi.fn();
    (useInformSocialType as Mock).mockReturnValue(mockInform);
    (useIsGuest as Mock).mockReturnValue(vi.fn().mockResolvedValue(true));
    render(<AddTracksButton />);
    fireEvent.click(screen.getByText('Add Tracks'));
    await waitFor(() => expect(mockInform).toHaveBeenCalled());
    expect(mockExecute).not.toHaveBeenCalled();
  });
});
