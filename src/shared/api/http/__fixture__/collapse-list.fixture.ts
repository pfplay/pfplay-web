import { fixturePlaylistTracks } from '@/shared/api/http/__fixture__/playlist-tracks.fixture';
import type { UserListItemType } from '@/shared/ui/components/user-list-item';
import { PlaylistTrack } from '../types/playlists';

export const fixtureCollapseList: {
  tracks: PlaylistTrack[];
  userListPanel: UserListItemType[];
} = {
  tracks: fixturePlaylistTracks,
  userListPanel: [
    {
      crewId: 1,
      nickname: 'nickname1111',
      avatarIconUri: '/images/Temp/nft.png',
    },
    {
      crewId: 2,
      nickname: 'nickname222',
      avatarIconUri: '/images/Temp/nft.png',
    },
  ],
};
