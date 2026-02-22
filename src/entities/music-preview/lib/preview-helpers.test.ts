import type { PlaylistTrack } from '@/shared/api/http/types/playlists';
import type { Music } from '@/shared/api/http/types/playlists';
import {
  convertPlaylistTrackToPreview,
  convertSearchMusicToPreview,
  extractVideoIdFromUrl,
  safeDecodeTitle,
} from './preview-helpers';

describe('preview-helpers', () => {
  describe('convertPlaylistTrackToPreview', () => {
    test('PlaylistTrack을 PreviewTrack으로 변환', () => {
      const track: PlaylistTrack = {
        trackId: 1,
        linkId: 12345,
        name: '테스트 곡',
        orderNumber: 1,
        duration: '03:30',
        thumbnailImage: 'https://img.youtube.com/vi/12345/0.jpg',
      };

      expect(convertPlaylistTrackToPreview(track)).toEqual({
        id: '12345',
        title: '테스트 곡',
        thumbnailUrl: 'https://img.youtube.com/vi/12345/0.jpg',
        videoUrl: 'https://www.youtube.com/watch?v=12345',
        source: 'playlist-track',
      });
    });
  });

  describe('convertSearchMusicToPreview', () => {
    test('Music을 PreviewTrack으로 변환', () => {
      const music: Music = {
        videoId: 'abc123',
        videoTitle: '검색 결과 곡',
        thumbnailUrl: 'https://img.youtube.com/vi/abc123/0.jpg',
        runningTime: '04:15',
      };

      expect(convertSearchMusicToPreview(music)).toEqual({
        id: 'abc123',
        title: '검색 결과 곡',
        thumbnailUrl: 'https://img.youtube.com/vi/abc123/0.jpg',
        videoUrl: 'https://www.youtube.com/watch?v=abc123',
        source: 'search-result',
      });
    });
  });

  describe('extractVideoIdFromUrl', () => {
    it.each([
      ['https://www.youtube.com/watch?v=dQw4w9WgXcQ', 'dQw4w9WgXcQ'],
      ['https://youtu.be/dQw4w9WgXcQ', 'dQw4w9WgXcQ'],
      ['https://www.youtube.com/watch?v=abc123&t=10', 'abc123'],
    ])('"%s" → "%s"', (url, expected) => {
      expect(extractVideoIdFromUrl(url)).toBe(expected);
    });

    it.each(['https://www.google.com', 'not-a-url', ''])('유효하지 않은 URL "%s" → null', (url) => {
      expect(extractVideoIdFromUrl(url)).toBeNull();
    });
  });

  describe('safeDecodeTitle', () => {
    test('인코딩된 문자열 디코딩', () => {
      expect(safeDecodeTitle('%ED%85%8C%EC%8A%A4%ED%8A%B8')).toBe('테스트');
    });

    test('일반 문자열은 그대로 반환', () => {
      expect(safeDecodeTitle('일반 텍스트')).toBe('일반 텍스트');
    });

    test('잘못된 인코딩은 원본 반환', () => {
      expect(safeDecodeTitle('%E0%A4%A')).toBe('%E0%A4%A');
    });
  });
});
