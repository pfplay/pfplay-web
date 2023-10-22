'use client';
import Button from '@/components/shared/atoms/Button';
import Typography from '@/components/shared/atoms/Typography';
import { PFAdd } from '@/components/shared/icons';
import { mockAvatarBodyList } from '@/constants/__mock__/mockAvatarBodyList';
import AvatarImage, { AvatarImg } from './AvatarImage';

interface AvatarFaceProps {
  selectedFace: AvatarImg;
  setSelectedFace: (face: AvatarImg) => void;
}

const AvatarFace = ({ selectedFace, setSelectedFace }: AvatarFaceProps) => {
  // const connectWithMetamask = useMetamask();
  // const disconnect = useDisconnect();
  // const address = useAddress();
  return (
    <div className='max-h-[580px] flexCol gap-5 mt-5'>
      <section className='flexCol gap-5'>
        <div className='flexRow justify-between items-center '>
          <div className='flexRow gap-4'>
            <Typography type='title1' className='text-gray-50 uppercase'>
              nft
            </Typography>
            <Typography type='detail1' className='flexRowCenter gap-1 text-gray-50 uppercase'>
              연결된 지갑이
              <Typography className='text-red-300'>1</Typography>
            </Typography>
          </div>
          <div className='flexRow gap-4'>
            <Button variant='outline' color='secondary' className='px-[24px]'></Button>
            <Button variant='fill' color='secondary' Icon={<PFAdd />} className='px-[38px]'>
              추가 연결
            </Button>
          </div>
        </div>
        <div className='w-full flexRowCenter bg-gray-800 py-4'>
          {/* <div className=' grid grid-cols-2 gap-5 laptop:grid-cols-3 desktop:grid-cols-5 overflow-y-auto styled-scroll'>
            <AvatarImage
              key={1}
              avatar={{
                id: 1,
                type: 'basic',
                name: '도깨비불',
                image:
                  'https://postfiles.pstatic.net/MjAyMzA3MjlfMTE3/MDAxNjkwNjE0MTc3MjUz.owpzAVyLyeWQNKejvnYsd7g4Qv9SPvwwzl6voUCAeZ0g.Re2hKthxs8iV4NJr2Ofd-4_DfiXe46GzvPfhrjftX3Eg.PNG.sylviuss/avatar_empty.png?type=w773',
                point: 0,
              }}
              selectedImg={{
                id: 1,
                type: 'basic',
                name: '도깨비불',
                image:
                  'https://postfiles.pstatic.net/MjAyMzA3MjlfMTE3/MDAxNjkwNjE0MTc3MjUz.owpzAVyLyeWQNKejvnYsd7g4Qv9SPvwwzl6voUCAeZ0g.Re2hKthxs8iV4NJr2Ofd-4_DfiXe46GzvPfhrjftX3Eg.PNG.sylviuss/avatar_empty.png?type=w773',
                point: 0,
              }}
              setSelectedImage={setSelectedFace}
            />
          </div> */}
          <Typography type='body3' className='text-gray-400'>
            보유한 내역이 없어요
          </Typography>
        </div>
      </section>
      <section className='flexCol gap-5'>
        <Typography type='title1' className='text-gray-50'>
          PFPlay
        </Typography>
        <div className='flexCol gap-10'>
          <div className='max-h-[140px] grid grid-cols-2 gap-5 laptop:grid-cols-3 desktop:grid-cols-5 overflow-y-auto styled-scroll'>
            {/* //  TODO: 아바타 이미지 데이터 가져오면 mock arr 대체하기 */}
            {mockAvatarBodyList.map((avatar) => (
              <AvatarImage
                key={avatar.id}
                avatar={avatar}
                selectedImg={selectedFace}
                setSelectedImage={setSelectedFace}
              />
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default AvatarFace;