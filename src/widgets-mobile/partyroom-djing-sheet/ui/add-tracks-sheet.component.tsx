'use client';
import { FC } from 'react';
import { PreviewTrack } from '@/entities/music-preview/model/preview.model';
import { useAddPlaylistTrack } from '@/features/playlist/add-tracks/api/use-add-playlist-track.mutation';
import MusicSearch from '@/features-mobile/playlist/add-tracks/ui/music-search.component';
import { Music } from '@/shared/api/http/types/playlists';
import { useStores } from '@/shared/lib/store/stores.context';
import { MiniPlayer } from '@/widgets-mobile/music-preview-mini-player';

interface Props {
  playlistId: number;
}

/**
 * 모바일 트랙 추가 시트 (spec §6.3).
 *
 * - body  = MusicSearch (검색 input + 결과 리스트)
 * - footer = MiniPlayer (currentTrack 있을 때만 자체 렌더, 없으면 null)
 * - ▶ click → startPreview({ ...music, source: 'preview-search' })
 *   (Music 의 videoId/videoTitle/thumbnailUrl/runningTime + source marker)
 * - [+ 추가] click (검색 결과 또는 MiniPlayer) → useAddPlaylistTrack.mutate({
 *     listId, linkId, name, duration, thumbnailImage
 *   })
 *   Music ↔ AddTrackToPlaylistRequestBody 매핑 위치는 sheet 하나로 일원화 (단일 책임).
 * - MiniPlayer 의 currentTrack 은 preview-search 출처라 Music 필드를 모두 보존 →
 *   동일 매핑 함수(toRequestBody) 재사용 가능.
 */
const AddTracksSheet: FC<Props> = ({ playlistId }) => {
  const { useMusicPreview } = useStores();
  const { startPreview } = useMusicPreview();
  const { mutate: addTrack, isPending } = useAddPlaylistTrack();

  const handlePreview = (music: Music) => {
    // PreviewTrack 모델(id/title/videoUrl/source: 'playlist-track'|'search-result')과
    // Music(videoId/videoTitle/thumbnailUrl/runningTime) 의 어휘 차이는 chunk 4 범위 밖.
    // MiniPlayer 의 defensive aliasing(name ?? title) 패턴과 동일하게 모든 식별 필드를
    // spread 로 같이 흘려보내고 source 는 spec 그대로 'preview-search' 마커를 부여한다.
    // ⚠️ title 은 MiniPlayer 가 직접 읽으므로 명시적으로 videoTitle → title 매핑.
    //   (spread 만으로는 title 키가 비어 displayName='' → mini-player-name DOM 가
    //   zero-content 로 Playwright hidden 판정.)
    startPreview({
      ...music,
      title: music.videoTitle,
      source: 'preview-search',
    } as unknown as PreviewTrack);
  };

  const handleAdd = (music: Music | (PreviewTrack & Partial<Music>)) => {
    // currentTrack(PreviewTrack & Music spread) 또는 검색결과(Music) 둘 다 videoId 보유.
    // PreviewTrack 어휘로 들어온 경우 id/title 로 떨어질 수 있어 양방향 fallback.
    const m = music as Music & PreviewTrack & { name?: string };
    addTrack({
      listId: playlistId,
      linkId: m.videoId ?? m.id,
      name: m.videoTitle ?? m.name ?? m.title,
      duration: m.runningTime,
      thumbnailImage: m.thumbnailUrl,
    });
  };

  return (
    <div className='flex flex-col h-full'>
      <div className='flex-1 min-h-0'>
        <MusicSearch onPreview={handlePreview} onAdd={handleAdd} addPending={isPending} />
      </div>
      <MiniPlayer onAdd={handleAdd} addPending={isPending} />
    </div>
  );
};

export default AddTracksSheet;
