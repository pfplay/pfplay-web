import type { NextPage } from 'next';

const AvatarBody: NextPage = () => {
  return (
    <>
      <div
        className='grid grid-cols-5 gap-5 mt-7 scrollbar-hide overflow-y-auto'
        style={{ maxHeight: '500px' }}
      >
        <div className=' bg-gray-500' style={{ maxWidth: '200px', aspectRatio: 'auto 1/1' }}></div>
        <div className=' bg-gray-500' style={{ maxWidth: '200px', aspectRatio: 'auto 1/1' }}></div>
        <div className=' bg-gray-500' style={{ maxWidth: '200px', aspectRatio: 'auto 1/1' }}></div>
        <div className=' bg-gray-500' style={{ maxWidth: '200px', aspectRatio: 'auto 1/1' }}></div>
        <div className=' bg-gray-500' style={{ maxWidth: '200px', aspectRatio: 'auto 1/1' }}></div>
        <div className=' bg-gray-500' style={{ maxWidth: '200px', aspectRatio: 'auto 1/1' }}></div>
        <div className=' bg-gray-500' style={{ maxWidth: '200px', aspectRatio: 'auto 1/1' }}></div>
        <div className=' bg-gray-500' style={{ maxWidth: '200px', aspectRatio: 'auto 1/1' }}></div>
        <div className=' bg-gray-500' style={{ maxWidth: '200px', aspectRatio: 'auto 1/1' }}></div>
        <div className=' bg-gray-500' style={{ maxWidth: '200px', aspectRatio: 'auto 1/1' }}></div>
        <div className=' bg-gray-500' style={{ maxWidth: '200px', aspectRatio: 'auto 1/1' }}></div>
      </div>
    </>
  );
};
export default AvatarBody;
