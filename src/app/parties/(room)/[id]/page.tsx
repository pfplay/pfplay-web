import TempAvatars from '@/app/parties/(room)/[id]/temp-avatars';
import { cn } from '@/shared/lib/functions/cn';
import { getServerDictionary } from '@/shared/lib/localization/get-server-dictionary';
import { Button } from '@/shared/ui/components/button';
import { Input } from '@/shared/ui/components/input';
import { Typography } from '@/shared/ui/components/typography';
import { PFInfoOutline, PFSend, PFParty } from '@/shared/ui/icons';
import { PartyroomDisplayBoard } from '@/widgets/partyroom-display-board';
import { Sidebar } from '@/widgets/sidebar';

export const dynamic = 'force-dynamic';

const PartyroomPage = async () => {
  const t = await getServerDictionary();

  // TODO: 파티룸 모든 api 불러오는 동안 Suspense로 입장 중 페이지 보여주기
  return (
    <>
      <TempAvatars />

      {/* 가운데 플레이리스트 */}
      <div className='absolute top-[44px] left-1/2 transform -translate-x-1/2 max-w-full w-[calc(512px+(40px*2))] px-[40px]'>
        <PartyroomDisplayBoard width={512} />
      </div>

      {/* 왼쪽 float 메뉴 */}
      <Sidebar
        className={cn([
          'flexCol justify-between gap-10 px-1 py-6 bg-[#0E0E0E] rounded',
          'absolute top-1/2 left-[40px] transform -translate-y-1/2',
        ])}
        showDJQueue
      />

      {/* 오른쪽 채팅창 */}
      <div className='absolute top-0 right-0 w-[400px] max-w-full h-screen flexCol bg-black pt-8 pb-3 px-7'>
        <div className='bg-black grid grid-cols-2 gap-3'>
          <Button
            color='secondary'
            variant='outline'
            Icon={<PFInfoOutline width={20} height={20} className='[&_*]:stroke-white' />}
            size='sm'
            className='text-gray-50'
          >
            {t.party.title.party_info}
          </Button>
          <Button
            color='secondary'
            variant='outline'
            Icon={<PFParty widths={20} height={20} className='[&_*]:fill-gray-300' />}
            size='sm'
            className='text-gray-50'
          >
            {t.party.title.party_list}
          </Button>
        </div>

        {/* 채팅, 사람 탭 */}
        <div className='px-7 bg-black'></div>

        {/* 채팅창 목록 */}
        <div className='flex-1 flexCol w-full bg-gradient-to-r from-black/0 via-black/80 to-black/80 mt-6'>
          <div className='flex-1 flexCol w-full h-6 bg-gradient-to-b from-black to-black/0'>
            <div className='flex-1 flexColCenter space-y-4 overflow-y-auto'>
              <Typography type='detail1' className='text-gray-500 select-none'>
                Coming Soon :)
              </Typography>
            </div>

            <Input
              size='lg'
              variant='outlined'
              placeholder='What would you like to talk about?'
              Suffix={
                <Button
                  color='secondary'
                  variant='fill'
                  Icon={<PFSend width={20} height={20} />}
                  size='sm'
                  className='text-gray-50'
                />
              }
            />
          </div>
        </div>
      </div>
    </>
  );
};

export default PartyroomPage;
