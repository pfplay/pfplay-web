import { ReactNode, useCallback, useState } from 'react';
import { usePlaylistAction } from '@/entities/playlist';
import { useFetchPlaylists } from '@/features/playlist/list';
import { Music } from '@/shared/api/http/types/playlists';
import { track } from '@/shared/lib/analytics';
import { useI18n } from '@/shared/lib/localization/i18n.context';
import { useStores } from '@/shared/lib/store/stores.context';
import { IconMenu } from '@/shared/ui/components/icon-menu';
import LoadingPanel from '@/shared/ui/components/loading/loading-panel.component';
import { TextButton } from '@/shared/ui/components/text-button';
import { Typography } from '@/shared/ui/components/typography';
import { PFAddCircle, PFAddPlaylist } from '@/shared/ui/icons';
import SearchInput from './search-input.component';
import SearchListItem from './search-list-item.component';
import SearchPreviewPanel from './search-preview-panel.component';
import { useSearchMusics } from '../api/use-search-musics.query';

type MusicSearchProps = {
  extraAction?: ReactNode;
};

export default function MusicSearch({ extraAction }: MusicSearchProps) {
  const t = useI18n();
  const { useUIState } = useStores();
  const selectedPlaylist = useUIState((state) => state.playlistDrawer.selectedPlaylist);
  const playlistAction = usePlaylistAction();
  const { data: playlists = [] } = useFetchPlaylists();
  const [search, setSearch] = useState('');
  const { data: musics, isFetching } = useSearchMusics(search);

  const handleSearch = useCallback((value: string) => {
    setSearch(value);
    if (value) {
      track('Music Searched', { query: value });
    }
  }, []);

  const addTrackToPlaylist = useCallback(
    (listId: number, music: Music) => {
      playlistAction.addTrack(listId, {
        linkId: music.videoId,
        thumbnailImage: music.thumbnailUrl,
        duration: music.runningTime,
        name: music.videoTitle,
      });
    },
    [playlistAction]
  );

  return (
    <div className='pt-[36px] pb-[12px] pl-[40px] pr-[12px]'>
      <div className='flex items-center gap-7 mb-11 pr-[28px]'>
        <Typography type='title2'>{t.playlist.btn.add_song}</Typography>
        <SearchInput onSearch={handleSearch} />
        {extraAction}
      </div>

      {/* 미리듣기 임베드(≥200×200, issue #420). 비차단 — 리스트 클릭 시 미리듣기가 연속 전환된다.
          좁은 폭(<laptop)에서는 세로 스택(미리듣기 위 / 리스트 아래) — 모달은 max-w-full 로 축소되는데
          480px 미리듣기가 옆에 고정되면 리스트가 쪼그라들기 때문. laptop(≥1024) 이상에서 우측 컬럼. */}
      <div className='flex flex-col gap-6 laptop:flex-row'>
        <div className='h-[340px] flex-1 min-w-0 overflow-y-scroll pr-[8px]'>
          {isFetching && <LoadingPanel />}
          {!isFetching &&
            !!search &&
            musics?.map((music) => (
              <div key={music.videoId} className='py-3'>
                <SearchListItem
                  music={music}
                  Suffix={
                    selectedPlaylist ? (
                      // 선택된 플레이리스트가 있을 경우 해당 플레이리스트에 바로 음악 추가
                      <TextButton
                        Icon={<PFAddPlaylist />}
                        onClick={() => addTrackToPlaylist(selectedPlaylist.id, music)}
                        data-testid='track-add-button'
                      />
                    ) : (
                      // 선택된 플레이리스트가 없을 경우 플레이리스트 선택 메뉴 표시
                      <IconMenu
                        MenuButtonIcon={<PFAddPlaylist />}
                        menuItemPanel={{ className: 'm-w-[300px] border border-gray-500' }}
                        menuItemConfig={[
                          ...playlists.map(({ name: label, id }) => ({
                            label,
                            onClickItem: () => addTrackToPlaylist(id, music),
                          })),
                          {
                            label: t.playlist.btn.add_playlist,
                            Icon: <PFAddCircle />,
                            onClickItem: playlistAction.add,
                          },
                        ]}
                      />
                    )
                  }
                />
              </div>
            ))}
        </div>
        <SearchPreviewPanel />
      </div>
    </div>
  );
}
