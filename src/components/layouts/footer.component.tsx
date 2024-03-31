import Button from '@/components/shared/atoms/button.component';
import TextButton from '@/components/shared/atoms/text-button.component';
import { PFChevronRight } from '@/components/shared/icons';
import { AppLink } from '@/components/shared/router/app-link.component';
import { getServerDictionary } from '@/utils/dictionary';

const Footer = async () => {
  const dic = await getServerDictionary();
  return (
    <footer className='absolute bottom-[52px] w-full flexRow flex-wrap gap-2 justify-between items-center px-app'>
      <AppLink href='/docs/terms-of-service'>
        <TextButton tabIndex={-1} className={'text-gray-300'}>
          {dic['onboard.btn.terms']}
        </TextButton>
      </AppLink>

      <Button variant='outline' color='secondary' Icon={<PFChevronRight />} iconPlacement='right'>
        {dic['onboard.btn.pfp_doing']}
      </Button>
    </footer>
  );
};

export default Footer;
