import type { AuthorityTier } from '@/shared/api/http/types/@enums';
import type { OAuth2Provider } from '@/shared/api/http/types/users';

export type AuthType = 'guest' | 'member';
export type AuthorityTierLabel = `${AuthorityTier}`;
export type OAuthProviderLabel = OAuth2Provider;

export type EventPropertyMap = {
  'Session Started': {
    auth_type?: AuthType;
    authority_tier?: AuthorityTierLabel;
  };
  'User Signed In': {
    auth_type: AuthType;
  };
  'User Signed Up': {
    provider: OAuthProviderLabel;
  };
};

export type EventName = keyof EventPropertyMap;

export type UserPropertySet = {
  auth_type?: AuthType;
  authority_tier?: AuthorityTierLabel;
  oauth_provider?: OAuthProviderLabel;
};

export type UserPropertySetOnce = {
  has_created_partyroom?: boolean;
  first_partyroom_entered_at?: string;
};

export type UserPropertyAdd = {
  total_playlists?: number;
  total_dj_sessions?: number;
};

export type UserPropertyOps = {
  set?: UserPropertySet;
  setOnce?: UserPropertySetOnce;
  add?: UserPropertyAdd;
};
