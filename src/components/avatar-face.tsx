'use client';
import { useAddress, useDisconnect, useMetamask } from '@thirdweb-dev/react';
import Image from 'next/image';

export const AvatarFace = () => {
  const connectWithMetamask = useMetamask();
  const disconnect = useDisconnect();
  const address = useAddress();
  return (
    <>
      <div className='flex justify-between items-center' style={{ marginTop: '20px' }}>
        <span className='flex  items-center'>
          <p style={{ fontSize: '28px' }}>NFT</p>
          <span className='ml-4 flex' style={{ fontSize: '16px', color: '#DADADA' }}>
            연결된 지갑{' '}
            <p className='ml-2' style={{ fontWeight: 'bold', color: '#F31F2C' }}>
              1
            </p>
          </span>
        </span>
        <span className='flex items-center text-sm'>
          {address ? (
            <>
              <div
                className='flex justify-center items-center px-5'
                style={{ height: '36px', border: 'solid 1px #545454', borderRadius: '4px' }}
              >
                <div className='group relative inline-block'>
                  <div className='bg-primary inline-flex rounded ptext-base '>
                    <Image
                      src='/icons/Ethereum.svg'
                      alt='Ethereum'
                      width={20}
                      height={20}
                      style={{ marginTop: '1px' }}
                    />
                    <p className='ml-1'>
                      {address.slice(0, 5)}...{address.slice(address.length - 5, address.length)}
                    </p>
                  </div>
                  <div
                    className='absolute top-full left-1/2 z-20 mt-5 -translate-x-1/2 whitespace-nowrap rounded py-2 px-5 text-sm text-white opacity-0 group-hover:opacity-100 cursor-pointer '
                    style={{ backgroundColor: '#111111' }}
                    onClick={disconnect}
                  >
                    <span
                      className='absolute top-[-3px] left-1/2 -z-10 h-2 w-2 -translate-x-1/2 rotate-45 rounded-sm'
                      style={{ backgroundColor: '#111111' }}
                    ></span>
                    <p className='mb-1'>연결 해제</p>
                  </div>
                </div>
              </div>
            </>
          ) : null}
          <button
            style={{
              height: '36px',
              marginLeft: '16px',
              border: 'solid 1px #545454',
              borderRadius: '4px',
              backgroundColor: '#2F2F2F',
            }}
            className='text-sm flex justify-center items-center px-5'
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
      {address ? (
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
      )}
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
