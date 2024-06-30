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
      id: 1,
      username: 'nickname1111',
      src: '/images/Background/Profile.png',
    },
    {
      id: 2,
      username: 'nickname222',
      src: '/images/Background/Profile.png',
    },
  ],
};
