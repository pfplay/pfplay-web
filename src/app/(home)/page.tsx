import Image from 'next/image';
import CustomLink from '@/components/shared/CustomLink';

const HomePage = () => {
  return (
    <>
      <Image
        src='/images/Logo/wordmark_medium_white.png'
        width={297.24}
        height={72}
        alt='logo'
        priority
      />
      <CustomLink
        href='/sign-in'
        linkTitle='Let your PFP Play'
        classNames={{
          button: 'px-[99px]',
        }}
        size='xl'
      />
    </>
  );
};

export default HomePage;
