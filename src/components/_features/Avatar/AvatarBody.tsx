import Image from 'next/image';
import { avatarBodyMockArr } from '@/config/profile-body-mock';
import { cn } from '@/lib/utils';

export type AvatarBodyImg = {
  id: number;
  type: 'basic' | 'dj' | 'room' | 'ref';
  name: string;
  image: string;
  point: number;
};

interface AvatarBodyProps {
  selectedBody: AvatarBodyImg;
  setSelectedBody: (body: AvatarBodyImg) => void;
}

const AvatarBody = ({ selectedBody, setSelectedBody }: AvatarBodyProps) => {
  return (
    <section className='flexCol gap-5'>
      <div className='max-h-[400px] grid grid-cols-5 gap-5 mt-7 scrollbar-hide overflow-y-auto'>
        {/* //  TODO: 아바타 이미지 데이터 가져오면 mock arr 대체하기 */}
        {avatarBodyMockArr.map((avatar) => (
          <div key={avatar.id} className='relative w-full max-width-[200px] aspect-square'>
            {/* // TODO: Component화 시키고 반응형으로 만들기 */}
            <Image
              key={avatar.id}
              src={avatar.image}
              alt={avatar.name}
              fill
              sizes='(max-width:200px) 100vw, 200px'
              onClick={() => setSelectedBody({ ...avatar })}
              className={cn(
                'bg-grey-500 max-h-[200px] aspect-square cursor-pointer',
                selectedBody.id === avatar.id && 'border-[1px] border-red-700 bg-grey-50'
              )}
            />
          </div>
        ))}
      </div>
      {/* TODO: Button 컴포넌트 수정되면 대체 */}
      <button
        className={cn('self-end bg-gradient-red text-grey-50 font-bold-sm px-[96px] py-[12px]')}
      >
        Let&apos;s get in
      </button>
    </section>
  );
};

export default AvatarBody;
