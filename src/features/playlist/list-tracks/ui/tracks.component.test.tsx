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

let storeState: { me?: { crewId: number }; currentDj?: { crewId: number } } = {};
vi.mock('@/shared/lib/store/stores.context', () => ({
  useStores: () => ({
    useCurrentPartyroom: (selector: (s: typeof storeState) => unknown) => selector(storeState),
  }),
}));

let lastTrackProps: Array<{
  trackId: number;
  duration: string;
  isOverRoomLimit?: boolean;
  isNow?: boolean;
  isNext?: boolean;
}> = [];
vi.mock('./track.component', () => ({
  default: (props: {
    track: { duration: string; trackId: number };
    isOverRoomLimit?: boolean;
    isNow?: boolean;
    isNext?: boolean;
  }) => {
    lastTrackProps.push({
      trackId: props.track.trackId,
      duration: props.track.duration,
      isOverRoomLimit: props.isOverRoomLimit,
      isNow: props.isNow,
      isNext: props.isNext,
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

function setTracks(tracks: PlaylistTrack[], lastPlayedTrackId: number | null = null) {
  (useFetchPlaylistTracks as Mock).mockReturnValue({
    data: { content: tracks, lastPlayedTrackId },
  });
}

function setStore(next: typeof storeState) {
  storeState = next;
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
  storeState = {};
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

  test('limit 5분: 정확히 5:00 트랙은 isOverRoomLimit=false (strict > 경계값)', () => {
    setTracks([makeTrack('t1', '5:00')]);

    render(<TracksInPlaylist playlist={playlist} />);

    const exact = lastTrackProps.find((p) => p.duration === '5:00');
    expect(exact?.isOverRoomLimit).toBe(false);
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

describe('TracksInPlaylist NOW/NEXT 배지', () => {
  const t10 = () => makeTrack('t10', '1:00'); // trackId 10
  const t20 = () => makeTrack('t20', '1:00'); // trackId 20
  const t30 = () => makeTrack('t30', '1:00'); // trackId 30

  const byId = (id: number) => {
    const found = lastTrackProps.find((p) => p.trackId === id);
    if (!found) throw new Error(`track ${id} not rendered`);
    return found;
  };

  test('커서 null: NEXT는 첫 트랙, NOW 없음(비-DJ)', () => {
    setTracks([t10(), t20(), t30()], null);
    render(<TracksInPlaylist playlist={playlist} />);

    expect(byId(10).isNext).toBe(true);
    expect(byId(20).isNext).toBe(false);
    expect(lastTrackProps.every((p) => !p.isNow)).toBe(true);
  });

  test('내가 CurrentDJ + 커서=20: NOW=20, NEXT=30', () => {
    setStore({ me: { crewId: 5 }, currentDj: { crewId: 5 } });
    setTracks([t10(), t20(), t30()], 20);
    render(<TracksInPlaylist playlist={playlist} />);

    expect(byId(20).isNow).toBe(true);
    expect(byId(20).isNext).toBe(false);
    expect(byId(30).isNext).toBe(true);
    expect(byId(10).isNow).toBe(false);
  });

  test('내가 CurrentDJ 아님 + 커서=20: NOW 없음, NEXT=30만', () => {
    setStore({ me: { crewId: 5 }, currentDj: { crewId: 9 } });
    setTracks([t10(), t20(), t30()], 20);
    render(<TracksInPlaylist playlist={playlist} />);

    expect(lastTrackProps.every((p) => !p.isNow)).toBe(true);
    expect(byId(30).isNext).toBe(true);
  });

  test('커서=마지막(30): NEXT는 wrap 하여 첫 트랙(10)', () => {
    setStore({ me: { crewId: 5 }, currentDj: { crewId: 5 } });
    setTracks([t10(), t20(), t30()], 30);
    render(<TracksInPlaylist playlist={playlist} />);

    expect(byId(30).isNow).toBe(true);
    expect(byId(10).isNext).toBe(true);
  });

  test('단일 트랙 + CurrentDJ 겹침(NOW==NEXT): NOW만, isNext=false', () => {
    setStore({ me: { crewId: 5 }, currentDj: { crewId: 5 } });
    setTracks([t10()], 10);
    render(<TracksInPlaylist playlist={playlist} />);

    expect(byId(10).isNow).toBe(true);
    expect(byId(10).isNext).toBe(false);
  });
});
