import { headers } from 'next/headers';
import { MobileOnlyDesktopFeatureCard } from '@/shared/ui/components/mobile-only-desktop-feature-card';
import { AvatarSettingsPageDesktop } from '@/widgets/avatar-settings-page-desktop';

const AvatarSettingsPage = () => {
  const isMobile = headers().get('x-pf-device') === 'mobile';
  if (isMobile) return <MobileOnlyDesktopFeatureCard feature='avatar-edit' />;
  return <AvatarSettingsPageDesktop />;
};

export default AvatarSettingsPage;
