import Image from 'next/image';

export const Logo = () => {
  return (
    <button>
      <Image
        src='/logos/wordmark_medium_white.svg'
        alt='wordmark'
        width={150}
        height={36}
        style={{ marginTop: '1px' }}
      />
    </button>
  );
};
