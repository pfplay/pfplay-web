import { UserListItemType } from '@/components/features/user-list-item.component';
import { PlaylistMusic } from '@/shared/api/types/playlist';
import { fixturePlaylistMusics } from './playlist-musics.fixture';

export const fixtureCollapseList: {
  musics: Omit<PlaylistMusic, 'uid' | 'orderNumber'>[];
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
