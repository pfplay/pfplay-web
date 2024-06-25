import { MusicListItem } from '@/shared/api/types/playlists';

export function generateFixtureYoutubeMusics(page: number): MusicListItem[] {
  return [
    {
      videoId: `youtube-music-${page}-1`,
      thumbnailUrl: '/images/Background/Profile.png',
      videoTitle: `title-${page}-1`,
      runningTime: '00:20',
    },
    {
      videoId: `youtube-music-${page}-2`,
      thumbnailUrl: '/images/Background/Profile.png',
      videoTitle: `title-${page}-2`,
      runningTime: '00:30',
    },
    {
      videoId: `youtube-music-${page}-3`,
      thumbnailUrl: '/images/Background/Profile.png',
      videoTitle: `title-${page}-3`,
      runningTime: '00:40',
    },
    {
      videoId: `youtube-music-${page}-4`,
      thumbnailUrl: '/images/Background/Profile.png',
      videoTitle: `title-${page}-4`,
      runningTime: '00:50',
    },
    {
      videoId: `youtube-music-${page}-5`,
      thumbnailUrl: '/images/Background/Profile.png',
      videoTitle: `title-${page}-5`,
      runningTime: '01:00',
    },
    {
      videoId: `youtube-music-${page}-6`,
      thumbnailUrl: '/images/Background/Profile.png',
      videoTitle: `title-${page}-6`,
      runningTime: '01:10',
    },
    {
      videoId: `youtube-music-${page}-7`,
      thumbnailUrl: '/images/Background/Profile.png',
      videoTitle: `title-${page}-7`,
      runningTime: '01:20',
    },
    {
      videoId: `youtube-music-${page}-8`,
      thumbnailUrl: '/images/Background/Profile.png',
      videoTitle: `title-${page}-8`,
      runningTime: '01:30',
    },
  ];
}
