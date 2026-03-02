jest.mock('@/features/playlist/add-tracks', () => ({
  AddTracksToPlaylist: ({ children }: { children: (props: any) => React.ReactNode }) =>
    children({ text: 'Add Tracks', execute: jest.fn() }),
}));
jest.mock('@/shared/ui/icons', () => ({
  PFAddPlaylist: () => <svg data-testid='add-icon' />,
}));

import React from 'react';
import { render, screen } from '@testing-library/react';
import AddTracksButton from './add-tracks-button.component';

describe('AddTracksButton', () => {
  test('Add Tracks 텍스트를 렌더링한다', () => {
    render(<AddTracksButton />);
    expect(screen.getByText('Add Tracks')).toBeTruthy();
  });

  test('아이콘을 렌더링한다', () => {
    render(<AddTracksButton />);
    expect(screen.getByTestId('add-icon')).toBeTruthy();
  });
});
