import { YoutubeMusic } from '@/shared/api/types/playlist';

export function generateFixtureYoutubeMusics(page: number): YoutubeMusic[] {
  return [
    {
      id: `youtube-music-${page}-1`,
      thumbnailLow: 'https://source.unsplash.com/user/c_v_r',
      thumbnailMedium: 'https://source.unsplash.com/user/c_v_r',
      thumbnailHigh: 'https://source.unsplash.com/user/c_v_r',
      title: `title-${page}-1`,
      duration: '00:20',
    },
    {
      id: `youtube-music-${page}-2`,
      thumbnailLow: 'https://source.unsplash.com/user/c_v_r',
      thumbnailMedium: 'https://source.unsplash.com/user/c_v_r',
      thumbnailHigh: 'https://source.unsplash.com/user/c_v_r',
      title: `title-${page}-2`,
      duration: '00:30',
    },
    {
      id: `youtube-music-${page}-3`,
      thumbnailLow: 'https://source.unsplash.com/user/c_v_r',
      thumbnailMedium: 'https://source.unsplash.com/user/c_v_r',
      thumbnailHigh: 'https://source.unsplash.com/user/c_v_r',
      title: `title-${page}-3`,
      duration: '00:40',
    },
    {
      id: `youtube-music-${page}-4`,
      thumbnailLow: 'https://source.unsplash.com/user/c_v_r',
      thumbnailMedium: 'https://source.unsplash.com/user/c_v_r',
      thumbnailHigh: 'https://source.unsplash.com/user/c_v_r',
      title: `title-${page}-4`,
      duration: '00:50',
    },
    {
      id: `youtube-music-${page}-5`,
      thumbnailLow: 'https://source.unsplash.com/user/c_v_r',
      thumbnailMedium: 'https://source.unsplash.com/user/c_v_r',
      thumbnailHigh: 'https://source.unsplash.com/user/c_v_r',
      title: `title-${page}-5`,
      duration: '01:00',
    },
    {
      id: `youtube-music-${page}-6`,
      thumbnailLow: 'https://source.unsplash.com/user/c_v_r',
      thumbnailMedium: 'https://source.unsplash.com/user/c_v_r',
      thumbnailHigh: 'https://source.unsplash.com/user/c_v_r',
      title: `title-${page}-6`,
      duration: '01:10',
    },
    {
      id: `youtube-music-${page}-7`,
      thumbnailLow: 'https://source.unsplash.com/user/c_v_r',
      thumbnailMedium: 'https://source.unsplash.com/user/c_v_r',
      thumbnailHigh: 'https://source.unsplash.com/user/c_v_r',
      title: `title-${page}-7`,
      duration: '01:20',
    },
    {
      id: `youtube-music-${page}-8`,
      thumbnailLow: 'https://source.unsplash.com/user/c_v_r',
      thumbnailMedium: 'https://source.unsplash.com/user/c_v_r',
      thumbnailHigh: 'https://source.unsplash.com/user/c_v_r',
      title: `title-${page}-8`,
      duration: '01:30',
    },
  ];
}
