'use client';
import Image from 'next/image';
import { useSelectedAvatarStore } from '@/store/avatar.store';

const SelectedAvatar = () => {
  const selectedAvatarParts = useSelectedAvatarStore((state) => state.selectedAvatarParts);
  console.log({ selectedAvatarParts });

  return (
    <div className='min-h-[525px] flexCol justify-center items-center h-full bg-black pointer-events-none select-none  '>
      {/*  TODO: Crop the Face and body image when selected */}
      {!selectedAvatarParts?.body && <div className='bg-black w-[300px] h-[300px]' />}
      {selectedAvatarParts?.body && (
        <Image
          src={selectedAvatarParts?.body.image}
          alt={selectedAvatarParts?.body.name}
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
