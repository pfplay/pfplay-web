import { EmailBox } from '@components/ui/EmailBox';
import { Logo, WorldGlobe } from '@components/ui/icon';
export const Header = () => {
  return (
    <header>
      <div className="text-white flex justify-between items-center pt-10 px-[120px]" style={{ maxWidth: '1680px' }}>
        <Logo />
        <div className="flex items-center">
          <EmailBox />
          <WorldGlobe />
        </div>
      </div>
    </header>
  );
};
