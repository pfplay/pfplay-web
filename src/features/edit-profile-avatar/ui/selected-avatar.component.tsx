import Image from 'next/image';
import { useSelectedAvatarState } from '../lib/selected-avatar-state.context';

const SelectedAvatar = () => {
  const selectedAvatar = useSelectedAvatarState();

  return (
    <div className='min-h-[525px] flexCol justify-center items-center h-full bg-black select-none'>
      {/* TODO: face + body 조합한 avatar entity ui 적용 */}
      {!selectedAvatar.bodyUri && <div className='bg-black w-[300px] h-[300px]' />}
      {selectedAvatar.bodyUri && (
        <Image
          src={selectedAvatar.bodyUri}
          alt='Selected Avatar Body'
          width={300}
          height={300}
          sizes='(max-width:300px)'
          className='bg-black min-w-[300px]'
        />
      )}
    </div>
  );
};

export default SelectedAvatar;
