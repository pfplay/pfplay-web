import React from 'react';
import Button from '@/components/@shared/@atoms/Button';
import Typography from '@/components/@shared/@atoms/Typography';
import PFChevronRight from '@/components/@shared/@icons/navigation/PFChevronRight';

const Footer = () => {
  return (
    <footer className='absolute bottom-[52px] w-full min-w-laptop flexRow justify-between items-center px-[120px]'>
      <Typography className='text-gray-300'>Privacy&Terms</Typography>
      <Button variant='outline' color='secondary' Icon={<PFChevronRight />} iconPlacement='right'>
        당신의 PFP는 안녕하신가요?
      </Button>
    </footer>
  );
};

export default Footer;
