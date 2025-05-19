'use client';
import { PartyroomCreateCard } from '@/features/partyroom/create';
import { MainPartyroomCard, PartyroomList } from '@/features/partyroom/list';
import SuspenseWithErrorBoundary from '@/shared/api/http/error/suspense-with-error-boundary.component';
import { cn } from '@/shared/lib/functions/cn';
import { mergeDeep } from '@/shared/lib/functions/merge-deep';
import { useI18n } from '@/shared/lib/localization/i18n.context';
import { useAppRouter } from '@/shared/lib/router/use-app-router.hook';
import { useStores } from '@/shared/lib/store/stores.context';
import { useDialog } from '@/shared/ui/components/dialog';
import { Typography } from '@/shared/ui/components/typography';
import { MyProfilePanel } from '@/widgets/profile-panel';
import { Sidebar, ProfileButton, PlaylistButton } from '@/widgets/sidebar';

const PartyLobbyPage = () => {
  const router = useAppRouter();
  const t = useI18n();
  const { useUIState } = useStores();
  const setPlaylistDrawer = useUIState((state) => state.setPlaylistDrawer);
  const { openDialog } = useDialog();

  const togglePlaylist = () => {
    setPlaylistDrawer((prev) => mergeDeep(prev, { open: !prev.open }));
  };

  const handleClickProfileButton = () => {
    return openDialog((_, onCancel) => ({
      title: ({ defaultClassName }) => (
        <Typography type='title2' className={defaultClassName}>
          {t.common.btn.my_profile}
        </Typography>
      ),
      titleAlign: 'left',
      showCloseIcon: true,
      classNames: {
        container: 'w-[620px] h-[391px] py-7 px-10 bg-black',
      },
      Body: (
        <MyProfilePanel
          onClickAvatarSetting={() => {
            router.push('/settings/avatar');
            onCancel?.();
          }}
        />
      ),
    }));
  };

  return (
    <>
      <Sidebar
        className={cn([
          'flexCol justify-between gap-10 px-1 py-6 bg-[#0E0E0E] rounded',
          'fixed z-10 bottom-8 right-8 transform',
          'laptop:bottom-[unset] laptop:right-[unset] laptop:top-1/2 laptop:left-8 laptop:-translate-y-1/2',
        ])}
      >
        <ProfileButton onClick={handleClickProfileButton} />
        <PlaylistButton onClick={togglePlaylist} />
      </Sidebar>

      <div className='max-w-desktop mx-auto'>
        <SuspenseWithErrorBoundary enableReload>
          <MainPartyroomCard />
        </SuspenseWithErrorBoundary>

        <section
          className={cn([
            'grid gap-[1.5rem] mt-6 overflow-y-auto',
            'grid-rows-[240px] auto-rows-[240px] grid-flow-row-dense',
            'grid-cols-1',
            'tablet:grid-cols-[repeat(auto-fit,calc((100%-1.5rem)/2))]', // 100%-{COL_GAP}
            'desktop:grid-cols-[repeat(auto-fit,calc((100%-3rem)/3))]', // 100%-({COL_GAP}*2)
          ])}
        >
          <PartyroomCreateCard />

          <PartyroomList />
        </section>
      </div>
    </>
  );
};

export default PartyLobbyPage;
