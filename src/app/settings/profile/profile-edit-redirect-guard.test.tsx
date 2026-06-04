import { render } from '@testing-library/react';
import { describe, expect, test, vi, beforeEach } from 'vitest';
import { AuthorityTier } from '@/shared/api/http/types/@enums';
import ProfileEditRedirectGuard from './profile-edit-redirect-guard';

const replaceMock = vi.fn();
vi.mock('next/navigation', () => ({ useRouter: () => ({ replace: replaceMock }) }));

let meValue: any;
vi.mock('@/entities/me', () => ({ useSuspenseFetchMe: () => ({ data: meValue }) }));

const renderGuard = (device: 'mobile' | 'desktop') =>
  render(
    <ProfileEditRedirectGuard device={device}>
      <div>child</div>
    </ProfileEditRedirectGuard>
  );

describe('ProfileEditRedirectGuard', () => {
  beforeEach(() => replaceMock.mockReset());

  test('GT → /', () => {
    meValue = { authorityTier: AuthorityTier.GT, profileUpdated: true };
    renderGuard('mobile');
    expect(replaceMock).toHaveBeenCalledWith('/');
  });

  test('profileUpdated=false → 리다이렉트 없음(폼 노출)', () => {
    meValue = { authorityTier: AuthorityTier.AM, profileUpdated: false };
    renderGuard('mobile');
    expect(replaceMock).not.toHaveBeenCalled();
  });

  test('FM + profileUpdated → /parties', () => {
    meValue = { authorityTier: AuthorityTier.FM, profileUpdated: true };
    renderGuard('desktop');
    expect(replaceMock).toHaveBeenCalledWith('/parties');
  });

  test('AM + desktop + profileUpdated → /settings/avatar', () => {
    meValue = { authorityTier: AuthorityTier.AM, profileUpdated: true };
    renderGuard('desktop');
    expect(replaceMock).toHaveBeenCalledWith('/settings/avatar');
  });

  test('AM + mobile + profileUpdated → /parties (아바타 강제 단계 생략)', () => {
    meValue = { authorityTier: AuthorityTier.AM, profileUpdated: true };
    renderGuard('mobile');
    expect(replaceMock).toHaveBeenCalledWith('/parties');
  });
});
