import Image from 'next/image';
import { mockAvatarBodyList } from '@/constants/__mock__/mockAvatarBodyList';
import { cn } from '@/utils/cn';

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
    <section className='relative flexCol h-full gap-5'>
      <div className='max-h-[300px] grid grid-cols-2 gap-5 laptop:grid-cols-3 desktop:grid-cols-5 mt-7 overflow-y-auto'>
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
              onClick={() => setSelectedBody({ ...avatar })}
              className={cn(
                'bg-gray-500 max-h-[200px] aspect-square select-none drag-none',
                selectedBody.id === avatar.id && 'border-[1px] border-red-700 bg-gray-50'
              )}
            />
          </div>
        ))}
      </div>
      {/* TODO: Button 컴포넌트 수정되면 대체 */}
      <button
        className={cn('self-end bg-gradient-red text-gray-50 font-bold-sm px-[96px] py-[12px]')}
      >
        Let&apos;s get in
      </button>
    </section>
  );
};

export default AvatarBody;
