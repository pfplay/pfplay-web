'use client';
import Image from 'next/image';
import Button from '@/components/@shared/@atoms/Button';
import { mockAvatarBodyList } from '@/constants/__mock__/mockAvatarBodyList';
import { cn } from '@/utils/cn';

export type AvatarFaceImg = {
  id: number;
  type: 'basic' | 'dj' | 'room' | 'ref';
  name: string;
  image: string;
  point: number;
};

interface AvatarFaceProps {
  selectedFace: AvatarFaceImg;
  setSelectedFace: (body: AvatarFaceImg) => void;
}

const AvatarFace = ({ selectedFace, setSelectedFace }: AvatarFaceProps) => {
  // const connectWithMetamask = useMetamask();
  // const disconnect = useDisconnect();
  // const address = useAddress();
  return (
    <section className='flexCol gap-10'>
      <div className='max-h-[200px] grid grid-cols-2 gap-5 laptop:grid-cols-3 desktop:grid-cols-5 mt-7 overflow-y-auto styled-scroll'>
        {/* //  TODO: 아바타 이미지 데이터 가져오면 mock arr 대체하기 */}
        {mockAvatarBodyList.map((avatar) => (
          <div
            key={avatar.id}
            className='relative w-full max-width-[200px] aspect-square cursor-pointer'
          >
            {/* // TODO: Component화 시키고 반응형으로 만들기 */}
            <Image
              key={avatar.id}
              src={avatar.image}
              alt={avatar.name}
              fill
              sizes='(max-width:200px) 100vw, 200px'
              onClick={() => setSelectedFace({ ...avatar })}
              className={cn(
                'bg-gray-500 max-h-[200px] aspect-square select-none drag-none',
                selectedFace.id === avatar.id && 'border-[1px] border-red-700 bg-gray-50'
              )}
            />
          </div>
        ))}
      </div>
      <Button size='xl' className='self-end px-[88.5px]'>
        Let&apos;s get in
      </Button>
    </section>
  );
};

export default AvatarFace;
