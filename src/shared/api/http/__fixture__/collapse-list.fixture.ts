import type { UserListItemType } from '@/shared/ui/components/user-list-item';
import { fixturePlaylistMusics } from './playlist-musics.fixture';
import { PlaylistMusic } from '../types/playlists';

export const fixtureCollapseList: {
  musics: PlaylistMusic[];
  userListPanel: UserListItemType[];
} = {
  musics: fixturePlaylistMusics,
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
