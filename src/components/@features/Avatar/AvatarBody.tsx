import Button from '@/components/@shared/@atoms/Button';
import { mockAvatarBodyList } from '@/constants/__mock__/mockAvatarBodyList';
import AvatarImage, { AvatarImg } from './AvatarImage';

interface AvatarBodyProps {
  selectedBody: AvatarImg;
  setSelectedBody: (body: AvatarImg) => void;
}

const AvatarBody = ({ selectedBody, setSelectedBody }: AvatarBodyProps) => {
  return (
    <section className='flexCol gap-10'>
      <div className='max-h-[321px] grid grid-cols-2 gap-5 laptop:grid-cols-3 desktop:grid-cols-5 mt-7 overflow-y-auto styled-scroll'>
        {/* //  TODO: 아바타 이미지 데이터 가져오면 mock arr 대체하기 */}
        {mockAvatarBodyList.map((avatar) => (
          <AvatarImage
            key={avatar.id}
            avatar={avatar}
            selectedImg={selectedBody}
            setSelectedImage={setSelectedBody}
          />
        ))}
      </div>
      <Button size='xl' className='self-end px-[88.5px]'>
        Let&apos;s get in
      </Button>
    </section>
  );
};

export default AvatarBody;
