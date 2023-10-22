import { UserListItemType } from '@/components/shared/UserListItem';
import { PlayListItemType } from '@/components/shared/atoms/PlayListItem';

export const mockCollapslistConfig: {
  playListPanel: PlayListItemType[];
  userListPanel: UserListItemType[];
} = {
  playListPanel: [
    {
      id: 1,
      title:
        'BLACKPINK(블랙핑크) - Shut Down @인기가요sssss inkigayo 20220925 long long long long long long long longlong long long long text',

      alt: 'menu1',
      duration: '00:00',
    },
    {
      id: 2,
      title: 'BLACKPINK(블랙핑크)checkehck ',

      alt: 'menu2',
      duration: '04:20',
    },
  ],
  userListPanel: [
    {
      id: 1,
      username: 'nickname1111',
      src: 'https://source.unsplash.com/user/c_v_r',
    },
    {
      id: 2,
      username: 'nickname222',
      src: 'https://source.unsplash.com/user/c_v_r',
    },
  ],
};
