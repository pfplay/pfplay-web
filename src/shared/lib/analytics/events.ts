import type { AuthorityTier } from '@/shared/api/http/types/@enums';
import type { OAuth2Provider } from '@/shared/api/http/types/users';

export type AuthType = 'guest' | 'member';
export type AuthorityTierLabel = `${AuthorityTier}`;
export type OAuthProviderLabel = OAuth2Provider;
export type ReactionTypeLabel = 'like' | 'dislike' | 'grab';
export type TrackSource = 'search' | 'grab';
export type DjDeregisterReason = 'self' | 'admin';
export type StageTypeLabel = 'main' | 'general';

export type EventPropertyMap = {
  // Session & Auth
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

  // Funnel 1: Retention
  'Partyroom List Viewed': {
    partyroom_count: number;
  };
  'Playback Reacted': {
    partyroom_id: number;
    reaction_type: ReactionTypeLabel;
  };
  'Chat Message Sent': {
    partyroom_id: number;
  };
  'Track Playback Started': {
    partyroom_id: number;
    track_id: string;
  };

  // Funnel 2: Conversion
  'Playlist Created': {
    playlist_id: number;
  };
  'Track Added': {
    playlist_id: number;
    track_id: string;
    source: TrackSource;
  };
  'Music Searched': {
    query: string;
  };
  'DJ Registered': {
    partyroom_id: number;
    playlist_id: number;
  };
  'DJ Deregistered': {
    partyroom_id: number;
    reason: DjDeregisterReason;
  };
  'DJ Turn Started': {
    partyroom_id: number;
    track_id: string;
  };
  'Partyroom Created': {
    partyroom_id: number;
    playback_time_limit: number;
    stage_type?: StageTypeLabel;
  };

  // Profile & Onboarding
  'Avatar Changed': Record<string, never>;
  'Bio Updated': Record<string, never>;
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
