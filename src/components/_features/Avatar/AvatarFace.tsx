'use client';
import Image from 'next/image';

const AvatarFace = () => {
  // const connectWithMetamask = useMetamask();
  // const disconnect = useDisconnect();
  // const address = useAddress();
  return (
    <>
      <div className='flex justify-between items-center' style={{ marginTop: '20px' }}>
        <span className='flex  items-center'>
          <p style={{ fontSize: '28px' }}>NFT</p>
          <span className='ml-4 flex text-grey-200' style={{ fontSize: '16px' }}>
            연결된 지갑{' '}
            <p className='ml-2 text-red-300' style={{ fontWeight: 'bold' }}>
              1
            </p>
          </span>
        </span>
        <span className='flex items-center text-sm'>
          <button
            style={{
              height: '36px',
              marginLeft: '16px',
              border: 'solid 1px',
              borderRadius: '4px',
            }}
            className='text-sm flex justify-center items-center px-5 border-grey-500 bg-grey-700'
            // onClick={connectWithMetamask}
          >
            <Image
              src='/icons/icn_add.svg'
              alt='Ethereum'
              width={15}
              height={15}
              style={{ marginTop: '1px' }}
            />{' '}
            <p className='ml-1'>추가 연결</p>
          </button>
        </span>
      </div>
      {/* {address ? (
        <div
          className='grid grid-cols-5 gap-5 mt-7 scrollbar-hide overflow-y-auto'
          style={{ maxHeight: '200px' }}
        >
          <div
            className=' bg-gray-500'
            style={{ maxWidth: '200px', aspectRatio: 'auto 1/1' }}
          ></div>
          <div
            className=' bg-gray-500'
            style={{ maxWidth: '200px', aspectRatio: 'auto 1/1' }}
          ></div>
          <div
            className=' bg-gray-500'
            style={{ maxWidth: '200px', aspectRatio: 'auto 1/1' }}
          ></div>
          <div
            className=' bg-gray-500'
            style={{ maxWidth: '200px', aspectRatio: 'auto 1/1' }}
          ></div>
          <div
            className=' bg-gray-500'
            style={{ maxWidth: '200px', aspectRatio: 'auto 1/1' }}
          ></div>
          <div
            className=' bg-gray-500'
            style={{ maxWidth: '200px', aspectRatio: 'auto 1/1' }}
          ></div>
          <div
            className=' bg-gray-500'
            style={{ maxWidth: '200px', aspectRatio: 'auto 1/1' }}
          ></div>
          <div
            className=' bg-gray-500'
            style={{ maxWidth: '200px', aspectRatio: 'auto 1/1' }}
          ></div>
          <div
            className=' bg-gray-500'
            style={{ maxWidth: '200px', aspectRatio: 'auto 1/1' }}
          ></div>
          <div
            className=' bg-gray-500'
            style={{ maxWidth: '200px', aspectRatio: 'auto 1/1' }}
          ></div>
          <div
            className=' bg-gray-500'
            style={{ maxWidth: '200px', aspectRatio: 'auto 1/1' }}
          ></div>
        </div>
      ) : (
        <div className='flex justify-center items-center h-14 rounded bg-slate-900/30'>
          <p>보유한 내역이 없어요</p>
        </div>
      )} */}
      <p style={{ fontSize: '28px', marginTop: '20px' }}>PFPlay</p>
      <div
        className='grid grid-cols-5 gap-5 mt-7 scrollbar-hide overflow-y-auto'
        style={{ maxHeight: '190px' }}
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

export default AvatarFace;
