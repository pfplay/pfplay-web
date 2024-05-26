import { PlaylistMusic } from '@/shared/api/types/playlist';

export const fixturePlaylistMusics: Omit<PlaylistMusic, 'uid' | 'orderNumber'>[] = [
  {
    musicId: 1,
    name: 'BLACKPINK(블랙핑크) - Shut Down @인기가요sssss inkigayo 20220925 long long long long long long long longlong long long long text',
    duration: '00:00',
    thumbnailImage: 'https://source.unsplash.com/user/c_v_r',
  },
  {
    musicId: 2,
    name: 'BLACKPINK(블랙핑크)checkehck ',
    duration: '04:20',
    thumbnailImage: 'https://source.unsplash.com/user/c_v_r',
  },
];
