import Button from '@/components/shared/atoms/Button';
import Typography from '@/components/shared/atoms/Typography';
import { PFChevronRight } from '@/components/shared/icons';
import { getServerDictionary } from '@/utils/dictionary';

const Footer = async () => {
  const dic = await getServerDictionary();
  return (
    <footer className='absolute bottom-[52px] w-full flexRow flex-wrap gap-2 justify-between items-center px-app'>
      <Typography className='text-gray-300'>{dic['onboard.btn.terms']}</Typography>
      <Button variant='outline' color='secondary' Icon={<PFChevronRight />} iconPlacement='right'>
        {dic['onboard.btn.pfp_doing']}
      </Button>
    </footer>
  );
};

export default Footer;
