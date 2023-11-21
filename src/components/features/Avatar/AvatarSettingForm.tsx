import { Fragment, PropsWithChildren } from 'react';
import BackButton from '@/components/shared/BackButton';
import ButtonLink from '@/components/shared/ButtonLink';
import SuspenseWithErrorBoundary from '@/components/shared/SuspenseWithErrorBoundary';
import {
  CustomTab,
  TabGroup,
  TabList,
  TabPanel,
  TabPanels,
} from '@/components/shared/atoms/CustomTab';
import { cn } from '@/utils/cn';
import AvatarBodyList from './AvatarBodyList';
import AvatarFaceList from './AvatarFaceList';
import SelectedAvatar from './SelectedAvatar';

interface Props {
  withLayout?: boolean;
}

const AvatarSettingForm = ({ withLayout }: Props) => {
  const Container = withLayout ? Layout : Fragment;

  return (
    <Container>
      <div className='flexRow gap-5'>
        <div className='flexCol items-start gap-10'>
          <BackButton text='뭘 입고 놀아볼까요?' />
          <SelectedAvatar />
        </div>
        <div className='w-full flexCol'>
          <TabGroup>
            <TabList className={cn('w-full flexRow')}>
              <CustomTab tabTitle='body' variant='line' />
              <CustomTab tabTitle='face' variant='line' />
              <div className='flex-1 border-b-[1px] border-b-gray-400' />
            </TabList>
            <TabPanels className={'pb-2'}>
              <TabPanel tabIndex={0} className='pt-6'>
                <SuspenseWithErrorBoundary>
                  <AvatarBodyList />
                </SuspenseWithErrorBoundary>
              </TabPanel>
              <TabPanel tabIndex={1} className={' pt-4 '}>
                <AvatarFaceList />
                {/* <Suspense
                  fallback={
                    // TODO: 로딩 디자인 나오면 수정
                    <div className='flexRow justify-center items-center p-20'>
                      <Typography type='detail1'>로딩중...</Typography>
                    </div>
                  }
                >
                     <AvatarFaceList />
                </Suspense> */}
              </TabPanel>
            </TabPanels>
          </TabGroup>

          <ButtonLink
            href='/parties'
            linkTitle="Let's get in"
            classNames={{
              container: 'self-end',
              button: 'px-[88.5px]',
            }}
            size='xl'
          />
        </div>
      </div>
    </Container>
  );
};

function Layout({ children }: PropsWithChildren) {
  return (
    <div className='absolute-user-form-section'>
      <div className='h-full flexCol justify-start max-w-screen-desktop mx-auto gap-10 p-10 px-[60px]'>
        {children}
      </div>
    </div>
  );
}

export default AvatarSettingForm;
