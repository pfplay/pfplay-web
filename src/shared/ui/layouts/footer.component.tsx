import { getServerDictionary } from '@/shared/lib/localization/get-server-dictionary';
import { AppLink } from '@/shared/lib/router/app-link.component';
import { Button } from '@/shared/ui/components/button';
import { TextButton } from '@/shared/ui/components/text-button';
import { PFChevronRight } from '@/shared/ui/icons';

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
