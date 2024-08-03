import { ReactNode, useCallback, useState } from 'react';
import { usePlaylistAction } from '@/entities/playlist';
import { MusicListItem } from '@/shared/api/http/types/playlists';
import { useI18n } from '@/shared/lib/localization/i18n.context';
import { useStores } from '@/shared/lib/store/stores.context';
import { IconMenu } from '@/shared/ui/components/icon-menu';
import LoadingPanel from '@/shared/ui/components/loading/loading-panel.component';
import { TextButton } from '@/shared/ui/components/text-button';
import { Typography } from '@/shared/ui/components/typography';
import { PFAddCircle, PFAddPlaylist } from '@/shared/ui/icons';
import { useSearchMusics } from 'features/playlist/add-musics/api/use-search-musics.query';
import SearchInput from './search-input.component';
import SearchListItem from './search-list-item.component';

type MusicSearchProps = {
  extraAction?: ReactNode;
};

export default function MusicSearch({ extraAction }: MusicSearchProps) {
  const t = useI18n();
  const { useUIState } = useStores();
  const selectedPlaylist = useUIState((state) => state.playlistDrawer.selectedPlaylist);
  const playlistAction = usePlaylistAction();
  const [search, setSearch] = useState('');
  const { data: musics, isFetching } = useSearchMusics(search);

  const addMusicToPlaylist = useCallback(
    (listId: number, music: MusicListItem) => {
      playlistAction.addMusic(listId, {
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
        <SearchInput onSearch={setSearch} />
        {extraAction}
      </div>

      <div className='h-[340px] overflow-y-scroll pr-[8px]'>
        {isFetching && <LoadingPanel />}
        {!isFetching &&
          !!search &&
          musics?.map((music) => (
            <div key={music.videoId} className='py-3'>
              <SearchListItem
                music={music}
                suffix={
                  selectedPlaylist ? (
                    // 선택된 플레이리스트가 있을 경우 해당 플레이리스트에 바로 음악 추가
                    <TextButton
                      Icon={<PFAddPlaylist />}
                      onClick={() => addMusicToPlaylist(selectedPlaylist.id, music)}
                    />
                  ) : (
                    // 선택된 플레이리스트가 없을 경우 플레이리스트 선택 메뉴 표시
                    <IconMenu
                      MenuButtonIcon={<PFAddPlaylist />}
                      menuItemPanel={{ className: 'm-w-[300px] border border-gray-500' }}
                      menuItemConfig={[
                        ...playlistAction.list.map(({ name: label, id }) => ({
                          label,
                          onClickItem: () => addMusicToPlaylist(id, music),
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
    </div>
  );
}
