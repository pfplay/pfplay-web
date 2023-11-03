'use client';
import Image from 'next/image';
import React from 'react';
import { useSelectedAvatarStore } from '@/store/avatar';

const SelectedAvatar = () => {
  const [selectedBody, selectedFace] = useSelectedAvatarStore((state) => [
    state.selectedBody,
    state.selectedFace,
  ]);

  console.log({ selectedBody, selectedFace });

  return (
    <div className='flexCol justify-center items-center h-full bg-black pointer-events-none select-none  '>
      {/*  TODO: Face 이미지 대응 */}
      {!selectedBody && <div className='bg-black w-[300px] h-[300px]' />}
      {selectedBody && (
        <Image
          src={selectedBody.image}
          alt={selectedBody.name}
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
