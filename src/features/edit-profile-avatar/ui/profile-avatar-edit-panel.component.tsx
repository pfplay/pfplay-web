import { ReactNode } from 'react';
import { useVerticalStretch } from '@/shared/lib/hooks/use-vertical-stretch.hook';
import { useI18n } from '@/shared/lib/localization/i18n.context';
import { Tab, TabGroup, TabList, TabPanel, TabPanels } from '@/shared/ui/components/tab';
import AvatarBodyList from './avatar-body-list.component';
import AvatarFaceList from './avatar-face-list.component';
import SelectedAvatar from './selected-avatar.component';
import SelectedAvatarStateProvider from '../lib/selected-avatar-state.provider';

type Props = {
  titleRender: (text: string) => ReactNode;
  /**
   * 제출 버튼, 취소 버튼 등
   */
  actions: ReactNode;
};

export default function ProfileAvatarEditPanel({ titleRender, actions }: Props) {
  const t = useI18n();
  const containerRef = useVerticalStretch();

  return (
    <div
      ref={containerRef}
      className='flexRow justify-start max-w-screen-desktop mx-auto gap-5 p-10 px-[60px]'
    >
      <SelectedAvatarStateProvider>
        <div className='flexCol items-start gap-10'>
          {titleRender(t.settings.para.what_wear)}
          {/*<Typography type='title2'>{t.settings.para.what_wear}</Typography>*/}
          <SelectedAvatar />
        </div>
        <div className='flex-1 h-full flexCol gap-2'>
          <TabGroup className='flex-1 flexCol'>
            <TabList className='w-full flexRow'>
              <Tab tabTitle='body' variant='line' className='w-auto' />
              <Tab tabTitle='face' variant='line' className='w-auto' />
              <div className='flex-1 border-b-[1px] border-b-gray-400' />
            </TabList>
            <TabPanels className='flex-1 flexCol pb-2 overflow-hidden'>
              {/* FIXME: 각 패널 overflow auto 안 먹고 있음 */}
              <TabPanel tabIndex={0} className='flex-1 flexCol pt-6'>
                <AvatarBodyList />
              </TabPanel>
              <TabPanel tabIndex={1} className='flex-1 flexCol pt-4'>
                <AvatarFaceList />
              </TabPanel>
            </TabPanels>
          </TabGroup>

          <div className='self-end shrink-0 flex gap-3'>{actions}</div>
        </div>
      </SelectedAvatarStateProvider>
    </div>
  );
}
