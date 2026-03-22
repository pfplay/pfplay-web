import { PlaylistType } from '@/shared/api/http/types/@enums';
import { Playlist } from '@/shared/api/http/types/playlists';

export const fixturePlaylists: Playlist[] = [
  {
    id: 1,
    name: 'playlist 1',
    orderNumber: 1,
    type: PlaylistType.PLAYLIST,
    musicCount: 10,
  },
  {
    id: 2,
    name: 'playlist 2',
    orderNumber: 2,
    type: PlaylistType.PLAYLIST,
    musicCount: 4,
  },
  {
    id: 3,
    name: 'playlist 3',
    orderNumber: 3,
    type: PlaylistType.PLAYLIST,
    musicCount: 5,
  },
  {
    id: 4,
    name: 'playlist 4',
    orderNumber: 4,
    type: PlaylistType.PLAYLIST,
    musicCount: 6,
  },
  {
    id: 5,
    name: 'playlist 5',
    orderNumber: 5,
    type: PlaylistType.PLAYLIST,
    musicCount: 10,
  },
  {
    id: 6,
    name: 'playlist 6',
    orderNumber: 6,
    type: PlaylistType.PLAYLIST,
    musicCount: 5,
  },
  {
    id: 7,
    name: 'playlist 7',
    orderNumber: 7,
    type: PlaylistType.PLAYLIST,
    musicCount: 0,
  },
  {
    id: 8,
    name: 'playlist 8',
    orderNumber: 8,
    type: PlaylistType.PLAYLIST,
    musicCount: 0,
  },
  {
    id: 9,
    name: 'playlist 9',
    orderNumber: 9,
    type: PlaylistType.PLAYLIST,
    musicCount: 0,
  },
  {
    id: 10,
    name: 'playlist 10',
    orderNumber: 10,
    type: PlaylistType.PLAYLIST,
    musicCount: 8,
  },
];
