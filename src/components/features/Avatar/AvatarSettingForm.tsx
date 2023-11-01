import React, { Fragment, PropsWithChildren } from 'react';
import BackButton from '@/components/shared/BackButton';
import CustomLink from '@/components/shared/CustomLink';
import CustomTab, {
  TabGroup,
  TabList,
  TabPanel,
  TabPanels,
} from '@/components/shared/atoms/CustomTab';
import { cn } from '@/utils/cn';
import { ROUTES } from '@/utils/routes';
import AvatarBodyList from './AvatarBodyList';

interface Props {
  withLayout?: boolean;
}

const AvatarSettingForm = ({ withLayout }: Props) => {
  // const { openErrorDialog } = useDialog();
  // const [bodyList, setBodyList] = useState<AvatarParts[]>([]);
  // const [faceList, setFaceList] = useState<AvatarParts[]>([]);
  // const [selectedBody, setSelectedBody] = useState<AvatarParts>();
  // const [selectedFace, setSelectedFace] = useState<AvatarParts>();
  // const [bodyStatus, setBodyStatus] = useState<FetchStatus>('idle');
  // const [faceStatus, setFaceStatus] = useState<FetchStatus>('idle');

  const Container = withLayout ? Layout : Fragment;

  // const fetchBodyList = async () => {
  //   setBodyStatus('loading');
  //   try {
  //     const bodyList = await AvatarService.getBodyList();
  //     setBodyList(bodyList);
  //     setSelectedBody(bodyList[0]);
  //     setBodyStatus('succeeded');
  //   } catch (e) {
  //     openErrorDialog(e);
  //     setBodyStatus('failed');
  //   }
  // };

  // const fetchFaceList = async () => {
  //   setFaceStatus('loading');
  //   try {
  //     // TODO: fetch face list
  //     setFaceList(mockAvatarPartsList);
  //     setSelectedFace(mockAvatarPartsList[0]);
  //     setFaceStatus('succeeded');
  //   } catch (e) {
  //     openErrorDialog(e);
  //     setFaceStatus('failed');
  //   }
  // };

  // useEffect(() => {
  //   fetchBodyList();
  //   fetchFaceList();
  // }, []);

  return (
    <Container>
      <div className='flexRow gap-5'>
        <div className='flexCol items-start gap-10'>
          <BackButton text='뭘 입고 놀아볼까요?' />
          <div className='items-center h-full bg-black pointer-events-none select-none flexRow'>
            {/* {!(selectedBody && selectedFace) && <div className='bg-black w-[300px] h-[300px]' />}
            {selectedBody && selectedFace && (
              <Image
                src={selectedBody.image}
                alt={selectedBody.name}
                width={300}
                height={300}
                sizes='(max-width:300px)'
                className='bg-black min-w-[300px]'
              />
            )} */}
          </div>
        </div>
        <div className='w-full flexCol'>
          <TabGroup>
            <TabList className={cn('w-full flexRow')}>
              <CustomTab tabTitle='body' variant='line' />
              <CustomTab tabTitle='face' variant='line' />
              <div className='flex-1 border-b-[1px] border-b-gray-400' />
            </TabList>
            <TabPanels className={'pb-2'}>
              <TabPanel tabIndex={0} className={'pt-6'}>
                <AvatarBodyList />
                {/* <AvatarBodyList
                // list={bodyList}
                // selected={selectedBody}
                // setSelected={setSelectedBody}
                // status={bodyStatus}
                /> */}
              </TabPanel>
              <TabPanel tabIndex={1} className={' pt-4 '}>
                {/* <AvatarFaceList
                  list={faceList}
                  selected={selectedFace}
                  setSelected={setSelectedFace}
                  status={faceStatus}
                /> */}
              </TabPanel>
            </TabPanels>
          </TabGroup>

          <CustomLink
            href={ROUTES.PARTIES.index}
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
