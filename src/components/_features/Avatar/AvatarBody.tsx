import Image from 'next/image';

const AvatarBody = () => {
  return (
    <>
      <div className='max-h-[400px] grid grid-cols-5 gap-5 mt-7 scrollbar-hide overflow-y-auto'>
        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18].map((avatar) => (
          // TODO: inject avatar src and alt
          <Image
            key={avatar}
            src={''}
            alt={''}
            sizes='(max-width:200px)'
            className='bg-grey-500 max-h-[200px] aspect-square'
          />
        ))}
      </div>
    </>
  );
};

export default AvatarBody;
