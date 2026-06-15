'use client';
import { FC, useRef } from 'react';
import { convertSearchMusicToPreview } from '@/entities/music-preview/lib/preview-helpers';
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
 * - ▶ click → startPreview(convertSearchMusicToPreview(music))
 *   (Music → 정식 PreviewTrack. id/videoUrl 이 채워져 youtube-preview-player 가 실재생.)
 * - [+ 추가] (검색 결과 행 또는 MiniPlayer) → useAddPlaylistTrack.mutate(...)
 *
 * 어휘 경계: 재생(PreviewTrack)과 추가(AddTrackToPlaylistRequestBody)는 서로 다른 관심사.
 * PreviewTrack 은 duration 을 안 들고 다니므로, 추가가 필요로 하는 원본 Music 을
 * `lastPreviewedMusicRef` 로 추적한다 → mini-player 의 lossy currentTrack 에 의존하지 않고
 * duration(필수 필드)을 무손실 보존. (이전엔 Music 을 PreviewTrack 으로 캐스트해 흘려보냈음.)
 */
const AddTracksSheet: FC<Props> = ({ playlistId }) => {
  const { useMusicPreview } = useStores();
  const { startPreview } = useMusicPreview();
  const { mutate: addTrack, isPending } = useAddPlaylistTrack();

  // 마지막으로 미리들은 원본 Music — mini-player 추가가 duration 까지 보존하기 위한 출처.
  const lastPreviewedMusicRef = useRef<Music | null>(null);

  const addMusic = (music: Music) => {
    addTrack({
      listId: playlistId,
      linkId: music.videoId,
      name: music.videoTitle,
      duration: music.runningTime,
      thumbnailImage: music.thumbnailUrl,
    });
  };

  const handlePreview = (music: Music) => {
    lastPreviewedMusicRef.current = music;
    startPreview(convertSearchMusicToPreview(music));
  };

  // 검색 결과 행의 [+]: 그 행의 Music 으로 바로 추가.
  const handleAddFromSearch = (music: Music) => addMusic(music);

  // mini-player 의 [+]: currentTrack 은 lossy 라 못 쓰고, 미리들은 원본 Music 으로 추가.
  const handleAddFromMiniPlayer = () => {
    const music = lastPreviewedMusicRef.current;
    if (music) addMusic(music);
  };

  return (
    <div className='flex flex-col h-full'>
      <div className='flex-1 min-h-0'>
        <MusicSearch onPreview={handlePreview} onAdd={handleAddFromSearch} addPending={isPending} />
      </div>
      <MiniPlayer onAdd={handleAddFromMiniPlayer} addPending={isPending} />
    </div>
  );
};

export default AddTracksSheet;
