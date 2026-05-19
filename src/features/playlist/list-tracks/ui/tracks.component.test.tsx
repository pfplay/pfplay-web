let paramsValue: { id?: string } = { id: '7' };

vi.mock('next/navigation', () => ({
  useParams: () => paramsValue,
}));
vi.mock('@/shared/lib/localization/i18n.context');
vi.mock('@/features/partyroom/get-summary', () => ({
  useFetchPartyroomDetailSummary: vi.fn(),
}));
vi.mock('@/entities/playlist', () => ({
  usePlaylistAction: () => ({
    removeTrack: vi.fn(),
    moveTrack: vi.fn(),
    changeTrackOrder: vi.fn(),
  }),
}));
vi.mock('../api/use-fetch-playlist-tracks.query', () => ({
  useFetchPlaylistTracks: vi.fn(),
}));

let lastTrackProps: Array<{ duration: string; isOverRoomLimit?: boolean }> = [];
vi.mock('./track.component', () => ({
  default: (props: { track: { duration: string }; isOverRoomLimit?: boolean }) => {
    lastTrackProps.push({
      duration: props.track.duration,
      isOverRoomLimit: props.isOverRoomLimit,
    });
    return <div data-testid='track' />;
  },
}));

import { render } from '@testing-library/react';
import { beforeEach, describe, expect, test, vi } from 'vitest';
import { useFetchPartyroomDetailSummary } from '@/features/partyroom/get-summary';
import { Playlist, PlaylistTrack } from '@/shared/api/http/types/playlists';
import { useI18n } from '@/shared/lib/localization/i18n.context';
import TracksInPlaylist from './tracks.component';
import { useFetchPlaylistTracks } from '../api/use-fetch-playlist-tracks.query';

const playlist = { id: 1 } as Playlist;

function makeTrack(linkId: string, duration: string): PlaylistTrack {
  return {
    linkId,
    trackId: Number(linkId.replace(/\D/g, '')) || 1,
    name: `track-${linkId}`,
    duration,
    thumbnailImage: null,
  } as unknown as PlaylistTrack;
}

function setTracks(tracks: PlaylistTrack[]) {
  (useFetchPlaylistTracks as Mock).mockReturnValue({ data: { content: tracks } });
}

function setSummary(summary: unknown) {
  // 실제 react-query 처럼 enabled=false 면 data 미해소(undefined)
  (useFetchPartyroomDetailSummary as Mock).mockImplementation((_id: number, enabled: boolean) => ({
    data: enabled ? summary : undefined,
  }));
}

beforeEach(() => {
  vi.clearAllMocks();
  lastTrackProps = [];
  paramsValue = { id: '7' };
  (useI18n as Mock).mockReturnValue({
    playlist: { btn: { delete_playlist: 'd', move_playlist: 'm' } },
  });
  setSummary({ playbackTimeLimit: 5 });
});

describe('TracksInPlaylist over-limit 계산', () => {
  test('limit 5분: 6:00 트랙은 isOverRoomLimit=true, 3:00 트랙은 false', () => {
    setTracks([makeTrack('t1', '6:00'), makeTrack('t2', '3:00')]);

    render(<TracksInPlaylist playlist={playlist} />);

    const over = lastTrackProps.find((p) => p.duration === '6:00');
    const under = lastTrackProps.find((p) => p.duration === '3:00');
    expect(over?.isOverRoomLimit).toBe(true);
    expect(under?.isOverRoomLimit).toBe(false);
  });

  test('summary undefined 면 모든 트랙 false (fail-safe)', () => {
    setSummary(undefined);
    setTracks([makeTrack('t1', '6:00')]);

    render(<TracksInPlaylist playlist={playlist} />);

    expect(lastTrackProps[0].isOverRoomLimit).toBe(false);
  });

  test('playbackTimeLimit 0 이면 모든 트랙 false (fail-safe)', () => {
    setSummary({ playbackTimeLimit: 0 });
    setTracks([makeTrack('t1', '6:00')]);

    render(<TracksInPlaylist playlist={playlist} />);

    expect(lastTrackProps[0].isOverRoomLimit).toBe(false);
  });

  test('파싱 불가 duration 이면 false (fail-safe)', () => {
    setTracks([makeTrack('t1', 'LIVE')]);

    render(<TracksInPlaylist playlist={playlist} />);

    expect(lastTrackProps[0].isOverRoomLimit).toBe(false);
  });

  test('로비(params.id undefined)면 query를 enabled=false 로 호출하고 배지 없음', () => {
    paramsValue = {};
    setTracks([makeTrack('t1', '6:00')]);

    render(<TracksInPlaylist playlist={playlist} />);

    const [, enabled] = (useFetchPartyroomDetailSummary as Mock).mock.calls[0];
    expect(enabled).toBe(false);
    expect(lastTrackProps[0].isOverRoomLimit).toBe(false);
  });

  test('방 안(params.id 존재)이면 query를 enabled=true 로 호출한다', () => {
    setTracks([makeTrack('t1', '3:00')]);

    render(<TracksInPlaylist playlist={playlist} />);

    const [partyroomId, enabled] = (useFetchPartyroomDetailSummary as Mock).mock.calls[0];
    expect(partyroomId).toBe(7);
    expect(enabled).toBe(true);
  });
});
